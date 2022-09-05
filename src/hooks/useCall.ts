import { Contract } from "ethers";
import useSWR, { SWRResponse } from "swr";

type AsyncReturnType<T> = T extends (...args: any) => Promise<infer U>
  ? U
  : any;

const call =
  <C extends Contract, F extends keyof C["callStatic"]>(contract: C) =>
  async (_: string, method: F, ...params: Parameters<C[F]>) =>
    await (contract[method](...params) as AsyncReturnType<C[F]>);

const useCall = <C extends Contract, F extends keyof C["callStatic"]>(
  contract: C | null,
  method: F,
  params: Parameters<C[F]> | null
): [AsyncReturnType<C[F]> | undefined, Omit<SWRResponse, "data">] => {
  const { data, isValidating, mutate, error } = useSWR(
    contract && params !== null ? [contract.address, method, ...params] : null,
    call<C, F>(contract!)
  );

  return [data, { isValidating, mutate, error }];
};

export default useCall;
