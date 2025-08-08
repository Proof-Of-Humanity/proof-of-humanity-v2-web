"use client";
import { useCallback, useEffect, useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { getRewardClaimStatus } from "data/airdrop";
import AirdropShell from "components/Integrations/Airdrop/AirdropShell";

export type EligibilityStatus = 'disconnected' | 'eligible' | 'not-eligible' | 'claimed';
import NotificationCard, { EmailVerificationStatus } from "components/Integrations/Airdrop/NotificationCard";
import ActionButton from "components/ActionButton";
import useBatchWrite from "contracts/hooks/useBatchWrite";

interface AirdropClientStateProps {
  amountPerClaim: bigint;
  currentStake: bigint;
  humanitySubcourtId: bigint;
}

export default function AirdropClientState({
  amountPerClaim,
  currentStake,
  humanitySubcourtId,
}: AirdropClientStateProps) {
  const [eligibilityStatus, setEligibilityStatus] = useState<EligibilityStatus>('disconnected');
  const [showNotificationCard, setShowNotificationCard] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const modal = useAppKit();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  // Notification state (no backend calls for now)
  const [emailVerificationStatus] = useState<EmailVerificationStatus>('unsubscribed');
  const [subscribedEmail] = useState<string>('');
  const [isEmailLoading] = useState(false);

  // Batch transaction logic
  const [prepareBatch, _ , transactionStatus] = useBatchWrite({
    onFail: () => {
      setError("Your wallet doesn't support atomic batch transactions (ERC-5792). Please use a wallet that supports batch calls.");
    },
    onReady: (fire) => {
      setError(null);
      fire();
    },
    onLoading: () => {},
    onError: () => {
      setError("Transaction failed. Please try again.");
    },
    onSuccess: () => {
      setEligibilityStatus('claimed');
      setShowNotificationCard(true);
      setError(null);
    },
  });

  const isLoading = transactionStatus.write === "pending";
  // Determine eligibility and claim status
  useEffect(() => {
    const run = async () => {
      if (!isConnected || !address || !chainId) {
        setEligibilityStatus('disconnected');
        return;
      }
      try {
        const status = await getRewardClaimStatus(address, chainId as any);
        if (status.claimed) {
          setEligibilityStatus('claimed');
        } else {
          setEligibilityStatus('eligible');
        }
      } catch (e) {
        setEligibilityStatus('not-eligible');
      }
    };
    run();
  }, [isConnected, address, chainId]);

  const handleConnectWallet = useCallback(() => {
    modal.open({ view: "Connect" });
  }, [modal]);

  const handleClaimAndStake = useCallback(() => {
    if (!address) return;

    const newStake = currentStake + amountPerClaim;

    prepareBatch({
      calls: [
        {
          contract: "PnkRewardDistributer",
          functionName: "claim",
          args: [],
        },
        {
          contract: "KlerosLiquid", 
          functionName: "setStake",
          args: [humanitySubcourtId, newStake],
        },
      ],
    });
  }, [address, amountPerClaim, currentStake, humanitySubcourtId, prepareBatch]);

  const renderActionButton = () => {
    if (eligibilityStatus === 'claimed') return null;

    switch (eligibilityStatus) {
      case 'eligible':
        return (
          <div className="mt-14 flex justify-center">
            <ActionButton
              onClick={handleClaimAndStake}
              label="Claim & Stake"
              disabled={isLoading}
              isLoading={isLoading}
              className="w-44 py-3"
              variant="primary"
            />
          </div>
        );
      case 'disconnected':
        return (
          <div className="mt-14 flex justify-center">
            <ActionButton
              onClick={handleConnectWallet}
              label="Connect wallet"
              disabled={isLoading}
              isLoading={isLoading}
              className="w-44 py-3"
              variant="primary"
            />
          </div>
        );
      case 'not-eligible':
      default:
        return (
          <div className="mt-14 flex justify-center">
            <ActionButton
              onClick={() => {}}
              label="Claim & Stake"
              disabled={true}
              className="w-44 py-3"
              variant="primary"
            />
          </div>
        );
    }
  };

  return (
    <>
      {error ? (
        <div className="w-full max-w-[1095px] text-red-500 text-sm">{error}</div>
      ) : null}
      
      <div className="w-full max-w-[1095px]">
        <AirdropShell
          eligibilityStatus={eligibilityStatus}
          amountPerClaim={amountPerClaim}
        >
          {renderActionButton()}
        </AirdropShell>
      </div>

      {showNotificationCard ? (
        <div className="w-full mb-6 max-w-[1095px]">
          <NotificationCard
            isLoading={isEmailLoading}
            verificationStatus={emailVerificationStatus}
            subscribedEmail={subscribedEmail}
          />
        </div>
      ) : null}
    </>
  );
}
