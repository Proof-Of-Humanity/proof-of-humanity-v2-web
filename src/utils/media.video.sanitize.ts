import type { LogEventCallback } from "@ffmpeg/ffmpeg";
import { MEDIA_MESSAGES } from "./media.messages";
import {
  detectVideoFormat,
  getVideoCodecForFormat,
  loadFFMPEG,
} from "./media.video.probe";
import { randomString } from "./misc";

const UNRECOGNIZED_FORMAT_ERROR = MEDIA_MESSAGES.invalidVideoFile;

const normalizeRotation = (rotation: number): number => {
  const snapped = Math.round(rotation / 90) * 90;
  const normalized = ((snapped % 360) + 360) % 360;
  return [0, 90, 180, 270].includes(normalized) ? normalized : 0;
};

const probeDurationAndRotation = async (
  ffmpegInstance: Awaited<ReturnType<typeof loadFFMPEG>>,
  inputName: string,
): Promise<{ durationSec: number; rotation: number }> => {
  let durationSec = 0;
  let rotation = 0;

  const logger: LogEventCallback = ({ message }) => {
    const durationMatch = message.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
    if (durationMatch) {
      durationSec =
        parseInt(durationMatch[1], 10) * 3600 +
        parseInt(durationMatch[2], 10) * 60 +
        parseFloat(durationMatch[3]);
    }

    const rotationMatch = message.match(/rotation of (-?\d+(?:\.\d+)?) degrees/i);
    if (rotationMatch) {
      rotation = normalizeRotation(parseFloat(rotationMatch[1]));
    }
  };

  ffmpegInstance.on("log", logger);

  try {
    await ffmpegInstance.exec(["-i", inputName]);
  } catch {
    // Expected: ffmpeg errors without an output target, but input metadata is logged first.
  } finally {
    ffmpegInstance.off("log", logger);
  }

  return { durationSec, rotation };
};

export const videoSanitizer = async (
  inputBuffer: ArrayBufferLike,
  maxSizeBytes?: number,
  inputDurationSec?: number,
): Promise<Uint8Array> => {
  let inputName: string | null = null;
  let outputFilename: string | null = null;
  let ffmpegInstance: Awaited<ReturnType<typeof loadFFMPEG>> | null = null;

  try {
    ffmpegInstance = await loadFFMPEG();

    const inputArray = new Uint8Array(inputBuffer);
    const inputFormat = detectVideoFormat(inputArray);
    if (!inputFormat) throw new Error(UNRECOGNIZED_FORMAT_ERROR);

    inputName = `${randomString(16)}.${inputFormat}`;
    outputFilename = `${randomString(16)}.${inputFormat}`;
    await ffmpegInstance.writeFile(inputName, new Uint8Array(inputArray));

    const sizeLimitBytes = maxSizeBytes ?? 0;
    const shouldCompress = sizeLimitBytes > 0 && inputBuffer.byteLength > sizeLimitBytes;
    const shouldProbeInput = shouldCompress || inputFormat === "mp4" || inputFormat === "mov";
    const { durationSec: probedDurationSec, rotation } = shouldProbeInput
      ? await probeDurationAndRotation(ffmpegInstance, inputName)
      : { durationSec: 0, rotation: 0 };

    let ffmpegArgs: string[];

    if (shouldCompress) {
      const { videoCodec, audioCodec } = getVideoCodecForFormat(inputFormat);
      const duration =
        typeof inputDurationSec === "number" && Number.isFinite(inputDurationSec)
          ? inputDurationSec
          : probedDurationSec;

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

        if (videoCodec === "libx264") {
          ffmpegArgs.push("-preset", "fast");
        }
      } else {
        if (inputFormat === "webm") {
          ffmpegArgs = [
            "-i",
            inputName,
            "-map_metadata",
            "-1",
            "-c:v",
            "libvpx",
            "-b:v",
            "2500k",
            "-c:a",
            "libopus",
          ];
        } else if (inputFormat === "avi") {
          ffmpegArgs = [
            "-i",
            inputName,
            "-map_metadata",
            "-1",
            "-c:v",
            "mpeg4",
            "-b:v",
            "2500k",
            "-c:a",
            "mp3",
          ];
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
      }
    } else {
      ffmpegArgs = ["-i", inputName, "-map_metadata", "-1", "-c", "copy"];
    }

    if (inputFormat === "mp4" || inputFormat === "mov") {
      if (rotation !== 0) {
        ffmpegArgs.push("-metadata:s:v:0", `rotate=${rotation}`);
      }
      ffmpegArgs.push("-movflags", "+faststart");
    }

    ffmpegArgs.push(outputFilename);
    await ffmpegInstance.exec(ffmpegArgs);

    const output = await ffmpegInstance.readFile(outputFilename);
    if (!(output instanceof Uint8Array)) {
      throw new Error("FFmpeg output is not binary data.");
    }
    return output;
  } catch (err) {
    console.error("❌ [Video Sanitizer] Error during processing:", err);
    throw err instanceof Error ? err : new Error("Video sanitization failed.");
  } finally {
    try {
      if (inputName && ffmpegInstance) await ffmpegInstance.deleteFile(inputName);
    } catch {
      // ignore cleanup failures
    }

    try {
      if (outputFilename && ffmpegInstance) await ffmpegInstance.deleteFile(outputFilename);
    } catch {
      // ignore cleanup failures
    }
  }
};
