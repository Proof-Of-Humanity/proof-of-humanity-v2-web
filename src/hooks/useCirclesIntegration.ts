import { useState, useEffect, useCallback, useMemo } from "react";
import {
  useAccount,
  useChainId,
  useConnect,
  useSwitchChain,
  injected,
} from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { SupportedChainId } from "config/chains";
import { ChainSet, configSetSelection } from "contracts";
import { gnosis, gnosisChiado } from "viem/chains";
import {
  getProcessedCirclesData,
  ProcessedCirclesData,
  validateCirclesHumanity,
} from "data/circles";
import { toast } from "react-toastify";
import { isAddress } from "viem";
import usePOHCirclesWrite from "contracts/hooks/usePOHCirclesWrite";
import { useLoading } from "hooks/useLoading";

export default function useCirclesIntegration() {
  const { address, isConnected } = useAccount();
  const connectedChainId = useChainId() as SupportedChainId;
  const { switchChain } = useSwitchChain();
  const { connect } = useConnect();

  const [walletAddress, setWalletAddress] = useState("");
  const [disableButton, setDisableButton] = useState(false);

  const loading = useLoading(false, "Transaction pending");
  const [pending] = loading.use();

  const circlesChain =
    configSetSelection.chainSet === ChainSet.MAINNETS ? gnosis : gnosisChiado;

  const {
    data: circlesAccountInfo,
    isFetching: isLoadingCirclesData,
    isSuccess: isCirclesDataSuccess,
    isError: isCirclesDataQueryError,
    refetch: refetchCirclesData,
  } = useQuery<ProcessedCirclesData>({
    queryKey: ["circlesData", address],
    queryFn: () => getProcessedCirclesData(address as string),
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

  const isWalletAddressValid = useMemo(
    () => isAddress(walletAddress.trim()),
    [walletAddress],
  );

  const txCallbacks = useCallback(
    (successMsg: string, failMsg: string) => {
      const fail = () => {
        loading.stop();
        toast.error(failMsg);
      };
      return {
        onReady: (fire: () => void) => {
          fire();
          toast.info("Transaction pending");
        },
        onSuccess: () => {
          loading.stop();
          setDisableButton(true);
          setTimeout(() => {
            refetchCirclesData();
          }, 1000);
          toast.success(successMsg);
        },
        onFail: fail,
        onError: fail,
      };
    },
    [loading, refetchCirclesData],
  );

  const [writeLink] = usePOHCirclesWrite(
    "register",
    useMemo(
      () =>
        txCallbacks(
          "Successfully linked Circles account!",
          "Failed to link account",
        ),
      [txCallbacks],
    ),
  );

  const [writeRenew] = usePOHCirclesWrite(
    "renewTrust",
    useMemo(
      () => txCallbacks("Successfully renewed trust!", "Failed to renew trust"),
      [txCallbacks],
    ),
  );

  const handleLinkAccount = useCallback(async () => {
    try {
      if (!isWalletAddressValid) {
        toast.error("Please enter a valid wallet address");
        return;
      }
      loading.start();
      const isHuman = await validateCirclesHumanity(walletAddress);
      if (!isHuman) {
        loading.stop();
        toast.error("The provided address is not a human in Circles.");
        return;
      }

      writeLink({
        args: [
          currentHumanityId as `0x${string}`,
          walletAddress.trim() as `0x${string}`,
        ],
      });
    } catch (error) {
      loading.stop();
      console.error("Error linking account:", error);
      toast.error(
        "An error occurred while linking the account. Please try again.",
      );
    }
  }, [
    isWalletAddressValid,
    walletAddress,
    loading,
    currentHumanityId,
    writeLink,
  ]);

  const handleRenewTrust = useCallback(async () => {
    try {
      if (!isWalletAddressValid) {
        toast.error("No linked Circles account address found to renew.");
        return;
      }
      loading.start();
      writeRenew({
        args: [currentHumanityId as `0x${string}`],
      });
    } catch (error) {
      loading.stop();
      console.error("Error renewing trust:", error);
      toast.error("An error occurred while renewing trust. Please try again.");
    }
  }, [currentHumanityId, isWalletAddressValid, loading, writeRenew]);

  const getActionButtonProps = useCallback(
    (action: () => Promise<void> | void, defaultLabel: string) => {
      if (pending) {
        return { onClick: () => {}, label: defaultLabel, disabled: true };
      }
      if (!isConnected) {
        return {
          onClick: () => {
            connect({ connector: injected() });
          },
          label: "Connect Wallet",
          disabled: false,
        };
      }
      const isWrongChain = connectedChainId !== circlesChain.id;
      if (isWrongChain) {
        return {
          onClick: () => {
            switchChain({ chainId: circlesChain.id });
          },
          label: `Switch to ${circlesChain.name} to ${defaultLabel}`,
          disabled: false,
        };
      }
      const disabled = disableButton || !isWalletAddressValid;
      if (humanityStatus === "invalid") {
        return {
          onClick: () =>
            toast.error(
              "Verification required. Become a verified human on PoH, then paste your Circles wallet to link.",
            ),
          label: defaultLabel,
          disabled,
        };
      }

      return { onClick: action, label: defaultLabel, disabled };
    },
    [
      pending,
      isConnected,
      connectedChainId,
      circlesChain,
      disableButton,
      isWalletAddressValid,
      humanityStatus,
      connect,
      switchChain,
    ],
  );

  useEffect(() => {
    setWalletAddress("");
    setDisableButton(false);
  }, [address]);

  return {
    walletAddress,
    linkStatus,
    humanityStatus,
    isCirclesDataQueryError,
    isWalletAddressValid,
    pending,
    isLoadingCirclesData,
    humanityId: currentHumanityId,

    setWalletAddress,
    handleLinkAccount,
    handleRenewTrust,
    getActionButtonProps,
  };
}
