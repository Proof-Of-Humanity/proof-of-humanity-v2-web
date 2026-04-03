"use client";

import { useEffect, useMemo, type ReactNode } from "react";
import { useAccount, useChainId } from "wagmi";

import ChainLogo from "components/ChainLogo";
import {
  getForeignChain,
  idToChain,
  type SupportedChain,
  type SupportedChainId,
} from "config/chains";
import type { ProfileHumanityQuery } from "generated/graphql";
import {
  ProfileOptimisticProvider,
  useProfileOptimistic,
} from "optimistic/profile";
import type {
  ProfileOptimisticBase,
  ProfileOptimisticOverlay,
  ProfilePendingAction,
} from "optimistic/types";
import TransferSection from "app/[pohid]/cross-chain/TransferSection";
import UpdateStateSection from "app/[pohid]/cross-chain/UpdateStateSection";
import PendingRelaySection from "app/[pohid]/cross-chain/PendingRelaySection";
import {
  RELAY_MODE_MANUAL_SIGNATURES,
  RELAY_MODE_WAIT_ONLY,
  type RelayMode,
} from "app/[pohid]/cross-chain/types";
import {
  realBridgeTransactions,
  realProfileFixtures,
} from "../../../../scripts/fixtures/realCrossChainFixtures";

const DEFAULT_CLAIMER = "0x1111111111111111111111111111111111111111" as const;
const HARNESS_GATEWAY_ID =
  "0x0000000000000000000000000000000000000042" as const;
const MANUAL_RELAY_DATA = "0x1234" as const;

type PendingRelayDescriptor = {
  relayMode: RelayMode;
  sourceChainId: SupportedChainId;
  destinationChainId: SupportedChainId;
  encodedData?: `0x${string}`;
  transferTimestamp?: number;
};

type HarnessHumanityRecord = Record<SupportedChainId, ProfileHumanityQuery>;

const baseProfileState: ProfileOptimisticBase = {
  winningStatus: "resolved",
  pendingRevocation: false,
  lastTransferTimestamp: undefined,
  lastOutUpdateTimestamp: undefined,
  hasPendingUpdateRelay: false,
  hasPendingTransferRelay: false,
};

const seedTransferOverlay = {
  winningStatus: "transferring",
  lastTransferTimestamp: 0,
  hasPendingTransferRelay: true,
} satisfies ProfileOptimisticOverlay;

const seedUpdateOverlay = {
  lastOutUpdateTimestamp: 0,
  hasPendingUpdateRelay: true,
} satisfies ProfileOptimisticOverlay;

const seedRelayUpdateOverlay = {
  hasPendingUpdateRelay: false,
} satisfies ProfileOptimisticOverlay;

function SeedProfileAction({
  action,
  overlay,
}: {
  action?: ProfilePendingAction;
  overlay?: ProfileOptimisticOverlay;
}) {
  const { pendingAction, applyAction } = useProfileOptimistic();

  useEffect(() => {
    if (!action || !overlay || pendingAction !== null) {
      return;
    }

    applyAction(action, overlay);
  }, [action, applyAction, overlay, pendingAction]);

  return null;
}

function Scene({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="paper flex flex-col gap-4 p-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-secondaryText text-sm">{description}</p>
      </div>
      <div className="rounded border border-slate-200 bg-white px-4 py-3">
        {children}
      </div>
    </section>
  );
}

function StatusPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-slate-200 bg-white px-3 py-2">
      <div className="text-secondaryText text-xs uppercase tracking-wide">
        {label}
      </div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}

function alignFixtureClaimer({
  humanity,
  homeChainId,
  claimer,
}: {
  humanity: HarnessHumanityRecord;
  homeChainId: SupportedChainId;
  claimer: `0x${string}`;
}) {
  const foreignChainId = getForeignChain(homeChainId) as SupportedChainId;

  return {
    ...humanity,
    [homeChainId]: {
      ...humanity[homeChainId],
      humanity: humanity[homeChainId].humanity
        ? {
            ...humanity[homeChainId].humanity,
            registration: humanity[homeChainId].humanity.registration
              ? {
                  ...humanity[homeChainId].humanity.registration,
                  claimer: {
                    ...humanity[homeChainId].humanity.registration.claimer,
                    id: claimer,
                  },
                }
              : null,
          }
        : null,
    },
    [foreignChainId]: {
      ...humanity[foreignChainId],
      crossChainRegistration: humanity[foreignChainId].crossChainRegistration
        ? {
            ...humanity[foreignChainId].crossChainRegistration,
            claimer: {
              ...humanity[foreignChainId].crossChainRegistration.claimer,
              id: claimer,
            },
          }
        : null,
    },
  } as HarnessHumanityRecord;
}

function CrossChainHarnessShell({
  homeChain,
  humanity,
  canTransfer,
  canUpdate,
  transferCooldownEndsAt,
  pendingTransferRelay,
  pendingUpdateRelay,
  pohId,
}: {
  homeChain: SupportedChain;
  humanity: Record<SupportedChainId, ProfileHumanityQuery>;
  canTransfer: boolean;
  canUpdate: boolean;
  transferCooldownEndsAt?: number;
  pendingTransferRelay?: PendingRelayDescriptor | null;
  pendingUpdateRelay?: PendingRelayDescriptor | null;
  pohId: `0x${string}`;
}) {
  const transferClaimer = humanity[homeChain.id]?.humanity?.registration
    ?.claimer.id as `0x${string}` | undefined;

  return (
    <div className="flex w-full flex-col items-center border-t p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col items-center sm:items-start">
        <span className="text-secondaryText">Home chain</span>
        <span className="flex items-center font-semibold">
          <ChainLogo
            chainId={homeChain.id}
            className="fill-primaryText mr-2 h-4 w-4"
          />
          {homeChain.name}
        </span>
      </div>

      {pendingTransferRelay ? (
        <PendingRelaySection
          mode="transfer"
          debugDisableExecution
          {...pendingTransferRelay}
        />
      ) : pendingUpdateRelay ? (
        <PendingRelaySection
          mode="update"
          debugDisableExecution
          {...pendingUpdateRelay}
        />
      ) : (
        <>
          {canTransfer && transferClaimer ? (
            <TransferSection
              claimer={transferClaimer}
              homeChain={homeChain}
              gatewayId={HARNESS_GATEWAY_ID}
              transferCooldownEndsAt={transferCooldownEndsAt}
              debugDisableExecution
            />
          ) : null}
          {canUpdate ? (
            <UpdateStateSection
              humanity={humanity}
              homeChain={homeChain}
              gatewayId={HARNESS_GATEWAY_ID}
              pohId={pohId}
              debugDisableExecution
            />
          ) : null}
        </>
      )}
    </div>
  );
}

export default function CrossChainHarnessPage() {
  const { address } = useAccount();
  const connectedChainId = useChainId();
  const claimer = (address?.toLowerCase() || DEFAULT_CLAIMER) as `0x${string}`;
  const actionFixture = realProfileFixtures.claimedWithRejectedRevocation;
  const transferFixture = realProfileFixtures.removedWithTransferHistory;
  const actionHomeChain = idToChain(
    actionFixture.allRequests[0].chainId as SupportedChainId,
  ) as SupportedChain | null;
  const actionHumanity = useMemo(
    () =>
      actionHomeChain
        ? alignFixtureClaimer({
            humanity:
              actionFixture.humanity as unknown as HarnessHumanityRecord,
            homeChainId: actionHomeChain.id,
            claimer,
          })
        : null,
    [actionFixture.humanity, actionHomeChain, claimer],
  );

  const waitRelayDescriptor = useMemo(() => {
    return {
      relayMode: RELAY_MODE_WAIT_ONLY,
      sourceChainId: realBridgeTransactions.sepoliaToChiadoTransfer
        .chainId as SupportedChainId,
      destinationChainId: getForeignChain(
        realBridgeTransactions.sepoliaToChiadoTransfer
          .chainId as SupportedChainId,
      ) as SupportedChainId,
      transferTimestamp: Number(
        transferFixture.humanity[11155111].outTransfer?.transferTimestamp || 0,
      ),
    } satisfies PendingRelayDescriptor;
  }, [transferFixture.humanity]);

  const manualRelayDescriptor = useMemo(() => {
    return {
      relayMode: RELAY_MODE_MANUAL_SIGNATURES,
      sourceChainId: realBridgeTransactions.chiadoToSepoliaTransfer
        .chainId as SupportedChainId,
      destinationChainId: getForeignChain(
        realBridgeTransactions.chiadoToSepoliaTransfer
          .chainId as SupportedChainId,
      ) as SupportedChainId,
      encodedData: MANUAL_RELAY_DATA,
      transferTimestamp: Number(
        transferFixture.humanity[11155111].outTransfer?.transferTimestamp || 0,
      ),
    } satisfies PendingRelayDescriptor;
  }, [transferFixture.humanity]);

  if (!actionHomeChain || !actionHumanity) {
    return (
      <div className="content">
        <div className="paper mt-8 p-6">
          <h1 className="text-xl font-semibold">Cross-chain Harness</h1>
          <p className="text-secondaryText mt-2">
            This harness needs both a wait-only and a manual-signatures route in
            the current chain set.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="content">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 py-8">
        <section className="paper flex flex-col gap-4 p-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold">Cross-chain Harness</h1>
            <p className="text-secondaryText text-sm">
              Live preview of the current transfer, update, and relay UX. Final
              transaction execution is disabled on this page.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <StatusPill
              label="Wallet"
              value={address ? address : "Not connected"}
            />
            <StatusPill
              label="Current Chain"
              value={
                connectedChainId
                  ? idToChain(connectedChainId)?.name ||
                    String(connectedChainId)
                  : "Unknown"
              }
            />
            <StatusPill label="Scene Claimer" value={claimer} />
          </div>
          <div className="text-secondaryText text-sm">
            The harness is built from the real profile and bridge fixtures in
            `scripts/fixtures/realCrossChainFixtures.ts`. For action scenes, the
            claimed fixture claimer is aligned to your connected wallet so the
            current buttons stay inspectable.
          </div>
        </section>

        <ProfileOptimisticProvider
          base={baseProfileState}
          enablePolling={false}
          storageKey="debug-cross-chain-action-shell"
          account={claimer}
        >
          <Scene
            title="Action Shell"
            description={`Current shell using the real claimed fixture on ${actionHomeChain.name}.`}
          >
            <CrossChainHarnessShell
              homeChain={actionHomeChain}
              humanity={actionHumanity}
              canTransfer
              canUpdate
              pohId={actionFixture.id as `0x${string}`}
            />
          </Scene>
        </ProfileOptimisticProvider>

        <ProfileOptimisticProvider
          base={baseProfileState}
          enablePolling={false}
          storageKey="debug-cross-chain-transfer-cooldown"
          account={claimer}
        >
          <Scene
            title="Transfer Cooldown"
            description="Shows the transfer cooldown text branch while update remains available."
          >
            <CrossChainHarnessShell
              homeChain={actionHomeChain}
              humanity={actionHumanity}
              canTransfer
              canUpdate
              transferCooldownEndsAt={
                Number(
                  actionHumanity[actionHomeChain.id].humanity?.registration
                    ?.expirationTime || 0,
                ) -
                60 * 60
              }
              pohId={actionFixture.id as `0x${string}`}
            />
          </Scene>
        </ProfileOptimisticProvider>

        <ProfileOptimisticProvider
          base={baseProfileState}
          enablePolling={false}
          storageKey="debug-cross-chain-transfer-pending"
          account={claimer}
        >
          <SeedProfileAction action="transfer" overlay={seedTransferOverlay} />
          <Scene
            title="Transfer Pending"
            description="Optimistic transfer state replaces the transfer CTA with pending copy."
          >
            <CrossChainHarnessShell
              homeChain={actionHomeChain}
              humanity={actionHumanity}
              canTransfer
              canUpdate
              pohId={actionFixture.id as `0x${string}`}
            />
          </Scene>
        </ProfileOptimisticProvider>

        <ProfileOptimisticProvider
          base={baseProfileState}
          enablePolling={false}
          storageKey="debug-cross-chain-update-pending"
          account={claimer}
        >
          <SeedProfileAction action="update" overlay={seedUpdateOverlay} />
          <Scene
            title="Update Pending"
            description="Optimistic update state replaces the update CTA with the current pending message."
          >
            <CrossChainHarnessShell
              homeChain={actionHomeChain}
              humanity={actionHumanity}
              canTransfer
              canUpdate
              pohId={actionFixture.id as `0x${string}`}
            />
          </Scene>
        </ProfileOptimisticProvider>

        {waitRelayDescriptor ? (
          <ProfileOptimisticProvider
            base={{
              ...baseProfileState,
              hasPendingTransferRelay: true,
            }}
            enablePolling={false}
            storageKey="debug-cross-chain-transfer-relay-wait"
            account={claimer}
          >
            <Scene
              title="Transfer Relay Wait-only"
              description={`Transfer relay modal for ${idToChain(waitRelayDescriptor.sourceChainId)?.name} -> ${idToChain(waitRelayDescriptor.destinationChainId)?.name}.`}
            >
              <PendingRelaySection
                mode="transfer"
                debugDisableExecution
                {...waitRelayDescriptor}
              />
            </Scene>
          </ProfileOptimisticProvider>
        ) : null}

        {manualRelayDescriptor ? (
          <ProfileOptimisticProvider
            base={{
              ...baseProfileState,
              hasPendingTransferRelay: true,
            }}
            enablePolling={false}
            storageKey="debug-cross-chain-transfer-relay-manual"
            account={claimer}
          >
            <Scene
              title="Transfer Relay Manual"
              description={`Manual transfer relay route. If you switch to ${idToChain(manualRelayDescriptor.destinationChainId)?.name}, the modal will show the relay CTA.`}
            >
              <PendingRelaySection
                mode="transfer"
                debugDisableExecution
                {...manualRelayDescriptor}
              />
            </Scene>
          </ProfileOptimisticProvider>
        ) : null}

        {waitRelayDescriptor ? (
          <ProfileOptimisticProvider
            base={{
              ...baseProfileState,
              hasPendingUpdateRelay: true,
            }}
            enablePolling={false}
            storageKey="debug-cross-chain-update-relay-wait"
            account={claimer}
          >
            <Scene
              title="Update Relay Wait-only"
              description={`Current relay modal for ${idToChain(waitRelayDescriptor.sourceChainId)?.name} -> ${idToChain(waitRelayDescriptor.destinationChainId)?.name}.`}
            >
              <PendingRelaySection
                mode="update"
                debugDisableExecution
                {...waitRelayDescriptor}
              />
            </Scene>
          </ProfileOptimisticProvider>
        ) : null}

        {manualRelayDescriptor ? (
          <ProfileOptimisticProvider
            base={{
              ...baseProfileState,
              hasPendingUpdateRelay: true,
            }}
            enablePolling={false}
            storageKey="debug-cross-chain-update-relay-manual"
            account={claimer}
          >
            <Scene
              title="Update Relay Manual"
              description={`Manual relay route. If you switch to ${idToChain(manualRelayDescriptor.destinationChainId)?.name}, the modal will show the execute CTA instead of the switch-chain state.`}
            >
              <PendingRelaySection
                mode="update"
                debugDisableExecution
                {...manualRelayDescriptor}
              />
            </Scene>
          </ProfileOptimisticProvider>
        ) : null}

        {manualRelayDescriptor ? (
          <ProfileOptimisticProvider
            base={{
              ...baseProfileState,
              hasPendingUpdateRelay: true,
            }}
            enablePolling={false}
            storageKey="debug-cross-chain-update-relay-submitted"
            account={claimer}
          >
            <SeedProfileAction
              action="relayUpdate"
              overlay={seedRelayUpdateOverlay}
            />
            <Scene
              title="Relay Submitted"
              description="Post-submit optimistic relay state while waiting for indexed confirmation."
            >
              <PendingRelaySection
                mode="update"
                debugDisableExecution
                {...manualRelayDescriptor}
              />
            </Scene>
          </ProfileOptimisticProvider>
        ) : null}
      </div>
    </div>
  );
}
