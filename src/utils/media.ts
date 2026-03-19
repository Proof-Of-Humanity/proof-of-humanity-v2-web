export { IS_IOS, IS_MOBILE } from "./media.device";
export { getCroppedPhoto, sanitizeImage } from "./media.image";
export {
  probeVideoMetrics,
  detectVideoFormat,
  getVideoMimeType,
  readVideoMetadata,
} from "./media.video.probe";
export { videoSanitizer } from "./media.video.sanitize";
export type { VideoFrameTimingMetrics, VideoProbeMetrics } from "./media.video.probe";
export { MEDIA_ERROR_CODES, MEDIA_MESSAGES } from "./media.messages";
export { processVideoInput, warmVideoPipeline } from "./media.video.pipeline";
export type {
  VideoPipelineError,
  VideoPipelineErrorCode,
  VideoPipelineResult,
  VideoPipelineSuccess,
} from "./media.video.pipeline";
export {
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
} from "./media.video.validate";
export type {
  PhotoValidationError,
  VideoMetadata,
  VideoQualityValidationResult,
  VideoValidationError,
  VideoValidationReason,
} from "./media.video.validate";
