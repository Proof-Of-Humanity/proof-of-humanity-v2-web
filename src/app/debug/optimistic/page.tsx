"use client";

import { useMemo } from "react";
import {
  applyOptimisticWriteSuccess,
  type OptimisticApi,
} from "optimistic/applyOptimisticWriteSuccess";
import {
  ProfileOptimisticProvider,
  useProfileOptimistic,
} from "optimistic/profile";
import {
  RequestOptimisticProvider,
  useRequestOptimistic,
} from "optimistic/request";
import type { WriteSuccessContext } from "contracts/hooks/types";
import { RequestStatus } from "utils/status";
import type { Address } from "viem";

const requestBase = {
  status: "vouching",
  requestStatus: RequestStatus.VOUCHING,
  funded: 10n,
  totalCost: 40n,
  validVouches: 1,
  onChainVouches: [
    "0x1111111111111111111111111111111111111111" as Address,
  ],
  offChainVouches: [],
  evidenceList: [],
  revocation: false,
};

const profileBase = {
  winningStatus: "resolved",
  hasPendingRevocation: false,
};

const buildContext = (
  functionName: string,
  overrides: Partial<WriteSuccessContext> = {},
): WriteSuccessContext => ({
  contract: "ProofOfHumanity",
  functionName,
  args: [],
  value: 0n,
  chainId: 100,
  txHash: "0x1234" as `0x${string}`,
  ...overrides,
});

function RequestHarness() {
  const requestOptimistic = useRequestOptimistic();

  const api = useMemo(
    (): OptimisticApi => ({
      request: {
        state: requestOptimistic.effective,
        applyPatch: requestOptimistic.applyPatch,
        address: "0x2222222222222222222222222222222222222222" as Address,
      },
    }),
    [requestOptimistic],
  );

  return (
    <section className="space-y-4 rounded border p-4" data-testid="request-panel">
      <h2 className="text-xl font-semibold">Request Harness</h2>
      <div className="flex flex-wrap gap-2">
        <button
          data-testid="fund-request"
          className="rounded border px-3 py-2"
          onClick={() =>
            applyOptimisticWriteSuccess(
              buildContext("fundRequest", {
                args: ["0x01", 0n],
                value: 15n,
              }),
              api,
            )
          }
        >
          Fund +15
        </button>
        <button
          data-testid="add-vouch"
          className="rounded border px-3 py-2"
          onClick={() =>
            applyOptimisticWriteSuccess(
              buildContext("addVouch", {
                args: ["0x01", "0x02"],
              }),
              api,
            )
          }
        >
          Add Vouch
        </button>
        <button
          data-testid="advance-request"
          className="rounded border px-3 py-2"
          onClick={() =>
            applyOptimisticWriteSuccess(buildContext("advanceState"), api)
          }
        >
          Advance
        </button>
        <button
          data-testid="submit-evidence"
          className="rounded border px-3 py-2"
          onClick={() =>
            applyOptimisticWriteSuccess(
              buildContext("submitEvidence", {
                args: ["0x01", 0n, "ipfs://optimistic-evidence"],
              }),
              api,
            )
          }
        >
          Submit Evidence
        </button>
        <button
          data-testid="challenge-request"
          className="rounded border px-3 py-2"
          onClick={() =>
            applyOptimisticWriteSuccess(buildContext("challengeRequest"), api)
          }
        >
          Challenge
        </button>
        <button
          data-testid="clear-request"
          className="rounded border px-3 py-2"
          onClick={requestOptimistic.clearOverlay}
        >
          Clear
        </button>
      </div>
      <dl className="grid grid-cols-2 gap-2 text-sm">
        <dt>Status</dt>
        <dd data-testid="request-status">{requestOptimistic.effective.status}</dd>
        <dt>Request Status</dt>
        <dd data-testid="request-request-status">
          {requestOptimistic.effective.requestStatus}
        </dd>
        <dt>Funded</dt>
        <dd data-testid="request-funded">
          {requestOptimistic.effective.funded.toString()}
        </dd>
        <dt>Valid Vouches</dt>
        <dd data-testid="request-vouches">
          {requestOptimistic.effective.validVouches}
        </dd>
        <dt>Evidence Count</dt>
        <dd data-testid="request-evidence-count">
          {requestOptimistic.effective.evidenceList.length}
        </dd>
        <dt>Pending Challenge</dt>
        <dd data-testid="request-pending-challenge">
          {requestOptimistic.effective.pendingChallenge ? "yes" : "no"}
        </dd>
      </dl>
    </section>
  );
}

function ProfileHarness() {
  const profileOptimistic = useProfileOptimistic();

  const api = useMemo(
    (): OptimisticApi => ({
      profile: {
        state: profileOptimistic.effective,
        applyPatch: profileOptimistic.applyPatch,
      },
    }),
    [profileOptimistic],
  );

  return (
    <section className="space-y-4 rounded border p-4" data-testid="profile-panel">
      <h2 className="text-xl font-semibold">Profile Harness</h2>
      <div className="flex flex-wrap gap-2">
        <button
          data-testid="revoke-humanity"
          className="rounded border px-3 py-2"
          onClick={() =>
            applyOptimisticWriteSuccess(buildContext("revokeHumanity"), api)
          }
        >
          Revoke
        </button>
        <button
          data-testid="transfer-humanity"
          className="rounded border px-3 py-2"
          onClick={() =>
            applyOptimisticWriteSuccess(
              {
                ...buildContext("transferHumanity"),
                contract: "CrossChainProofOfHumanity",
              },
              api,
            )
          }
        >
          Transfer
        </button>
        <button
          data-testid="update-humanity"
          className="rounded border px-3 py-2"
          onClick={() =>
            applyOptimisticWriteSuccess(
              {
                ...buildContext("updateHumanity"),
                contract: "CrossChainProofOfHumanity",
              },
              api,
            )
          }
        >
          Update
        </button>
        <button
          data-testid="execute-signatures"
          className="rounded border px-3 py-2"
          onClick={() =>
            applyOptimisticWriteSuccess(
              {
                ...buildContext("executeSignatures"),
                contract: "EthereumAMBBridge",
              },
              api,
            )
          }
        >
          Execute Signatures
        </button>
        <button
          data-testid="clear-profile"
          className="rounded border px-3 py-2"
          onClick={profileOptimistic.clearOverlay}
        >
          Clear
        </button>
      </div>
      <dl className="grid grid-cols-2 gap-2 text-sm">
        <dt>Winning Status</dt>
        <dd data-testid="profile-winning-status">
          {profileOptimistic.effective.winningStatus ?? "none"}
        </dd>
        <dt>Pending Revocation</dt>
        <dd data-testid="profile-pending-revocation">
          {profileOptimistic.effective.pendingRevocation ? "yes" : "no"}
        </dd>
        <dt>Pending Transfer</dt>
        <dd data-testid="profile-pending-transfer">
          {profileOptimistic.effective.pendingTransfer ? "yes" : "no"}
        </dd>
        <dt>Pending Update</dt>
        <dd data-testid="profile-pending-update">
          {profileOptimistic.effective.pendingUpdate ? "yes" : "no"}
        </dd>
      </dl>
    </section>
  );
}

export default function OptimisticDebugPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      <h1 className="text-2xl font-bold">Optimistic Write Debug</h1>
      <p className="text-sm text-slate-600">
        This route exercises the real optimistic helper and providers without a
        wallet dependency.
      </p>
      <RequestOptimisticProvider base={requestBase}>
        <RequestHarness />
      </RequestOptimisticProvider>
      <ProfileOptimisticProvider base={profileBase}>
        <ProfileHarness />
      </ProfileOptimisticProvider>
    </main>
  );
}
