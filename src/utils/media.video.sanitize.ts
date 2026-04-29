import type { LogEventCallback } from "@ffmpeg/ffmpeg";
import { MEDIA_MESSAGES } from "./media.messages";
import {
  detectVideoFormat,
  getVideoCodecForFormat,
  loadFFMPEG,
} from "./media.video.probe";
import { randomString } from "./misc";

const UNRECOGNIZED_FORMAT_ERROR = MEDIA_MESSAGES.invalidVideoFile;

const logFFmpegSanitizer = (
  stage: string,
  details: Record<string, unknown> = {},
): void => {
  console.info(`[FFmpeg Sanitizer] ${stage}`, details);
};

const logFFmpegSanitizerError = (
  stage: string,
  error: unknown,
  details: Record<string, unknown> = {},
): void => {
  console.error(`[FFmpeg Sanitizer] ${stage}`, {
    ...details,
    message: error instanceof Error ? error.message : String(error),
    error,
  });
};

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
  const startedAt = Date.now();

  const logger: LogEventCallback = ({ message }) => {
    logFFmpegSanitizer("ffmpeg_log", { inputName, message });

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
    logFFmpegSanitizer("probe_rotation_start", { inputName });
    const execResult = await ffmpegInstance.exec(["-i", inputName]);
    logFFmpegSanitizer("probe_rotation_exec_complete", {
      inputName,
      execResult,
      durationMs: Date.now() - startedAt,
    });
    if (execResult !== 0) {
      logFFmpegSanitizerError(
        "probe_rotation_exec_non_zero_exit",
        new Error(`ffmpeg exec exited with code ${execResult}`),
        {
          inputName,
          execResult,
          durationMs: Date.now() - startedAt,
        },
      );
    }
  } catch (error) {
    logFFmpegSanitizerError("probe_rotation_exec_threw", error, {
      inputName,
      durationMs: Date.now() - startedAt,
    });
    // Expected: ffmpeg errors without an output target, but input metadata is logged first.
  } finally {
    ffmpegInstance.off("log", logger);
    logFFmpegSanitizer("probe_rotation_complete", {
      inputName,
      durationMs: Date.now() - startedAt,
      durationSec,
      rotation,
    });
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
  const startedAt = Date.now();

  try {
    logFFmpegSanitizer("sanitize_start", {
      inputSizeBytes: inputBuffer.byteLength,
      maxSizeBytes: maxSizeBytes ?? null,
      inputDurationSec: inputDurationSec ?? null,
    });
    ffmpegInstance = await loadFFMPEG();
    logFFmpegSanitizer("sanitize_ffmpeg_ready", {
      durationMs: Date.now() - startedAt,
    });

    const inputArray = new Uint8Array(inputBuffer);
    const inputFormat = detectVideoFormat(inputArray);
    if (!inputFormat) throw new Error(UNRECOGNIZED_FORMAT_ERROR);
    logFFmpegSanitizer("sanitize_input_format_detected", { inputFormat });

    inputName = `${randomString(16)}.${inputFormat}`;
    outputFilename = `${randomString(16)}.${inputFormat}`;
    logFFmpegSanitizer("sanitize_write_file_start", { inputName, outputFilename });
    await ffmpegInstance.writeFile(inputName, new Uint8Array(inputArray));
    logFFmpegSanitizer("sanitize_write_file_complete", {
      inputName,
      outputFilename,
      durationMs: Date.now() - startedAt,
    });

    const sizeLimitBytes = maxSizeBytes ?? 0;
    const shouldCompress = sizeLimitBytes > 0 && inputBuffer.byteLength > sizeLimitBytes;
    const shouldProbeInput = shouldCompress || inputFormat === "mp4" || inputFormat === "mov";
    logFFmpegSanitizer("sanitize_mode", {
      shouldCompress,
      shouldProbeInput,
      sizeLimitBytes,
      inputSizeBytes: inputBuffer.byteLength,
    });
    const { durationSec: probedDurationSec, rotation } = shouldProbeInput
      ? await probeDurationAndRotation(ffmpegInstance, inputName)
      : { durationSec: 0, rotation: 0 };
    logFFmpegSanitizer("sanitize_probe_complete", {
      inputName,
      probedDurationSec,
      rotation,
    });

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

      if (inputFormat === "webm") {
        ffmpegArgs.push("-speed", "8", "-deadline", "realtime", "-threads", "4");
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
    logFFmpegSanitizer("sanitize_exec_start", {
      inputName,
      outputFilename,
      ffmpegArgs,
    });
    const execResult = await ffmpegInstance.exec(ffmpegArgs);
    logFFmpegSanitizer("sanitize_exec_complete", {
      inputName,
      outputFilename,
      execResult,
      durationMs: Date.now() - startedAt,
    });
    if (execResult !== 0) {
      logFFmpegSanitizerError(
        "sanitize_exec_non_zero_exit",
        new Error(`ffmpeg exec exited with code ${execResult}`),
        {
          inputName,
          outputFilename,
          execResult,
          durationMs: Date.now() - startedAt,
        },
      );
    }

    logFFmpegSanitizer("sanitize_read_file_start", { outputFilename });
    const output = await ffmpegInstance.readFile(outputFilename);
    if (!(output instanceof Uint8Array)) {
      throw new Error("FFmpeg output is not binary data.");
    }
    logFFmpegSanitizer("sanitize_read_file_complete", {
      outputFilename,
      outputSizeBytes: output.byteLength,
      durationMs: Date.now() - startedAt,
    });
    return output;
  } catch (err) {
    logFFmpegSanitizerError("sanitize_failure", err, {
      inputName,
      outputFilename,
      durationMs: Date.now() - startedAt,
    });
    console.error("❌ [Video Sanitizer] Error during processing:", err);
    throw err instanceof Error ? err : new Error("Video sanitization failed.");
  } finally {
    try {
      if (inputName && ffmpegInstance) {
        logFFmpegSanitizer("sanitize_cleanup_input_start", { inputName });
        await ffmpegInstance.deleteFile(inputName);
        logFFmpegSanitizer("sanitize_cleanup_input_complete", { inputName });
      }
    } catch (error) {
      logFFmpegSanitizerError("sanitize_cleanup_input_failed", error, { inputName });
    }

    try {
      if (outputFilename && ffmpegInstance) {
        logFFmpegSanitizer("sanitize_cleanup_output_start", { outputFilename });
        await ffmpegInstance.deleteFile(outputFilename);
        logFFmpegSanitizer("sanitize_cleanup_output_complete", { outputFilename });
      }
    } catch (error) {
      logFFmpegSanitizerError("sanitize_cleanup_output_failed", error, {
        outputFilename,
      });
    }
  }
};
