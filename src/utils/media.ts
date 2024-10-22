import { FFmpeg, createFFmpeg } from "@ffmpeg/ffmpeg";
import Jimp from "jimp";
import { Area } from "react-easy-crop";
import { on } from "./events";
import { concatBuffers, randomString } from "./misc";
import UAParser from "ua-parser-js";

const parser = new UAParser(navigator.userAgent);
export const USER_AGENT = parser.getResult();

const device = parser.getDevice();
export const IS_MOBILE = device.type === "mobile" || device.type === "tablet";

export const OS = parser.getOS();
export const IS_IOS = OS.name === "iOS";
export const IS_ANDROID = OS.name === "Android";

const exifRemoved = async (buffer: Uint8Array) => {
  const dv = new DataView(buffer.buffer);
  const formatTag = dv.getUint16(0);

  if (formatTag !== 0xffd8) return buffer;

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
    ...pieces.map((v) => buffer.slice(v.recess, v.offset)),
    buffer.slice(recess),
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

  if (await isGrayscale(image)) throw new Error("Image is grayscale!");

  return new Blob(
    [
      await exifRemoved(
        await image
          .quality(95)
          .resize(Math.min(bitmap.width, 1080), Math.min(bitmap.height, 1080))
          .getBufferAsync(Jimp.MIME_JPEG),
      ),
    ],
    { type: "image/jpeg" },
  );
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

  // croppedAreaPixels values are bounding box relative
  // extract the cropped image using these values
  const data = context.getImageData(
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
  );

  // set canvas width to final desired crop size - this will clear existing context
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // paste generated rotate image at the top left corner
  context.putImageData(data, 0, 0);

  // As Base64 string
  return canvas.toDataURL("image/jpeg");
};

let ffmpeg: FFmpeg;

export const loadFFMPEG = async () => {
  if (ffmpeg && ffmpeg.isLoaded()) return;
  ffmpeg = createFFmpeg({ log: false, corePath: "/dist/ffmpeg-core.js" });
  await ffmpeg.load();
};

export const videoSanitizer = async (
  inputBuffer: ArrayBufferLike,
  // callback?: (progress: number) => void,
  // duration?: number
) => {
  try {
    await loadFFMPEG();

    // ffmpeg.setProgress((progress) => {
    // if (progress.time === undefined) return;
    // callback(progress.time / duration);
    // });

    const inputName = randomString(16);
    const outputFilename = `${randomString(16)}.mp4`;

    ffmpeg.FS("writeFile", inputName, new Uint8Array(inputBuffer));

    await ffmpeg.run(
      "-i",
      inputName,
      "-map_metadata",
      "-1",
      "-c:v",
      "libx264",
      "-c:a",
      "copy",
      "-crf",
      "26",
      "-preset",
      "superfast",
      // "-vf",
      // "mpdecimate",
      outputFilename,
    );

    return ffmpeg.FS("readFile", outputFilename);
  } catch (err) {
    console.error(err);
    return inputBuffer;
  }
};

// const options = [
//   "-i",
//   inputName,
//   "-map_metadata",
//   -1,
//   "-c:v",
//   "libx264",
//   "-c:a",
//   "copy",
//   "-crf",
//   "26",
//   "-preset",
//   "superfast",
//   "-vf",
//   "mpdecimate",
//   // ...(mirrored ? ["-vf", "mirror"] : []),
//   outputFilename,
// ];
