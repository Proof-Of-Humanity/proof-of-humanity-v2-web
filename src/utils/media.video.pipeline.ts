import {
  detectVideoFormat,
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
  code: VideoPipelineErrorCode;
  userMessage: string;
  messages?: string[];
  warnings?: string[];
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

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const isPositiveNumber = (value: unknown): value is number =>
  isFiniteNumber(value) && value > 0;

const uniqueMessages = (messages: (string | undefined)[]): string[] => {
  const values = messages.filter((message): message is string => Boolean(message));
  return [...new Set(values)];
};

const buildAggregatedValidationError = (
  errors: VideoPipelineError[],
  warnings: string[] = [],
): VideoPipelineError => {
  const errorMessages = uniqueMessages(errors.map((error) => error.userMessage));
  const warningMessages = uniqueMessages(warnings);
  const messageParts: string[] = [];

  if (errorMessages.length > 0) {
    messageParts.push(errorMessages.join(" "));
  }
  if (warningMessages.length > 0) {
    messageParts.push(`Warnings: ${warningMessages.join(" ")}`);
  }

  return {
    code: errors[0]?.code ?? MEDIA_ERROR_CODES.PROCESSING_FAILED,
    userMessage: messageParts.join(" "),
    messages: errorMessages,
    warnings: warningMessages,
  };
};

export const processVideoInput = async (input: Blob): Promise<VideoPipelineResult> => {
  try {
    const validationErrors: VideoPipelineError[] = [];
    let collectedWarnings: string[] = [];

    const typeError = validateVideoType(input.type);
    if (typeError) {
      validationErrors.push(typeError);
    }

    const rawBuffer = await input.arrayBuffer();
    const rawArray = new Uint8Array(rawBuffer);

    const rawFormat = detectVideoFormat(rawArray);
    if (!rawFormat) {
      validationErrors.push({
        code: MEDIA_ERROR_CODES.INVALID_FORMAT,
        userMessage: MEDIA_MESSAGES.invalidVideoFile,
      });
    }

    const normalizedMime = normalizeVideoMimeType(input.type);
    const normalizedBlob = input.slice(0, input.size, normalizedMime);

    const canUseFFmpeg = !DISABLE_FFMPEG && typeof SharedArrayBuffer !== "undefined";

    if (!canUseFFmpeg) {
      let rawMeta: BrowserVideoMetadata | null = null;
      try {
        rawMeta = await readVideoMetadata(normalizedBlob);
      } catch {}

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
        return {
          data: null,
          error: buildAggregatedValidationError(validationErrors, collectedWarnings),
        };
      }

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
      validationErrors.push({
        code: MEDIA_ERROR_CODES.PROCESSING_FAILED,
        userMessage: MEDIA_MESSAGES.genericVideoProcessingError,
      });
      return {
        data: null,
        error: buildAggregatedValidationError(
          validationErrors,
          isFFmpegLoadError(error)
            ? collectedWarnings.concat(
              MEDIA_MESSAGES.videoProcessingHardRefreshWarning,
            )
            : collectedWarnings,
        ),
      };
    }

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
      } catch {}
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

    if (validationErrors.length > 0) {
      return {
        data: null,
        error: buildAggregatedValidationError(validationErrors, collectedWarnings),
      };
    }

    const finalProbeDuration = isFiniteNumber(durationForChecks) ? durationForChecks : 0;
    const finalProbeWidth = isPositiveNumber(widthForChecks) ? widthForChecks : 0;
    const finalProbeHeight = isPositiveNumber(heightForChecks) ? heightForChecks : 0;

    const needsCompression = input.size > VIDEO_LIMITS.maxSizeBytes;

    let sanitizedArray: Uint8Array;
    try {
      sanitizedArray = await videoSanitizer(
        rawBuffer,
        VIDEO_LIMITS.maxSizeBytes,
        finalProbeDuration > 0 ? finalProbeDuration : undefined,
      );
    } catch (error) {
      return {
        data: null,
        error: buildAggregatedValidationError(
          [
            {
              code: MEDIA_ERROR_CODES.PROCESSING_FAILED,
              userMessage: MEDIA_MESSAGES.genericVideoProcessingError,
            },
          ],
          isFFmpegLoadError(error)
            ? collectedWarnings.concat(
              MEDIA_MESSAGES.videoProcessingHardRefreshWarning,
            )
            : collectedWarnings,
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

    const postValidationErrors: VideoPipelineError[] = [];
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
      let postProbe: Awaited<ReturnType<typeof probeVideoMetrics>> | null = null;
      try {
        const postBuffer = await processedBlob.arrayBuffer();
        postProbe = await probeVideoMetrics(postBuffer);
      } catch {}

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
      return {
        data: null,
        error: buildAggregatedValidationError(postValidationErrors, collectedWarnings),
      };
    }

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
    return {
      data: null,
      error: buildAggregatedValidationError(
        [
          {
            code: MEDIA_ERROR_CODES.PROCESSING_FAILED,
            userMessage: MEDIA_MESSAGES.genericVideoProcessingError,
          },
        ],
        isFFmpegLoadError(error)
          ? [MEDIA_MESSAGES.videoProcessingHardRefreshWarning]
          : [],
      ),
    };
  }
};
