"use client";

import { ObservableObject } from "@legendapp/state";
import ActionButton from "components/ActionButton";
import Checklist from "components/Checklist";
import Previewed from "components/Previewed";
import Webcam, { CameraButton } from "components/Webcam";
import useFullscreen from "hooks/useFullscreen";
import { useLoading } from "hooks/useLoading";
import useStaleGuard from "hooks/useStaleGuard";
import CircleCancel from "icons/CircleCancelMinor.svg";
import CircleTick from "icons/CircleTickMinor.svg";
import ResetIcon from "icons/ResetMinor.svg";
import ZoomIcon from "icons/SearchMajor.svg";
import CameraIcon from "icons/CameraMajor.svg";
import SmileyIcon from "icons/SmileyHappyMajor.svg";
import Image, { StaticImageData } from "next/image";
import { useEffect, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import type { Area, Point } from "react-easy-crop/types";
import { toast } from "react-toastify";
import ReactWebcam from "react-webcam";
import { getCroppedPhoto, sanitizeImage } from "utils/media.image";
import {
  validatePhotoDimensions,
  validatePhotoSize,
  PHOTO_LIMITS,
} from "utils/media";
import { base64ToUint8Array } from "utils/misc";
import { MediaState } from "./Form";

interface PhotoProps {
  advance: () => void;
  onBack?: () => void;
  photo$: ObservableObject<MediaState["photo"]>;
}

const ExamplePic: React.FC<
  Omit<StaticImageData, "width" | "height"> & { wrong?: boolean }
> = ({ wrong, ...imageProps }) => (
  <div className="flex flex-col items-center">
    <Image
      alt="example"
      className="mb-2 h-36 w-36 rounded-sm"
      width={512}
      height={512}
      {...imageProps}
    />
    {wrong ? (
      <CircleCancel className="h-6 w-6 fill-red-500" />
    ) : (
      <CircleTick className="h-6 w-6 fill-green-500" />
    )}
  </div>
);

const PHOTO_CHECKLIST = [
  {
    text: "Face forward, centered, well lit.",
    isValid: true,
  },
  {
    text: "Eyes, nose, mouth visible (eyeglasses allowed, given no glare/reflection covering eyes).",
    isValid: true,
  },
  {
    text: "No masks/veils covering facial features.",
    isValid: false,
  },
];

function Photo({ advance, onBack, photo$ }: PhotoProps) {
  const photo = photo$.use();
  const fullscreenRef = useRef(null);
  const { isFullscreen, setFullscreen, toggleFullscreen } =
    useFullscreen(fullscreenRef);

  const [originalPhoto, setOriginalPhoto] = useState<{
    uri: string;
  } | null>(null);

  const [showCamera, setShowCamera] = useState(false);
  const [camera, setCamera] = useState<ReactWebcam | null>(null);
  const [cropPixels, setCropPixels] = useState<Area | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [maxZoom, setMaxZoom] = useState(3);
  const [zoom, setZoom] = useState(1);
  const cropTooSmallRef = useRef(false);

  const loading = useLoading();
  const staleGuard = useStaleGuard();
  const [pending, loadingMessage] = loading.use();

  const onCrop = async () => {
    if (!cropPixels || !originalPhoto) return;

    const dimensionError = validatePhotoDimensions(
      cropPixels.width,
      cropPixels.height,
    );
    if (dimensionError) {
      toast.error(dimensionError);
      return;
    }

    const isStale = staleGuard.begin();
    loading.start("Cropping photo");
    try {
      const cropped = await getCroppedPhoto(originalPhoto.uri, cropPixels);
      if (isStale() || !cropped) return;
      const croppedBase64 = cropped.split(",")[1];
      if (!croppedBase64) return;

      const sanitized = await sanitizeImage(
        Buffer.from(base64ToUint8Array(croppedBase64)),
      );
      if (isStale()) return;

      const sizeError = validatePhotoSize(sanitized.size);
      if (sizeError) {
        toast.error(sizeError);
        return;
      }

      if (photo?.uri) URL.revokeObjectURL(photo.uri);
      photo$.set({ content: sanitized, uri: URL.createObjectURL(sanitized) });
    } catch (err: any) {
      if (!isStale()) toast.error(err.message);
    } finally {
      // A retake/supersede path owns the loader once this run goes stale.
      if (!isStale()) loading.stop();
    }
  };

  const takePhoto = async () => {
    setFullscreen(false);
    if (!camera) return;

    const screenshot = camera.getScreenshot();
    if (!screenshot) return;
    const screenshotBase64 = screenshot.split(",")[1];
    if (!screenshotBase64) return;

    const buffer = Buffer.from(base64ToUint8Array(screenshotBase64));
    if (originalPhoto?.uri) URL.revokeObjectURL(originalPhoto.uri);
    setOriginalPhoto({
      uri: URL.createObjectURL(new Blob([buffer], { type: "image/jpeg" })),
    });

    setShowCamera(false);
  };

  const retakePhoto = () => {
    // Abandon any in-flight crop so it can't resurrect a discarded photo.
    staleGuard.invalidate();
    setShowCamera(false);
    if (photo?.uri) URL.revokeObjectURL(photo.uri);
    if (originalPhoto?.uri) URL.revokeObjectURL(originalPhoto.uri);
    photo$.delete();
    setOriginalPhoto(null);
    setZoom(1);
    setCrop({ x: 0, y: 0 });
    setCropPixels(null);
    cropTooSmallRef.current = false;
    loading.stop();
  };

  useEffect(
    () => () => {
      if (originalPhoto?.uri) URL.revokeObjectURL(originalPhoto.uri);
    },
    [originalPhoto?.uri],
  );

  // Four distinct stages, not two — the confirmed photo used to fall through
  // to the "Take a Photo" copy while showing the finished portrait, and the
  // live camera used to promise "the examples below" after they'd unmounted.
  const stage = photo
    ? "confirmed"
    : originalPhoto
      ? "cropping"
      : showCamera
        ? "camera"
        : "empty";

  const COPY = {
    empty: {
      title: (
        <>
          Take a <span className="text-peach">Photo</span>
        </>
      ),
      body: "Face the camera directly with your whole face visible — the examples below show what passes and what gets rejected.",
    },
    camera: {
      title: (
        <>
          Take a <span className="text-peach">Photo</span>
        </>
      ),
      body: "Look straight at the lens, fill the frame with your face, and make sure nothing covers your eyes, nose, or mouth.",
    },
    cropping: {
      title: (
        <>
          Crop <span className="text-peach">Photo</span>
        </>
      ),
      body: "Center your face in the circle and zoom in until it fills most of the frame. Keep it straight — not tilted or rotated.",
    },
    confirmed: {
      title: (
        <>
          Check Your <span className="text-peach">Photo</span>
        </>
      ),
      body: "This portrait will be public on your profile and reviewed against the policy. Make sure it's sharp, well lit, and shows your whole face before continuing.",
    },
  }[stage];

  return (
    <div className="flex w-full flex-col items-center pb-2">
      <div className="flex flex-col items-center text-center">
        <h1 className="text-primaryText text-2xl font-semibold">
          {COPY.title}
        </h1>
        <p className="text-secondaryText mt-3 max-w-xl text-sm leading-6">
          {COPY.body}
        </p>
      </div>

      {/* ── Stage: empty (nothing captured, camera closed) — teach the rules
          first (pass/fail examples + checklist) before offering the camera
          CTA, since failing them costs the deposit. */}
      {stage === "empty" && (
        <div className="mt-8 flex flex-col items-center gap-8">
          <div className="flex w-fit flex-col items-center">
            <span className="pb-2 font-semibold">Facing the camera</span>
            <div className="grid grid-cols-2 gap-2">
              <ExamplePic src="/images/front-facing.jpg" />
              <ExamplePic src="/images/not-front-facing.jpg" wrong={true} />
            </div>
          </div>

          <div className="flex w-fit flex-col items-center">
            <span className="pb-2 font-semibold">
              All facial features must be visible
            </span>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <ExamplePic src="/images/hijab.jpg" />
              <ExamplePic src="/images/niqab.jpg" wrong={true} />
              <ExamplePic src="/images/glasses.jpg" />
              <ExamplePic src="/images/sunglasses.jpg" wrong={true} />
            </div>
          </div>

          <Checklist
            title="Photo Checklist"
            warning="Not following these guidelines will result in a loss of funds."
            items={PHOTO_CHECKLIST}
          />

          <div className="flex w-full flex-col items-center">
            <ActionButton
              onClick={() => setShowCamera(true)}
              ariaLabel="Take with Camera"
              label={
                <span className="flex items-center gap-2">
                  <CameraIcon className="h-5 w-5 fill-white" />
                  Take with Camera
                </span>
              }
              className="w-full max-w-xs"
            />
            {/* Back sits under the CTA — empty is the only stage without an
                inline Next/primary to pair it with. */}
            {onBack && (
              <ActionButton
                onClick={onBack}
                label="Back"
                variant="secondary"
                className="mt-4 w-full max-w-[10rem]"
              />
            )}
          </div>
        </div>
      )}

      {/* ── Stage: camera (live preview) — the webcam dock with the hero
          capture button; the wrapper holds the ref/tabIndex fullscreen
          targets. */}
      {stage === "camera" && (
        <div className="mt-6 w-full" tabIndex={0} ref={fullscreenRef}>
          <Webcam
            fullscreen={isFullscreen}
            toggleFullscreen={toggleFullscreen}
            onCamera={setCamera}
          >
            <CameraButton onClick={takePhoto} label="Take photo">
              <SmileyIcon className="mx-auto h-8 w-8 fill-white" />
            </CameraButton>
          </Webcam>
        </div>
      )}

      {/* ── Stage: cropping (raw capture taken, not yet confirmed) — zoom rail
          + circular cropper; "Next" validates dimensions and commits the
          crop, which is what produces `photo`. */}
      {stage === "cropping" && (
        <>
          <div className="mb-4 mt-8 flex w-full items-center gap-3">
            <ZoomIcon className="fill-orange h-6 w-6 shrink-0" />
            <input
              aria-label="Zoom"
              className="slider-thumb bg-stroke h-1.5 w-full appearance-none rounded-full"
              type="range"
              min={1}
              max={maxZoom}
              step={0.05}
              value={zoom}
              onChange={(event) => setZoom(parseFloat(event.target.value))}
            />
          </div>

          <div className="bg-whiteBackground relative mb-2 h-96 w-full">
            <Cropper
              image={originalPhoto?.uri}
              crop={crop}
              zoom={zoom}
              maxZoom={maxZoom}
              aspect={1}
              cropShape="round"
              onCropChange={setCrop}
              onCropComplete={(_area, croppedPixels) => {
                setCropPixels(croppedPixels);
                const dimensionError = validatePhotoDimensions(
                  croppedPixels.width,
                  croppedPixels.height,
                );
                const tooSmall = !!dimensionError;
                if (tooSmall && !cropTooSmallRef.current) {
                  cropTooSmallRef.current = true;
                  toast.error(dimensionError);
                } else if (!tooSmall) {
                  cropTooSmallRef.current = false;
                }
              }}
              onZoomChange={setZoom}
              onMediaLoaded={(media) => {
                setMaxZoom(
                  Math.floor(
                    Math.min(media.naturalWidth, media.naturalHeight) /
                      Math.min(PHOTO_LIMITS.minWidth, PHOTO_LIMITS.minHeight),
                  ),
                );
              }}
            />
          </div>

          <div className="mt-2 flex w-full max-w-xs gap-3">
            {onBack && (
              <ActionButton
                onClick={onBack}
                label="Back"
                variant="secondary"
                className="flex-1"
              />
            )}
            <ActionButton
              onClick={onCrop}
              isLoading={pending}
              disabled={pending}
              label={pending ? `${loadingMessage}...` : "Next"}
              className="flex-1"
            />
          </div>
        </>
      )}

      {/* ── Stage: confirmed (cropped photo committed) — the final portrait
          (click to expand) so the user checks exactly what goes on-chain,
          with Back/Next to move through the wizard. */}
      {stage === "confirmed" && photo && (
        <div className="mt-8 flex flex-col items-center">
          <Previewed
            kind="image"
            uri={photo.uri}
            trigger={
              <Image
                alt="preview"
                className="cursor-pointer rounded-full ring-1 ring-peach"
                src={photo.uri}
                width={256}
                height={256}
              />
            }
          />
          <div className="mt-6 flex w-full max-w-xs gap-3">
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

      {/* Escape hatch, every stage past empty — resets back to the empty
          stage. "Cancel" while the camera is open (nothing captured yet),
          "Retake" once an image exists. */}
      {stage !== "empty" && (
        <div className="mt-5 flex justify-center">
          <button
            className="text-orange flex items-center py-1 text-base font-medium hover:underline"
            onClick={retakePhoto}
          >
            {stage !== "camera" && (
              <ResetIcon className="fill-orange mr-1.5 h-5 w-5" />
            )}
            {stage === "camera" ? "Cancel" : "Retake"}
          </button>
        </div>
      )}

      {/* Checklist repeated while filming — the rules matter most at the
          moment of capture, so opening the camera must not drop them
          (Video keeps its checklist on screen for the same reason). */}
      {stage === "camera" && (
        <Checklist
          title="Photo Checklist"
          warning="Not following these guidelines will result in a loss of funds."
          items={PHOTO_CHECKLIST}
        />
      )}
    </div>
  );
}

export default Photo;
