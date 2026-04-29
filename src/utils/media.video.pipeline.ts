import {
  detectVideoFormat,
  loadFFMPEG,
  isFFmpegLoadError,
  getVideoMimeType,
  probeVideoMetrics,
  readVideoMetadata,
} from "./media.video.probe";
import { videoSanitizer } from "./media.video.sanitize";
import { MEDIA_ERROR_CODES, MEDIA_MESSAGES } from "./media.messages";
import {
  normalizeVideoMimeType,
  VIDEO_LIMITS,
  type VideoValidationReason,
  validateVideoDuration,
  validateVideoQuality,
  validateVideoResolution,
  validateVideoSize,
  validateVideoType,
} from "./media.video.validate";

const DISABLE_FFMPEG = process.env.NEXT_PUBLIC_DISABLE_FFMPEG === "true";

export type VideoPipelineErrorCode =
  | VideoValidationReason
  | typeof MEDIA_ERROR_CODES.PROCESSING_FAILED;

export interface VideoPipelineError {
  code?: VideoPipelineErrorCode;
  messages: string[];
  warnings: string[];
}

export interface VideoPipelineSuccess {
  blob: Blob;
  warnings: string[];
  didCompress: boolean;
  meta: {
    duration: number;
    width: number;
    height: number;
    sizeBytes: number;
  };
}

export type VideoPipelineResult =
  | { data: VideoPipelineSuccess; error: null }
  | { data: null; error: VideoPipelineError };

type BrowserVideoMetadata = { duration: number; width: number; height: number };
type BlockingVideoError = {
  code: VideoPipelineErrorCode;
  userMessage: string;
};

const GENERIC_PROCESSING_ERROR: BlockingVideoError = {
  code: MEDIA_ERROR_CODES.PROCESSING_FAILED,
  userMessage: MEDIA_MESSAGES.genericVideoProcessingError,
};

const logVideoPipeline = (
  stage: string,
  details: Record<string, unknown> = {},
): void => {
  console.info(`[Video Pipeline] ${stage}`, details);
};

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const isPositiveNumber = (value: unknown): value is number =>
  isFiniteNumber(value) && value > 0;

const uniqueMessages = (messages: (string | undefined)[]): string[] => {
  const values = messages.filter((message): message is string => Boolean(message));
  return [...new Set(values)];
};

const buildAggregatedValidationError = (
  errors: BlockingVideoError[],
  warnings: string[] = [],
): VideoPipelineError => {
  return {
    code: errors[0]?.code,
    messages: uniqueMessages(errors.map((error) => error.userMessage)),
    warnings: uniqueMessages(warnings),
  };
};

export const warmVideoPipeline = (): void => {
  if (DISABLE_FFMPEG) return;
  if (typeof window === "undefined") return;
  if (typeof SharedArrayBuffer === "undefined") return;

  loadFFMPEG().catch(() => undefined);
};

export const processVideoInput = async (input: Blob): Promise<VideoPipelineResult> => {
  try {
    const validationErrors: BlockingVideoError[] = [];
    let collectedWarnings: string[] = [];
    const startedAt = Date.now();

    const typeError = validateVideoType(input.type);
    if (typeError) {
      validationErrors.push(typeError);
    }

    const rawBuffer = await input.arrayBuffer();
    const rawArray = new Uint8Array(rawBuffer);
    logVideoPipeline("raw_buffer_ready", {
      sizeBytes: rawBuffer.byteLength,
    });

    const rawFormat = detectVideoFormat(rawArray);
    logVideoPipeline("raw_format_detected", {
      rawFormat,
    });
    if (!rawFormat) {
      validationErrors.push({
        code: MEDIA_ERROR_CODES.INVALID_FORMAT,
        userMessage: MEDIA_MESSAGES.invalidVideoFile,
      });
    }

    const normalizedMime = normalizeVideoMimeType(input.type);
    const normalizedBlob = input.slice(0, input.size, normalizedMime);

    const canUseFFmpeg = !DISABLE_FFMPEG && typeof SharedArrayBuffer !== "undefined";

    logVideoPipeline("start", {
      sizeBytes: input.size,
      inputType: input.type || "unknown",
      normalizedMime,
      canUseFFmpeg,
    });

    if (!canUseFFmpeg) {
      logVideoPipeline("ffmpeg_unavailable_fallback", {
        reason: DISABLE_FFMPEG ? "ffmpeg_disabled" : "shared_array_buffer_unavailable",
      });

      let rawMeta: BrowserVideoMetadata | null = null;
      try {
        rawMeta = await readVideoMetadata(normalizedBlob);
      } catch { }
      logVideoPipeline("fallback_metadata_read", {
        rawMeta,
      });

      if (rawMeta !== null) {
        if (isFiniteNumber(rawMeta.duration)) {
          const durationError = validateVideoDuration(rawMeta.duration);
          if (durationError) {
            validationErrors.push(durationError);
          }
        }

        if (isPositiveNumber(rawMeta.width) && isPositiveNumber(rawMeta.height)) {
          const resolutionError = validateVideoResolution(rawMeta.width, rawMeta.height);
          if (resolutionError) {
            validationErrors.push(resolutionError);
          }
        }
      }

      const sizeError = validateVideoSize(normalizedBlob.size);
      if (sizeError) {
        validationErrors.push(sizeError);
      }

      if (rawMeta !== null) {
        const fallbackQuality = validateVideoQuality(
          null,
          {
            duration: isFiniteNumber(rawMeta.duration) ? rawMeta.duration : 0,
            width: isPositiveNumber(rawMeta.width) ? rawMeta.width : 0,
            height: isPositiveNumber(rawMeta.height) ? rawMeta.height : 0,
            sizeBytes: normalizedBlob.size,
          },
          { isFallbackEstimate: true },
        );
        collectedWarnings = collectedWarnings.concat(fallbackQuality.warnings);
        if (fallbackQuality.error) {
          validationErrors.push(fallbackQuality.error);
        }
      }

      if (validationErrors.length > 0) {
        logVideoPipeline("fallback_validation_failed", {
          errorCodes: validationErrors.map((error) => error.code),
          warningCount: collectedWarnings.length,
        });
        return {
          data: null,
          error: buildAggregatedValidationError(validationErrors, collectedWarnings),
        };
      }

      logVideoPipeline("fallback_complete", {
        durationMs: Date.now() - startedAt,
        durationSec: rawMeta?.duration ?? 0,
        width: rawMeta?.width ?? 0,
        height: rawMeta?.height ?? 0,
        sizeBytes: normalizedBlob.size,
        warningCount: collectedWarnings.length,
      });
      return {
        data: {
          blob: normalizedBlob,
          warnings: uniqueMessages(collectedWarnings),
          didCompress: false,
          meta: {
            duration: isFiniteNumber(rawMeta?.duration) ? rawMeta.duration : 0,
            width: isPositiveNumber(rawMeta?.width) ? rawMeta.width : 0,
            height: isPositiveNumber(rawMeta?.height) ? rawMeta.height : 0,
            sizeBytes: normalizedBlob.size,
          },
        },
        error: null,
      };
    }

    if (!rawFormat) {
      return {
        data: null,
        error: buildAggregatedValidationError(validationErrors, collectedWarnings),
      };
    }

    let probe: Awaited<ReturnType<typeof probeVideoMetrics>>;
    try {
      probe = await probeVideoMetrics(rawBuffer);
    } catch (error) {
      logVideoPipeline("probe_failed", {
        isFFmpegLoadError: isFFmpegLoadError(error),
        message: error instanceof Error ? error.message : String(error),
      });
      if (isFFmpegLoadError(error)) {
        return {
          data: null,
          error: buildAggregatedValidationError(
            [],
            collectedWarnings.concat(MEDIA_MESSAGES.videoProcessingHardRefreshWarning),
          ),
        };
      }

      return {
        data: null,
        error: buildAggregatedValidationError(
          [GENERIC_PROCESSING_ERROR],
          collectedWarnings,
        ),
      };
    }

    logVideoPipeline("probe_complete", {
      durationSec: probe.durationSec,
      width: probe.width,
      height: probe.height,
      videoCodec: probe.videoCodec,
      videoBitrateKbps: probe.videoBitrateKbps,
      hasAudio: probe.hasAudio,
    });

    const probeDuration = probe.durationSec;
    const probeWidth = probe.width;
    const probeHeight = probe.height;
    let fallbackMeta: BrowserVideoMetadata | null = null;
    if (
      !isFiniteNumber(probeDuration) ||
      !isPositiveNumber(probeWidth) ||
      !isPositiveNumber(probeHeight)
    ) {
      try {
        fallbackMeta = await readVideoMetadata(normalizedBlob);
      } catch { }
      logVideoPipeline("probe_metadata_fallback_read", {
        fallbackMeta,
      });
    }

    const durationForChecks = isFiniteNumber(probeDuration)
      ? probeDuration
      : isFiniteNumber(fallbackMeta?.duration)
        ? fallbackMeta.duration
        : null;
    const widthForChecks = isPositiveNumber(probeWidth)
      ? probeWidth
      : isPositiveNumber(fallbackMeta?.width)
        ? fallbackMeta.width
        : null;
    const heightForChecks = isPositiveNumber(probeHeight)
      ? probeHeight
      : isPositiveNumber(fallbackMeta?.height)
        ? fallbackMeta.height
        : null;
    logVideoPipeline("validation_inputs_ready", {
      durationForChecks,
      widthForChecks,
      heightForChecks,
      inputSizeBytes: input.size,
    });

    if (rawFormat === "webm") {
      const webmCodec = probe.videoCodec?.toLowerCase();
      if (webmCodec && webmCodec !== "vp8" && webmCodec !== "vp9") {
        validationErrors.push({
          code: MEDIA_ERROR_CODES.INVALID_FORMAT,
          userMessage: MEDIA_MESSAGES.invalidWebmCodec,
        });
      }
    }

    if (isFiniteNumber(durationForChecks)) {
      const probeDurationError = validateVideoDuration(durationForChecks);
      if (probeDurationError) {
        validationErrors.push(probeDurationError);
      }
    }

    if (isPositiveNumber(widthForChecks) && isPositiveNumber(heightForChecks)) {
      const probeResolutionError = validateVideoResolution(widthForChecks, heightForChecks);
      if (probeResolutionError) {
        validationErrors.push(probeResolutionError);
      }
    }

    const qualityResult = validateVideoQuality(
      probe.frameTiming,
      {
        duration: isFiniteNumber(durationForChecks) ? durationForChecks : 0,
        width: isPositiveNumber(widthForChecks) ? widthForChecks : 0,
        height: isPositiveNumber(heightForChecks) ? heightForChecks : 0,
        sizeBytes: input.size,
      },
      {
        measuredBitrateKbps: probe.videoBitrateKbps,
        probeSignals: {
          blurMean: probe.blurMean,
          averageLuma: probe.averageLuma,
          nonSilenceSec: probe.nonSilenceSec,
          hasAudio: probe.hasAudio,
          maxFreezeDurationSec: probe.maxFreezeDurationSec,
          freezeRatio: probe.freezeRatio,
        },
      },
    );

    if (qualityResult.error) {
      validationErrors.push(qualityResult.error);
    }
    collectedWarnings = collectedWarnings.concat(qualityResult.warnings);
    logVideoPipeline("quality_validation_complete", {
      qualityErrorCode: qualityResult.error?.code ?? null,
      warningCount: qualityResult.warnings.length,
      warnings: qualityResult.warnings,
    });

    if (validationErrors.length > 0) {
      logVideoPipeline("pre_sanitize_validation_failed", {
        errorCodes: validationErrors.map((error) => error.code),
        warningCount: collectedWarnings.length,
      });
      return {
        data: null,
        error: buildAggregatedValidationError(validationErrors, collectedWarnings),
      };
    }

    const finalProbeDuration = isFiniteNumber(durationForChecks) ? durationForChecks : 0;
    const finalProbeWidth = isPositiveNumber(widthForChecks) ? widthForChecks : 0;
    const finalProbeHeight = isPositiveNumber(heightForChecks) ? heightForChecks : 0;

    const needsCompression = input.size > VIDEO_LIMITS.maxSizeBytes;

    logVideoPipeline("sanitize_start", {
      needsCompression,
      durationSec: finalProbeDuration,
      width: finalProbeWidth,
      height: finalProbeHeight,
      inputSizeBytes: input.size,
    });

    let sanitizedArray: Uint8Array;
    try {
      sanitizedArray = await videoSanitizer(
        rawBuffer,
        VIDEO_LIMITS.maxSizeBytes,
        finalProbeDuration > 0 ? finalProbeDuration : undefined,
      );
    } catch (error) {
      logVideoPipeline("sanitize_failed", {
        isFFmpegLoadError: isFFmpegLoadError(error),
        message: error instanceof Error ? error.message : String(error),
      });
      if (isFFmpegLoadError(error)) {
        return {
          data: null,
          error: buildAggregatedValidationError(
            [],
            collectedWarnings.concat(MEDIA_MESSAGES.videoProcessingHardRefreshWarning),
          ),
        };
      }

      return {
        data: null,
        error: buildAggregatedValidationError(
          [GENERIC_PROCESSING_ERROR],
          collectedWarnings,
        ),
      };
    }

    const sanitizedFormat = detectVideoFormat(sanitizedArray);
    if (!sanitizedFormat) {
      validationErrors.push({
        code: MEDIA_ERROR_CODES.INVALID_FORMAT,
        userMessage: MEDIA_MESSAGES.invalidVideoFile,
      });
      return {
        data: null,
        error: buildAggregatedValidationError(validationErrors, collectedWarnings),
      };
    }

    const processedBlob = new Blob([sanitizedArray.slice().buffer], {
      type: getVideoMimeType(sanitizedFormat),
    });

    logVideoPipeline("sanitize_complete", {
      outputFormat: sanitizedFormat,
      outputSizeBytes: processedBlob.size,
      inputSizeBytes: input.size,
    });

    const postValidationErrors: BlockingVideoError[] = [];
    const postSizeError = validateVideoSize(processedBlob.size);
    if (postSizeError) {
      postValidationErrors.push(postSizeError);
    }

    const nearSizeLimit = processedBlob.size >= Math.floor(VIDEO_LIMITS.maxSizeBytes * 0.9);
    const nearDurationLimit =
      finalProbeDuration > 0 && finalProbeDuration >= VIDEO_LIMITS.maxDurationSec * 0.9;
    const nearResolutionLimit =
      finalProbeWidth > 0 &&
      finalProbeHeight > 0 &&
      Math.min(finalProbeWidth, finalProbeHeight) <= VIDEO_LIMITS.minDimensionPx + 32;
    // ffmpeg run is expensive, only run post probe estimates are near limit
    const shouldRunPostSanitizeProbe =
      needsCompression || nearSizeLimit || nearDurationLimit || nearResolutionLimit;

    if (shouldRunPostSanitizeProbe) {
      logVideoPipeline("post_sanitize_probe_start", {
        needsCompression,
        nearSizeLimit,
        nearDurationLimit,
        nearResolutionLimit,
      });
      let postProbe: Awaited<ReturnType<typeof probeVideoMetrics>> | null = null;
      try {
        const postBuffer = await processedBlob.arrayBuffer();
        postProbe = await probeVideoMetrics(postBuffer);
      } catch { }
      logVideoPipeline("post_sanitize_probe_complete", {
        postProbe,
      });

      if (postProbe) {
        const postDuration = postProbe.durationSec;
        const postWidth = postProbe.width;
        const postHeight = postProbe.height;

        if (sanitizedFormat === "webm") {
          const webmCodec = postProbe.videoCodec?.toLowerCase();
          if (webmCodec && webmCodec !== "vp8" && webmCodec !== "vp9") {
            postValidationErrors.push({
              code: MEDIA_ERROR_CODES.INVALID_FORMAT,
              userMessage: MEDIA_MESSAGES.invalidWebmCodec,
            });
          }
        }

        if (isFiniteNumber(postDuration)) {
          const postDurationError = validateVideoDuration(postDuration);
          if (postDurationError) {
            postValidationErrors.push(postDurationError);
          }
        }

        if (isPositiveNumber(postWidth) && isPositiveNumber(postHeight)) {
          const postResolutionError = validateVideoResolution(postWidth, postHeight);
          if (postResolutionError) {
            postValidationErrors.push(postResolutionError);
          }
        }
      }
    }

    if (postValidationErrors.length > 0) {
      logVideoPipeline("post_sanitize_validation_failed", {
        errorCodes: postValidationErrors.map((error) => error.code),
        warningCount: collectedWarnings.length,
      });
      return {
        data: null,
        error: buildAggregatedValidationError(postValidationErrors, collectedWarnings),
      };
    }

    logVideoPipeline("complete", {
      durationMs: Date.now() - startedAt,
      didCompress: needsCompression && processedBlob.size < input.size,
      warningCount: collectedWarnings.length,
      outputSizeBytes: processedBlob.size,
      durationSec: finalProbeDuration,
      width: finalProbeWidth,
      height: finalProbeHeight,
    });
    return {
      data: {
        blob: processedBlob,
        warnings: uniqueMessages(collectedWarnings),
        didCompress: needsCompression && processedBlob.size < input.size,
        meta: {
          duration: finalProbeDuration,
          width: finalProbeWidth,
          height: finalProbeHeight,
          sizeBytes: processedBlob.size,
        },
      },
      error: null,
    };
  } catch (error) {
    logVideoPipeline("unexpected_failure", {
      message: error instanceof Error ? error.message : String(error),
    });
    if (isFFmpegLoadError(error)) {
      return {
        data: null,
        error: buildAggregatedValidationError(
          [],
          [MEDIA_MESSAGES.videoProcessingHardRefreshWarning],
        ),
      };
    }

    return {
      data: null,
      error: buildAggregatedValidationError(
        [GENERIC_PROCESSING_ERROR],
        [],
      ),
    };
  }
};
