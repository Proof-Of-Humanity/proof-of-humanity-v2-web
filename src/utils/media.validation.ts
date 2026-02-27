import type { VideoFrameTimingMetrics } from "./media.video";

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

export type VideoValidationReason =
  | "INVALID_FORMAT"
  | "DURATION_EXCEEDED"
  | "RESOLUTION_TOO_SMALL"
  | "SIZE_EXCEEDED"
  | "LOW_FPS";

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
    code: "INVALID_FORMAT",
    userMessage: `Uploaded file type: ${label}. Unsupported video format. Please use ${VIDEO_LIMITS.allowedFormatsLabel}.`,
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
      code: "DURATION_EXCEEDED",
      userMessage: `Video is too long. Maximum allowed duration is ${VIDEO_LIMITS.maxDurationSec} seconds`,
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
      code: "RESOLUTION_TOO_SMALL",
      userMessage: `Video dimensions are too small. Minimum dimensions are ${VIDEO_LIMITS.minDimensionPx}px by ${VIDEO_LIMITS.minDimensionPx}px`,
    };
  }
  return null;
}

/** Validate video file size. */
export function validateVideoSize(sizeBytes: number): VideoValidationError | null {
  if (sizeBytes > VIDEO_LIMITS.maxSizeBytes) {
    return {
      code: "SIZE_EXCEEDED",
      userMessage: `Video is oversized. Maximum allowed size is ${VIDEO_LIMITS.maxSizeMb}mb`,
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
      code: "LOW_FPS",
      userMessage:
        "Video looks choppy to verify clearly. Please improve lighting, close background apps, and record again.",
    };
  }

  const warnings: string[] = [];

  const blurMean = options.probeSignals?.blurMean;
  const hasBlurWarning =
    typeof blurMean === "number" &&
    Number.isFinite(blurMean) &&
    blurMean >= VIDEO_LIMITS.blurWarningThreshold;
  if (hasBlurWarning) {
    warnings.push(
      "Video appears blurry. Please keep your camera steady and ensure your face and wallet text are in focus.",
    );
  }

  const averageLuma = options.probeSignals?.averageLuma;
  const hasLowLightWarning =
    typeof averageLuma === "number" &&
    Number.isFinite(averageLuma) &&
    averageLuma < VIDEO_LIMITS.minLumaWarning;
  if (hasLowLightWarning) {
    warnings.push(
      "Video appears too dark. Please improve lighting so your face and wallet text are clearly visible.",
    );
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
    warnings.push(
      "Video appears to freeze at times. Please keep your camera steady, improve lighting, and record again.",
    );
  }

  const hasAudio = options.probeSignals?.hasAudio;
  if (hasAudio === false) {
    warnings.push(
      "No audio track detected. Please record again and clearly say the required phrase.",
    );
  } else {
    const nonSilenceSec = options.probeSignals?.nonSilenceSec;
    if (
      typeof nonSilenceSec === "number" &&
      Number.isFinite(nonSilenceSec) &&
      nonSilenceSec < VIDEO_LIMITS.minAudioDurationWarning
    ) {
      warnings.push(
        "Audio appears mostly silent. Please speak clearly throughout the recording.",
      );
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
    warnings.push(
      "Video bitrate is lower than recommended. For better clarity, use good lighting and your camera's higher quality mode.",
    );
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
    return `Unsupported image format "${file.type || "unknown"}". Please use JPG, PNG, or WEBP.`;
  }

  if (file.size > PHOTO_LIMITS.uploadMaxSizeBytes) {
    return `Photo is too large (${Math.round(file.size / 1024 / 1024)}MB). Maximum upload size is ${PHOTO_LIMITS.uploadMaxSizeMb}MB.`;
  }

  return null;
}

/** Validate crop dimensions. */
export function validatePhotoDimensions(
  width: number,
  height: number,
): PhotoValidationError {
  if (width < PHOTO_LIMITS.minWidth || height < PHOTO_LIMITS.minHeight) {
    return `Photo dimensions are too small. Minimum dimensions are ${PHOTO_LIMITS.minWidth}px by ${PHOTO_LIMITS.minHeight}px`;
  }
  return null;
}

/** Validate final photo size after processing. */
export function validatePhotoSize(sizeBytes: number): PhotoValidationError {
  if (sizeBytes > PHOTO_LIMITS.maxSizeBytes) {
    return `Photo is oversized. Maximum allowed size is ${PHOTO_LIMITS.maxSizeMb}mb`;
  }
  return null;
}
