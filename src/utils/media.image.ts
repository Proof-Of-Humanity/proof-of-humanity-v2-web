import { Area } from "react-easy-crop";
import { on } from "./events";

const MAX_IMAGE_SIDE = 1080;
const SANITIZE_JPEG_QUALITY = 0.95;

const blobToImage = (blob: Blob): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const image = new Image();
    const done = (cb: () => void) => {
      URL.revokeObjectURL(url);
      cb();
    };
    on(image, "load", () => done(() => resolve(image)));
    on(image, "error", (error) => done(() => reject(error)));
    image.src = url;
  });

const drawToCanvas = (
  image: HTMLImageElement,
  width: number,
  height: number,
): HTMLCanvasElement => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");
  ctx.drawImage(image, 0, 0, width, height);
  return canvas;
};

const canvasIsGrayscale = (canvas: HTMLCanvasElement): boolean => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return false;
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let red = 0;
  let green = 0;
  let blue = 0;
  for (let i = 0; i < data.length; i += 4) {
    red += data[i] ?? 0;
    green += data[i + 1] ?? 0;
    blue += data[i + 2] ?? 0;
  }
  return red === green && green === blue;
};

const canvasToBlob = (
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("toBlob returned null")),
      "image/jpeg",
      quality,
    );
  });

export const sanitizeImage = async (
  input: Blob | ArrayBufferLike | Uint8Array,
): Promise<Blob> => {
  const toBlob = (bytes: Uint8Array): Blob => {
    const copy = new Uint8Array(bytes.byteLength);
    copy.set(bytes);
    return new Blob([copy.buffer]);
  };

  const blob =
    input instanceof Blob
      ? input
      : input instanceof Uint8Array
        ? toBlob(input)
        : toBlob(new Uint8Array(input));

  const image = await blobToImage(blob);

  const scale = Math.min(
    1,
    MAX_IMAGE_SIDE / image.naturalWidth,
    MAX_IMAGE_SIDE / image.naturalHeight,
  );
  const targetWidth = Math.max(1, Math.round(image.naturalWidth * scale));
  const targetHeight = Math.max(1, Math.round(image.naturalHeight * scale));

  // Sample the full image once to detect grayscale, then re-draw at target size.
  // (Re-encoding through canvas implicitly strips EXIF.)
  const probe = drawToCanvas(image, image.naturalWidth, image.naturalHeight);
  if (canvasIsGrayscale(probe)) {
    throw new Error("Image is grayscale!");
  }

  const output = drawToCanvas(image, targetWidth, targetHeight);
  return canvasToBlob(output, SANITIZE_JPEG_QUALITY);
};

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    on(image, "load", () => resolve(image));
    on(image, "error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

export const getCroppedPhoto = async (
  photoUri: string,
  pixelCrop: Area,
  flip = { horizontal: false, vertical: false },
) => {
  const image = await createImage(photoUri);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) return null;

  canvas.width = image.width;
  canvas.height = image.height;

  context.translate(image.width / 2, image.height / 2);
  context.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
  context.translate(-image.width / 2, -image.height / 2);
  context.drawImage(image, 0, 0);

  const data = context.getImageData(
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
  );

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  context.putImageData(data, 0, 0);

  return canvas.toDataURL("image/jpeg");
};
