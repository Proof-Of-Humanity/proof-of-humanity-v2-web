import {
  detectVideoFormat,
  getVideoMimeType,
  probeVideoMetrics,
  readVideoMetadata,
  videoSanitizer,
} from "./media.video";
import { MEDIA_MESSAGES } from "./media.messages";
import {
  normalizeVideoMimeType,
  VIDEO_LIMITS,
  type VideoValidationReason,
  validateVideoDuration,
  validateVideoQuality,
  validateVideoResolution,
  validateVideoSize,
  validateVideoType,
} from "./media.validation";

const DISABLE_FFMPEG = process.env.NEXT_PUBLIC_DISABLE_FFMPEG === "true";

export type VideoPipelineErrorCode = VideoValidationReason | "PROCESSING_FAILED";

export interface VideoPipelineError {
  code: VideoPipelineErrorCode;
  userMessage: string;
  messages?: string[];
  warnings?: string[];
  technical?: string;
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

const toTechnicalError = (err: unknown): string | undefined =>
  err instanceof Error ? err.message : undefined;

type BrowserVideoMetadata = { duration: number; width: number; height: number };

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

  const technical = uniqueMessages(errors.map((error) => error.technical)).join(" | ");

  return {
    code: errors[0]?.code ?? "PROCESSING_FAILED",
    userMessage: messageParts.join(" "),
    messages: errorMessages,
    warnings: warningMessages,
    technical: technical || undefined,
  };
};

const collectDurationAndResolutionErrors = (
  meta: BrowserVideoMetadata,
): VideoPipelineError[] => {
  const errors: VideoPipelineError[] = [];

  const durationError = validateVideoDuration(meta.duration);
  if (durationError) {
    errors.push(durationError);
  }

  const resolutionError = validateVideoResolution(meta.width, meta.height);
  if (resolutionError) {
    errors.push(resolutionError);
  }

  return errors;
};

const readAndValidateBrowserMetadata = async (
  blob: Blob,
): Promise<{ meta: BrowserVideoMetadata | null; errors: VideoPipelineError[] }> => {
  let meta: BrowserVideoMetadata;
  try {
    meta = await readVideoMetadata(blob);
  } catch (err) {
    return {
      meta: null,
      errors: [
        {
          code: "INVALID_FORMAT",
          userMessage: MEDIA_MESSAGES.invalidVideoFile,
          technical: toTechnicalError(err),
        },
      ],
    };
  }

  const validationErrors = collectDurationAndResolutionErrors(meta);
  return { meta, errors: validationErrors };
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
        code: "INVALID_FORMAT",
        userMessage: MEDIA_MESSAGES.invalidVideoFile,
      });
    }

    const normalizedMime = normalizeVideoMimeType(input.type);
    const normalizedBlob = input.slice(0, input.size, normalizedMime);

    const canUseFFmpeg = !DISABLE_FFMPEG && typeof SharedArrayBuffer !== "undefined";

    if (!canUseFFmpeg) {
      const rawMetaResult = await readAndValidateBrowserMetadata(normalizedBlob);
      validationErrors.push(...rawMetaResult.errors);
      const rawMeta = rawMetaResult.meta;

      const sizeError = validateVideoSize(normalizedBlob.size);
      if (sizeError) {
        validationErrors.push(sizeError);
      }

      if (rawMeta !== null) {
        const fallbackQuality = validateVideoQuality(
          null,
          {
            duration: rawMeta.duration,
            width: rawMeta.width,
            height: rawMeta.height,
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

      if (!rawMeta) {
        return {
          data: null,
          error: {
            code: "PROCESSING_FAILED",
            userMessage: MEDIA_MESSAGES.genericVideoProcessingError,
          },
        };
      }

      return {
        data: {
          blob: normalizedBlob,
          warnings: uniqueMessages(collectedWarnings),
          didCompress: false,
          meta: {
            duration: rawMeta.duration,
            width: rawMeta.width,
            height: rawMeta.height,
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
    } catch (err) {
      validationErrors.push({
        code: "PROCESSING_FAILED",
        userMessage: MEDIA_MESSAGES.genericVideoProcessingError,
        technical: toTechnicalError(err),
      });
      return {
        data: null,
        error: buildAggregatedValidationError(validationErrors, collectedWarnings),
      };
    }

    const probeDuration = probe.durationSec;
    const probeWidth = probe.width;
    const probeHeight = probe.height;
    const hasProbeMetadata =
      typeof probeDuration === "number" &&
      Number.isFinite(probeDuration) &&
      typeof probeWidth === "number" &&
      Number.isFinite(probeWidth) &&
      probeWidth > 0 &&
      typeof probeHeight === "number" &&
      Number.isFinite(probeHeight) &&
      probeHeight > 0;

    if (!hasProbeMetadata) {
      validationErrors.push({
        code: "PROCESSING_FAILED",
        userMessage: MEDIA_MESSAGES.genericVideoProcessingError,
      });
    }

    if (rawFormat === "webm") {
      const webmCodec = probe.videoCodec?.toLowerCase();
      if (webmCodec !== "vp8" && webmCodec !== "vp9") {
        validationErrors.push({
          code: "INVALID_FORMAT",
          userMessage: MEDIA_MESSAGES.invalidWebmCodec,
        });
      }
    }

    if (hasProbeMetadata) {
      const probeDurationError = validateVideoDuration(probeDuration);
      if (probeDurationError) {
        validationErrors.push(probeDurationError);
      }

      const probeResolutionError = validateVideoResolution(probeWidth, probeHeight);
      if (probeResolutionError) {
        validationErrors.push(probeResolutionError);
      }

      const qualityResult = validateVideoQuality(
        probe.frameTiming,
        {
          duration: probeDuration,
          width: probeWidth,
          height: probeHeight,
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
    }

    if (validationErrors.length > 0) {
      return {
        data: null,
        error: buildAggregatedValidationError(validationErrors, collectedWarnings),
      };
    }

    const finalProbeDuration = probeDuration as number;
    const finalProbeWidth = probeWidth as number;
    const finalProbeHeight = probeHeight as number;

    const needsCompression = input.size > VIDEO_LIMITS.maxSizeBytes;

    let sanitizedArray: Uint8Array;
    try {
      sanitizedArray = await videoSanitizer(
        rawBuffer,
        VIDEO_LIMITS.maxSizeBytes,
        finalProbeDuration,
      );
    } catch (err) {
      return {
        data: null,
        error: buildAggregatedValidationError(
          [
            {
              code: "PROCESSING_FAILED",
              userMessage: MEDIA_MESSAGES.genericVideoProcessingError,
              technical: toTechnicalError(err),
            },
          ],
          collectedWarnings,
        ),
      };
    }

    const sanitizedFormat = detectVideoFormat(sanitizedArray);
    if (!sanitizedFormat) {
      validationErrors.push({
        code: "INVALID_FORMAT",
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
    const nearDurationLimit = finalProbeDuration >= VIDEO_LIMITS.maxDurationSec * 0.9;
    const nearResolutionLimit =
      Math.min(finalProbeWidth, finalProbeHeight) <= VIDEO_LIMITS.minDimensionPx + 32;
    // ffmpeg run is expensive, only run post probe estimates are near limit
    const shouldRunPostSanitizeProbe =
      needsCompression || nearSizeLimit || nearDurationLimit || nearResolutionLimit;

    if (shouldRunPostSanitizeProbe) {
      let postProbe: Awaited<ReturnType<typeof probeVideoMetrics>> | null = null;
      try {
        const postBuffer = await processedBlob.arrayBuffer();
        postProbe = await probeVideoMetrics(postBuffer);
      } catch (err) {
        postValidationErrors.push({
          code: "PROCESSING_FAILED",
          userMessage: MEDIA_MESSAGES.genericVideoProcessingError,
          technical: toTechnicalError(err),
        });
      }

      if (postProbe) {
        const postDuration = postProbe.durationSec;
        const postWidth = postProbe.width;
        const postHeight = postProbe.height;
        const hasPostMetadata =
          typeof postDuration === "number" &&
          Number.isFinite(postDuration) &&
          typeof postWidth === "number" &&
          Number.isFinite(postWidth) &&
          postWidth > 0 &&
          typeof postHeight === "number" &&
          Number.isFinite(postHeight) &&
          postHeight > 0;

        if (sanitizedFormat === "webm") {
          const webmCodec = postProbe.videoCodec?.toLowerCase();
          if (webmCodec !== "vp8" && webmCodec !== "vp9") {
            postValidationErrors.push({
              code: "INVALID_FORMAT",
              userMessage: MEDIA_MESSAGES.invalidWebmCodec,
            });
          }
        }

        if (!hasPostMetadata) {
          postValidationErrors.push({
            code: "PROCESSING_FAILED",
            userMessage: MEDIA_MESSAGES.genericVideoProcessingError,
          });
        } else {
          const postDurationError = validateVideoDuration(postDuration);
          if (postDurationError) {
            postValidationErrors.push(postDurationError);
          }

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
  } catch (err) {
    return {
      data: null,
      error: {
        code: "PROCESSING_FAILED",
        userMessage: MEDIA_MESSAGES.genericVideoProcessingError,
        technical: toTechnicalError(err),
      },
    };
  }
};
