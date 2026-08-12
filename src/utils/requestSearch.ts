import { Request_Filter } from "generated/graphql";
import { Hash } from "viem";
import { machinifyId } from "./identifier";

const HEX_ID_RE = /^(0x)?[0-9a-fA-F]{40}$/;

export const parseSearchHexId = (search: string): Hash | null => {
  const trimmed = search.trim();
  if (!HEX_ID_RE.test(trimmed)) return null;
  return machinifyId(trimmed.replace(/^0x/i, ""));
};

export const getRequestSearchFilter = (search: string): Request_Filter => {
  const query = search.trim();
  if (!query) return {};

  const hexId = parseSearchHexId(query);
  if (hexId) {
    return {
      or: [{ claimer: hexId }, { humanity_: { id: hexId } }],
    };
  }

  return { claimer_: { name_contains_nocase: query } };
};
