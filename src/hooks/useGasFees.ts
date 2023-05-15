import { Web3ErrorCode } from "enums/Web3ErrorCode";
import { BigNumber } from "ethers";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { ProofOfHumanity } from "generated/contracts";
import { useProofOfHumanity } from "./useContract";

export const useGasFees = <F extends keyof ProofOfHumanity>(
  method: F,
  params: Parameters<ProofOfHumanity[F]> | null
): [BigNumber | null, boolean] => {
  const poh = useProofOfHumanity();
  const [estimationError, setEstimationError] = useState(false);
  const { data, error } = useSWR(
    !estimationError && poh && params !== null
      ? [poh.address, method, ...params]
      : null,
    async () => poh && (await (poh.estimateGas[method] as any)(...params!))
  );

  useEffect(() => {
    if (
      !error ||
      !error.error ||
      error.error.code !== Web3ErrorCode.EXECUTION_REVERTED
    )
      return console.error(error);
    setEstimationError(true);
  }, [error]);

  return [data, estimationError];
};
