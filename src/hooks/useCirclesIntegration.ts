import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAccount, useChainId, useConnect, useSwitchChain, injected } from 'wagmi';
import { SupportedChainId } from "config/chains";
import { ChainSet, configSetSelection } from "contracts";
import { gnosis, gnosisChiado } from "viem/chains";
import { getProcessedCirclesData } from "data/circles";
import { toast } from "react-toastify";
import { isAddress } from "viem";
import usePOHCirclesWrite from "contracts/hooks/usePOHCirclesWrite";
import { useLoading } from "hooks/useLoading";

export default function useCirclesIntegration() {
  const { address, isConnected } = useAccount();
  const connectedChainId = useChainId() as SupportedChainId;
  const { switchChain } = useSwitchChain();
  const { connect } = useConnect();
  
  // Step management
  const [currentCreateAccountStep, setCurrentCreateAccountStep] = useState(0);
  const [currentMintStep, setCurrentMintStep] = useState(0);
  
  // Circles account state
  const [walletAddress, setWalletAddress] = useState("");
  const [linkStatus, setLinkStatus] = useState<"idle"|"linked"|"expired">("idle");
  const [humanityStatus, setHumanityStatus] = useState<"valid" | "invalid" | "checking">("checking");
  const [fetchError, setFetchError] = useState<unknown>(null);
  const [disableButton, setDisableButton] = useState(false);
  const humanityId = useRef<string>("");
  
  // Loading states
  const loading = useLoading(false, "Transaction pending");
  const fetchLoading = useLoading(false, "Loading Circles account info...");
  const [pending] = loading.use();
  const [isFetching] = fetchLoading.use();
  
  // Chain configuration
  const circlesChain  = configSetSelection.chainSet === ChainSet.MAINNETS ? gnosis : gnosisChiado;
  
  // Derived states
  const isWalletAddressValid = isAddress(walletAddress.trim());
  
  // Write operations
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
        if(address){
          setTimeout(() => {
            updateCirclesData(address);
          }, 1000); // 1 second delay
        }
        toast.success("Successfully linked Circles account!");
      },
      onFail: () => {
        loading.stop();
        toast.error("Failed to link account");
      },
      onError: () => {
        loading.stop();
        console.log("2Failed to link account");
        toast.error("Failed to link account");
      }
    }), [loading])
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
        if(address){
          setTimeout(() => {
            updateCirclesData(address);
          }, 1000); // 1 second delay
        }
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
    }), [loading])
  );

  // Data fetching
  const updateCirclesData = useCallback(async (accountAddress: string) => {
    fetchLoading.start();
    try {
      const result = await getProcessedCirclesData(accountAddress);
      setWalletAddress(result.walletAddress);
      setLinkStatus(result.linkStatus);
      setHumanityStatus(result.humanityStatus);
      humanityId.current = result.humanityId;
      if (result.error) {
        setFetchError(result.error);
        toast.error("Error fetching Circles account data");
      } else {
        setFetchError(null);
      }
    } catch (error) {
      console.error("Error during circles data update:", error);
      setFetchError(error);
      toast.error("Failed to load Circles data");
    } finally {
      fetchLoading.stop();
    }
  }, [fetchLoading]);

  // Actions
  const handleLinkAccount = useCallback(async () => {
    if (!walletAddress || !isWalletAddressValid) {
      toast.error("Please enter a valid wallet address");
      return;
    }

    loading.start();
    writeLink({
      args: [humanityId.current, walletAddress.trim()],
    });
  }, [walletAddress, isWalletAddressValid, loading, writeLink]);

  const handleRenewTrust = useCallback(async () => {
    if (!walletAddress || !isWalletAddressValid) {
      toast.error("Wallet address is required");
      return;
    }
    loading.start();
    writeRenew({
      args: [walletAddress.trim()],
    });
  }, [walletAddress, isWalletAddressValid, loading, writeRenew]);

  // Button props helper
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
    console.log("chainName", circlesChain.name);
    if (isWrongChain) {
      return { 
        onClick: () => {
          switchChain({ chainId: circlesChain.id })
        }, 
        label: `Switch to ${circlesChain.name} to ${defaultLabel}`,
        disabled: false 
      };
    }
    
    if (humanityStatus === "invalid") {
      return { 
        onClick: () => toast.error("No valid humanity linked to current address"), 
        label: defaultLabel,
        disabled: false
      };
    }

    return { 
      onClick: action, 
      label: defaultLabel,
      disabled: false 
    };
  }, [isConnected, connectedChainId, circlesChain, connect, switchChain, humanityStatus, pending]);

  // Load data on wallet connection
  useEffect(() => {
    if (!isConnected || !address) {
      setLinkStatus("idle");
      setWalletAddress("");
      setHumanityStatus("checking");
      return;
    }
    
    updateCirclesData(address);
    setDisableButton(false);
  }, [isConnected, address]);

  return {
    // State
    walletAddress,
    linkStatus,
    humanityStatus,
    fetchError,
    disableButton,
    currentCreateAccountStep,
    currentMintStep,
    isWalletAddressValid,
    pending,
    isFetching,
    circlesChain,
    humanityId: humanityId.current,
    
    // Actions
    setWalletAddress,
    setCurrentCreateAccountStep,
    setCurrentMintStep,
    updateCirclesData,
    handleLinkAccount,
    handleRenewTrust,
    getActionButtonProps
  };
} 