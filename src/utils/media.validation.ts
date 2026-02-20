import type { VideoFrameTimingMetrics } from "./media.video";

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
    allowedTypes: [
        "video/webm",
        "video/mp4",
        "video/x-msvideo",
        "video/quicktime",
    ] as readonly string[],
    allowedFormatsLabel: "webm, mp4, avi, mov",
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

// ─── Validation Result ──────────────────────────────────────────
export type ValidationResult =
    | { ok: true; warnings: string[] }
    | { ok: false; error: string };

const pass = (warnings: string[] = []): ValidationResult => ({
    ok: true,
    warnings,
});
const fail = (error: string): ValidationResult => ({ ok: false, error });

// ─── Video Validation ───────────────────────────────────────────

/** Check if a MIME type is in the allowed video types list. */
export function validateVideoType(mimeType: string): ValidationResult {
    const normalizedType = normalizeVideoMimeType(mimeType);
    if (VIDEO_LIMITS.allowedTypes.includes(normalizedType)) return pass();
    const label = getUploadedTypeLabel(mimeType);
    return fail(
        `Uploaded file type: ${label}. Unsupported video format. Please use ${VIDEO_LIMITS.allowedFormatsLabel}.`,
    );
}

/** Normalize browser MIME aliases to backend-accepted canonical video MIME types. */
export function normalizeVideoMimeType(type: string): string {
    const baseType = type.split(";")[0]?.trim().toLowerCase();
    if (!baseType) return type;
    if (baseType === "video/avi") return "video/x-msvideo";
    if (baseType === "video/mov") return "video/quicktime";
    return baseType;
}

/**
 * Resolve a video MIME type to a human-readable label.
 */
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

/** Validate hard limits: duration, size, dimensions. */
export function validateVideoMetadata(meta: VideoMetadata): ValidationResult {
    if (meta.duration > VIDEO_LIMITS.maxDurationSec) {
        return fail(
            `Video is too long. Maximum allowed duration is ${VIDEO_LIMITS.maxDurationSec} seconds`,
        );
    }
    if (meta.sizeBytes > VIDEO_LIMITS.maxSizeBytes) {
        return fail(
            `Video is oversized. Maximum allowed size is ${VIDEO_LIMITS.maxSizeMb}mb`,
        );
    }
    const shortEdge = Math.min(meta.width, meta.height);
    if (shortEdge < VIDEO_LIMITS.minDimensionPx) {
        return fail(
            `Video dimensions are too small. Minimum dimensions are ${VIDEO_LIMITS.minDimensionPx}px by ${VIDEO_LIMITS.minDimensionPx}px`,
        );
    }
    return pass();
}

export function getMinAverageBitrate(
    width: number,
    height: number,
): number {
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
): ValidationResult {
    // Hard error: effective FPS too low
    if (
        typeof frameTiming?.effectiveFps === "number" &&
        frameTiming.effectiveFps < VIDEO_LIMITS.minCaptureFps
    ) {
        return fail(
            "Video looks choppy to verify clearly. Please improve lighting, close background apps, and record again.",
        );
    }

    const warnings: string[] = [];

    // Warning: large frame gap
    if (
        typeof frameTiming?.maxFrameGapMs === "number" &&
        frameTiming.maxFrameGapMs > VIDEO_LIMITS.maxFrameGapMs
    ) {
        warnings.push(
            "Video may look choppy. Please verify before submitting.",
        );
    }

    // Warning: low average bitrate
    const { duration, width, height, sizeBytes } = meta;
    const averageBitrate =
        duration > 0 ? Math.floor((sizeBytes * 8) / duration) : 0;
    const minBitrate = getMinAverageBitrate(width, height);

    if (averageBitrate > 0 && averageBitrate < minBitrate) {
        warnings.push(
            "Video bitrate is lower than recommended. For better clarity, use good lighting and your camera's higher quality mode.",
        );
    }

    return pass(warnings);
}

// ─── Photo Validation ───────────────────────────────────────────

/** Validate a photo file before loading it into the crop editor. */
export function validatePhotoUpload(file: File): ValidationResult {
    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
        return fail(
            `Unsupported image format "${file.type || "unknown"}". Please use JPG, PNG, or WEBP.`,
        );
    }
    if (file.size > PHOTO_LIMITS.uploadMaxSizeBytes) {
        return fail(
            `Photo is too large (${Math.round(file.size / 1024 / 1024)}MB). Maximum upload size is ${PHOTO_LIMITS.uploadMaxSizeMb}MB.`,
        );
    }
    return pass();
}

/** Validate crop dimensions. */
export function validatePhotoDimensions(
    width: number,
    height: number,
): ValidationResult {
    if (width < PHOTO_LIMITS.minWidth || height < PHOTO_LIMITS.minHeight) {
        return fail(
            `Photo dimensions are too small. Minimum dimensions are ${PHOTO_LIMITS.minWidth}px by ${PHOTO_LIMITS.minHeight}px`,
        );
    }
    return pass();
}

/** Validate final photo size after processing. */
export function validatePhotoSize(sizeBytes: number): ValidationResult {
    if (sizeBytes > PHOTO_LIMITS.maxSizeBytes) {
        return fail(
            `Photo is oversized. Maximum allowed size is ${PHOTO_LIMITS.maxSizeMb}mb`,
        );
    }
    return pass();
}
