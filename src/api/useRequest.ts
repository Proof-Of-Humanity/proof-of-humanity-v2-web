import useSWR from "swr";
import { queryFetchSingle } from ".";

export const useRequest = (chainId?: number, id?: string) => {
  console.log({ chainId, id });
  const { data } = useSWR(
    ["Request", chainId, id],
    async (_, chain: number, request: string) =>
      (await queryFetchSingle(chain, "Request", request))?.request,
    { revalidateOnFocus: true }
  );

  return data;
};
