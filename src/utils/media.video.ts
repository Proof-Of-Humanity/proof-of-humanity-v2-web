import { FFmpeg, createFFmpeg } from "@ffmpeg/ffmpeg";
import { randomString } from "./misc";

let ffmpeg: FFmpeg;

const INVALID_VIDEO_FILE_ERROR =
  "Invalid or corrupted video file. Please upload a valid WEBM, MP4, AVI, or MOV video.";

const loadFFMPEG = async () => {
  if (typeof SharedArrayBuffer === "undefined") {
    throw new Error(
      "Video processing is not available. Please refresh the page (Cmd+R or Ctrl+R) and try again.",
    );
  }

  if (ffmpeg && ffmpeg.isLoaded()) return;

  ffmpeg = createFFmpeg({
    log: false,
    corePath: "/ffmpeg/ffmpeg-core.js",
  });

  await ffmpeg.load();
};

const readAscii = (buffer: Uint8Array, start: number, length: number) =>
  String.fromCharCode(...buffer.slice(start, start + length));

export type VideoFormat = "mp4" | "mov" | "webm" | "avi";

export const detectVideoFormat = (buffer: Uint8Array): VideoFormat | null => {
  if (buffer.length < 12) return null;

  if (
    buffer[0] === 0x1a &&
    buffer[1] === 0x45 &&
    buffer[2] === 0xdf &&
    buffer[3] === 0xa3
  ) {
    return "webm";
  }

  const riffCheck = readAscii(buffer, 0, 4);
  const aviCheck = readAscii(buffer, 8, 4);
  if (riffCheck === "RIFF" && aviCheck === "AVI ") return "avi";

  const ftypCheck = readAscii(buffer, 4, 4);
  if (ftypCheck === "ftyp") {
    const majorBrand = readAscii(buffer, 8, 4);
    return majorBrand === "qt  " ? "mov" : "mp4";
  }

  return null;
};

export const getVideoMimeType = (format: VideoFormat): string => {
  switch (format) {
    case "webm":
      return "video/webm";
    case "avi":
      return "video/x-msvideo";
    case "mov":
      return "video/quicktime";
    case "mp4":
    default:
      return "video/mp4";
  }
};

const getVideoCodecForFormat = (
  format: string,
): { videoCodec: string; audioCodec: string } => {
  switch (format) {
    case "webm":
      return { videoCodec: "libvpx", audioCodec: "libvorbis" };
    case "avi":
      return { videoCodec: "mpeg4", audioCodec: "mp3" };
    case "mov":
    case "mp4":
    default:
      return { videoCodec: "libx264", audioCodec: "aac" };
  }
};

export interface VideoFrameTimingMetrics {
  frameCount: number;
  effectiveFps: number | null;
  maxFrameGapMs: number | null;
}

export const analyzeVideoFrameTiming = async (
  inputBuffer: ArrayBufferLike,
): Promise<VideoFrameTimingMetrics | null> => {
  try {
    await loadFFMPEG();

    const inputArray = new Uint8Array(inputBuffer);
    const inputFormat = detectVideoFormat(inputArray);
    if (!inputFormat) throw new Error(INVALID_VIDEO_FILE_ERROR);
    const inputName = `${randomString(16)}.${inputFormat}`;

    ffmpeg.FS("writeFile", inputName, inputArray);

    const frameTimes: number[] = [];
    ffmpeg.setLogger(({ message }) => {
      if (!message.includes("showinfo")) return;

      const ptsMatch = message.match(/pts_time:([-\d.]+)/);
      if (!ptsMatch) return;

      const ptsTime = parseFloat(ptsMatch[1]);
      if (!Number.isFinite(ptsTime)) return;

      frameTimes.push(ptsTime);
    });

    try {
      await ffmpeg.run(
        "-i",
        inputName,
        "-map",
        "0:v:0",
        "-vf",
        "showinfo",
        "-an",
        "-f",
        "null",
        "-",
      );
    } catch {
      // Some builds throw even with null output; keep parsed metrics when available.
    }

    try {
      ffmpeg.FS("unlink", inputName);
    } catch {
      // ignore cleanup failures
    }

    if (frameTimes.length < 2) {
      return frameTimes.length === 1
        ? { frameCount: 1, effectiveFps: null, maxFrameGapMs: null }
        : null;
    }

    const frameGaps: number[] = [];
    for (let i = 1; i < frameTimes.length; i += 1) {
      const gap = frameTimes[i] - frameTimes[i - 1];
      if (gap > 0) frameGaps.push(gap);
    }

    if (frameGaps.length === 0) {
      return {
        frameCount: frameTimes.length,
        effectiveFps: null,
        maxFrameGapMs: null,
      };
    }

    const start = frameTimes[0];
    const end = frameTimes[frameTimes.length - 1];
    const span = end - start;

    const effectiveFps = span > 0 ? (frameTimes.length - 1) / span : null;
    const maxGap = Math.max(...frameGaps);

    return {
      frameCount: frameTimes.length,
      effectiveFps,
      maxFrameGapMs: maxGap * 1000,
    };
  } catch (err) {
    console.error("❌ [Video Probe] Error while extracting frame timing:", err);
  }

  return null;
};

export const getPrimaryVideoCodec = async (
  inputBuffer: ArrayBufferLike,
): Promise<string | null> => {
  let inputName: string | null = null;
  try {
    await loadFFMPEG();

    const inputArray = new Uint8Array(inputBuffer);
    const inputFormat = detectVideoFormat(inputArray);
    if (!inputFormat) throw new Error(INVALID_VIDEO_FILE_ERROR);

    inputName = `${randomString(16)}.${inputFormat}`;
    ffmpeg.FS("writeFile", inputName, inputArray);

    let codec: string | null = null;
    ffmpeg.setLogger(({ message }) => {
      if (codec) return;

      const codecMatch = message.match(/Video:\s*([a-zA-Z0-9_]+)/);
      if (!codecMatch) return;

      codec = codecMatch[1].toLowerCase();
    });

    try {
      await ffmpeg.run("-i", inputName);
    } catch {
      // Expected since probe has no output target.
    }

    return codec;
  } finally {
    try {
      if (inputName) ffmpeg.FS("unlink", inputName);
    } catch {
      // ignore cleanup failures
    }
  }
};

export const readVideoMetadata = (
  blob: Blob,
): Promise<{ duration: number; width: number; height: number }> =>
  new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const objectUrl = URL.createObjectURL(blob);

    const cleanup = () => {
      URL.revokeObjectURL(objectUrl);
      video.removeAttribute("src");
      video.load();
    };

    video.preload = "metadata";
    video.onloadedmetadata = () => {
      const duration = Number.isFinite(video.duration) ? video.duration : 0;
      const width = video.videoWidth || 0;
      const height = video.videoHeight || 0;
      cleanup();
      resolve({ duration, width, height });
    };
    video.onerror = () => {
      cleanup();
      reject(new Error("Unable to read video metadata."));
    };
    video.src = objectUrl;
  });

export const videoSanitizer = async (
  inputBuffer: ArrayBufferLike,
  maxSizeBytes?: number,
): Promise<Uint8Array> => {
  let inputName: string | null = null;
  let outputFilename: string | null = null;
  try {
    await loadFFMPEG();

    const inputArray = new Uint8Array(inputBuffer);
    const inputFormat = detectVideoFormat(inputArray);
    if (!inputFormat) throw new Error(INVALID_VIDEO_FILE_ERROR);
    inputName = `${randomString(16)}.${inputFormat}`;
    outputFilename = `${randomString(16)}.${inputFormat}`;

    ffmpeg.FS("writeFile", inputName, inputArray);

    const sizeLimitBytes = maxSizeBytes ?? 0;
    const shouldCompress =
      sizeLimitBytes > 0 && inputBuffer.byteLength > sizeLimitBytes;
    let ffmpegArgs: string[];

    if (shouldCompress) {
      let duration = 0;
      ffmpeg.setLogger(({ message }) => {
        const match = message.match(/Duration: (\d+):(\d+):(\d+.\d+)/);
        if (match) {
          duration =
            parseInt(match[1]) * 3600 +
            parseInt(match[2]) * 60 +
            parseFloat(match[3]);
        }
      });

      // Probe for duration
      try {
        await ffmpeg.run("-i", inputName);
      } catch {
        // Expected error due to missing output file
      }

      const { videoCodec, audioCodec } = getVideoCodecForFormat(inputFormat);

      if (duration > 0) {
        const originalSizeBytes = inputBuffer.byteLength;
        const originalBitrate = (originalSizeBytes * 8) / duration;
        const targetBitrate = Math.floor(originalBitrate * 0.7);

        ffmpegArgs = [
          "-i",
          inputName,
          "-map_metadata",
          "-1",
          "-c:v",
          videoCodec,
          "-b:v",
          `${targetBitrate}`,
          "-maxrate",
          `${targetBitrate}`,
          "-bufsize",
          `${targetBitrate * 2}`,
          "-c:a",
          audioCodec === "copy" ? "aac" : audioCodec,
        ];

        if (inputFormat === "mp4" || inputFormat === "mov") {
          ffmpegArgs.push("-b:a", "96k");
        }

        ffmpegArgs.push("-preset", "fast");
      } else {
        ffmpegArgs = [
          "-i",
          inputName,
          "-map_metadata",
          "-1",
          "-c:v",
          videoCodec,
          "-c:a",
          audioCodec,
          "-crf",
          "24",
          "-preset",
          "fast",
        ];
      }

      // WebM-specific speed optimizations
      if (inputFormat === "webm") {
        ffmpegArgs.push("-cpu-used", "8");
        ffmpegArgs.push("-deadline", "realtime");
        ffmpegArgs.push("-threads", "4");
      }
    } else {
      ffmpegArgs = ["-i", inputName, "-map_metadata", "-1", "-c", "copy"];
    }

    if (inputFormat === "mp4" || inputFormat === "mov") {
      ffmpegArgs.push("-movflags", "+faststart");
    }

    ffmpegArgs.push(outputFilename);
    await ffmpeg.run(...ffmpegArgs);
    return ffmpeg.FS("readFile", outputFilename);
  } catch (err) {
    console.error("❌ [Video Sanitizer] Error during processing:", err);
    throw err instanceof Error ? err : new Error("Video sanitization failed.");
  } finally {
    try {
      if (inputName) ffmpeg.FS("unlink", inputName);
    } catch {
      // ignore cleanup failures
    }
    try {
      if (outputFilename) ffmpeg.FS("unlink", outputFilename);
    } catch {
      // ignore cleanup failures
    }
  }
};
