import { Request_Filter } from "generated/graphql";
import { type Hash, isAddress } from "viem";

const parseSearchId = (query: string): Hash | null => {
  if (isAddress(query, { strict: false })) return query.toLowerCase() as Hash;
  if (isAddress(`0x${query}`, { strict: false }))
    return `0x${query.toLowerCase()}` as Hash;
  return null;
};

export const getRequestSearchFilter = (search: string): Request_Filter => {
  const query = search.trim();
  if (!query) return {};

  const id = parseSearchId(query);
  if (id) return { or: [{ claimer: id }, { humanity_: { id } }] };

  return { claimer_: { name_contains_nocase: query } };
};
