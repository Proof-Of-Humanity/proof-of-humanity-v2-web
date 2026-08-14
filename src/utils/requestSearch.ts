import type { Request_Filter } from "generated/graphql";

const walletAddressRegex = /^0x[0-9a-f]{40}$/i;
const humanityIdRegex = /^[0-9a-f]{40}$/i;

export const getRequestSearchFilter = (search: string): Request_Filter => {
  const query = search.trim();
  if (!query) return {};

  if (walletAddressRegex.test(query)) return { claimer: query.toLowerCase() };

  if (humanityIdRegex.test(query))
    return { humanity_: { id: `0x${query.toLowerCase()}` } };

  return { claimer_: { name_contains_nocase: query } };
};
