import { formatEther } from "ethers";
import ABC2048 from "./base2048/words";

export const shuffleArray = <T>(array: T[]): T[] => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

// A wrapper for "JSON.parse()"" to support "undefined" value
export const parseJSON = <T>(value: string | null): T | undefined => {
  try {
    return value === "undefined" ? undefined : JSON.parse(value ?? "");
  } catch {
    console.log("parsing error on", { value });
    return undefined;
  }
};

export const concatenateBuffers = (...buffers: ArrayBufferLike[]) => {
  const totalByteLength = buffers.reduce((sum, bf) => sum + bf.byteLength, 0);
  const temporary = new Uint8Array(totalByteLength);

  let offset = 0;
  buffers.forEach((bf) => {
    temporary.set(new Uint8Array(bf), offset);
    offset += bf.byteLength;
  });

  return temporary;
};

export const base64ToUint8Array = (base64: string) => {
  const binaryString = atob(base64);
  return new Uint8Array(binaryString.length).map((_, i) =>
    binaryString.charCodeAt(i)
  );
};

const characters =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export const randomString = (length: number) =>
  [...Array(length)].reduce(
    (acc) =>
      acc + characters.charAt(Math.floor(Math.random() * characters.length)),
    ""
  );

export const formatEth = (wei: bigint, precision: number = 4) =>
  +parseFloat(formatEther(wei)).toFixed(precision);

const genBase2048 = () => {
  const ALPHABET_MAP = {};
  const LEADER = ABC2048[0];

  // pre-compute lookup table
  for (let z = 0; z < ABC2048.length; z++) {
    const x = ABC2048[z];

    if (ALPHABET_MAP[x] !== undefined) throw new TypeError(x + " is ambiguous");
    ALPHABET_MAP[x] = z;
  }

  function encode(source: any) {
    if (source.length === 0) return "";

    const digits = [0];
    for (let i = 0; i < source.length; ++i) {
      let carry = source[i];
      for (let j = 0; j < digits.length; ++j) {
        carry += digits[j] << 8;
        digits[j] = carry % 2048;
        carry = (carry / 2048) | 0;
      }

      while (carry > 0) {
        digits.push(carry % 2048);
        carry = (carry / 2048) | 0;
      }
    }

    const letters = [];

    // deal with leading zeros
    for (let k = 0; source[k] === 0 && k < source.length - 1; ++k)
      letters.push(ABC2048[0]);
    // convert digits to a string
    for (let q = digits.length - 1; q >= 0; --q)
      letters.push(ABC2048[digits[q]]);

    if (ABC2048 instanceof Array) {
      return letters.join(" ");
    } else {
      return letters.join("");
    }
  }

  function decodeUnsafe(s: string) {
    if (s.length === 0) return Buffer.allocUnsafe(0);

    const letters = ABC2048 instanceof Array ? s.split(" ") : s;

    const bytes = [0];
    for (let i = 0; i < letters.length; i++) {
      const value = ALPHABET_MAP[letters[i]];
      if (value === undefined) return;

      let carry = value;
      for (let j = 0; j < bytes.length; ++j) {
        carry += bytes[j] * 2048;
        bytes[j] = carry & 0xff;
        carry >>= 8;
      }

      while (carry > 0) {
        bytes.push(carry & 0xff);
        carry >>= 8;
      }
    }

    // deal with leading zeros
    for (let k = 0; letters[k] === LEADER && k < letters.length - 1; ++k) {
      bytes.push(0);
    }

    return Buffer.from(bytes.reverse());
  }

  function decode(s: string) {
    const buffer = decodeUnsafe(s);
    if (buffer) return buffer;
    throw new Error("Non-base" + 2048 + " character");
  }

  return { encode, decodeUnsafe, decode };
};

export const base2048 = genBase2048();

export const bufferFrom = (
  value: string | ArrayBuffer,
  {
    encoding,
    offset,
    length,
  }: { encoding: BufferEncoding; offset: number; length?: number } = {
    encoding: "utf8",
    offset: 0,
  }
) => {
  if (Object.prototype.toString.call(value).slice(8, -1) === "ArrayBuffer") {
    offset >>>= 0;
    const maxLength = (value as ArrayBuffer).byteLength - offset;
    if (maxLength < 0) throw new RangeError("'offset' is out of bounds");
    if (length === undefined) {
      length = maxLength;
    } else {
      length >>>= 0;
      if (length > maxLength) throw new RangeError("'length' is out of bounds");
    }
    return Buffer.from((value as ArrayBuffer).slice(offset, offset + length));
  }

  return typeof value === "string"
    ? Buffer.from(value, encoding)
    : Buffer.from(value);
};

export function romanize(n: number): string {
  if (n < 1) return "";
  if (n >= 40) return `XL${romanize(n - 40)}`;
  if (n >= 10) return `X${romanize(n - 10)}`;
  if (n >= 9) return `IX${romanize(n - 9)}`;
  if (n >= 5) return `V${romanize(n - 5)}`;
  if (n >= 4) return `IV${romanize(n - 4)}`;
  if (n >= 1) return `I${romanize(n - 1)}`;
  return "";
}
