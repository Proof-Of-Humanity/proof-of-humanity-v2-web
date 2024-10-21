import { useEffect, useMemo, useState } from 'react';
import { ContractAbi, WriteArgs, WriteFunctionName, Effects } from './types';
import { SupportedChainId } from 'config/chains';
import {
  UseContractWriteConfig,
  UsePrepareContractWriteConfig,
  WalletClient,
  useChainId,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from 'wagmi';
import abis from 'contracts/abis';
import useChainParam from 'hooks/useChainParam';
import { Contract, ContractName } from 'contracts';
import { Abi, ParseAbiParameter, toBytes, zeroAddress } from 'viem';

const defaultForInputs = (inputs: readonly ParseAbiParameter<string>[]) =>
  inputs.length
    ? inputs.map((inp) => {
        if (inp.type.endsWith('[]')) return [];
        if (inp.type === 'address') return zeroAddress;
        if (inp.type === 'bool') return false;
        if (inp.type === 'string') return '';
        if (inp.type.startsWith('uint')) return 0n;
        if (inp.type.startsWith('bytes')) return toBytes(0);
        if (inp.type.startsWith('int')) return 0n;
        throw new Error('Abi error');
      })
    : undefined;

export default function useWagmiWrite<C extends ContractName, F extends WriteFunctionName<C>>(
  contract: C,
  functionName: F,
  effects?: Effects,
) {
  const abiFragment = (abis[contract] as Abi).find(
    (item) => item.type === 'function' && item.name === functionName,
  );
  const [value, setValue] = useState(0n);
  const [args, setArgs] = useState(
    defaultForInputs((abiFragment as any).inputs) as WriteArgs<C, F>,
  );

  const [enabled, setEnabled] = useState(false);

  const chain = useChainParam();
  const defaultChainId = useChainId() as SupportedChainId;

  const { config: prepared, status: prepareStatus } = usePrepareContractWrite({
    address: Contract[contract][chain?.id || defaultChainId],
    abi: [abiFragment],
    functionName,
    chainId: chain?.id || defaultChainId,
    value,
    args,
    enabled,
  } as UsePrepareContractWriteConfig<ContractAbi<C>, F, SupportedChainId, WalletClient>);

  const { write, data, status } = useContractWrite(
    prepared as UseContractWriteConfig<ContractAbi<C>, F, 'prepared'>,
  );
  const { status: transactionStatus } = useWaitForTransaction({
    hash: data?.hash,
  });

  useEffect(() => {
    switch (prepareStatus) {
      case 'success':
        if (write && enabled) {
          effects?.onReady?.(write);
          setEnabled(false);
        }
        break;
      case 'error':
        effects?.onFail?.();
        setEnabled(false);
    }
  }, [prepareStatus, write, effects, enabled]);

  useEffect(() => {
    switch (status) {
      case 'error':
        effects?.onError?.();
        setEnabled(false);
    }
  }, [status, effects]);

  useEffect(() => {
    switch (transactionStatus) {
      case 'loading':
        effects?.onLoading?.();
        break;
      case 'success':
        effects?.onSuccess?.();
    }
  }, [transactionStatus, effects]);

  return useMemo(
    () =>
      [
        (params: { value?: bigint; args?: WriteArgs<C, F> } = {}) => {
          if (params.value) setValue(params.value);
          if (params.args) setArgs(params.args);
          setEnabled(true);
        },
        () => {
          write?.();
          setEnabled(false);
        },
        {
          prepare: prepareStatus,
          write: status,
          transaction: transactionStatus,
        },
      ] as const,
    [prepareStatus, status, transactionStatus, write],
  );
}
