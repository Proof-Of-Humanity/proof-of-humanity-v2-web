import { useState } from "react";
import cn from "classnames";
import ReactWebcam from "react-webcam";
import { IS_MOBILE } from "utils/media";
import FlipCameraIcon from "icons/FlipCameraMajor.svg";
import MaximizeIcon from "icons/MaximizeMinor.svg";
import MinimizeIcon from "icons/MinimizeMinor.svg";
import CloseIcon from "icons/MobileCancelMajor.svg";

interface CameraButtonInterface {
  className?: string;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}

/** The hero capture control — rendered centered in the camera dock. */
export const CameraButton: React.FC<CameraButtonInterface> = ({
  className,
  onClick,
  label,
  children,
}) => (
  <button
    type="button"
    aria-label={label}
    className={cn(
      "btn-primary outline-theme h-16 w-16 shrink-0 rounded-full !p-0 outline outline-2 outline-offset-2",
      className,
    )}
    style={{ touchAction: "manipulation" }}
    onClick={onClick}
  >
    {children}
  </button>
);

/** Quiet in-frame chrome (flip, fullscreen, close) — ghost circles that sit
 * on the video without competing with the capture button. */
const DockButton: React.FC<CameraButtonInterface & { label: string }> = ({
  className,
  onClick,
  label,
  children,
}) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    className={cn(
      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm transition-colors hover:bg-black/60",
      className,
    )}
    style={{ touchAction: "manipulation" }}
    onClick={onClick}
  >
    {children}
  </button>
);

const CAMERA_ERRORS = {
  blocked: {
    title: "Camera access is blocked",
    hint: "Allow camera access for this site in your browser settings, then try again.",
  },
  busy: {
    title: "Your camera is in use",
    hint: "Another app appears to be using the camera. Close it and try again.",
  },
  missing: {
    title: "No camera found",
    hint: "Connect a camera and try again.",
  },
  constraints: {
    title: "This camera isn't supported",
    hint: "It doesn't support the video quality we need. Try a different camera.",
  },
  generic: {
    title: "Camera isn't working",
    hint: "Something went wrong starting the camera. Try a different browser or device.",
  },
} as const;

interface WebcamProps {
  /** Controlled by the parent — it exits fullscreen after capture completes. */
  fullscreen: boolean;
  toggleFullscreen: () => void;
  /** Record mode: captures audio and uses video-rate constraints. */
  video?: boolean;
  /** Live capture in progress: locks the chrome and shows the indicator. */
  recording?: boolean;
  onCamera: (camera: ReactWebcam | null) => void;
  /** Rendered over the camera surface (absolutely positioned by the caller). */
  overlay?: React.ReactNode;
  /** Capture control(s) — compose with `CameraButton`; rendered centered in
   * the bottom dock. */
  children: React.ReactNode;
  /** Dismiss the camera — renders the ✕ chip in the top-right of the frame. */
  onClose?: () => void;
  /** Rendered alongside the error state so the upload path stays reachable. */
  fallback?: React.ReactNode;
}

const Webcam: React.FC<WebcamProps> = ({
  video = false,
  overlay,
  onCamera,
  recording,
  fullscreen,
  toggleFullscreen,
  children,
  onClose,
  fallback,
}) => {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [currentCamera, setCurrentCamera] = useState("");
  const [cameraPermission, setCameraPermission] = useState(true);
  const [userMediaError, setUserMediaError] = useState("");
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

  const switchFacingMode = () =>
    setFacingMode(facingMode === "user" ? "environment" : "user");

  const cycleCamera = () =>
    setCurrentCamera((current) => {
      const i = devices.findIndex((device) => device.deviceId === current);
      return devices[(i + 1) % devices.length]?.deviceId ?? current;
    });

  const onUserMedia = (_mediaStream: MediaStream) => {
    if (devices.length !== 0) return;

    navigator.mediaDevices.enumerateDevices().then((videoDevices) => {
      const cameras = videoDevices.filter(
        (device) => device.kind === "videoinput",
      );
      setDevices(cameras);
      setCurrentCamera(cameras[0]?.deviceId ?? "");
    });
  };

  const onUserMediaError = (error: string | DOMException) => {
    switch (typeof error === "string" ? error : error.name) {
      case "NotFoundError":
      case "DevicesNotFound:Error":
        if (devices.length > 0) switchFacingMode();
        setUserMediaError("NoCamera");
        break;
      case "NotAllowedError":
      case "PermissionDeniedError":
        setCameraPermission(false);
        break;
      case "OverconstrainedError":
      case "ConstraintNotSatisfied:Error":
        setUserMediaError("NoConstraints");
        break;
      case "NotReadableError":
      case "TrackStartError":
        setUserMediaError("CameraBusy");
        break;
      // react-webcam also emits plain strings ("getUserMedia not supported")
      // and other DOMExceptions (SecurityError, AbortError…). Without this,
      // no error state renders and capture fails silently.
      default:
        setUserMediaError("CameraFailed");
    }
  };

  if (!cameraPermission || userMediaError) {
    let errorData;
    if (!cameraPermission) {
      errorData = CAMERA_ERRORS.blocked;
    } else if (userMediaError === "CameraBusy") {
      errorData = CAMERA_ERRORS.busy;
    } else if (userMediaError === "NoConstraints") {
      errorData = CAMERA_ERRORS.constraints;
    } else if (userMediaError === "NoCamera") {
      errorData = CAMERA_ERRORS.missing;
    } else {
      errorData = CAMERA_ERRORS.generic;
    }
    const { title, hint } = errorData;

    return (
      <div className="flex w-full flex-col items-center gap-2 py-8 text-center">
        <span className="text-status-rejected text-lg font-semibold">
          {title}
        </span>
        <p className="text-secondaryText max-w-sm text-sm leading-6">{hint}</p>
        {fallback}
      </div>
    );
  }

  const FullscreenIcon = fullscreen ? MinimizeIcon : MaximizeIcon;
  const selectedDeviceId =
    !IS_MOBILE && currentCamera ? currentCamera : undefined;
  const videoConstraints = video
    ? {
        width: IS_MOBILE
          ? { ideal: 1280, max: 1280 }
          : { min: 640, ideal: 1280 },
        height: IS_MOBILE ? { ideal: 720, max: 720 } : { min: 480, ideal: 720 },
        frameRate: IS_MOBILE
          ? { min: 24, ideal: 30, max: 30 }
          : { min: 24, ideal: 30 },
        deviceId: selectedDeviceId,
        facingMode,
      }
    : {
        width: IS_MOBILE
          ? { min: 640, exact: 1280 }
          : { min: 640, ideal: 1920 },
        height: IS_MOBILE
          ? { min: 480, exact: 720 }
          : { min: 480, ideal: 1080 },
        frameRate: { min: 24, ideal: 60 },
        deviceId: selectedDeviceId,
        facingMode,
      };

  return (
    <div className="relative flex min-h-[300px] items-center justify-center overflow-hidden bg-black sm:min-h-[400px]">
      <ReactWebcam
        className={cn(
          "h-full w-full object-contain",
          !IS_MOBILE && "aspect-video",
        )}
        ref={onCamera}
        screenshotFormat={"image/jpeg"}
        audio={video}
        muted={true}
        screenshotQuality={1}
        forceScreenshotSourceSize
        videoConstraints={videoConstraints}
        onCanPlayThrough={() => false}
        onClick={(e) => e.preventDefault()}
        onUserMedia={onUserMedia}
        onUserMediaError={onUserMediaError}
        audioConstraints={{
          noiseSuppression: true,
          echoCancellation: true,
        }}
      />

      {overlay}

      {recording ? (
        <span className="absolute right-6 top-6 inline-flex h-8 w-8 rounded-full bg-red-500 before:h-full before:w-full before:animate-ping before:rounded-full before:bg-red-400/80" />
      ) : (
        onClose && (
          <DockButton
            label="Close camera"
            className="absolute right-3 top-3"
            onClick={onClose}
          >
            <CloseIcon className="h-5 w-5 fill-white" />
          </DockButton>
        )
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-4 pb-4 pt-14">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center">
          <div className="flex justify-start">
            {!recording && devices.length > 1 && (
              <DockButton
                label="Switch camera"
                onClick={IS_MOBILE ? switchFacingMode : cycleCamera}
              >
                <FlipCameraIcon className="h-5 w-5 fill-white" />
              </DockButton>
            )}
          </div>
          <div className="flex justify-center">{children}</div>
          <div className="flex justify-end">
            {/* Stays available mid-recording — resizing the viewport doesn't
                touch the MediaRecorder stream, unlike switching cameras. */}
            {!IS_MOBILE && (
              <DockButton label="Toggle fullscreen" onClick={toggleFullscreen}>
                <FullscreenIcon className="h-5 w-5 fill-white" />
              </DockButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Webcam;
