"use client";

import { ObservableObject } from "@legendapp/state";
import Checklist from "components/Checklist";
import Previewed from "components/Previewed";
import Webcam from "components/Webcam";
import useFullscreen from "hooks/useFullscreen";
import { useLoading } from "hooks/useLoading";
import CircleCancel from "icons/CircleCancelMinor.svg";
import CircleTick from "icons/CircleTickMinor.svg";
import CheckmarkIcon from "icons/MobileAcceptMajor.svg";
import ResetIcon from "icons/ResetMinor.svg";
import ZoomIcon from "icons/SearchMajor.svg";
import CameraIcon from "icons/CameraMajor.svg";
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

function Photo({ advance, photo$ }: PhotoProps) {
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

    loading.start("Cropping photo");
    try {
      const cropped = await getCroppedPhoto(originalPhoto.uri, cropPixels);
      if (!cropped) return;
      const croppedBase64 = cropped.split(",")[1];
      if (!croppedBase64) return;

      const sanitized = await sanitizeImage(
        Buffer.from(base64ToUint8Array(croppedBase64)),
      );

      const sizeError = validatePhotoSize(sanitized.size);
      if (sizeError) {
        toast.error(sizeError);
        return;
      }

      if (photo?.uri) URL.revokeObjectURL(photo.uri);
      photo$.set({ content: sanitized, uri: URL.createObjectURL(sanitized) });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      loading.stop();
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

  return (
    <>
      <span className="my-4 flex w-full flex-col text-2xl font-semibold">
        {originalPhoto && !photo ? "Crop photo" : "Take Photo"}
        <div className="divider mt-4 w-2/3" />
      </span>

      <span className="pb-8">
        {originalPhoto && !photo
          ? "Make sure your face is centered and not rotated"
          : "The photo should include the face of the submitter facing the camera and the facial features must be visible"}
      </span>

      {!showCamera && !originalPhoto && !photo && (
        <div className="flex flex-col items-center gap-8">
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
            items={[
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
            ]}
          />

          <div className="mt-6 flex w-full flex-col items-center">
            <button
              className="btn-primary !w-full max-w-xl gap-3 px-6 py-4 text-lg"
              onClick={() => setShowCamera(true)}
            >
              <CameraIcon className="h-6 w-6 fill-white" />
              <span>Take with Camera</span>
            </button>
          </div>
        </div>
      )}

      {showCamera && (
        <div tabIndex={0} ref={fullscreenRef}>
          <Webcam
            fullscreen={isFullscreen}
            toggleFullscreen={toggleFullscreen}
            loadCamera={setCamera}
            action={takePhoto}
          />
        </div>
      )}

      {!showCamera && !!originalPhoto && !photo && (
        <>
          <div className="centered mx-12 mb-4">
            <ZoomIcon className="fill-theme mr-2 h-6 w-6" />
            <input
              className="slider-thumb bg-grey h-0.5 w-full appearance-none"
              type="range"
              min={1}
              max={maxZoom}
              step={0.05}
              value={zoom}
              onChange={(event) => setZoom(parseFloat(event.target.value))}
            />
          </div>

          <div className="bg-grey relative mb-2 h-96 w-full">
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

          {pending ? (
            <button className="btn-primary">
              <Image
                alt="loading"
                src="/logo/poh-white.svg"
                className="animate-flip"
                height={12}
                width={12}
              />
              {loadingMessage}...
            </button>
          ) : (
            <button className="btn-primary" onClick={onCrop}>
              <CheckmarkIcon className="mr-2 h-6 w-6 fill-white" />
              Ready
            </button>
          )}
        </>
      )}

      {!!photo && (
        <div className="flex flex-col items-center">
          <Previewed
            uri={photo.uri}
            trigger={
              <Image
                alt="preview"
                className="rounded-full"
                src={photo.uri}
                width={256}
                height={256}
              />
            }
          />
          <button className="btn-primary mt-4" onClick={advance}>
            Next
          </button>
        </div>
      )}

      {(showCamera || !!originalPhoto || !!photo) && (
        <button
          className="text-orange mt-4 flex items-center gap-2 text-lg font-semibold transition hover:text-peach"
          onClick={retakePhoto}
        >
          <ResetIcon className="h-6 w-6 fill-current" />
          {showCamera ? "Return" : "Retake"}
        </button>
      )}
    </>
  );
}

export default Photo;
