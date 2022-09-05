import { BigNumber } from "ethers";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { Web3ErrorCode } from "constants/web3";
import { ProofOfHumanity } from "generated/contracts";
import useProofOfHumanity from "./useProofOfHumanity";

export const useGasFees = <F extends keyof ProofOfHumanity["callStatic"]>(
  method: F,
  params: Parameters<ProofOfHumanity[F]> | null
): [BigNumber | null, boolean] => {
  const poh = useProofOfHumanity(false);
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
      return;
    setEstimationError(true);
  }, [error]);

  return [data, estimationError];
};
