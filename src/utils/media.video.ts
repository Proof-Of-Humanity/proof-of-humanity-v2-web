import { FFmpeg, createFFmpeg } from "@ffmpeg/ffmpeg";
import { MEDIA_MESSAGES } from "./media.messages";
import { randomString } from "./misc";

let ffmpeg: FFmpeg;

const UNRECOGNIZED_FORMAT_ERROR = MEDIA_MESSAGES.invalidVideoFile;

const loadFFMPEG = async () => {
  if (typeof SharedArrayBuffer === "undefined") {
    throw new Error(
      "Video processing is not available. Please refresh the page (Cmd+R or Ctrl+R) and try again.",
    );
  }

  if (ffmpeg && ffmpeg.isLoaded()) {
    return;
  }

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
  format: VideoFormat,
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

export interface VideoProbeMetrics {
  videoCodec: string | null;
  videoBitrateKbps: number | null;
  durationSec: number | null;
  width: number | null;
  height: number | null;
  frameTiming: VideoFrameTimingMetrics | null;
}

const parseDurationToSeconds = (message: string): number | null => {
  const match = message.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
  if (!match) return null;

  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const seconds = parseFloat(match[3]);

  if (!Number.isFinite(hours) || !Number.isFinite(minutes) || !Number.isFinite(seconds)) {
    return null;
  }

  return hours * 3600 + minutes * 60 + seconds;
};

const parseResolution = (message: string): { width: number; height: number } | null => {
  if (message.includes("wrapped_avframe")) return null;
  const showInfoMatch = message.match(/\bs:(\d{2,5})x(\d{2,5})\b/);
  const streamMatch = message.match(/,\s*(\d{2,5})x(\d{2,5})(?:[\s,]|$)/);
  const match = showInfoMatch ?? streamMatch;
  if (!match) return null;

  const width = parseInt(match[1], 10);
  const height = parseInt(match[2], 10);

  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return null;
  }

  return { width, height };
};

const parseKbps = (text: string): number | null => {
  const value = Number.parseFloat(text);
  return Number.isFinite(value) && value > 0 ? value : null;
};

const parseContainerBitrate = (message: string): number | null => {
  const bitrateMatch = message.match(/bitrate:\s*([0-9]+(?:\.[0-9]+)?)\s*kb\/s/i);
  if (!bitrateMatch) return null;
  return parseKbps(bitrateMatch[1]);
};

const parseVideoStreamBitrate = (message: string): number | null => {
  if (!message.includes("Video:")) return null;
  // FFmpeg's `showinfo` filter creates a fake output stream that always reports 200 kb/s.
  // We must ignore it so we don't overwrite the actual container bitrate.
  if (message.includes("wrapped_avframe")) return null;
  const bitrateMatches = [...message.matchAll(/([0-9]+(?:\.[0-9]+)?)\s*kb\/s/gi)];
  if (bitrateMatches.length === 0) return null;
  const lastMatch = bitrateMatches[bitrateMatches.length - 1];
  return parseKbps(lastMatch[1]);
};

const buildFrameTimingMetrics = (
  frameTimes: number[],
): VideoFrameTimingMetrics | null => {
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

  return {
    frameCount: frameTimes.length,
    effectiveFps: span > 0 ? (frameTimes.length - 1) / span : null,
    maxFrameGapMs: Math.max(...frameGaps) * 1000,
  };
};

export const probeVideoMetrics = async (
  inputBuffer: ArrayBufferLike,
): Promise<VideoProbeMetrics> => {
  let inputName: string | null = null;

  try {
    await loadFFMPEG();

    const inputArray = new Uint8Array(inputBuffer);
    const inputFormat = detectVideoFormat(inputArray);
    if (!inputFormat) throw new Error(UNRECOGNIZED_FORMAT_ERROR);

    inputName = `${randomString(16)}.${inputFormat}`;
    ffmpeg.FS("writeFile", inputName, inputArray);

    let durationSec: number | null = null;
    let width: number | null = null;
    let height: number | null = null;
    let videoCodec: string | null = null;
    let videoBitrateKbps: number | null = null;
    let containerBitrateKbps: number | null = null;
    const frameTimes: number[] = [];

    ffmpeg.setLogger(({ message }) => {
      if (!videoCodec) {
        const codecMatch = message.match(/Video:\s*([a-zA-Z0-9_]+)/);
        if (codecMatch) videoCodec = codecMatch[1].toLowerCase();
      }

      if (durationSec === null) {
        const parsedDuration = parseDurationToSeconds(message);
        if (parsedDuration !== null) durationSec = parsedDuration;
      }

      if (containerBitrateKbps === null) {
        const parsedContainerBitrate = parseContainerBitrate(message);
        if (parsedContainerBitrate !== null) containerBitrateKbps = parsedContainerBitrate;
      }

      if (videoBitrateKbps === null) {
        const parsedVideoBitrate = parseVideoStreamBitrate(message);
        if (parsedVideoBitrate !== null) videoBitrateKbps = parsedVideoBitrate;
      }

      if (width === null || height === null) {
        const parsedResolution = parseResolution(message);
        if (parsedResolution) {
          width = parsedResolution.width;
          height = parsedResolution.height;
        }
      }

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
      // Null sink can still throw, but metadata logs are usually produced.
    }

    const result = {
      videoCodec,
      videoBitrateKbps: videoBitrateKbps ?? containerBitrateKbps,
      durationSec,
      width,
      height,
      frameTiming: buildFrameTimingMetrics(frameTimes),
    };

    return result;
  } catch (err) {
    console.error("❌ [Video Probe] Error while extracting video metrics:", err);
    throw err instanceof Error ? err : new Error("Video probe failed.");
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
  inputDurationSec?: number,
): Promise<Uint8Array> => {
  let inputName: string | null = null;
  let outputFilename: string | null = null;

  try {
    await loadFFMPEG();

    const inputArray = new Uint8Array(inputBuffer);
    const inputFormat = detectVideoFormat(inputArray);
    if (!inputFormat) throw new Error(UNRECOGNIZED_FORMAT_ERROR);

    inputName = `${randomString(16)}.${inputFormat}`;
    outputFilename = `${randomString(16)}.${inputFormat}`;
    ffmpeg.FS("writeFile", inputName, inputArray);

    const sizeLimitBytes = maxSizeBytes ?? 0;
    const shouldCompress = sizeLimitBytes > 0 && inputBuffer.byteLength > sizeLimitBytes;

    let ffmpegArgs: string[];

    if (shouldCompress) {
      const { videoCodec, audioCodec } = getVideoCodecForFormat(inputFormat);
      const duration =
        typeof inputDurationSec === "number" && Number.isFinite(inputDurationSec)
          ? inputDurationSec
          : 0;

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
          audioCodec,
        ];

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

    const output = ffmpeg.FS("readFile", outputFilename);
    return output;
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
