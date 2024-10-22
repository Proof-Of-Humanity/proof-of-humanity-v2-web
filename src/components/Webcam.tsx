import { useState } from "react";
import cn from "classnames";
import ReactWebcam from "react-webcam";
import { IS_MOBILE } from "utils/media";
import FlipCameraIcon from "icons/FlipCameraMajor.svg";
import MaximizeIcon from "icons/MaximizeMinor.svg";
import MinimizeIcon from "icons/MinimizeMinor.svg";
import PauseIcon from "icons/PauseMajor.svg";
import PlayIcon from "icons/PlayMajor.svg";
import MirrorIcon from "icons/ProductReturnsMinor.svg";
import SmileyIcon from "icons/SmileyHappyMajor.svg";

interface CameraButtonInterface {
  className?: string;
  secondary?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

export const CameraButton: React.FC<CameraButtonInterface> = ({
  className,
  secondary,
  onClick,
  children,
}) => (
  <button
    className={cn(
      "btn-main absolute rounded-full",
      secondary
        ? "h-12 w-12 opacity-70"
        : "outline-theme h-16 w-16 outline outline-2 outline-offset-2",
      className,
    )}
    onClick={onClick}
  >
    {children}
  </button>
);

interface WebcamProps {
  fullscreen: boolean;
  recording?: boolean;
  toggleFullscreen: () => void;
  action: () => void;
  isVideo?: boolean;
  overlay?: boolean;
  loadCamera: React.Dispatch<React.SetStateAction<ReactWebcam | null>>;
}

const Webcam: React.FC<WebcamProps> = ({
  isVideo = false,
  overlay,
  loadCamera,
  action,
  recording,
  fullscreen,
  toggleFullscreen,
}) => {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [currentCamera, setCurrentCamera] = useState("");
  const [cameraPermission, setCameraPermission] = useState(true);
  const [userMediaError, setUserMediaError] = useState("");
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [mirrored, setMirrored] = useState(false);

  const switchFacingMode = () =>
    setFacingMode(facingMode === "user" ? "environment" : "user");

  const onUserMedia = (_mediaStream: MediaStream) => {
    if (devices.length !== 0) return;

    // if (video) loadFFMPEG();

    navigator.mediaDevices.enumerateDevices().then((videoDevices) => {
      setDevices(videoDevices.filter((dev) => dev.kind === "videoinput"));
      setCurrentCamera(videoDevices[0].deviceId);
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
        setUserMediaError("NoCamera");
        break;
    }
  };

  if (!cameraPermission || userMediaError)
    return <div className="text-3xl text-red-500">Camera not enabled</div>;

  const FullscreenIcon = fullscreen ? MinimizeIcon : MaximizeIcon;
  const ActionIcon = isVideo ? (recording ? PauseIcon : PlayIcon) : SmileyIcon;

  return (
    <div className="relative">
      <ReactWebcam
        className="h-full w-full bg-red-500/50"
        ref={loadCamera}
        mirrored={mirrored}
        screenshotFormat={"image/jpeg"}
        audio={isVideo}
        muted={true}
        screenshotQuality={1}
        forceScreenshotSourceSize
        videoConstraints={{
          width: IS_MOBILE
            ? { min: 640, exact: 1280 }
            : { min: 640, ideal: 1920 },
          height: IS_MOBILE
            ? { min: 480, exact: 720 }
            : { min: 480, ideal: 1080 },
          frameRate: { min: 24, ideal: 60 },
          deviceId: IS_MOBILE ? undefined : currentCamera,
          facingMode,
        }}
        onCanPlayThrough={() => false}
        onClick={(e) => e.preventDefault()}
        onUserMedia={onUserMedia}
        onUserMediaError={onUserMediaError}
        audioConstraints={{
          noiseSuppression: true,
          echoCancellation: true,
        }}
      />

      {recording && overlay && (
        <div className="centered absolute left-0 top-0 h-full w-full select-none bg-black text-center text-xl font-semibold uppercase text-white opacity-70 sm:text-3xl md:text-3xl lg:text-4xl">
          I certify that I am a real human and that I am not already registered
          in this registry
        </div>
      )}

      {recording ? (
        <>
          <span className="absolute right-6 top-6 inline-flex h-8 w-8 rounded-full bg-red-500 before:h-full before:w-full before:animate-ping before:rounded-full before:bg-red-400/80" />
        </>
      ) : (
        <>
          {IS_MOBILE && devices.length > 1 && (
            <CameraButton
              secondary
              className="left-4 top-4"
              onClick={switchFacingMode}
            >
              <FlipCameraIcon className="h-8 w-8 fill-white" />
            </CameraButton>
          )}
          <CameraButton
            secondary
            className={cn(
              "left-4",
              IS_MOBILE && devices.length > 1 ? "top-20" : "top-4",
            )}
            onClick={() => setMirrored((o) => !o)}
          >
            <MirrorIcon className="h-8 w-8 fill-white" />
          </CameraButton>
          <CameraButton
            secondary
            className="right-4 top-4"
            onClick={toggleFullscreen}
          >
            <FullscreenIcon className="h-8 w-8 fill-white" />
          </CameraButton>
        </>
      )}

      <CameraButton
        className="bottom-8 left-1/2 -translate-x-1/2 opacity-90"
        onClick={action}
      >
        <ActionIcon className="h-12 w-12 fill-white" />
      </CameraButton>
    </div>
  );
};

export default Webcam;
