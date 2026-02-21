export { IS_IOS, IS_MOBILE } from "./media.device";
export { getCroppedPhoto, sanitizeImage } from "./media.image";
export {
  analyzeVideoFrameTiming,
  detectVideoFormat,
  getVideoMimeType,
  readVideoMetadata,
  videoSanitizer,
} from "./media.video";
export type { VideoFrameTimingMetrics } from "./media.video";
export { MEDIA_MESSAGES } from "./media.messages";
export { processVideoInput } from "./video.pipeline";
export type {
  VideoPipelineError,
  VideoPipelineErrorCode,
  VideoPipelineResult,
  VideoPipelineSuccess,
} from "./video.pipeline";
export {
  getMinAverageBitrate,
  getUploadedTypeLabel,
  IMAGE_ALLOWED_MIME_TYPES,
  IMAGE_UPLOAD_EXTENSIONS,
  MEDIA_UPLOAD_ACCEPT,
  normalizeVideoMimeType,
  PHOTO_LIMITS,
  VIDEO_ALLOWED_MIME_TYPES,
  VIDEO_UPLOAD_EXTENSIONS,
  VIDEO_LIMITS,
  validatePhotoDimensions,
  validatePhotoSize,
  validatePhotoUpload,
  validateVideoDuration,
  validateVideoQuality,
  validateVideoResolution,
  validateVideoSize,
  validateVideoType,
} from "./media.validation";
export type {
  PhotoValidationError,
  VideoMetadata,
  VideoQualityValidationResult,
  VideoValidationError,
  VideoValidationReason,
} from "./media.validation";
