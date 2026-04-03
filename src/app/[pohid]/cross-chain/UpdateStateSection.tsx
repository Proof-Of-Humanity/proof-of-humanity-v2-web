"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useChainId } from "wagmi";

import ChainLogo from "components/ChainLogo";
import Modal from "components/Modal";
import {
  SupportedChainId,
  supportedChains,
  type SupportedChain,
} from "config/chains";
import useCCPoHWrite from "contracts/hooks/useCCPoHWrite";
import type { ProfileHumanityQuery } from "generated/graphql";
import { useLoading } from "hooks/useLoading";
import useWeb3Loaded from "hooks/useWeb3Loaded";
import { useProfileOptimistic } from "optimistic/profile";
import { timeAgo } from "utils/time";

const buildUpdateSuccessPatch = ({
  previousLastOutUpdateTimestamp,
}: {
  previousLastOutUpdateTimestamp?: number;
}) => ({
  lastOutUpdateTimestamp: previousLastOutUpdateTimestamp ?? 0,
  hasPendingUpdateRelay: true,
});

export default function UpdateStateSection({
  humanity,
  homeChain,
  gatewayId,
  pohId,
  debugDisableExecution = false,
}: {
  humanity: Record<SupportedChainId, ProfileHumanityQuery>;
  homeChain: SupportedChain;
  gatewayId: `0x${string}`;
  pohId: `0x${string}`;
  debugDisableExecution?: boolean;
}) {
  const chainId = useChainId() as SupportedChainId;
  const { base, pendingAction, applyAction } = useProfileOptimistic();
  const loading = useLoading();
  const web3Loaded = useWeb3Loaded();
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [isLoading, loadingMessage] = loading.use();
  const isReconciling = pendingAction !== null;
  const [prepareUpdate, , updateStatus] = useCCPoHWrite(
    "updateHumanity",
    useMemo(
      () => ({
        onLoading() {
          loading.start("Transaction pending...");
        },
        onReady(fire: () => void) {
          setUpdateError(null);
          loading.start("Confirm in wallet...");
          fire();
        },
        onSuccess() {
          applyAction(
            "update",
            buildUpdateSuccessPatch({
              previousLastOutUpdateTimestamp: base.lastOutUpdateTimestamp,
            }),
          );
          toast.success("Update transaction sent!");
          loading.stop();
          setIsUpdateModalOpen(false);
        },
        onError() {
          setUpdateError("Transaction failed. Check your wallet and try again.");
          toast.error("Transaction failed");
          loading.stop();
        },
        onFail() {
          setUpdateError(
            "Simulation failed. The update is not currently executable.",
          );
          toast.error("Simulation failed");
          loading.stop();
        },
      }),
      [applyAction, base.lastOutUpdateTimestamp, loading],
    ),
  );

  const hasUpdateInFlight =
    updateStatus.write === "pending" ||
    (updateStatus.write === "success" &&
      updateStatus.transaction === "pending");

  const closeUpdateModal = useCallback(() => {
    setIsUpdateModalOpen(false);
    if (!hasUpdateInFlight) {
      loading.stop();
    }
  }, [hasUpdateInFlight, loading]);
  const sectionState =
    !web3Loaded || homeChain.id !== chainId
      ? "hidden"
      : pendingAction === "update"
        ? "pending"
        : "action";

  if (sectionState === "hidden") {
    return null;
  }

  if (sectionState === "pending") {
    return (
      <div className="group relative">
        <button className="text-sky-500" disabled>
          Update state
        </button>
        <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-max -translate-x-1/2 rounded-md bg-neutral-700 px-3 py-2 text-center text-sm text-white opacity-0 transition-opacity group-hover:opacity-100">
          Waiting for indexer
          <span className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-[5px] border-t-[5px] border-x-transparent border-t-neutral-700" />
        </span>
      </div>
    );
  }

  return (
    <>
      <div className="group relative">
        <button
          className="text-sky-500"
          disabled={isReconciling}
          onClick={() => setIsUpdateModalOpen(true)}
        >
          Update state
        </button>
        {isReconciling ? (
          <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-max -translate-x-1/2 rounded-md bg-neutral-700 px-3 py-2 text-center text-sm text-white opacity-0 transition-opacity group-hover:opacity-100">
            Waiting for indexer
            <span className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-[5px] border-t-[5px] border-x-transparent border-t-neutral-700" />
          </span>
        ) : null}
      </div>
      <Modal
        formal
        open={isUpdateModalOpen}
        onClose={closeUpdateModal}
        canClose={!hasUpdateInFlight}
        header="Update"
      >
        <div className="p-4">
          <span className="txt text-primaryText m-2">
            Update humanity state on another chain. If you use wallet contract
            make sure it has same address on both chains.
          </span>
          {isLoading ? (
            <div className="paper border-stroke bg-whiteBackground mt-4 px-3 py-2">
              <span className="text-secondaryText text-sm font-medium">
                {loadingMessage}
              </span>
            </div>
          ) : null}
          {updateError ? (
            <div className="paper border-orange bg-lightOrange mt-4 px-3 py-2">
              <span className="text-orange text-sm font-medium">
                {updateError}
              </span>
            </div>
          ) : null}

          <div className="mt-4">
            {supportedChains.map((chain) => {
              const crossChainReg = humanity[chain.id].crossChainRegistration;
              const isExpired = crossChainReg
                ? Number(crossChainReg.expirationTime) < Date.now() / 1000
                : true;
              const isValid =
                chain.id === homeChain.id || (crossChainReg && !isExpired);

              return (
                <div
                  key={chain.id}
                  className="text-primaryText m-2 flex items-center justify-between gap-4 border p-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center">
                      <ChainLogo
                        chainId={chain.id}
                        className="fill-primaryText mr-1 h-4 w-4"
                      />
                      {chain.name} {isValid ? "✔" : "❌"}
                    </div>
                    <div className="text-secondaryText mt-1 text-sm">
                      {chain.id === homeChain.id ? (
                        <span>Home chain</span>
                      ) : crossChainReg ? (
                        <span className={isExpired ? "text-orange-500" : ""}>
                          {isExpired ? "Expired " : "Expires "}
                          {timeAgo(crossChainReg.expirationTime)}
                        </span>
                      ) : (
                        <span>No cross-chain registration yet.</span>
                      )}
                    </div>
                  </div>

                  {chain.id === homeChain.id ? (
                    <div className="text-secondaryText text-sm font-medium">
                      Source
                    </div>
                  ) : (
                    <button
                      className="disabled:text-secondaryText shrink-0 text-blue-500 underline underline-offset-2 disabled:cursor-not-allowed disabled:no-underline"
                      disabled={isLoading}
                      onClick={() => {
                        setUpdateError(null);

                        if (debugDisableExecution) {
                          toast.info("Harness mode: update execution disabled");
                          return;
                        }

                        prepareUpdate({
                          args: [gatewayId, pohId],
                        });
                      }}
                    >
                      {isLoading ? "Processing..." : "Update state"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Modal>
    </>
  );
}
