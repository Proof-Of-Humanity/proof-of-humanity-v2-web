import Jimp from "jimp";
import { Area } from "react-easy-crop";
import { on } from "./events";
import { concatBuffers } from "./misc";

const exifRemoved = async (buffer: Uint8Array) => {
  const dv = new DataView(buffer.buffer);
  const formatTag = dv.getUint16(0);

  if (formatTag !== 0xffd8) {
    return buffer;
  }

  const pieces = [];
  let i = 0;
  let recess = 0;
  let offset = 2;
  let app1 = dv.getUint16(offset);
  offset += 2;

  while (offset < dv.byteLength) {
    if (app1 === 0xffda) break;
    if (app1 === 0xffe1) {
      pieces[i++] = { recess, offset: offset - 2 };
      recess = offset + dv.getUint16(offset);
    }
    offset += dv.getUint16(offset);
    app1 = dv.getUint16(offset);
    offset += 2;
  }

  return concatBuffers(
    ...pieces.map((v) => buffer.slice(v.recess, v.offset).buffer),
    buffer.slice(recess).buffer,
  );
};

const isGrayscale = async (image: Jimp) => {
  let red = 0;
  let green = 0;
  let blue = 0;

  image.scan(
    0,
    0,
    image.bitmap.width,
    image.bitmap.height,
    function (_x, _y, idx) {
      red += this.bitmap.data[idx + 0];
      green += this.bitmap.data[idx + 1];
      blue += this.bitmap.data[idx + 2];
    },
  );

  return red === green && green === blue;
};

export const sanitizeImage = async (buffer: Buffer) => {
  const image = await Jimp.read(buffer);
  const { bitmap } = image;

  if (await isGrayscale(image)) {
    throw new Error("Image is grayscale!");
  }

  const targetWidth = Math.min(bitmap.width, 1080);
  const targetHeight = Math.min(bitmap.height, 1080);

  const processed = await image
    .quality(95)
    .resize(targetWidth, targetHeight)
    .getBufferAsync(Jimp.MIME_JPEG);
  const cleaned = await exifRemoved(processed);

  return new Blob([new Uint8Array(cleaned)], { type: "image/jpeg" });
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
