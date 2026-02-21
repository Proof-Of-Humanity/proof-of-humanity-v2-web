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
  maxFrameGapMs: 220,
  recorderVideoBps: 2_500_000,
  recorderAudioBps: 96_000,
  allowedTypes: VIDEO_ALLOWED_MIME_TYPES,
  allowedFormatsLabel: VIDEO_ALLOWED_FORMATS_LABEL,
} as const;

const MIN_AVERAGE_BITRATE_SD = 600_000; // bits/s
const MIN_AVERAGE_BITRATE_HD = 1_100_000;
const MIN_AVERAGE_BITRATE_FHD = 2_000_000;

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

export function getMinAverageBitrate(width: number, height: number): number {
  const longEdge = Math.max(width, height);
  if (longEdge > 1280) return MIN_AVERAGE_BITRATE_FHD;
  if (longEdge > 854) return MIN_AVERAGE_BITRATE_HD;
  return MIN_AVERAGE_BITRATE_SD;
}

/**
 * Validate quality-related metrics: effective FPS, frame gaps, bitrate.
 * Returns warnings for non-blocking issues (frame gap, low bitrate)
 * and a hard error for choppy video (low FPS).
 */
export function validateVideoQuality(
  frameTiming: VideoFrameTimingMetrics | null,
  meta: VideoMetadata,
): VideoQualityValidationResult {
  // Hard error: effective FPS too low
  if (
    typeof frameTiming?.effectiveFps === "number" &&
    frameTiming.effectiveFps < VIDEO_LIMITS.minCaptureFps
  ) {
    return {
      warnings: [],
      error: {
        code: "LOW_FPS",
        userMessage:
          "Video looks choppy to verify clearly. Please improve lighting, close background apps, and record again.",
      },
    };
  }

  const warnings: string[] = [];

  // Warning: large frame gap
  if (
    typeof frameTiming?.maxFrameGapMs === "number" &&
    frameTiming.maxFrameGapMs > VIDEO_LIMITS.maxFrameGapMs
  ) {
    warnings.push("Video may look choppy. Please verify before submitting.");
  }

  // Warning: low average bitrate
  const { duration, width, height, sizeBytes } = meta;
  const averageBitrate = duration > 0 ? Math.floor((sizeBytes * 8) / duration) : 0;
  const minBitrate = getMinAverageBitrate(width, height);

  if (averageBitrate > 0 && averageBitrate < minBitrate) {
    warnings.push(
      "Video bitrate is lower than recommended. For better clarity, use good lighting and your camera's higher quality mode.",
    );
  }

  return { warnings, error: null };
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
