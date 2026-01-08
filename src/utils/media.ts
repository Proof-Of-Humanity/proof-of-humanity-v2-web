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

  // Create a new Uint8Array with explicit ArrayBuffer to satisfy TypeScript
  const cleanedArray = new Uint8Array(cleaned);
  const blob = new Blob([cleanedArray], { type: "image/jpeg" });

  return blob;
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
  if (typeof SharedArrayBuffer === 'undefined') {
    throw new Error(
      "Video processing is not available. Please refresh the page (Cmd+R or Ctrl+R) and try again."
    );
  }
  
  if (ffmpeg && ffmpeg.isLoaded()) return;
  
  ffmpeg = createFFmpeg({ 
    log: true,
    corePath: "/ffmpeg/ffmpeg-core.js" 
  });
  
  try {
    await ffmpeg.load();
  } catch (err) {
    console.error("❌ [FFmpeg] Failed to load:", err);
    throw err;
  }
};

const readAscii = (buffer: Uint8Array, start: number, length: number) =>
  String.fromCharCode(...buffer.slice(start, start + length));

/**
 * Best-effort container detection by signature ("magic bytes").
 *
 * - WebM: EBML header starts with 0x1A45DFA3 at byte 0
 * - AVI: RIFF....AVI  (bytes 0-3 "RIFF", bytes 8-11 "AVI ")
 * - MP4/MOV: ISO-BMFF where bytes 4-7 are "ftyp", and bytes 8-11 are the major brand
 *
 */
export const detectVideoFormat = (buffer: Uint8Array): "mp4" | "mov" | "webm" | "avi" => {
  if (buffer.length < 12) {
    return "mp4";
  }

  // WebM / Matroska (EBML)
  if (buffer[0] === 0x1a && buffer[1] === 0x45 && buffer[2] === 0xdf && buffer[3] === 0xa3) {
    return "webm";
  }

  // AVI (RIFF container with "AVI " form type)
  const riffCheck = readAscii(buffer, 0, 4);
  const aviCheck = readAscii(buffer, 8, 4);
  if (riffCheck === "RIFF" && aviCheck === "AVI ") {
    return "avi";
  }

  // MP4 / MOV (ISO Base Media File Format)
  // Typical: [size:4][type:"ftyp":4][major_brand:4]...
  const ftypCheck = readAscii(buffer, 4, 4);
  if (ftypCheck === "ftyp") {
    const majorBrand = readAscii(buffer, 8, 4);
    
    // QuickTime brand indicates .mov container
    if (majorBrand === "qt  ") {
      return "mov";
    }
    return "mp4";
  }

  // Default to mp4 as the most common/expected for this app.
  return "mp4";
};

export const getVideoMimeType = (format: string): string => {
  switch (format) {
    case "webm":
      return "video/webm";
    case "avi":
      return "video/x-msvideo";
    case "mov":
      return "video/quicktime";
    case "mp4":
    default:
      return "video/mp4";
  }
};

const getVideoCodecForFormat = (format: string): { videoCodec: string; audioCodec: string } => {
  switch (format) {
    case "webm":
      return { videoCodec: "libvpx", audioCodec: "libvorbis" };
    case "avi":
      return { videoCodec: "mpeg4", audioCodec: "mp3" };
    case "mov":
    case "mp4":
    default:
      return { videoCodec: "libx264", audioCodec: "aac" };
  }
};

export const videoSanitizer = async (
  inputBuffer: ArrayBufferLike,
  maxSizeBytes?: number,
) => {
  try {
    await loadFFMPEG();

    const inputArray = new Uint8Array(inputBuffer);
    const inputFormat = detectVideoFormat(inputArray);
    const inputName = `${randomString(16)}.${inputFormat}`;
    const outputFilename = `${randomString(16)}.${inputFormat}`;

    ffmpeg.FS("writeFile", inputName, inputArray);

    const shouldCompress = maxSizeBytes && inputBuffer.byteLength > maxSizeBytes;
    
    let ffmpegArgs: string[];

    let duration = 0;
    ffmpeg.setLogger(({ type, message }) => {
      const match = message.match(/Duration: (\d+):(\d+):(\d+.\d+)/);
      if (match) {
        duration =
          parseInt(match[1]) * 3600 +
          parseInt(match[2]) * 60 +
          parseFloat(match[3]);
      }
    });

    if (shouldCompress) {
      // Probe for duration
      try {
        await ffmpeg.run("-i", inputName);
      } catch (e) {
        // Expected error due to missing output file
      }

      const { videoCodec, audioCodec } = getVideoCodecForFormat(inputFormat);

      if (duration > 0) {
        const originalSizeBytes = inputBuffer.byteLength;
        const originalBitrate = (originalSizeBytes * 8) / duration;
        const targetBitrate = Math.floor(originalBitrate * 0.7);

        ffmpegArgs = [
          "-i",
          inputName,
          "-map_metadata",
          "-1",
          "-c:v",
          videoCodec,
          "-b:v",
          `${targetBitrate}`,
          "-maxrate",
          `${targetBitrate}`,
          "-bufsize",
          `${targetBitrate * 2}`,
          "-c:a",
          audioCodec === "copy" ? "aac" : audioCodec,
        ];

        if (inputFormat === "mp4" || inputFormat === "mov") {
           ffmpegArgs.push("-b:a", "96k");
        }
        
        ffmpegArgs.push("-preset", "fast");

      } else {
        ffmpegArgs = [
          "-i",
          inputName,
          "-map_metadata",
          "-1",
          "-c:v",
          videoCodec,
          "-c:a",
          audioCodec,
          "-crf",
          "24",
          "-preset",
          "fast",
        ];
      }
      
      // WebM-specific speed optimizations
      if (inputFormat === "webm") {
        ffmpegArgs.push("-cpu-used", "8");  // Max speed (0=slow/best, 8=fast/worst)
        ffmpegArgs.push("-deadline", "realtime");  // Realtime encoding (fastest)
        ffmpegArgs.push("-threads", "4");  // Use multiple threads
      }
    } else {
      ffmpegArgs = [
        "-i",
        inputName,
        "-map_metadata",
        "-1",
        "-c",
        "copy",
      ];
    }

    if (inputFormat === "mp4" || inputFormat === "mov") {
      ffmpegArgs.push("-movflags", "+faststart");
    }

    ffmpegArgs.push(outputFilename);

    try {
      await ffmpeg.run(...ffmpegArgs);
    } catch (err) {
      console.error("❌ [FFmpeg] Processing failed:", err);
      throw err;
    }

    const outputData = ffmpeg.FS("readFile", outputFilename);
    
    console.log(`[Video Sanitizer] Size: ${inputBuffer.byteLength} -> ${outputData.byteLength}`);

    try {
      ffmpeg.FS("unlink", inputName);
      ffmpeg.FS("unlink", outputFilename);
    } catch (cleanupErr) {
      // ignore
    }

    return outputData;
  } catch (err) {
    console.error("❌ [Video Sanitizer] Error during processing:", err);
    return inputBuffer;
  }
};

export const compressVideoIfNeeded = async (
  file: File | Blob,
  maxSizeBytes: number,
): Promise<Blob> => {
  if (file.size <= maxSizeBytes) {
    return file;
  }

  const buffer = await file.arrayBuffer();
  const compressed = await videoSanitizer(buffer, maxSizeBytes);
  const compressedArray = new Uint8Array(compressed as ArrayBuffer);
  const format = detectVideoFormat(compressedArray);
  const mimeType = getVideoMimeType(format);

  const blob = new Blob([compressedArray], { type: mimeType });
  
  return blob;
};
