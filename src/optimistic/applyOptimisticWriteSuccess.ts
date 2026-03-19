"use client";

import { getContractInfo } from "contracts";
import type { WriteSuccessContext } from "contracts/hooks/types";
import { decodeEventLog, type Address } from "viem";
import { RequestStatus } from "utils/status";
import type {
  ProfileOptimisticBase,
  ProfileOptimisticOverlay,
  RequestOptimisticBase,
  RequestOptimisticOverlay,
} from "./types";

export interface OptimisticApi {
  request?: {
    state: RequestOptimisticBase;
    applyPatch: (patch: RequestOptimisticOverlay) => void;
    address?: Address;
  };
  profile?: {
    state: ProfileOptimisticBase & {
      pendingRevocation?: boolean;
      pendingTransfer?: boolean;
      pendingUpdate?: boolean;
    };
    applyPatch: (patch: ProfileOptimisticOverlay) => void;
  };
}

const getChallengeDisputeId = (ctx: WriteSuccessContext) => {
  if (!ctx.receipt || ctx.contract !== "ProofOfHumanity") return undefined;

  const abi = getContractInfo("ProofOfHumanity", ctx.chainId).abi;

  for (const log of ctx.receipt.logs) {
    try {
      const decoded = decodeEventLog({
        abi,
        data: log.data,
        topics: log.topics,
      });
      if (decoded.eventName === "RequestChallenged") {
        return String((decoded.args as { disputeId?: bigint }).disputeId ?? "");
      }
    } catch {
      continue;
    }
  }

  return undefined;
};

export function applyOptimisticWriteSuccess(
  ctx: WriteSuccessContext,
  api: OptimisticApi,
) {
  const requestState = api.request?.state;
  const address = api.request?.address;

  switch (`${ctx.contract}:${ctx.functionName}`) {
    case "ProofOfHumanity:advanceState":
      if (!requestState || !api.request) return;
      api.request.applyPatch({
        status: "resolving",
        requestStatus: RequestStatus.PENDING_CLAIM,
      });
      return;

    case "ProofOfHumanity:executeRequest":
      if (!requestState || !api.request) return;
      api.request.applyPatch({
        status: "resolved",
        requestStatus: requestState.revocation
          ? RequestStatus.RESOLVED_REVOCATION
          : RequestStatus.RESOLVED_CLAIM,
      });
      return;

    case "ProofOfHumanity:withdrawRequest":
      if (!api.request) return;
      api.request.applyPatch({
        status: "withdrawn",
        requestStatus: RequestStatus.WITHDRAWN,
      });
      return;

    case "ProofOfHumanity:fundRequest":
      if (!requestState || !api.request) return;
      api.request.applyPatch({
        funded: requestState.funded + (ctx.value ?? 0n) > requestState.totalCost
          ? requestState.totalCost
          : requestState.funded + (ctx.value ?? 0n),
      });
      return;

    case "ProofOfHumanity:addVouch":
      if (!requestState || !api.request || !address) return;
      if (
        requestState.onChainVouches.some(
          (vouchAddress) => vouchAddress.toLowerCase() === address.toLowerCase(),
        )
      )
        return;
      api.request.applyPatch({
        onChainVouches: [...requestState.onChainVouches, address],
        validVouches: requestState.validVouches + 1,
      });
      return;

    case "ProofOfHumanity:removeVouch":
      if (!requestState || !api.request || !address) return;
      api.request.applyPatch({
        onChainVouches: requestState.onChainVouches.filter(
          (vouchAddress) => vouchAddress.toLowerCase() !== address.toLowerCase(),
        ),
        validVouches: Math.max(0, requestState.validVouches - 1),
      });
      return;

    case "ProofOfHumanity:submitEvidence":
      if (!api.request || !address) return;
      if (!ctx.args?.[2] || typeof ctx.args[2] !== "string") return;
      api.request.applyPatch({
        appendedEvidence: [
          {
            id: `optimistic-evidence-${ctx.txHash ?? Date.now()}`,
            uri: ctx.args[2],
            creationTime: Math.floor(Date.now() / 1000),
            submitter: address,
            pending: true,
          },
        ],
      });
      return;

    case "ProofOfHumanity:challengeRequest":
      if (!requestState || !api.request) return;
      api.request.applyPatch({
        status: "disputed",
        requestStatus: requestState.revocation
          ? RequestStatus.DISPUTED_REVOCATION
          : RequestStatus.DISPUTED_CLAIM,
        pendingChallenge: {
          disputeId: getChallengeDisputeId(ctx),
          createdAt: Date.now(),
        },
      });
      return;

    case "ProofOfHumanity:revokeHumanity":
      if (!api.profile) return;
      api.profile.applyPatch({ pendingRevocation: true });
      return;

    case "CrossChainProofOfHumanity:transferHumanity":
      if (!api.profile) return;
      api.profile.applyPatch({ pendingTransfer: true });
      return;

    case "CrossChainProofOfHumanity:updateHumanity":
    case "EthereumAMBBridge:executeSignatures":
      if (!api.profile) return;
      api.profile.applyPatch({ pendingUpdate: true });
      return;

    case "ProofOfHumanity:claimHumanity":
    case "ProofOfHumanity:renewHumanity":
    case "ProofOfHumanity:fundAppeal":
      return;

    default:
      return;
  }
}
