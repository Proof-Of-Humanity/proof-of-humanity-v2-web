import { AddressZero } from "@ethersproject/constants";
import { useCallback, useEffect, useState } from "react";
import useSWR from "swr";
import { VDB_CHAIN } from "constants/chains";
import { ProofOfHumanity } from "generated/contracts";
import { RequestQuery } from "generated/graphql";
import { useProofOfHumanity } from "hooks/useContract";
import { VDBVouch } from "types/vouchdb";
import { shuffleArray } from "utils/misc";
import { useRequest } from "./useRequest";
import useVouchDB from "./useVouchDB";

type OnChainVouchInterface = ArrayElement<
  NonNullable<RequestQuery["request"]>["claimer"]["vouchesReceived"]
>;

/* 
    - Not self-vouch
    - Voucher has valid humanity
    - Voucher is not vouching
    - If signature - it has not expired
*/

const filterOnChainVouches = (
  vouches: OnChainVouchInterface[],
  count: number
) => {
  const vouchCalls: Array<string> = [];
  for (const vouch of shuffleArray(vouches)) {
    if (vouchCalls.length >= count) break;

    const { vouching, expirationTime } = vouch.from.humanity!;
    if (vouching || parseInt(expirationTime) < Date.now() / 1000) continue;

    vouchCalls.push(vouch.from.id);
  }
  return vouchCalls;
};

const filterOffChainVouches = async (
  vouches: VDBVouch[],
  count: number,
  poh: ProofOfHumanity
) => {
  const vouchCalls: Array<ProofOfHumanity.SignatureVouchStruct> = [];
  const offCVsHumanities = await Promise.all(
    vouches.map((vouch) => poh.humanityOf(vouch.voucher))
  );
  const offCVsHumanitiesInfo = await Promise.all(
    offCVsHumanities.map((humanity) =>
      humanity && humanity !== AddressZero
        ? poh.getHumanityInfo(humanity)
        : null
    )
  );

  for (let i = 0; i < vouches.length; i++) {
    if (vouchCalls.length >= count) break;

    const vouch = vouches[i];
    const vHumanityInfo = offCVsHumanitiesInfo[i];

    if (
      vouch.expiration < Date.now() / 1000 ||
      !vHumanityInfo ||
      vHumanityInfo.vouching ||
      vHumanityInfo.owner !== vouch.voucher ||
      vHumanityInfo.expirationTime < Date.now() / 1000
    )
      continue;

    const sig = vouch.signature.substring(2);
    vouchCalls.push({
      expirationTime: vouch.expiration,
      v: parseInt(sig.substring(128, 130), 16),
      r: "0x" + sig.substring(0, 64),
      s: "0x" + sig.substring(64, 128),
    });
  }

  return vouchCalls;
};

export const useVouches = (chainId?: number, requestId?: string) => {
  const { getRequestVouches } = useVouchDB();
  const request = useRequest(chainId, requestId);
  const poh = useProofOfHumanity();

  const [onChain, setOnChain] = useState<OnChainVouchInterface[]>([]);
  const [offChain, setOffChain] = useState<VDBVouch[]>([]);

  const { data, isValidating } = useSWR(
    chainId === VDB_CHAIN && request ? ["Vouches", requestId] : null,
    async () =>
      request &&
      (await getRequestVouches(request.claimer.id, request.humanity.id))
  );

  useEffect(() => {
    if (!request) return;

    const onCVs = request.claimer.vouchesReceived.filter(
      ({ from, humanity }) =>
        from.id !== request.claimer.id && humanity.id !== request.humanity.id
    );

    setOnChain(onCVs);
    setOffChain(
      data?.filter(
        ({ expiration, voucher }) =>
          expiration > Date.now() / 1000 &&
          !onCVs.find((onCV) => voucher === onCV.from.id)
      ) ?? []
    );
  }, [request, isValidating]);

  const getRequestValidVouches = useCallback(
    async (count: number) => {
      if (!poh) return { onChain: [], offChain: [] };

      const onChainVouchCalls = filterOnChainVouches(onChain, count);
      const neededCount = onChainVouchCalls.length - count;
      const offChainVouchCalls = neededCount
        ? await filterOffChainVouches(offChain, neededCount, poh)
        : [];

      return { onChain: onChainVouchCalls, offChain: offChainVouchCalls };
    },
    [onChain, offChain]
  );

  const getValidAdvanceCall = useCallback(async () => {}, []);

  return {
    totalCount: onChain.length + offChain.length,
    getRequestValidVouches,
    getValidAdvanceCall,
  };
};
