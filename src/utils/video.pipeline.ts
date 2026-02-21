import {
  analyzeVideoFrameTiming,
  detectVideoFormat,
  getPrimaryVideoCodec,
  getVideoMimeType,
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

export interface VideoPipelineResult {
  data: VideoPipelineSuccess | null;
  error: VideoPipelineError | null;
}

const toTechnicalError = (err: unknown): string | undefined =>
  err instanceof Error ? err.message : undefined;

export const processVideoInput = async (input: Blob): Promise<VideoPipelineResult> => {
  try {
    const typeError = validateVideoType(input.type);
    if (typeError) return { data: null, error: typeError };

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

    let rawMeta: { duration: number; width: number; height: number };
    try {
      rawMeta = await readVideoMetadata(input);
    } catch (err) {
      return {
        data: null,
        error: {
          code: "INVALID_FORMAT",
          userMessage: MEDIA_MESSAGES.invalidVideoFile,
          technical: toTechnicalError(err),
        },
      };
    }

    const durationError = validateVideoDuration(rawMeta.duration);
    if (durationError) return { data: null, error: durationError };

    const resolutionError = validateVideoResolution(rawMeta.width, rawMeta.height);
    if (resolutionError) return { data: null, error: resolutionError };

    const normalizedMime = normalizeVideoMimeType(input.type);
    const normalizedBlob = normalizedMime ? input.slice(0, input.size, normalizedMime) : input;
    const canUseFFmpeg = !DISABLE_FFMPEG && typeof SharedArrayBuffer !== "undefined";

    if (!canUseFFmpeg) {
      const sizeError = validateVideoSize(normalizedBlob.size);
      if (sizeError) return { data: null, error: sizeError };

      const qualityResult = validateVideoQuality(null, {
        duration: rawMeta.duration,
        width: rawMeta.width,
        height: rawMeta.height,
        sizeBytes: normalizedBlob.size,
      });

      if (qualityResult.error) return { data: null, error: qualityResult.error };

      return {
        data: {
          blob: normalizedBlob,
          warnings: qualityResult.warnings,
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

    if (rawFormat === "webm") {
      try {
        const webmCodec = await getPrimaryVideoCodec(rawBuffer);
        if (webmCodec === "h264") {
          return {
            data: null,
            error: {
              code: "INVALID_FORMAT",
              userMessage: MEDIA_MESSAGES.invalidWebmCodec,
            },
          };
        }
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
    }

    const needsCompression = input.size > VIDEO_LIMITS.maxSizeBytes;

    let sanitizedArray: Uint8Array;
    try {
      sanitizedArray = await videoSanitizer(rawBuffer, VIDEO_LIMITS.maxSizeBytes);
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
    const didCompress = needsCompression && processedBlob.size < input.size;

    let processedMeta: { duration: number; width: number; height: number };
    try {
      processedMeta = await readVideoMetadata(processedBlob);
    } catch (err) {
      return {
        success: false,
        error: {
          code: "PROCESSING_FAILED",
          userMessage: MEDIA_MESSAGES.genericVideoProcessingError,
          technical: toTechnicalError(err),
        },
      };
    }

    const postDurationError = validateVideoDuration(processedMeta.duration);
    if (postDurationError) return { success: false, error: postDurationError };

    const postResolutionError = validateVideoResolution(
      processedMeta.width,
      processedMeta.height,
    );
    if (postResolutionError) return { success: false, error: postResolutionError };

    const postSizeError = validateVideoSize(processedBlob.size);
    if (postSizeError) return { success: false, error: postSizeError };

    const frameTiming = await analyzeVideoFrameTiming(sanitizedArray.buffer);
    const qualityResult = validateVideoQuality(frameTiming, {
      duration: processedMeta.duration,
      width: processedMeta.width,
      height: processedMeta.height,
      sizeBytes: processedBlob.size,
    });

    if (qualityResult.error) return { success: false, error: qualityResult.error };

    return {
      success: true,
      data: {
        blob: processedBlob,
        warnings: qualityResult.warnings,
        didCompress,
        meta: {
          duration: processedMeta.duration,
          width: processedMeta.width,
          height: processedMeta.height,
          sizeBytes: processedBlob.size,
        },
      },
    };
  } catch (err) {
    return {
      success: false,
      error: {
        code: "PROCESSING_FAILED",
        userMessage: MEDIA_MESSAGES.genericVideoProcessingError,
        technical: toTechnicalError(err),
      },
    };
  }
};
