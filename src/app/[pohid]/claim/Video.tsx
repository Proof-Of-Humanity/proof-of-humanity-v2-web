import { ObservableObject } from "@legendapp/state";
import Checklist from "components/Checklist";
import Previewed from "components/Previewed";
import Uploader from "components/Uploader";
import Webcam from "components/Webcam";
import getBlobDuration from "get-blob-duration";
import useFullscreen from "hooks/useFullscreen";
import { useLoading } from "hooks/useLoading";
import CameraIcon from "icons/CameraMajor.svg";
import ResetIcon from "icons/ResetMinor.svg";
import Image from "next/image";
import React, { useRef, useState } from "react";
import ReactWebcam from "react-webcam";
import { toast } from "react-toastify";
import {
  detectVideoFormat,
  getVideoMimeType,
  videoSanitizer,
} from "utils/media";
import { useAccount } from "wagmi";
import { MediaState } from "./Form";

const ALLOWED_VIDEO_TYPES = [
  "video/webm",
  "video/mp4",
  "video/avi",
  "video/mov",
  "video/quicktime",
  "video/x-msvideo",
];
const MIN_DIMS = { width: 352, height: 352 }; // PXs

const MAX_DURATION = 20; // Seconds
const MAX_SIZE = 10; // Megabytes
const MAX_SIZE_BYTES = MAX_SIZE ? 1024 * 1024 * MAX_SIZE : MAX_SIZE; // Bytes
const ERROR_MSG = {
  duration: `Video is too long. Maximum allowed duration is ${MAX_DURATION} seconds long`,
  dimensions: `Video dimensions are too small. Minimum dimensions are ${MIN_DIMS.width}px by ${MIN_DIMS.height}px`,
  size: `Video is oversized. Maximum allowed size is ${MAX_SIZE}mb`,
  fileType: `Unsupported video format. Please use ${ALLOWED_VIDEO_TYPES.map((t) => t.split("/")[1]).join(", ")}`,
  unexpected: "Unexpected error. Check format/codecs used.",
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

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fullscreenRef = useRef(null);
  const { isFullscreen, setFullscreen, toggleFullscreen } =
    useFullscreen(fullscreenRef);

  const [showCamera, setShowCamera] = useState(false);
  const [camera, setCamera] = useState<ReactWebcam | null>(null);
  const [recording, setRecording] = useState(false);
  const recordedChunksRef = useRef<Blob[]>([]);

  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);

  const loading = useLoading();
  const [pending, loadingMessage] = loading.use();

  const checkVideoSize = (blob: Blob) => {
    if (MAX_SIZE_BYTES && blob.size > MAX_SIZE_BYTES) {
      videoError(ERROR_MSG.size);
      console.error(ERROR_MSG.size);
      return false;
    }
    return true;
  };

  const checkVideoDuration = async (blob: Blob) => {
    const duration = await getBlobDuration(blob);
    if (duration > MAX_DURATION) {
      videoError(ERROR_MSG.duration);
      console.error(ERROR_MSG.duration);
      return false;
    }
    return true;
  };

  const startRecording = () => {
    if (pending) return;
    if (!camera || !camera.stream) return;

    const videoTrack = camera.stream.getVideoTracks()[0];
    if (!videoTrack || videoTrack.readyState !== 'live') {
      videoError("Camera not ready. Please wait a moment and try again.");
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);

    // Try mimeTypes in order of preference
    const mimeTypes = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'video/mp4',
    ];

    let options: MediaRecorderOptions | undefined;
    for (const mimeType of mimeTypes) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(mimeType)) {
        options = { mimeType };
        break;
      }
    }

    let mediaRecorder: MediaRecorder;
    try {
      mediaRecorder = options
        ? new MediaRecorder(camera.stream, options)
        : new MediaRecorder(camera.stream);
    } catch (err) {
      videoError("Recording is not supported on this browser.");
      console.error("MediaRecorder init failed:", err);
      return;
    }

    recordedChunksRef.current = [];
    let discardRecording = false;
    let handledStop = false;

    mediaRecorder.ondataavailable = ({ data }) => {
      if (discardRecording) return;
      if (!data || data.size === 0) return;
      recordedChunksRef.current.push(data);
    };

    mediaRecorder.onstop = async () => {
      if (handledStop) return;
      handledStop = true;

      if (timerRef.current) clearTimeout(timerRef.current);
      setFullscreen(false);
      setRecording(false);

      if (discardRecording) {
        recordedChunksRef.current = [];
        return;
      }

      if (!recordedChunksRef.current.length) {
        const noDataError = "Video not captured. Please retake the video.";
        videoError(noDataError);
        return;
      }

      loading.start("Processing video");

      try {
        const blob = new Blob(recordedChunksRef.current, {
          type:
            mediaRecorder.mimeType ||
            recordedChunksRef.current[0].type ||
            "video/webm",
        });

        if (blob.size === 0) {
          throw new Error("Video not captured. Please retake the video.");
        }

        const needsCompression = Boolean(MAX_SIZE_BYTES && blob.size > MAX_SIZE_BYTES);

        if (needsCompression) {
          loading.start("Compressing video");
        }

        const buffer = await blob.arrayBuffer();
        const sanitized = await videoSanitizer(buffer, MAX_SIZE_BYTES);
        const sanitizedArray = new Uint8Array(sanitized as ArrayBuffer);

        if (sanitizedArray.byteLength === 0) {
          throw new Error("Video processing failed. Please retake the video.");
        }

        const detectedFormat = detectVideoFormat(sanitizedArray);
        const outputType = getVideoMimeType(detectedFormat);
        const sanitizedBlob = new Blob([sanitizedArray], { type: outputType });

        if (MAX_SIZE_BYTES && sanitizedBlob.size > MAX_SIZE_BYTES) {
          videoError(ERROR_MSG.size);
          console.error(ERROR_MSG.size);
          return;
        }

        const uri = URL.createObjectURL(sanitizedBlob);
        video$.set({ content: sanitizedBlob, uri });
        setShowCamera(false);

        if (needsCompression) {
          toast.success("Video compressed successfully");
        }
      } catch (err: any) {
        console.error("Video sanitization error:", err);
        videoError("Failed to process video");
      } finally {
        recordedChunksRef.current = [];
        loading.stop();
      }
    };

    mediaRecorder.start();

    setRecorder(mediaRecorder);
    setRecording(true);

    // Auto-stop recording at MAX_DURATION
    timerRef.current = setTimeout(() => {
      if (mediaRecorder.state === "recording") {
        discardRecording = true;
        recordedChunksRef.current = [];
        mediaRecorder.stop();
        setRecording(false);
        setFullscreen(false);
        videoError("Upload duration of 20 seconds exceeded. Please record a shorter version.");
      }
    }, MAX_DURATION * 1000);
  };

  const stopRecording = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
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

      <span className="mx-4 sm:mx-12 my-8 flex flex-col text-center">
        <span>
          Record a short video: hold your phone showing this wallet address (readable, no glare)
        </span>
        <strong className="my-2 break-all text-sm sm:text-base font-mono">{address}</strong>
        <span>and say the phrase</span>
        <span className="my-2">
          <code className="text-orange">"</code>
          <strong>{phrase}</strong>
          <code className="text-orange">"</code>
        </span>
      </span>

      {!showCamera && !video && (
        <Checklist
          title="Video Checklist"
          warning="Not following these guidelines will result in a loss of funds."
          items={[
            {
              text: "Show your wallet address & your face in the same frame. Face forward, centered, well lit.",
              isValid: true,
            },
            {
              text: "Address must read left→right (not mirrored) and match the connected wallet.",
              isValid: true,
            },
            {
              text: `Say exactly: "${phrase}"`,
              isValid: true,
            },
            {
              text: "Show wallet address on a phone screen—clear, no shine. If on paper, confirm every character matches.",
              isValid: true,
            },
            {
              text: "Eyes, nose, mouth clearly visible (eyeglasses allowed, given no glare/reflection covering eyes).",
              isValid: true,
            },
          ]}
        />
      )}

      {!showCamera && !video && (
        <div className="mt-6 flex w-full flex-col items-center">
          <button
            className="gradient flex w-full max-w-xl items-center justify-center gap-3 rounded-full px-6 py-4 text-lg font-semibold text-white shadow-lg transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            onClick={() => setShowCamera(true)}
          >
            <CameraIcon className="h-6 w-6 fill-white" />
            <span>Record with Camera (Recommended)</span>
          </button>

          <span className="mt-2 text-sm font-semibold text-primaryText">OR</span>

          <Uploader
            className="mt-1 text-base font-semibold text-primary underline underline-offset-2 hover:text-orange focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-300"
            type="video"
            onDrop={async (received) => {
              if (pending) return;
              try {
                const file = received[0];
                if (!file) return;

                if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
                  const msg =
                    "Uploaded file type: " +
                    file.type.split("/")[1] +
                    ". ".concat(ERROR_MSG.fileType);
                  videoError(msg);
                  console.error(msg);
                  return;
                }

                const blob = new Blob([file], { type: file.type });
                const uri = URL.createObjectURL(blob);

                if (!(await checkVideoDuration(blob))) return;
                if (!checkVideoSize(blob)) return;

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
                    console.error(ERROR_MSG.dimensions);
                    return;
                  }

                  setRecording(false);
                  video$.set({ uri, content: blob });
                });
              } catch (error: any) {
                videoError(ERROR_MSG.unexpected);
                console.error(error);
              }
            }}
          >
            <span>Upload video</span>
          </Uploader>
        </div>
      )}

      {showCamera && (
        <>
          <div tabIndex={0} ref={fullscreenRef}>
            <Webcam
              isVideo
              overlay
              recording={recording}
              action={recording ? stopRecording : startRecording}
              fullscreen={isFullscreen}
              toggleFullscreen={toggleFullscreen}
              loadCamera={setCamera}
              phrase={phrase}
            />
          </div>
          <Checklist
            title="Video Checklist"
            warning="Not following these guidelines will result in a loss of funds."
            items={[
              {
                text: "Show your wallet address & your face in the same frame. Face forward, centered, well lit.",
                isValid: true,
              },
              {
                text: "Address must read left→right (not mirrored) and match the connected wallet.",
                isValid: true,
              },
              {
                text: `Say exactly: "${phrase}"`,
                isValid: true,
              },
              {
                text: "Show wallet address on a phone screen—clear, no shine. If on paper, confirm every character matches.",
                isValid: true,
              },
              {
                text: "Eyes, nose, mouth clearly visible (eyeglasses allowed, given no glare/reflection covering eyes).",
                isValid: true,
              },
            ]}
          />
        </>
      )}

      {pending && (
        <div className="flex flex-col items-center mt-4">
          <button className="btn-main" disabled>
            <Image
              alt="loading"
              src="/logo/poh-white.svg"
              className="animate-flip"
              height={12}
              width={12}
            />
            {loadingMessage}...
          </button>
        </div>
      )}

      {!!video && !pending && (
        <div className="flex flex-col items-center">
          <Previewed
            isVideo
            uri={video.uri}
            trigger={
              <video
                className="w-full max-w-xl cursor-pointer rounded"
                src={`${video.uri}#t=0.001`}
                preload="metadata"
                playsInline
              />
            }
          />
          <span className="text-secondaryText mt-1 text-sm">
            Tap video to preview fullscreen
          </span>
          <button className="btn-main mt-4" onClick={advance}>
            Next
          </button>
        </div>
      )}

      {(showCamera || !!video) && !pending && (
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
