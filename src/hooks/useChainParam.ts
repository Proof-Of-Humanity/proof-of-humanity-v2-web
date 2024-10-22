import { paramToChain } from "config/chains";
import { useParams } from "next/navigation";

export default function useChainParam() {
  const params = useParams();
  return params.chain ? paramToChain(params.chain as string) : null;
}
