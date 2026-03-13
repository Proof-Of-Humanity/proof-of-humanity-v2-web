export const MEDIA_ERROR_CODES = {
  INVALID_FORMAT: "INVALID_FORMAT",
  DURATION_EXCEEDED: "DURATION_EXCEEDED",
  RESOLUTION_TOO_SMALL: "RESOLUTION_TOO_SMALL",
  SIZE_EXCEEDED: "SIZE_EXCEEDED",
  LOW_FPS: "LOW_FPS",
  NO_AUDIO: "NO_AUDIO",
  PROCESSING_FAILED: "PROCESSING_FAILED",
} as const;

export type VideoValidationReason =
  | typeof MEDIA_ERROR_CODES.INVALID_FORMAT
  | typeof MEDIA_ERROR_CODES.DURATION_EXCEEDED
  | typeof MEDIA_ERROR_CODES.RESOLUTION_TOO_SMALL
  | typeof MEDIA_ERROR_CODES.SIZE_EXCEEDED
  | typeof MEDIA_ERROR_CODES.LOW_FPS
  | typeof MEDIA_ERROR_CODES.NO_AUDIO;

export const MEDIA_MESSAGES = {
  genericVideoProcessingError:
    "Something went wrong while processing the video. Please try again.",
  invalidVideoFile:
    "Invalid or corrupted video file. Please upload a valid WEBM, MP4, AVI, or MOV video.",
  invalidWebmCodec:
    "Invalid WEBM codec. Please upload a WEBM encoded with VP8, VP9.",
  unsupportedVideoFormat: (label: string, allowedFormatsLabel: string) =>
    `Uploaded file type: ${label}. Unsupported video format. Please use ${allowedFormatsLabel}.`,
  videoDurationExceeded: (maxDurationSec: number) =>
    `Video is too long. Maximum allowed duration is ${maxDurationSec} seconds`,
  videoResolutionTooSmall: (minDimensionPx: number) =>
    `Video dimensions are too small. Minimum dimensions are ${minDimensionPx}px by ${minDimensionPx}px`,
  videoSizeExceeded: (maxSizeMb: number) =>
    `Video is oversized. Maximum allowed size is ${maxSizeMb}mb`,
  videoLowFps:
    "Video looks choppy to verify clearly. Please improve lighting, close background apps, and record again.",
  videoFrameGapWarning:
    "Video playback may appear stuttery. Please review to ensure your face and wallet address remain clearly visible before submitting.",
  videoBlurWarning:
    "Video appears blurry. Use better lighting, disable background blur, and keep your camera steady so your face and wallet text are clearly visible.",
  videoLowLightWarning:
    "Video appears too dark. Please improve lighting so your face and wallet text are clearly visible.",
  videoFreezeWarning:
    "Video appears to freeze at times. Please keep your camera steady, improve lighting, and record again.",
  videoNoAudioWarning:
    "No audio track detected. Please record again and clearly say the required phrase.",
  videoMostlySilentWarning:
    "Audio appears mostly silent. Please speak clearly throughout the recording.",
  videoLowBitrateWarning:
    "Video bitrate is lower than recommended. For better clarity, use good lighting and your camera's higher quality mode.",
  photoUnsupportedFormat: (fileType: string) =>
    `Unsupported image format "${fileType || "unknown"}". Please use JPG, PNG, or WEBP.`,
  photoUploadTooLarge: (sizeBytes: number, uploadMaxSizeMb: number) =>
    `Photo is too large (${Math.round(sizeBytes / 1024 / 1024)}MB). Maximum upload size is ${uploadMaxSizeMb}MB.`,
  photoDimensionsTooSmall: (minWidth: number, minHeight: number) =>
    `Photo dimensions are too small. Minimum dimensions are ${minWidth}px by ${minHeight}px`,
  photoSizeExceeded: (maxSizeMb: number) =>
    `Photo is oversized. Maximum allowed size is ${maxSizeMb}mb`,
} as const;
