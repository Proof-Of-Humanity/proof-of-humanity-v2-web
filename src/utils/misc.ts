import { formatEther } from "viem";

export const base64ToUint8Array = (base64: string) => {
  const binaryString = atob(base64);
  return new Uint8Array(binaryString.length).map((_, i) =>
    binaryString.charCodeAt(i),
  );
};

const characters =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export const randomString = (length: number) =>
  [...Array(length)].reduce(
    (acc) =>
      acc + characters.charAt(Math.floor(Math.random() * characters.length)),
    "",
  );

export const formatEth = (wei: bigint, precision: number = 4) =>
  +parseFloat(formatEther(wei)).toFixed(precision);

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
