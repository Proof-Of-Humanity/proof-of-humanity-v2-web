import { FFmpeg, createFFmpeg } from "@ffmpeg/ffmpeg";
import { randomString } from "./misc";

let ffmpeg: FFmpeg;

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

export const detectVideoFormat = (
  buffer: Uint8Array,
): "mp4" | "mov" | "webm" | "avi" => {
  if (buffer.length < 12) return "mp4";

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

  return "mp4";
};

export const getVideoMimeType = (format: string): string => {
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

export const videoSanitizer = async (
  inputBuffer: ArrayBufferLike,
  maxSizeBytes?: number,
) => {
  try {
    await loadFFMPEG();

    const inputArray = new Uint8Array(inputBuffer);
    const inputFormat = detectVideoFormat(inputArray);
    const inputName = `${randomString(16)}.${inputFormat}`;
    const outputFilename = `${randomString(16)}.${inputFormat}`;

    ffmpeg.FS("writeFile", inputName, inputArray);

    const sizeLimitBytes = maxSizeBytes ?? 0;
    const shouldCompress =
      sizeLimitBytes > 0 && inputBuffer.byteLength > sizeLimitBytes;
    let ffmpegArgs: string[];
    let compressionMode: "copy" | "bitrate-target" | "crf-fallback" = "copy";

    console.info("[Video Sanitizer] Decision", {
      format: inputFormat,
      inputSizeBytes: inputBuffer.byteLength,
      maxSizeBytes: sizeLimitBytes || null,
      shouldCompress,
    });

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
        compressionMode = "bitrate-target";

        console.info("[Video Sanitizer] Compression mode", {
          mode: compressionMode,
          durationSeconds: Number(duration.toFixed(3)),
          targetBitrate,
        });

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
        compressionMode = "crf-fallback";
        console.info("[Video Sanitizer] Compression mode", {
          mode: compressionMode,
        });
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
      compressionMode = "copy";
      ffmpegArgs = ["-i", inputName, "-map_metadata", "-1", "-c", "copy"];
    }

    if (inputFormat === "mp4" || inputFormat === "mov") {
      ffmpegArgs.push("-movflags", "+faststart");
    }

    ffmpegArgs.push(outputFilename);
    try {
      await ffmpeg.run(...ffmpegArgs);
    } catch (err) {
      console.error("❌ [FFmpeg] Processing failed:", err);
      throw err;
    }

    const outputData = ffmpeg.FS("readFile", outputFilename);
    console.info("[Video Sanitizer] Result", {
      mode: compressionMode,
      inputSizeBytes: inputBuffer.byteLength,
      outputSizeBytes: outputData.byteLength,
      bytesDelta: outputData.byteLength - inputBuffer.byteLength,
    });

    try {
      ffmpeg.FS("unlink", inputName);
      ffmpeg.FS("unlink", outputFilename);
    } catch {
      // ignore cleanup failures
    }

    return outputData;
  } catch (err) {
    console.error("❌ [Video Sanitizer] Error during processing:", err);
    return inputBuffer;
  }
};
