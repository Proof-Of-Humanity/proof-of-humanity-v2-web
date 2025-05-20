import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAccount, useChainId, useConnect, useSwitchChain, injected } from 'wagmi';
import { useQuery } from '@tanstack/react-query'; 
import { SupportedChainId } from "config/chains";
import { ChainSet, configSetSelection } from "contracts";
import { gnosis, gnosisChiado } from "viem/chains";
import { getProcessedCirclesData, ProcessedCirclesData } from "data/circles"; 
import { toast } from "react-toastify";
import { isAddress } from "viem";
import usePOHCirclesWrite from "contracts/hooks/usePOHCirclesWrite";
import { useLoading } from "hooks/useLoading";

type CirclesDataQueryKey = ['circlesData', string];

export default function useCirclesIntegration() {
  const { address, isConnected } = useAccount();
  const connectedChainId = useChainId() as SupportedChainId;
  const { switchChain } = useSwitchChain();
  const { connect } = useConnect();

  const [currentCreateAccountStep, setCurrentCreateAccountStep] = useState(0);
  const [currentMintStep, setCurrentMintStep] = useState(0);
  
  const [walletAddress, setWalletAddress] = useState(""); 
  const [disableButton, setDisableButton] = useState(false); 
  
  const loading = useLoading(false, "Transaction pending");
  const [pending] = loading.use();
  
  const circlesChain  = configSetSelection.chainSet === ChainSet.MAINNETS ? gnosis : gnosisChiado;

  const {
    data: circlesAccountInfo,
    isFetching: isLoadingCirclesData,
    isSuccess: isCirclesDataSuccess, 
    isError: isCirclesDataQueryError, 
    refetch: refetchCirclesData
  } = useQuery<ProcessedCirclesData, Error, ProcessedCirclesData, CirclesDataQueryKey>({
    queryKey: ['circlesData', address] as CirclesDataQueryKey,
    queryFn: ({queryKey}) => getProcessedCirclesData(queryKey[1] as string),
    enabled: !!address && isConnected,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  useEffect(() => {
    if (isCirclesDataSuccess && circlesAccountInfo?.walletAddress) {
      setWalletAddress(circlesAccountInfo.walletAddress);
    }
  }, [isCirclesDataSuccess, circlesAccountInfo]);

  useEffect(() => {
    if (isCirclesDataQueryError) {
      toast.error(`Failed to load Circles Account Info`);
    }
  }, [isCirclesDataQueryError]);

  const linkStatus = circlesAccountInfo?.linkStatus || "idle";
  const humanityStatus = circlesAccountInfo?.humanityStatus || "checking";
  const currentHumanityId = circlesAccountInfo?.humanityId || ""; 

  const isWalletAddressValid = useMemo(() => isAddress(walletAddress.trim()), [walletAddress]); 
  
  const [writeLink] = usePOHCirclesWrite(
    "register", 
    useMemo(() =>
      ({
      onReady: (fire) => {
        fire();
        toast.info("Transaction pending");
      },
      onSuccess: () => {
        loading.stop();
        setDisableButton(true);
        refetchCirclesData();
        toast.success("Successfully linked Circles account!");
      },
      onFail: () => {
        loading.stop();
        toast.error("Failed to link account");
      },
      onError: () => {
        loading.stop();
        toast.error("Failed to link account");
      }
    }), [loading, refetchCirclesData])
  );

  const [writeRenew] = usePOHCirclesWrite(
    "renewTrust", 
    useMemo(() => ({
      onReady(fire) {
        fire();
        toast.info("Transaction pending");
      },
      onSuccess: () => {
        loading.stop();
        setDisableButton(true);
        refetchCirclesData();
        toast.success("Successfully renewed trust!");
      },
      onFail: () => {
        loading.stop();
        toast.error("Failed to renew trust");
      },
      onError: () => {
        loading.stop();
        toast.error("Failed to renew trust");
      }
    }), [loading,refetchCirclesData])
  );

  const handleLinkAccount = useCallback(async () => {
    if (!isWalletAddressValid) { 
      toast.error("Please enter a valid wallet address");
      return;
    }
    loading.start();
    writeLink({
      args: [currentHumanityId, walletAddress.trim()], 
    });
  }, [isWalletAddressValid,loading,currentHumanityId]); 

  const handleRenewTrust = useCallback(async () => {
    if (!isWalletAddressValid) { 
      toast.error("No linked Circles account address found to renew.");
      return;
    }
    loading.start();
    writeRenew({
      args: [currentHumanityId], 
    });
  }, [currentHumanityId, isWalletAddressValid, loading, writeRenew]); 

  const getActionButtonProps = useCallback((action: () => Promise<void> | void, defaultLabel: string) => {
    if (pending) {
      return { onClick: () => {}, label: defaultLabel, disabled: true };
    }
    if (!isConnected) {
      return { 
        onClick: () => {
          connect({ connector: injected() })
        }, 
        label: 'Connect Wallet',
        disabled: false 
      };
    }
    const isWrongChain = connectedChainId !== circlesChain.id;
    if (isWrongChain) {
      return { 
        onClick: () => {
          switchChain({ chainId: circlesChain.id })
        }, 
        label: `Switch to ${circlesChain.name} to ${defaultLabel}`,
        disabled: false 
      };
    }
    let disabled = disableButton || !isWalletAddressValid; 
    if (humanityStatus === "invalid") {
      return { 
        onClick: () => toast.error("No valid humanity linked to current address"), 
        label: defaultLabel,
        disabled: disabled 
      };
    }

    return { onClick: action, label: defaultLabel, disabled };
  }, [pending, isConnected, connectedChainId, circlesChain, disableButton, isWalletAddressValid, humanityStatus]);

  useEffect(() => {
    if (!isConnected || !address) {
        setWalletAddress(""); 
    }
    setDisableButton(false); 
  }, [isConnected, address]); 

  return {
    walletAddress, 
    linkStatus,
    humanityStatus,
    isCirclesDataQueryError,
    currentCreateAccountStep,
    currentMintStep,
    isWalletAddressValid,
    pending, 
    isLoadingCirclesData, 
    humanityId: currentHumanityId, 
    
    setWalletAddress, 
    setCurrentCreateAccountStep,
    setCurrentMintStep,
    handleLinkAccount,
    handleRenewTrust,
    getActionButtonProps,
  };
}