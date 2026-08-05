import { ObservableObject } from "@legendapp/state";
import ActionButton from "components/ActionButton";
import Checklist from "components/Checklist";
import Previewed from "components/Previewed";
import Uploader from "components/Uploader";
import Webcam, { CameraButton } from "components/Webcam";
import useFullscreen from "hooks/useFullscreen";
import { useLoading } from "hooks/useLoading";
import useStaleGuard from "hooks/useStaleGuard";
import CameraIcon from "icons/CameraMajor.svg";
import InfoIcon from "icons/info.svg";
import PlayIcon from "icons/PlayMajor.svg";
import ResetIcon from "icons/ResetMinor.svg";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactWebcam from "react-webcam";
import { toast } from "react-toastify";
import {
  IS_IOS,
  MEDIA_MESSAGES,
  processVideoInput,
  warmVideoPipeline,
  VIDEO_LIMITS,
} from "utils/media";
import { useAccount } from "wagmi";
import { MediaState } from "./Form";

interface VideoProps {
  advance: () => void;
  onBack?: () => void;
  video$: ObservableObject<MediaState["video"]>;
  isRenewal: boolean;
  videoError: (error: string) => void;
}

const SAMPLE_VIDEO_URL = "/api/media/sample-registration-video";
const isSampleSubmissionEnabled = true;

function VideoStep({
  advance,
  onBack,
  video$,
  isRenewal,
  videoError,
}: VideoProps) {
  const WARNING_TOAST_BASE_MS = 5000;
  const WARNING_TOAST_PER_MESSAGE_MS = 1500;
  const WARNING_TOAST_MAX_MS = 20000;

  const video = video$.use();

  const { address } = useAccount();

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const staleGuard = useStaleGuard();
  const fullscreenRef = useRef(null);
  const { isFullscreen, setFullscreen, toggleFullscreen } =
    useFullscreen(fullscreenRef);

  const [showCamera, setShowCamera] = useState(false);
  const [camera, setCamera] = useState<ReactWebcam | null>(null);
  const [recording, setRecording] = useState(false);
  const [videoValidationErrors, setVideoValidationErrors] = useState<string[]>(
    [],
  );
  const [videoQualityWarnings, setVideoQualityWarnings] = useState<string[]>(
    [],
  );
  const [rawPreviewUri, setRawPreviewUri] = useState<string | null>(null);

  const loading = useLoading();
  const [pending, loadingMessage] = loading.use();

  useEffect(() => {
    warmVideoPipeline();
  }, []);

  const setValidationError = (message: string) => {
    setVideoValidationErrors([message]);
    setVideoQualityWarnings([]);
    videoError(message);
  };

  const setGenericProcessingError = () => {
    setValidationError(MEDIA_MESSAGES.genericVideoProcessingError);
  };

  const showWarningToasts = (messages: string[]) => {
    if (messages.length === 0) return;

    const autoCloseMs = Math.min(
      WARNING_TOAST_MAX_MS,
      WARNING_TOAST_BASE_MS +
        (messages.length - 1) * WARNING_TOAST_PER_MESSAGE_MS,
    );

    messages.forEach((warningMessage) =>
      toast.warn(warningMessage, {
        autoClose: autoCloseMs,
        pauseOnHover: true,
      }),
    );
  };

  const processVideoBlob = async (blob: Blob, isStale: () => boolean) => {
    // Show a raw preview immediately so user sees their video while processing
    const previewUrl = URL.createObjectURL(blob);
    setRawPreviewUri((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return previewUrl;
    });

    const needsCompression = blob.size > VIDEO_LIMITS.maxSizeBytes;
    if (needsCompression) {
      loading.start("Compressing video");
    }

    const result = await processVideoInput(blob);
    if (isStale()) {
      // User retook/cancelled (or left the step) while we were processing.
      URL.revokeObjectURL(previewUrl);
      return;
    }

    if (result.error) {
      const errorMessages = result.error.messages;
      const warningMessages = result.error.warnings;

      setShowCamera(false);
      setVideoValidationErrors(errorMessages);
      if (errorMessages[0]) {
        videoError(errorMessages[0]);
      }

      setVideoQualityWarnings(warningMessages);
      if (warningMessages.length > 0) {
        showWarningToasts(warningMessages);
      }
      return;
    }

    const processed = result.data;

    setVideoQualityWarnings(processed.warnings);
    if (processed.warnings.length > 0) {
      showWarningToasts(processed.warnings);
    }

    setVideoValidationErrors([]);
    URL.revokeObjectURL(previewUrl);
    setRawPreviewUri(null);

    if (video?.uri) URL.revokeObjectURL(video.uri);
    video$.set({
      content: processed.blob,
      uri: URL.createObjectURL(processed.blob),
    });
    setRecording(false);
    setShowCamera(false);

    if (needsCompression && processed.didCompress) {
      toast.success("Video compressed successfully");
    }
  };

  const handleUploadedVideo = async (received: File[]) => {
    const file = received[0];
    if (!file) return;

    setVideoValidationErrors([]);
    setVideoQualityWarnings([]);
    const isStale = staleGuard.begin();
    loading.start("Processing video");

    try {
      await processVideoBlob(file, isStale);
    } catch (err: unknown) {
      if (!isStale()) setGenericProcessingError();
    } finally {
      // A retake/supersede path owns the loader once this run goes stale.
      if (!isStale()) loading.stop();
    }
  };

  const startRecording = () => {
    if (pending) return;
    if (!camera || !camera.stream) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    const [videoTrack] = camera.stream.getVideoTracks();
    if (!videoTrack || videoTrack.readyState !== "live") {
      setValidationError(
        "Camera not ready. Please wait a moment and try again.",
      );
      return;
    }

    const captureFrameRate = videoTrack?.getSettings().frameRate;

    if (
      typeof captureFrameRate === "number" &&
      captureFrameRate < VIDEO_LIMITS.minCaptureFps
    ) {
      const lowFpsError =
        "Your camera is running too slowly right now. Improve lighting, close background apps, and try again.";
      setValidationError(lowFpsError);
      return;
    }

    const preferredMimeTypes = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm",
      "video/mp4",
    ];
    const supportedMimeType = preferredMimeTypes.find(
      (mimeType) =>
        typeof MediaRecorder !== "undefined" &&
        MediaRecorder.isTypeSupported(mimeType),
    );

    let mediaRecorder: MediaRecorder;
    try {
      mediaRecorder = supportedMimeType
        ? new MediaRecorder(camera.stream, { mimeType: supportedMimeType })
        : new MediaRecorder(camera.stream);
    } catch (error) {
      setValidationError("Recording is not supported on this browser.");
      return;
    }

    const recordedChunks: BlobPart[] = [];
    let discardRecording = false;
    let handledStop = false;

    mediaRecorder.ondataavailable = ({ data }) => {
      if (discardRecording) return;
      if (!data || data.size === 0) return;

      recordedChunks.push(data);
    };

    mediaRecorder.onstop = async () => {
      if (handledStop) return;
      handledStop = true;

      if (timerRef.current) clearTimeout(timerRef.current);
      recorderRef.current = null;
      setFullscreen(false);
      setRecording(false);

      if (discardRecording) return;

      if (recordedChunks.length === 0) {
        const noDataError =
          "No video data captured. Please try recording again.";
        setValidationError(noDataError);
        return;
      }

      setVideoValidationErrors([]);
      setVideoQualityWarnings([]);
      const isStale = staleGuard.begin();
      loading.start("Processing video");

      try {
        const blob = new Blob(recordedChunks, {
          type:
            mediaRecorder.mimeType ||
            (recordedChunks[0] instanceof Blob ? recordedChunks[0].type : "") ||
            (IS_IOS ? "video/mp4" : "video/webm"),
        });
        await processVideoBlob(blob, isStale);
      } catch (err: unknown) {
        if (!isStale()) setGenericProcessingError();
      } finally {
        // A retake/supersede path owns the loader once this run goes stale.
        if (!isStale()) loading.stop();
      }
    };

    mediaRecorder.start();

    recorderRef.current = mediaRecorder;
    setRecording(true);

    //Auto - stop recording at MAX_DURATION
    timerRef.current = setTimeout(() => {
      if (mediaRecorder.state === "recording") {
        discardRecording = true;
        recordedChunks.length = 0;
        mediaRecorder.stop();
        setRecording(false);
        setFullscreen(false);
        toast.error(
          "Upload duration of 20 seconds exceeded. Please record a shorter version.",
        );
      }
    }, VIDEO_LIMITS.maxDurationSec * 1000);
  };

  const stopRecording = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!recorderRef.current || !recording) return;
    recorderRef.current.stop();
  };

  // Tears down a recording session whose output nobody wants anymore:
  // disarm the auto-stop timer and silence the recorder's handlers before
  // stopping it, so its (always-async) onstop can't feed the processing
  // pipeline. Only touches refs, hence safely stable.
  const discardActiveRecording = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const recorder = recorderRef.current;
    if (recorder) {
      recorder.ondataavailable = null;
      recorder.onstop = null;
      if (recorder.state === "recording") recorder.stop();
      recorderRef.current = null;
    }
  }, []);

  // The recording session must not outlive the step.
  useEffect(() => discardActiveRecording, [discardActiveRecording]);

  const retakeVideo = () => {
    // Abandon in-flight processing and any live recording session.
    staleGuard.invalidate();
    discardActiveRecording();

    setShowCamera(false);
    setRecording(false);
    setVideoValidationErrors([]);
    setVideoQualityWarnings([]);
    loading.stop();
    if (rawPreviewUri) URL.revokeObjectURL(rawPreviewUri);
    setRawPreviewUri(null);
    if (video?.uri) URL.revokeObjectURL(video.uri);
    video$.delete();
  };

  useEffect(
    () => () => {
      if (rawPreviewUri) URL.revokeObjectURL(rawPreviewUri);
    },
    [rawPreviewUri],
  );

  const phrase = isRenewal
    ? "I certify I am a real human and I reapply to keep being part of this registry"
    : "I certify that I am a real human and that I am not already registered in this registry";

  // ─── Derived visual state ────────────────────────────────────────
  const isPreparing = pending && !rawPreviewUri;
  const isProcessing = pending && !!rawPreviewUri;
  const hasIssues =
    videoValidationErrors.length > 0 || videoQualityWarnings.length > 0;
  const hasError = !pending && !!rawPreviewUri && !video && hasIssues;
  const isAccepted = !!video && !pending;
  const isSourceSelection = !showCamera && !video && !pending && !rawPreviewUri;

  const checklistItems = [
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
      text: "Show wallet address on a phone screen, clear, no shine. If on paper, confirm every character matches.",
      isValid: true,
    },
    {
      text: "Eyes, nose, mouth clearly visible (eyeglasses allowed, given no glare/reflection covering eyes).",
      isValid: true,
    },
  ];

  return (
    <>
      <div className="flex w-full flex-col items-center text-center">
        <h1 className="text-primaryText text-2xl font-semibold">
          Record your <span className="text-peach">Video</span>
        </h1>
      </div>

      <span className="text-secondaryText mx-4 mb-8 mt-3 flex flex-col text-center text-sm leading-6 sm:mx-12">
        <span>
          Record a short video: hold your phone showing this wallet address
          (readable, no glare)
        </span>
        <strong className="text-orange my-2 break-all font-mono text-sm sm:text-base">
          {address}
        </strong>
        <span>and say the phrase</span>
        <span className="my-2">
          <code className="text-orange">&quot;</code>
          <strong className="text-orange">{phrase}</strong>
          <code className="text-orange">&quot;</code>
        </span>
      </span>

      {isSourceSelection && isSampleSubmissionEnabled && (
        <div className="border-orange bg-whiteBackground mx-auto mb-8 w-full max-w-3xl rounded-2xl border p-4 shadow-sm sm:p-5">
          <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:items-center sm:text-left">
            <div className="bg-lightOrange border-orange flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border">
              <CameraIcon className="fill-orange h-5 w-5" />
            </div>
            <div>
              <h3 className="text-primaryText text-lg font-semibold">
                Example Submission
              </h3>
              <p className="text-secondaryText text-sm">
                Watch this example to see how a correct submission looks.
              </p>
            </div>
          </div>

          <div className="border-stroke mt-4 overflow-hidden rounded-2xl border bg-black shadow-sm">
            <video
              className="aspect-video w-full bg-black object-cover"
              src={SAMPLE_VIDEO_URL}
              controls
              playsInline
              preload="metadata"
            />
          </div>
        </div>
      )}

      {/* ── S1: Source Selection ── */}
      {isSourceSelection && (
        <>
          <Checklist
            title="Video Checklist"
            warning="Not following these guidelines will result in a loss of funds."
            items={checklistItems}
          />

          <div className="mt-6 flex w-full flex-col items-center">
            <ActionButton
              onClick={() => setShowCamera(true)}
              ariaLabel="Record with Camera"
              label={
                <span className="flex items-center gap-2">
                  <CameraIcon className="h-5 w-5 fill-white" />
                  Record with Camera (Recommended)
                </span>
              }
              className="w-full max-w-sm px-10 py-3.5"
            />

            <span className="text-secondaryText mt-4 text-sm">OR</span>

            <Uploader
              className="text-orange mt-2 text-sm font-medium hover:underline"
              type="video"
              onDrop={handleUploadedVideo}
            >
              <span>Upload video</span>
            </Uploader>

            {onBack && (
              <ActionButton
                onClick={onBack}
                label="Back"
                variant="secondary"
                className="mt-6 w-full max-w-[10rem]"
              />
            )}
          </div>
        </>
      )}

      {/* ── S2: Camera Live ── */}
      {showCamera && !pending && !rawPreviewUri && (
        <>
          <div tabIndex={0} ref={fullscreenRef}>
            <Webcam
              video
              recording={recording}
              fullscreen={isFullscreen}
              toggleFullscreen={toggleFullscreen}
              onCamera={setCamera}
              overlay={
                recording ? (
                  <div className="centered absolute left-0 top-0 h-full w-full select-none bg-black text-center text-xl font-semibold uppercase text-white opacity-70 sm:text-3xl md:text-3xl lg:text-4xl">
                    {phrase}
                  </div>
                ) : undefined
              }
              fallback={
                <Uploader
                  className="text-orange text-sm font-medium hover:underline"
                  type="video"
                  onDrop={handleUploadedVideo}
                >
                  <span>Upload video</span>
                </Uploader>
              }
            >
              <CameraButton
                onClick={recording ? stopRecording : startRecording}
                label={recording ? "Stop recording" : "Start recording"}
                className={recording ? "btn-recording" : undefined}
              >
                {recording ? (
                  <span className="mx-auto block h-6 w-6 rounded-[4px] bg-white" />
                ) : (
                  <PlayIcon className="mx-auto h-8 w-8 fill-white" />
                )}
              </CameraButton>
            </Webcam>
          </div>
          <div className="mt-3 flex justify-center">
            <button
              className="text-orange py-1 text-base font-medium hover:underline disabled:opacity-50"
              onClick={() => retakeVideo()}
              disabled={recording}
            >
              Cancel
            </button>
          </div>
          <Checklist
            title="Video Checklist"
            warning="Not following these guidelines will result in a loss of funds."
            items={checklistItems}
          />
        </>
      )}

      {/* ── S3: Processing ── */}
      {isPreparing && (
        <div className="mt-4 flex flex-col items-center">
          <button className="btn-primary" disabled>
            <Image
              alt="loading"
              src="/logo/poh-white.svg"
              className="animate-flip"
              height={12}
              width={12}
            />
            {loadingMessage || "Processing video"}...
          </button>
        </div>
      )}

      {/* ── S3: Processing with raw preview ── */}
      {isProcessing && (
        <div className="mt-4 flex flex-col items-center">
          <div className="relative inline-block max-w-full overflow-hidden rounded-lg bg-black">
            <video
              src={rawPreviewUri!}
              className="mx-auto max-h-72 w-auto max-w-full object-contain opacity-60 sm:max-h-64"
              muted
              playsInline
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-lg bg-black/40">
              <Image
                alt="loading"
                src="/logo/poh-white.svg"
                className="animate-flip"
                height={24}
                width={24}
              />
              <span className="mt-2 text-sm font-semibold text-white">
                {loadingMessage}...
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── S4/S5: Accepted (± warning) ── */}
      {isAccepted && (
        <div className="flex flex-col items-center">
          <Previewed
            kind="video"
            uri={video.uri}
            trigger={
              <div className="inline-block max-w-full overflow-hidden rounded-lg bg-black">
                <video
                  className="mx-auto max-h-72 w-auto max-w-full cursor-pointer object-contain sm:max-h-64"
                  src={`${video.uri}#t=0.001`}
                  preload="metadata"
                  playsInline
                />
              </div>
            }
          />
          <span className="text-secondaryText mt-1 text-sm">
            Tap video to preview fullscreen
          </span>
          {hasIssues && (
            <div className="border-stroke bg-primaryBackground mt-4 w-full max-w-2xl rounded-xl border px-5 py-4 shadow-sm">
              <div className="text-primaryText mb-3 flex items-center justify-center gap-2 text-lg font-semibold">
                <span className="border-stroke bg-whiteBackground flex h-7 w-7 items-center justify-center rounded-full border">
                  <InfoIcon className="text-primaryText h-4 w-4 stroke-current stroke-2" />
                </span>
                <span>Issues Found</span>
              </div>
              {videoQualityWarnings.length > 0 && (
                <div className="mx-auto w-full max-w-lg">
                  <div className="mb-2 flex justify-center">
                    <span className="bg-status-challenged/15 text-status-challenged rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]">
                      Warnings
                    </span>
                  </div>
                  <ul className="text-status-challenged flex flex-col items-center gap-2 text-center text-sm">
                    {videoQualityWarnings.map((warningMessage, idx) => (
                      <li
                        key={`accepted-warning-${idx}`}
                        className="flex items-start justify-center gap-2"
                      >
                        <span className="bg-status-challenged mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full" />
                        <span className="text-status-challenged">
                          {warningMessage}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          <div className="mt-4 flex w-full max-w-xs gap-3">
            {onBack && (
              <ActionButton
                onClick={onBack}
                label="Back"
                variant="secondary"
                className="flex-1"
              />
            )}
            <ActionButton onClick={advance} label="Next" className="flex-1" />
          </div>
        </div>
      )}

      {/* ── S6: Error with preview ── */}
      {hasError && (
        <div className="flex flex-col items-center">
          <div className="inline-block max-w-full overflow-hidden rounded-lg bg-black">
            <video
              src={rawPreviewUri!}
              controls
              className="mx-auto max-h-72 w-auto max-w-full object-contain sm:max-h-64"
            />
          </div>
          <div className="border-stroke bg-primaryBackground mt-4 w-full max-w-2xl rounded-xl border px-5 py-4 shadow-sm">
            <div className="text-primaryText mb-3 flex items-center justify-center gap-2 text-lg font-semibold">
              <span className="border-stroke bg-whiteBackground flex h-7 w-7 items-center justify-center rounded-full border">
                <InfoIcon className="text-primaryText h-4 w-4 stroke-current stroke-2" />
              </span>
              <span className="text-primaryText">Issues Found</span>
            </div>
            {videoValidationErrors.length > 0 && (
              <div className="mx-auto w-full max-w-lg">
                <div className="mb-2 flex justify-center">
                  <span className="bg-status-rejected/15 text-status-rejected rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]">
                    Major Issues
                  </span>
                </div>
                <ul className="text-primaryText flex flex-col items-center gap-2 text-center text-sm">
                  {videoValidationErrors.map((errorMessage, idx) => (
                    <li
                      key={`error-${idx}`}
                      className="flex items-start justify-center gap-2"
                    >
                      <span className="bg-status-rejected mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full" />
                      <span className="text-status-rejected">
                        {errorMessage}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {videoQualityWarnings.length > 0 && (
              <div
                className={
                  videoValidationErrors.length > 0
                    ? "border-stroke mt-4 border-t pt-4"
                    : ""
                }
              >
                <div className="mb-2 flex justify-center">
                  <span className="bg-status-challenged/15 text-status-challenged rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]">
                    Warnings
                  </span>
                </div>
                <ul className="text-status-challenged mx-auto flex w-full max-w-lg flex-col items-center gap-2 text-center text-sm">
                  {videoQualityWarnings.map((warningMessage, idx) => (
                    <li
                      key={`warning-${idx}`}
                      className="flex items-start justify-center gap-2"
                    >
                      <span className="bg-status-challenged mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full" />
                      <span className="text-status-challenged">
                        {warningMessage}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Bottom action button ── */}
      {(isAccepted || isProcessing || isPreparing || hasError) && (
        <button
          className="text-orange mx-auto mt-3 flex items-center self-center py-1 text-base font-medium hover:underline"
          onClick={() => retakeVideo()}
        >
          {!(isProcessing || isPreparing) && (
            <ResetIcon className="fill-orange mr-1.5 h-5 w-5" />
          )}
          {isProcessing || isPreparing
            ? "Cancel"
            : isAccepted
              ? "Retake"
              : "Try Again"}
        </button>
      )}
    </>
  );
}

export default VideoStep;
