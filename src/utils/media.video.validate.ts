import {
  MEDIA_ERROR_CODES,
  MEDIA_MESSAGES,
  type VideoValidationReason,
} from "./media.messages";
import type { VideoFrameTimingMetrics } from "./media.video.probe";

export type { VideoValidationReason } from "./media.messages";

export const VIDEO_ALLOWED_MIME_TYPES = [
  "video/webm",
  "video/mp4",
  "video/x-msvideo",
  "video/quicktime",
] as const;

export const VIDEO_UPLOAD_EXTENSIONS = [
  ".mp4",
  ".webm",
  ".mov",
  ".qt",
  ".avi",
] as const;

const VIDEO_ALLOWED_FORMATS_LABEL = VIDEO_UPLOAD_EXTENSIONS.map((ext) =>
  ext.slice(1),
).join(", ");

export const IMAGE_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/webp",
] as const;

export const IMAGE_UPLOAD_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"] as const;

export const MEDIA_UPLOAD_ACCEPT = {
  image: { "image/*": [...IMAGE_UPLOAD_EXTENSIONS] },
  video: { "video/*": [...VIDEO_UPLOAD_EXTENSIONS] },
} as const;

// ─── Video Limits ───────────────────────────────────────────────
export const VIDEO_LIMITS = {
  maxDurationSec: 20,
  maxSizeMb: 10,
  maxSizeBytes: 10 * 1024 * 1024, // 10 MB
  minDimensionPx: 352,
  minCaptureFps: 20,
  maxFrameGapMs: 220,
  freezeWarningMinSec: 1.2,
  freezeWarningRatio: 0.25,
  blurWarningThreshold: 9,
  minLumaWarning: 55,
  minAudioDurationWarning: 3.0,
  recorderVideoBps: 2_500_000,
  recorderAudioBps: 96_000,
  allowedTypes: VIDEO_ALLOWED_MIME_TYPES,
  allowedFormatsLabel: VIDEO_ALLOWED_FORMATS_LABEL,
} as const;

const MIN_AVERAGE_BITRATE_SD = 340; // kb/s
const MIN_AVERAGE_BITRATE_HD = 680;
const MIN_AVERAGE_BITRATE_FHD = 1_275;

// ─── Photo Limits ───────────────────────────────────────────────
export const PHOTO_LIMITS = {
  minWidth: 256,
  minHeight: 256,
  maxSizeMb: 3,
  maxSizeBytes: 3 * 1024 * 1024,
  /** Pre-crop safety limit to avoid crashing the browser with huge files */
  uploadMaxSizeBytes: 20 * 1024 * 1024,
  uploadMaxSizeMb: 20,
} as const;

export interface VideoValidationError {
  code: VideoValidationReason;
  userMessage: string;
}

export interface VideoQualityValidationResult {
  warnings: string[];
  error: VideoValidationError | null;
}

export interface VideoQualityValidationOptions {
  measuredBitrateKbps?: number | null;
  isFallbackEstimate?: boolean;
  probeSignals?: {
    blurMean?: number | null;
    averageLuma?: number | null;
    nonSilenceSec?: number | null;
    hasAudio?: boolean | null;
    maxFreezeDurationSec?: number | null;
    freezeRatio?: number | null;
  } | null;
}

export type PhotoValidationError = string | null;

// ─── Video Validation ───────────────────────────────────────────

/** Check if a MIME type is in the allowed video types list. */
export function validateVideoType(mimeType: string): VideoValidationError | null {
  const normalizedType = normalizeVideoMimeType(mimeType);
  if ((VIDEO_LIMITS.allowedTypes as readonly string[]).includes(normalizedType)) {
    return null;
  }

  const label = getUploadedTypeLabel(mimeType);
  return {
    code: MEDIA_ERROR_CODES.INVALID_FORMAT,
    userMessage: MEDIA_MESSAGES.unsupportedVideoFormat(
      label,
      VIDEO_LIMITS.allowedFormatsLabel,
    ),
  };
}

/** Normalize browser MIME aliases to backend-accepted canonical video MIME types. */
export function normalizeVideoMimeType(type: string): string {
  const baseType = type.split(";")[0]?.trim().toLowerCase();
  if (!baseType) return type;
  if (baseType === "video/avi") return "video/x-msvideo";
  if (baseType === "video/mov") return "video/quicktime";
  return baseType;
}

/** Resolve a video MIME type to a human-readable label. */
export function getUploadedTypeLabel(type: string): string {
  if (!type) return "unknown";
  if (type === "video/x-msvideo" || type === "video/avi") return "avi";
  if (type === "video/quicktime" || type === "video/mov") return "mov";
  const [, subtype] = type.split("/");
  return subtype || type;
}

export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  sizeBytes: number;
}

/** Validate video duration. */
export function validateVideoDuration(duration: number): VideoValidationError | null {
  if (duration > VIDEO_LIMITS.maxDurationSec) {
    return {
      code: MEDIA_ERROR_CODES.DURATION_EXCEEDED,
      userMessage: MEDIA_MESSAGES.videoDurationExceeded(VIDEO_LIMITS.maxDurationSec),
    };
  }
  return null;
}

/** Validate video resolution (short edge must meet minimum). */
export function validateVideoResolution(
  width: number,
  height: number,
): VideoValidationError | null {
  const shortEdge = Math.min(width, height);
  if (shortEdge < VIDEO_LIMITS.minDimensionPx) {
    return {
      code: MEDIA_ERROR_CODES.RESOLUTION_TOO_SMALL,
      userMessage: MEDIA_MESSAGES.videoResolutionTooSmall(VIDEO_LIMITS.minDimensionPx),
    };
  }
  return null;
}

/** Validate video file size. */
export function validateVideoSize(sizeBytes: number): VideoValidationError | null {
  if (sizeBytes > VIDEO_LIMITS.maxSizeBytes) {
    return {
      code: MEDIA_ERROR_CODES.SIZE_EXCEEDED,
      userMessage: MEDIA_MESSAGES.videoSizeExceeded(VIDEO_LIMITS.maxSizeMb),
    };
  }
  return null;
}

function getMinBitrateKbps(width: number, height: number): number {
  const longEdge = Math.max(width, height);
  if (longEdge > 1280) return MIN_AVERAGE_BITRATE_FHD;
  if (longEdge > 854) return MIN_AVERAGE_BITRATE_HD;
  return MIN_AVERAGE_BITRATE_SD;
}

/**
 * Validate quality-related metrics: effective FPS, bitrate, blur/light/audio/freeze.
 * Returns warnings for non-blocking issues
 * and a hard error for choppy video (low FPS).
 */
export function validateVideoQuality(
  frameTiming: VideoFrameTimingMetrics | null,
  meta: VideoMetadata,
  options: VideoQualityValidationOptions = {},
): VideoQualityValidationResult {
  let error: VideoValidationError | null = null;
  if (
    typeof frameTiming?.effectiveFps === "number" &&
    frameTiming.effectiveFps < VIDEO_LIMITS.minCaptureFps
  ) {
    error = {
      code: MEDIA_ERROR_CODES.LOW_FPS,
      userMessage: MEDIA_MESSAGES.videoLowFps,
    };
  }

  const warnings: string[] = [];

  if (
    typeof frameTiming?.maxFrameGapMs === "number" &&
    frameTiming.maxFrameGapMs > VIDEO_LIMITS.maxFrameGapMs
  ) {
    warnings.push(MEDIA_MESSAGES.videoFrameGapWarning);
  }

  const blurMean = options.probeSignals?.blurMean;
  const hasBlurWarning =
    typeof blurMean === "number" &&
    Number.isFinite(blurMean) &&
    blurMean >= VIDEO_LIMITS.blurWarningThreshold;
  if (hasBlurWarning) {
    warnings.push(MEDIA_MESSAGES.videoBlurWarning);
  }

  const averageLuma = options.probeSignals?.averageLuma;
  const hasLowLightWarning =
    typeof averageLuma === "number" &&
    Number.isFinite(averageLuma) &&
    averageLuma < VIDEO_LIMITS.minLumaWarning;
  if (hasLowLightWarning) {
    warnings.push(MEDIA_MESSAGES.videoLowLightWarning);
  }

  const maxFreezeDurationSec = options.probeSignals?.maxFreezeDurationSec;
  const freezeRatio = options.probeSignals?.freezeRatio;
  const hasFreezeWarning =
    (typeof maxFreezeDurationSec === "number" &&
      Number.isFinite(maxFreezeDurationSec) &&
      maxFreezeDurationSec >= VIDEO_LIMITS.freezeWarningMinSec) ||
    (typeof freezeRatio === "number" &&
      Number.isFinite(freezeRatio) &&
      freezeRatio >= VIDEO_LIMITS.freezeWarningRatio);
  if (hasFreezeWarning) {
    warnings.push(MEDIA_MESSAGES.videoFreezeWarning);
  }

  const hasAudio = options.probeSignals?.hasAudio;
  if (hasAudio === false) {
    error = {
      code: MEDIA_ERROR_CODES.NO_AUDIO,
      userMessage: MEDIA_MESSAGES.videoNoAudioWarning,
    };
  } else {
    const nonSilenceSec = options.probeSignals?.nonSilenceSec;
    if (
      typeof nonSilenceSec === "number" &&
      Number.isFinite(nonSilenceSec) &&
      nonSilenceSec < VIDEO_LIMITS.minAudioDurationWarning
    ) {
      warnings.push(MEDIA_MESSAGES.videoMostlySilentWarning);
    }
  }

  // Warning: low bitrate (prefer probed bitrate when available, otherwise estimate).
  const { duration, width, height, sizeBytes } = meta;
  const averageBitrateKbps = duration > 0 ? Math.floor((sizeBytes * 8) / duration / 1000) : 0;
  const measuredBitrate = options.measuredBitrateKbps;
  const bitrateForCheck =
    typeof measuredBitrate === "number" && Number.isFinite(measuredBitrate) && measuredBitrate > 0
      ? Math.floor(measuredBitrate)
      : averageBitrateKbps;
  const minBitrate = getMinBitrateKbps(width, height);

  if (bitrateForCheck > 0 && bitrateForCheck < minBitrate) {
    warnings.push(MEDIA_MESSAGES.videoLowBitrateWarning);
  }

  return { warnings, error };
}

// ─── Photo Validation ───────────────────────────────────────────

/** Validate a photo file before loading it into the crop editor. */
export function validatePhotoUpload(file: File): PhotoValidationError {
  if (
    !IMAGE_ALLOWED_MIME_TYPES.includes(
      file.type as (typeof IMAGE_ALLOWED_MIME_TYPES)[number],
    )
  ) {
    return MEDIA_MESSAGES.photoUnsupportedFormat(file.type);
  }

  if (file.size > PHOTO_LIMITS.uploadMaxSizeBytes) {
    return MEDIA_MESSAGES.photoUploadTooLarge(file.size, PHOTO_LIMITS.uploadMaxSizeMb);
  }

  return null;
}

/** Validate crop dimensions. */
export function validatePhotoDimensions(
  width: number,
  height: number,
): PhotoValidationError {
  if (width < PHOTO_LIMITS.minWidth || height < PHOTO_LIMITS.minHeight) {
    return MEDIA_MESSAGES.photoDimensionsTooSmall(PHOTO_LIMITS.minWidth, PHOTO_LIMITS.minHeight);
  }
  return null;
}

/** Validate final photo size after processing. */
export function validatePhotoSize(sizeBytes: number): PhotoValidationError {
  if (sizeBytes > PHOTO_LIMITS.maxSizeBytes) {
    return MEDIA_MESSAGES.photoSizeExceeded(PHOTO_LIMITS.maxSizeMb);
  }
  return null;
}
