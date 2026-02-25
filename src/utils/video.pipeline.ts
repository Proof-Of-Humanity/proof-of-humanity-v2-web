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

const validateDurationAndResolution = (
  meta: BrowserVideoMetadata,
): VideoPipelineError | null => {
  const durationError = validateVideoDuration(meta.duration);
  if (durationError) {
    return durationError;
  }

  const resolutionError = validateVideoResolution(meta.width, meta.height);
  if (resolutionError) {
    return resolutionError;
  }

  return null;
};

const readAndValidateBrowserMetadata = async (
  blob: Blob,
): Promise<{ meta: BrowserVideoMetadata | null; error: VideoPipelineError | null }> => {
  let meta: BrowserVideoMetadata;
  try {
    meta = await readVideoMetadata(blob);
  } catch (err) {
    return {
      meta: null,
      error: {
        code: "INVALID_FORMAT",
        userMessage: MEDIA_MESSAGES.invalidVideoFile,
        technical: toTechnicalError(err),
      },
    };
  }

  const validationError = validateDurationAndResolution(meta);
  if (validationError) {
    return { meta: null, error: validationError };
  }

  return { meta, error: null };
};

export const processVideoInput = async (input: Blob): Promise<VideoPipelineResult> => {
  try {
    const typeError = validateVideoType(input.type);
    if (typeError) {
      return { data: null, error: typeError };
    }

    const rawBuffer = await input.arrayBuffer();
    const rawArray = new Uint8Array(rawBuffer);

    const rawFormat = detectVideoFormat(rawArray);
    if (!rawFormat) {
      return {
        data: null,
        error: {
          code: "INVALID_FORMAT",
          userMessage: MEDIA_MESSAGES.invalidVideoFile,
        },
      };
    }

    const normalizedMime = normalizeVideoMimeType(input.type);
    const normalizedBlob = input.slice(0, input.size, normalizedMime);

    const canUseFFmpeg = !DISABLE_FFMPEG && typeof SharedArrayBuffer !== "undefined";

    if (!canUseFFmpeg) {
      const rawMetaResult = await readAndValidateBrowserMetadata(normalizedBlob);
      if (rawMetaResult.error || !rawMetaResult.meta) {
        return { data: null, error: rawMetaResult.error! };
      }
      const rawMeta = rawMetaResult.meta;

      const sizeError = validateVideoSize(normalizedBlob.size);
      if (sizeError) {
        return { data: null, error: sizeError };
      }

      const qualityWarnings = validateVideoQuality(
        null,
        {
          duration: rawMeta.duration,
          width: rawMeta.width,
          height: rawMeta.height,
          sizeBytes: normalizedBlob.size,
        },
        { isFallbackEstimate: true },
      ).warnings;
      return {
        data: {
          blob: normalizedBlob,
          warnings: qualityWarnings,
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

    const probe = await probeVideoMetrics(rawBuffer);

    const probeDuration = probe.durationSec;
    const probeWidth = probe.width;
    const probeHeight = probe.height;

    if (
      typeof probeDuration !== "number" ||
      !Number.isFinite(probeDuration) ||
      typeof probeWidth !== "number" ||
      !Number.isFinite(probeWidth) ||
      probeWidth <= 0 ||
      typeof probeHeight !== "number" ||
      !Number.isFinite(probeHeight) ||
      probeHeight <= 0
    ) {
      return {
        data: null,
        error: {
          code: "PROCESSING_FAILED",
          userMessage: MEDIA_MESSAGES.genericVideoProcessingError,
        },
      };
    }

    const probeDurationError = validateVideoDuration(probeDuration);
    if (probeDurationError) {
      return { data: null, error: probeDurationError };
    }

    const probeResolutionError = validateVideoResolution(probeWidth, probeHeight);
    if (probeResolutionError) {
      return { data: null, error: probeResolutionError };
    }

    if (rawFormat === "webm") {
      const webmCodec = probe.videoCodec?.toLowerCase();
      if (webmCodec !== "vp8" && webmCodec !== "vp9") {
        return {
          data: null,
          error: {
            code: "INVALID_FORMAT",
            userMessage: MEDIA_MESSAGES.invalidWebmCodec,
          },
        };
      }
    }

    const qualityResult = validateVideoQuality(
      probe.frameTiming,
      {
        duration: probeDuration,
        width: probeWidth,
        height: probeHeight,
        sizeBytes: input.size,
      },
      { measuredBitrateKbps: probe.videoBitrateKbps },
    );

    if (qualityResult.error) {
      return { data: null, error: qualityResult.error };
    }

    const needsCompression = input.size > VIDEO_LIMITS.maxSizeBytes;

    let sanitizedArray: Uint8Array;
    try {
      sanitizedArray = await videoSanitizer(
        rawBuffer,
        VIDEO_LIMITS.maxSizeBytes,
        probeDuration,
      );
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

    const sanitizedFormat = detectVideoFormat(sanitizedArray);
    if (!sanitizedFormat) {
      return {
        data: null,
        error: {
          code: "INVALID_FORMAT",
          userMessage: MEDIA_MESSAGES.invalidVideoFile,
        },
      };
    }

    const processedBlob = new Blob([sanitizedArray.slice().buffer], {
      type: getVideoMimeType(sanitizedFormat),
    });

    const postSizeError = validateVideoSize(processedBlob.size);
    if (postSizeError) {
      return { data: null, error: postSizeError };
    }

    const nearSizeLimit = processedBlob.size >= Math.floor(VIDEO_LIMITS.maxSizeBytes * 0.9);
    const nearDurationLimit = probeDuration >= VIDEO_LIMITS.maxDurationSec * 0.9;
    const nearResolutionLimit =
      Math.min(probeWidth, probeHeight) <= VIDEO_LIMITS.minDimensionPx + 32;
    // ffmpeg run is expensive, only run post probe estimates are near limit 
    const shouldRunPostSanitizeProbe =
      needsCompression || nearSizeLimit || nearDurationLimit || nearResolutionLimit;

    if (shouldRunPostSanitizeProbe) {
      let postProbe: Awaited<ReturnType<typeof probeVideoMetrics>>;
      try {
        const postBuffer = await processedBlob.arrayBuffer();
        postProbe = await probeVideoMetrics(postBuffer);
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

      const postDuration = postProbe.durationSec;
      const postWidth = postProbe.width;
      const postHeight = postProbe.height;

      if (
        typeof postDuration !== "number" ||
        !Number.isFinite(postDuration) ||
        typeof postWidth !== "number" ||
        !Number.isFinite(postWidth) ||
        postWidth <= 0 ||
        typeof postHeight !== "number" ||
        !Number.isFinite(postHeight) ||
        postHeight <= 0
      ) {
        return {
          data: null,
          error: {
            code: "PROCESSING_FAILED",
            userMessage: MEDIA_MESSAGES.genericVideoProcessingError,
          },
        };
      }

      const postDurationError = validateVideoDuration(postDuration);
      if (postDurationError) {
        return { data: null, error: postDurationError };
      }

      const postResolutionError = validateVideoResolution(postWidth, postHeight);
      if (postResolutionError) {
        return { data: null, error: postResolutionError };
      }

      if (sanitizedFormat === "webm") {
        const webmCodec = postProbe.videoCodec?.toLowerCase();
        if (webmCodec !== "vp8" && webmCodec !== "vp9") {
          return {
            data: null,
            error: {
              code: "INVALID_FORMAT",
              userMessage: MEDIA_MESSAGES.invalidWebmCodec,
            },
          };
        }
      }
    }

    return {
      data: {
        blob: processedBlob,
        warnings: qualityResult.warnings,
        didCompress: needsCompression && processedBlob.size < input.size,
        meta: {
          duration: probeDuration,
          width: probeWidth,
          height: probeHeight,
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
