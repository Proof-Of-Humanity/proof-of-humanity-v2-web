import { useParams } from "next/navigation";
import { Hash, isHash } from "viem";

export default function useChainParam() {
  const params = useParams();

  if (!params.pohid || !isHash(params.pohid as string)) return null;

  return params.pohid as Hash;
}
