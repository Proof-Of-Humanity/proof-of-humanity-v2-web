import { isAddress } from "viem";

export function shortenAddress(address: `0x${string}`, chars = 4): string {
  if (!isAddress(address))
    throw Error(`Invalid 'address' parameter '${address}'.`);

  return `${address.substring(0, chars)}..${address.substring(42 - chars)}`;
}
