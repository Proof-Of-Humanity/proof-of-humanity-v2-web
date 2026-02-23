"use client";

import { ObservableObject } from "@legendapp/state";
import Checklist from "components/Checklist";
import Previewed from "components/Previewed";
import Uploader from "components/Uploader";
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
import { useRef, useState } from "react";
import Cropper from "react-easy-crop";
import type { Area, Point } from "react-easy-crop/types";
import { toast } from "react-toastify";
import ReactWebcam from "react-webcam";
import { getCroppedPhoto, sanitizeImage } from "utils/media";
import { base64ToUint8Array } from "utils/misc";
import { MediaState } from "./Form";

const MIN_DIMS = { width: 256, height: 256 }; // PXs
const MAX_SIZE = 3; // Megabytes
const MAX_SIZE_BYTES = 1024 * 1024 * MAX_SIZE; // Bytes
const ERROR_MSG = {
  dimensions: `Photo dimensions are too small. Minimum dimensions are ${MIN_DIMS.width}px by ${MIN_DIMS.height}px`,
  size: `Photo is oversized. Maximum allowed size is ${MAX_SIZE}mb`,
};

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
    buffer: Buffer;
  } | null>(null);

  const [showCamera, setShowCamera] = useState(false);
  const [camera, setCamera] = useState<ReactWebcam | null>(null);
  const [cropPixels, setCropPixels] = useState<Area | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [maxZoom, setMaxZoom] = useState(3);
  const [zoom, setZoom] = useState(1);

  const loading = useLoading();
  const [pending, loadingMessage] = loading.use();

  const onCrop = async () => {
    if (!cropPixels || !originalPhoto) return;
    if (
      cropPixels.width < MIN_DIMS.width ||
      cropPixels.height < MIN_DIMS.height
    ) {
      toast.error(ERROR_MSG.dimensions);
      return console.error("Dimensions error");
    }

    loading.start("Cropping photo");

    const cropped = await getCroppedPhoto(originalPhoto.uri, cropPixels);
    if (!cropped) return;

    try {
      const sanitized = await sanitizeImage(
        Buffer.from(base64ToUint8Array(cropped.split(",")[1])),
      );
      if (sanitized.size > MAX_SIZE_BYTES) {
        toast.error(ERROR_MSG.size);
        //return console.error("Size error");
      }

      photo$.set({ content: sanitized, uri: URL.createObjectURL(sanitized) });
    } catch (err: any) {
      toast.error(err.message);
    }

    loading.stop();
  };

  const takePhoto = async () => {
    setFullscreen(false);
    if (!camera) return;

    const screenshot = camera.getScreenshot();
    if (!screenshot) return;

    const buffer = Buffer.from(base64ToUint8Array(screenshot.split(",")[1]));
    setOriginalPhoto({
      uri: URL.createObjectURL(new Blob([buffer], { type: "buffer" })),
      buffer,
    });

    setShowCamera(false);
  };

  const retakePhoto = () => {
    setShowCamera(false);
    photo$.delete();
    setOriginalPhoto(null);
    setZoom(1);
    setCrop({ x: 0, y: 0 });
    setCropPixels(null);
    loading.stop();
  };

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

          {!showCamera && !originalPhoto && !photo && (
        <>
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
        </>
      )}

          <div className="mt-6 flex w-full flex-col items-center">
            <button
              className="gradient flex w-full max-w-xl items-center justify-center gap-3 rounded-full px-6 py-4 text-lg font-semibold text-white shadow-lg transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              onClick={() => setShowCamera(true)}
            >
              <CameraIcon className="h-6 w-6 fill-white" />
              <span>Take with Camera (Recommended)</span>
            </button>

            <span className="mt-2 text-sm font-semibold text-primaryText">
              OR
            </span>

            <Uploader
              className="mt-1 text-base font-semibold text-primary underline underline-offset-2 hover:text-orange focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-300"
              type="image"
              onDrop={async (received) => {
                const file = received[0];
                if (!file) return;
                setOriginalPhoto({
                  uri: URL.createObjectURL(new Blob([file], { type: file.type })),
                  buffer: Buffer.from(await file.arrayBuffer()),
                });
              }}
              disabled={!!originalPhoto}
            >
              <span>Upload photo</span>
            </Uploader>
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
              className="slider-thumb h-0.5 w-full appearance-none bg-slate-200"
              type="range"
              min={1}
              max={maxZoom}
              step={0.05}
              value={zoom}
              onChange={(event) => setZoom(parseFloat(event.target.value))}
            />
          </div>

          <div className="relative mb-2 h-96 w-full bg-slate-200">
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
                if (
                  croppedPixels.width < MIN_DIMS.width ||
                  croppedPixels.height < MIN_DIMS.height
                ) {
                  toast.error(ERROR_MSG.dimensions);
                  console.error("Size error");
                }
              }}
              onZoomChange={setZoom}
              onMediaLoaded={(media) => {
                setMaxZoom(
                  Math.floor(
                    Math.min(media.naturalWidth, media.naturalHeight) / 256,
                  ),
                );
              }}
            />
          </div>

          {pending ? (
            <button className="btn-main">
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
            <button className="btn-main" onClick={onCrop}>
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
          <button className="btn-main mt-4" onClick={advance}>
            Next
          </button>
        </div>
      )}

      {(showCamera || !!originalPhoto || !!photo) && (
        <button
          className="centered text-orange mt-4 text-lg font-semibold uppercase"
          onClick={retakePhoto}
        >
          <ResetIcon className="fill-orange mr-2 h-6 w-6" />
          {showCamera ? "Return" : "Retake"}
        </button>
      )}
    </>
  );
}

export default Photo;
