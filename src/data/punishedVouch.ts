import { idToChain, type SupportedChainId } from "config/chains";
import { prettifyId } from "utils/identifier";

type PunishedVouchFields = {
  punishedVouchSourceRequest?: {
    humanity: {
      id: string;
    };
    index: string | number;
  } | null;
  punishedVouchReason?: {
    id: string;
  } | null;
  punishedVouchTimestamp?: string | number | null;
};

export type PunishedVouchInfo = {
  reason: string;
  sourceHumanityId: `0x${string}`;
  sourceRequestIndex: string | number;
  sourceRequestHref: string;
  timestamp?: string | number | null;
};

const reasonLabels: Record<string, string> = {
  sybilAttack: "Sybil Attack",
  identityTheft: "Identity Theft",
};

export const getPunishedVouchInfo = (
  request: unknown,
  chainId: SupportedChainId,
): PunishedVouchInfo | null => {
  const punishedRequest = request as PunishedVouchFields;
  const sourceRequest = punishedRequest.punishedVouchSourceRequest;
  const sourceHumanityId = sourceRequest?.humanity.id as
    | `0x${string}`
    | undefined;
  const chain = idToChain(chainId);

  if (!sourceRequest || !sourceHumanityId || !chain) return null;

  const reasonId = punishedRequest.punishedVouchReason?.id || "";

  return {
    reason: reasonLabels[reasonId] || reasonId || "policy violation",
    sourceHumanityId,
    sourceRequestIndex: sourceRequest.index,
    sourceRequestHref: `/${prettifyId(sourceHumanityId)}/${chain.name.toLowerCase()}/${
      sourceRequest.index
    }`,
    timestamp: punishedRequest.punishedVouchTimestamp,
  };
};
