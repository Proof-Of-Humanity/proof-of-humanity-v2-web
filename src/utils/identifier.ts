import { Hash, toBytes, zeroAddress } from "viem";
// import baseX from "base-x";

// const BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
// const base58 = baseX(BASE58);

export const prettifyId = (id: Hash) => id?.slice(2).toUpperCase();
// base58.encode(hexToBytes(id));

export const machinifyId = (s: string) => {
  const id = `0x${zeroAddress.concat(s.toLowerCase()).slice(-40)}` as Hash;
  // const id = `0x${base58.decode(s)}` as Hash;
  try {
    toBytes(BigInt(id), { size: 20 });
    return id;
  } catch (err) {
    console.error(`String ${s} can't be decoded`);
    return null;
  }
};
