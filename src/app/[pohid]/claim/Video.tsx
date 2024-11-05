import { ObservableObject } from "@legendapp/state";
import Uploader from "components/Uploader";
import Webcam from "components/Webcam";
import getBlobDuration from "get-blob-duration";
import useFullscreen from "hooks/useFullscreen";
import CameraIcon from "icons/CameraMajor.svg";
import ResetIcon from "icons/ResetMinor.svg";
import UploadIcon from "icons/upload.svg";
import React, { useRef, useState } from "react";
import ReactWebcam from "react-webcam";
import { IS_IOS } from "utils/media";
import { useAccount } from "wagmi";
import { MediaState } from "./Form";

const MIN_DIMS = { width: 352, height: 352 }; // PXs
//const MAX_DURATION = 20; // Seconds
//const MAX_SIZE = 7; // Megabytes
const MAX_DURATION = 60 * 2; // Seconds
const MAX_SIZE = undefined;
const MAX_SIZE_BYTES = MAX_SIZE ? 1024 * 1024 * MAX_SIZE : MAX_SIZE; // Bytes
const ERROR_MSG = {
  duration: `Video is too long. Maximum allowed duration is ${MAX_DURATION} seconds long`,
  dimensions: `Video dimensions are too small. Minimum dimensions are ${MIN_DIMS.width}px by ${MIN_DIMS.height}px`,
  size: `Video is oversized. Maximum allowed size is ${MAX_SIZE}mb`,
};
interface PhotoProps {
  advance: () => void;
  video$: ObservableObject<MediaState["video"]>;
  isRenewal: boolean;
  videoError: (error: string) => void;
}

function VideoStep({ advance, video$, isRenewal, videoError }: PhotoProps) {
  const video = video$.use();

  const { address } = useAccount();

  const fullscreenRef = useRef(null);
  const { isFullscreen, setFullscreen, toggleFullscreen } =
    useFullscreen(fullscreenRef);

  const [showCamera, setShowCamera] = useState(false);
  const [camera, setCamera] = useState<ReactWebcam | null>(null);
  const [recording, setRecording] = useState(false);

  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);

  const checkVideoSize = (blob: Blob) => {
    if (MAX_SIZE_BYTES && blob.size > MAX_SIZE_BYTES) {
      videoError(ERROR_MSG.size);
      return console.error(ERROR_MSG.size);
    }
  };

  const checkVideoDuration = async (blob: Blob) => {
    const duration = await getBlobDuration(blob);
    if (duration > MAX_DURATION) {
      videoError(ERROR_MSG.duration);
      return console.error(ERROR_MSG.duration);
    }
  };

  const startRecording = () => {
    if (!camera || !camera.stream) return;
    const mediaRecorder = new MediaRecorder(camera.stream, {
      mimeType: IS_IOS ? 'video/mp4;codecs="h264"' : 'video/webm; codecs="vp8"',
    });

    mediaRecorder.ondataavailable = async ({ data }) => {
      const newlyRecorded = ([] as BlobPart[]).concat(data);
      const blob = new Blob(newlyRecorded, {
        type: `${IS_IOS ? 'video/mp4;codecs="h264"' : 'video/webm;codecs="vp8"'}`,
      });

      await checkVideoDuration(blob);
      checkVideoSize(blob);

      video$.set({ content: blob, uri: URL.createObjectURL(blob) });
      setShowCamera(false);
    };

    mediaRecorder.onstop = async () => {
      setFullscreen(false);
      setRecording(false);
    };

    mediaRecorder.start();

    setRecorder(mediaRecorder);
    setRecording(true);
  };

  const stopRecording = () => {
    if (!recorder || !recording) return;
    recorder.stop();
  };

  const retakeVideo = () => {
    setShowCamera(false);
    setRecording(false);
    video$.delete();
  };

  const phrase = isRenewal
    ? "I certify I am a real human and I reapply to keep being part of this registry"
    : "I certify that I am a real human and that I am not already registered in this registry";

  return (
    <>
      <span className="my-4 flex w-full flex-col text-2xl font-semibold">
        Video
        <div className="divider mt-4 w-2/3" />
      </span>

      <span className="mx-12 my-8 flex flex-col text-center">
        <span>
          You must record yourself holding a sign with your wallet address
        </span>
        <strong className="my-2">{address}</strong>
        <span>and say the phrase</span>
        <span className="my-2">
          <code className="text-orange">"</code>
          <strong>{phrase}</strong>
          <code className="text-orange">"</code>
        </span>
      </span>

      <span className="mx-12 my-8 flex flex-col text-center">
        <span>
          <strong>
            Upload only in accepted formats (webm, mp4, avi, and mov) to avoid
            losing your deposit
          </strong>
        </span>
      </span>

      {!showCamera && !video && (
        <div className="bordered relative mt-12 grid w-full grid-cols-2">
          <Uploader
            className="bg-whiteBackground flex h-full items-center justify-center rounded p-2 outline-dotted outline-white"
            type="video"
            onDrop={async (received) => {
              const file = received[0];
              const blob = new Blob([file], { type: file.type });
              const uri = URL.createObjectURL(blob);

              await checkVideoDuration(blob);
              checkVideoSize(blob);
              const vid = document.createElement("video");
              vid.crossOrigin = "anonymous";
              vid.src = uri;
              vid.preload = "auto";

              vid.addEventListener("loadeddata", async () => {
                if (
                  vid.videoWidth < MIN_DIMS.width ||
                  vid.videoHeight < MIN_DIMS.height
                ) {
                  videoError(ERROR_MSG.dimensions);
                  return console.error(ERROR_MSG.dimensions);
                }

                setRecording(false);
                video$.set({ uri, content: blob });
              });
            }}
          >
            <div className="bg-orange mr-4 flex h-12 w-12 items-center justify-center rounded-full">
              <UploadIcon className="h-6 w-6" />
            </div>
            <span className="text-lg font-medium">Upload video</span>
          </Uploader>

          <span className="bg-whiteBackground text-orange absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-slate-200 p-1 text-xs font-semibold">
            OR
          </span>

          <button
            className="flex items-center justify-center p-2 text-lg font-medium text-white"
            onClick={() => setShowCamera(true)}
          >
            <div className="flex flex-col">
              <span>Record with</span>
              <span>camera</span>
            </div>
            <CameraIcon className="ml-4 h-12 fill-white" />
          </button>
        </div>
      )}

      {showCamera && (
        <div tabIndex={0} ref={fullscreenRef}>
          <Webcam
            isVideo
            overlay
            recording={recording}
            action={recording ? stopRecording : startRecording}
            fullscreen={isFullscreen}
            toggleFullscreen={toggleFullscreen}
            loadCamera={setCamera}
          />
        </div>
      )}

      {!!video && (
        <div className="flex flex-col items-center">
          <video src={video.uri} controls />
          <button className="btn-main mt-4" onClick={advance}>
            Next
          </button>
        </div>
      )}

      {(showCamera || !!video) && (
        <button
          className="centered text-orange mt-4 text-lg font-semibold uppercase"
          onClick={() => retakeVideo()}
        >
          <ResetIcon className="fill-orange mr-2 h-6 w-6" />
          {showCamera ? "Return" : "Retake"}
        </button>
      )}
    </>
  );
}

export default VideoStep;
