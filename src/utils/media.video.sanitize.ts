import { MEDIA_MESSAGES } from "./media.messages";
import {
  detectVideoFormat,
  getVideoCodecForFormat,
  loadFFMPEG,
} from "./media.video.probe";
import { randomString } from "./misc";

const UNRECOGNIZED_FORMAT_ERROR = MEDIA_MESSAGES.invalidVideoFile;

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
