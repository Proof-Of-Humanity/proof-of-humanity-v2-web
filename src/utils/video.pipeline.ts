import {
  analyzeVideoFrameTiming,
  detectVideoFormat,
  getPrimaryVideoCodec,
  getVideoMimeType,
  readVideoMetadata,
  videoSanitizer,
} from "./media.video";
import {
  VIDEO_LIMITS,
  validateVideoQuality,
  validateVideoType,
} from "./media.validation";

export const VIDEO_PIPELINE_MESSAGES = {
  genericProcessingError:
    "Something went wrong while processing the video. Please try again.",
  invalidVideoFile:
    "Invalid or corrupted video file. Please upload a valid WEBM, MP4, AVI, or MOV video.",
  invalidWebmCodec:
    "Invalid WEBM codec. Please upload a WEBM encoded with VP8, VP9.",
} as const;

export type VideoInputSource = "upload" | "record";

export type VideoPipelineErrorCode =
  | "INVALID_FORMAT"
  | "DURATION_EXCEEDED"
  | "RESOLUTION_TOO_SMALL"
  | "SIZE_EXCEEDED"
  | "LOW_FPS"
  | "PROCESSING_FAILED";

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
  | { ok: true; data: VideoPipelineSuccess }
  | { ok: false; error: VideoPipelineError };

const toTechnicalError = (err: unknown): string | undefined =>
  err instanceof Error ? err.message : undefined;

const fail = (
  code: VideoPipelineErrorCode,
  userMessage: string,
  err?: unknown,
): VideoPipelineResult => ({
  ok: false,
  error: {
    code,
    userMessage,
    technical: toTechnicalError(err),
  },
});

const validateDurationAndResolution = (
  duration: number,
  width: number,
  height: number,
): VideoPipelineResult | null => {
  if (duration > VIDEO_LIMITS.maxDurationSec) {
    return fail(
      "DURATION_EXCEEDED",
      `Video is too long. Maximum allowed duration is ${VIDEO_LIMITS.maxDurationSec} seconds`,
    );
  }

  const shortEdge = Math.min(width, height);
  if (shortEdge < VIDEO_LIMITS.minDimensionPx) {
    return fail(
      "RESOLUTION_TOO_SMALL",
      `Video dimensions are too small. Minimum dimensions are ${VIDEO_LIMITS.minDimensionPx}px by ${VIDEO_LIMITS.minDimensionPx}px`,
    );
  }

  return null;
};

const validateSize = (sizeBytes: number): VideoPipelineResult | null => {
  if (sizeBytes > VIDEO_LIMITS.maxSizeBytes) {
    return fail(
      "SIZE_EXCEEDED",
      `Video is oversized. Maximum allowed size is ${VIDEO_LIMITS.maxSizeMb}mb`,
    );
  }

  return null;
};

export const processVideoInput = async (
  input: Blob,
  _source: VideoInputSource,
): Promise<VideoPipelineResult> => {
  try {
    const typeResult = validateVideoType(input.type);
    if (!typeResult.ok) {
      return fail("INVALID_FORMAT", typeResult.error);
    }

    const rawBuffer = await input.arrayBuffer();
    const rawArray = new Uint8Array(rawBuffer);
    const rawFormat = detectVideoFormat(rawArray);
    if (!rawFormat) {
      return fail("INVALID_FORMAT", VIDEO_PIPELINE_MESSAGES.invalidVideoFile);
    }

    const canUseFFmpeg = typeof SharedArrayBuffer !== "undefined";
    if (!canUseFFmpeg) {
      return fail(
        "PROCESSING_FAILED",
        VIDEO_PIPELINE_MESSAGES.genericProcessingError,
      );
    }

    if (rawFormat === "webm") {
      try {
        const webmCodec = await getPrimaryVideoCodec(rawBuffer);
        if (webmCodec === "h264") {
          return fail("INVALID_FORMAT", VIDEO_PIPELINE_MESSAGES.invalidWebmCodec);
        }
      } catch (err) {
        return fail(
          "PROCESSING_FAILED",
          VIDEO_PIPELINE_MESSAGES.genericProcessingError,
          err,
        );
      }
    }

    let rawMeta: { duration: number; width: number; height: number };
    try {
      rawMeta = await readVideoMetadata(input);
    } catch (err) {
      return fail("INVALID_FORMAT", VIDEO_PIPELINE_MESSAGES.invalidVideoFile, err);
    }

    const rawMetaResult = validateDurationAndResolution(
      rawMeta.duration,
      rawMeta.width,
      rawMeta.height,
    );
    if (rawMetaResult) return rawMetaResult;

    const needsCompression = input.size > VIDEO_LIMITS.maxSizeBytes;

    let sanitizedArray: Uint8Array;
    try {
      sanitizedArray = await videoSanitizer(rawBuffer, VIDEO_LIMITS.maxSizeBytes);
    } catch (err) {
      return fail(
        "PROCESSING_FAILED",
        VIDEO_PIPELINE_MESSAGES.genericProcessingError,
        err,
      );
    }

    const sanitizedFormat = detectVideoFormat(sanitizedArray);
    if (!sanitizedFormat) {
      return fail("INVALID_FORMAT", VIDEO_PIPELINE_MESSAGES.invalidVideoFile);
    }

    const processedBlob = new Blob([sanitizedArray.slice().buffer], {
      type: getVideoMimeType(sanitizedFormat),
    });
    const didCompress = needsCompression && processedBlob.size < input.size;

    let processedMeta: { duration: number; width: number; height: number };
    try {
      processedMeta = await readVideoMetadata(processedBlob);
    } catch (err) {
      return fail(
        "PROCESSING_FAILED",
        VIDEO_PIPELINE_MESSAGES.genericProcessingError,
        err,
      );
    }

    const processedMetaResult = validateDurationAndResolution(
      processedMeta.duration,
      processedMeta.width,
      processedMeta.height,
    );
    if (processedMetaResult) return processedMetaResult;

    const sizeResult = validateSize(processedBlob.size);
    if (sizeResult) return sizeResult;

    const frameTiming = await analyzeVideoFrameTiming(sanitizedArray.buffer);
    const qualityResult = validateVideoQuality(frameTiming, {
      duration: processedMeta.duration,
      width: processedMeta.width,
      height: processedMeta.height,
      sizeBytes: processedBlob.size,
    });

    if (!qualityResult.ok) {
      return fail("LOW_FPS", qualityResult.error);
    }

    return {
      ok: true,
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
    return fail(
      "PROCESSING_FAILED",
      VIDEO_PIPELINE_MESSAGES.genericProcessingError,
      err,
    );
  }
};
