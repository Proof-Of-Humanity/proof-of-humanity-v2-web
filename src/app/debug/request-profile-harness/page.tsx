"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import ActionButton from "components/ActionButton";
import {
  RequestOptimisticProvider,
  useRequestOptimistic,
} from "optimistic/request";
import {
  ProfileOptimisticProvider,
  useProfileOptimistic,
} from "optimistic/profile";
import type {
  OptimisticEvidenceItem,
  ProfileOptimisticBase,
  RequestOptimisticBase,
} from "optimistic/types";
import { RequestStatus } from "utils/status";

type AlignmentResult = {
  id: string;
  label: string;
  passed: boolean;
  idleCenter: number;
  activeCenter: number;
  delta: number;
};

type LifecycleResult = {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
};

const ALIGNMENT_THRESHOLD = 3;

const baseEvidenceItem: OptimisticEvidenceItem = {
  id: "indexed-evidence",
  uri: "ipfs://indexed-evidence",
  creationTime: 1,
  submitter: "0x0000000000000000000000000000000000000001",
};

const initialRequestBase: RequestOptimisticBase = {
  status: "resolving",
  requestStatus: RequestStatus.PENDING_CLAIM,
  lastStatusChange: 10,
  funded: 0n,
  totalCost: 1000000000000000000n,
  validVouches: 1,
  onChainVouches: [],
  offChainVouches: [],
  evidenceList: [baseEvidenceItem],
  revocation: false,
};

const initialProfileBase: ProfileOptimisticBase = {
  winningStatus: "none",
  pendingRevocation: false,
};

const tooltip = (message: string) => (
  <span className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 z-10 mb-2 w-max max-w-[240px] -translate-x-1/2 rounded-md bg-neutral-700 px-3 py-2 text-center text-sm text-white transition-opacity pointer-events-none whitespace-normal">
    {message}
    <span className="absolute top-full left-1/2 h-0 w-0 -translate-x-1/2 border-x-[5px] border-x-transparent border-t-[5px] border-t-neutral-700" />
  </span>
);

function ProbeCard({
  title,
  frameClassName = "flex min-h-[88px] items-center justify-center rounded border border-neutral-200 bg-white p-4",
  idle,
  active,
  onMeasure,
}: {
  title: string;
  frameClassName?: string;
  idle: ReactNode;
  active: ReactNode;
  onMeasure: (result: AlignmentResult) => void;
}) {
  const idleRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const idleFrame = idleRef.current;
      const activeFrame = activeRef.current;
      const idleButton = idleFrame?.querySelector("button");
      const activeButton = activeFrame?.querySelector("button");
      if (!idleFrame || !activeFrame || !idleButton || !activeButton) return;

      const idleFrameRect = idleFrame.getBoundingClientRect();
      const activeFrameRect = activeFrame.getBoundingClientRect();
      const idleRect = idleButton.getBoundingClientRect();
      const activeRect = activeButton.getBoundingClientRect();
      const idleCenter = idleRect.left - idleFrameRect.left + idleRect.width / 2;
      const activeCenter =
        activeRect.left - activeFrameRect.left + activeRect.width / 2;
      const delta = Math.abs(idleCenter - activeCenter);

      onMeasure({
        id: title,
        label: title,
        passed: delta <= ALIGNMENT_THRESHOLD,
        idleCenter,
        activeCenter,
        delta,
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [idle, active, onMeasure, title]);

  return (
    <div className="rounded-lg border border-neutral-300 bg-neutral-50 p-4">
      <div className="mb-3 text-sm font-semibold text-neutral-700">{title}</div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <div className="mb-2 text-xs uppercase tracking-wide text-neutral-500">Idle</div>
          <div ref={idleRef} className={frameClassName}>
            {idle}
          </div>
        </div>
        <div>
          <div className="mb-2 text-xs uppercase tracking-wide text-neutral-500">
            Tooltip Active
          </div>
          <div ref={activeRef} className={frameClassName}>
            {active}
          </div>
        </div>
      </div>
    </div>
  );
}

function RequestLifecycleProbe({
  onResult,
}: {
  onResult: (result: LifecycleResult) => void;
}) {
  const [base, setBase] = useState(initialRequestBase);

  return (
    <RequestOptimisticProvider
      base={base}
      enablePolling={false}
      account={ACCOUNT_A}
    >
      <RequestLifecycleInner base={base} setBase={setBase} onResult={onResult} />
    </RequestOptimisticProvider>
  );
}

function RequestLifecycleInner({
  base,
  setBase,
  onResult,
}: {
  base: RequestOptimisticBase;
  setBase: React.Dispatch<React.SetStateAction<RequestOptimisticBase>>;
  onResult: (result: LifecycleResult) => void;
}) {
  const { pendingAction, applyAction, pendingEvidenceItem } = useRequestOptimistic();
  const [challengeStep, setChallengeStep] = useState(0);
  const [evidenceStep, setEvidenceStep] = useState(0);

  useEffect(() => {
    if (challengeStep !== 0) return;
    applyAction("challenge", {
      status: "disputed",
      requestStatus: RequestStatus.DISPUTED_CLAIM,
      lastStatusChange: 20,
    });
    setChallengeStep(1);
  }, [applyAction, challengeStep]);

  useEffect(() => {
    if (challengeStep !== 1 || pendingAction !== "challenge") return;

    const timeoutId = window.setTimeout(() => {
      setBase((current) => ({
        ...current,
        status: "disputed",
        requestStatus: RequestStatus.DISPUTED_CLAIM,
        lastStatusChange: 20,
      }));
      setChallengeStep(2);
    }, 120);

    return () => window.clearTimeout(timeoutId);
  }, [challengeStep, pendingAction, setBase]);

  useEffect(() => {
    if (challengeStep !== 2 || pendingAction !== null) return;
    onResult({
      id: "request-challenge-reconcile",
      label: "Request challenge reconcile clears without refresh",
      passed: true,
      detail: `Base status=${base.status}, pendingAction=${pendingAction}`,
    });
    setChallengeStep(3);
  }, [base.status, challengeStep, onResult, pendingAction]);

  useEffect(() => {
    if (evidenceStep !== 0 || challengeStep !== 3) return;
    applyAction("evidence", {
      evidenceList: [
        {
          id: "pending-evidence",
          uri: "ipfs://pending-evidence",
          creationTime: 2,
          submitter: "0x0000000000000000000000000000000000000002",
        },
      ],
    });
    setEvidenceStep(1);
  }, [applyAction, challengeStep, evidenceStep]);

  useEffect(() => {
    if (evidenceStep !== 1 || pendingAction !== "evidence" || !pendingEvidenceItem) return;

    const timeoutId = window.setTimeout(() => {
      setBase((current) => ({
        ...current,
        evidenceList: [...current.evidenceList, pendingEvidenceItem],
      }));
      setEvidenceStep(2);
    }, 120);

    return () => window.clearTimeout(timeoutId);
  }, [evidenceStep, pendingAction, pendingEvidenceItem, setBase]);

  useEffect(() => {
    if (evidenceStep !== 2 || pendingAction !== null) return;
    onResult({
      id: "request-evidence-reconcile",
      label: "Request evidence reconcile clears without refresh",
      passed: true,
      detail: `Evidence count=${base.evidenceList.length}, pendingAction=${pendingAction}`,
    });
    setEvidenceStep(3);
  }, [base.evidenceList.length, evidenceStep, onResult, pendingAction]);

  return (
    <div className="rounded-lg border border-neutral-300 bg-white p-4 text-sm text-neutral-700">
      <div data-testid="request-lifecycle-status">
        pendingAction: {pendingAction ?? "none"} | evidenceCount: {base.evidenceList.length}
      </div>
    </div>
  );
}

function ProfileLifecycleProbe({
  onResult,
}: {
  onResult: (result: LifecycleResult) => void;
}) {
  const [base, setBase] = useState(initialProfileBase);

  return (
    <ProfileOptimisticProvider
      base={base}
      enablePolling={false}
      account={ACCOUNT_A}
    >
      <ProfileLifecycleInner base={base} setBase={setBase} onResult={onResult} />
    </ProfileOptimisticProvider>
  );
}

function ProfileLifecycleInner({
  base,
  setBase,
  onResult,
}: {
  base: ProfileOptimisticBase;
  setBase: React.Dispatch<React.SetStateAction<ProfileOptimisticBase>>;
  onResult: (result: LifecycleResult) => void;
}) {
  const { pendingAction, applyAction } = useProfileOptimistic();
  const [revokeStep, setRevokeStep] = useState(0);

  useEffect(() => {
    if (revokeStep !== 0) return;
    applyAction("revoke", { pendingRevocation: true });
    setRevokeStep(1);
  }, [applyAction, revokeStep]);

  useEffect(() => {
    if (revokeStep !== 1 || pendingAction !== "revoke") return;

    const timeoutId = window.setTimeout(() => {
      setBase((current) => ({ ...current, pendingRevocation: true }));
      setRevokeStep(2);
    }, 120);

    return () => window.clearTimeout(timeoutId);
  }, [pendingAction, revokeStep, setBase]);

  useEffect(() => {
    if (revokeStep !== 2 || pendingAction !== null) return;
    onResult({
      id: "profile-revoke-reconcile",
      label: "Profile revoke reconcile clears without refresh",
      passed: true,
      detail: `pendingRevocation=${base.pendingRevocation}, pendingAction=${pendingAction}`,
    });
    setRevokeStep(3);
  }, [base.pendingRevocation, onResult, pendingAction, revokeStep]);

  return (
    <div className="rounded-lg border border-neutral-300 bg-white p-4 text-sm text-neutral-700">
      <div data-testid="profile-lifecycle-status">
        pendingAction: {pendingAction ?? "none"} | pendingRevocation:{" "}
        {String(base.pendingRevocation)}
      </div>
    </div>
  );
}

const REQUEST_HYDRATION_STORAGE_KEY = "debug-request-hydration";
const PROFILE_HYDRATION_STORAGE_KEY = "debug-profile-hydration";
const REQUEST_ACCOUNT_SCOPE_STORAGE_KEY = "debug-request-account-scope";
const ACCOUNT_A = "0x00000000000000000000000000000000000000aa";
const ACCOUNT_B = "0x00000000000000000000000000000000000000bb";

function RequestHydrationProbe({
  onResult,
}: {
  onResult: (result: LifecycleResult) => void;
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    window.localStorage.setItem(
      `${REQUEST_HYDRATION_STORAGE_KEY}:${ACCOUNT_A.toLowerCase()}`,
      JSON.stringify({
        pendingAction: "challenge",
        overlay: {
          status: "disputed",
          requestStatus: RequestStatus.DISPUTED_CLAIM,
          lastStatusChange: 20,
        },
        expiresAt: Date.now() + 60_000,
      }),
    );
    setReady(true);
  }, []);

  if (!ready) return null;

  return (
    <RequestOptimisticProvider
      base={initialRequestBase}
      enablePolling={false}
      storageKey={REQUEST_HYDRATION_STORAGE_KEY}
      account={ACCOUNT_A}
    >
      <RequestHydrationInner onResult={onResult} />
    </RequestOptimisticProvider>
  );
}

function RequestHydrationInner({
  onResult,
}: {
  onResult: (result: LifecycleResult) => void;
}) {
  const { pendingAction, effective } = useRequestOptimistic();
  const latestState = useRef({
    pendingAction,
    status: effective.status,
    requestStatus: effective.requestStatus,
  });
  const onResultRef = useRef(onResult);

  latestState.current = {
    pendingAction,
    status: effective.status,
    requestStatus: effective.requestStatus,
  };
  onResultRef.current = onResult;

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const { pendingAction, status, requestStatus } = latestState.current;
      onResultRef.current({
        id: "request-hydrates-from-storage",
        label: "Request hydrate restores pending state on mount",
        passed:
          pendingAction === "challenge" &&
          status === "disputed" &&
          requestStatus === RequestStatus.DISPUTED_CLAIM,
        detail: `pendingAction=${pendingAction ?? "none"}, status=${status}`,
      });
    }, 120);

    return () => window.clearTimeout(timeoutId);
  }, []);

  return null;
}

function ProfileHydrationProbe({
  onResult,
}: {
  onResult: (result: LifecycleResult) => void;
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    window.localStorage.setItem(
      `${PROFILE_HYDRATION_STORAGE_KEY}:${ACCOUNT_A.toLowerCase()}`,
      JSON.stringify({
        pendingAction: "revoke",
        overlay: {
          pendingRevocation: true,
        },
        expiresAt: Date.now() + 60_000,
      }),
    );
    setReady(true);
  }, []);

  if (!ready) return null;

  return (
    <ProfileOptimisticProvider
      base={initialProfileBase}
      enablePolling={false}
      storageKey={PROFILE_HYDRATION_STORAGE_KEY}
      account={ACCOUNT_A}
    >
      <ProfileHydrationInner onResult={onResult} />
    </ProfileOptimisticProvider>
  );
}

function ProfileHydrationInner({
  onResult,
}: {
  onResult: (result: LifecycleResult) => void;
}) {
  const { pendingAction, effective } = useProfileOptimistic();
  const latestState = useRef({
    pendingAction,
    pendingRevocation: effective.pendingRevocation,
  });
  const onResultRef = useRef(onResult);

  latestState.current = {
    pendingAction,
    pendingRevocation: effective.pendingRevocation,
  };
  onResultRef.current = onResult;

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const { pendingAction, pendingRevocation } = latestState.current;
      onResultRef.current({
        id: "profile-hydrates-from-storage",
        label: "Profile hydrate restores pending state on mount",
        passed: pendingAction === "revoke" && pendingRevocation,
        detail: `pendingAction=${pendingAction ?? "none"}, pendingRevocation=${String(
          pendingRevocation,
        )}`,
      });
    }, 120);

    return () => window.clearTimeout(timeoutId);
  }, []);

  return null;
}

function RequestAccountScopeProbe({
  onResult,
}: {
  onResult: (result: LifecycleResult) => void;
}) {
  const [account, setAccount] = useState(ACCOUNT_A);
  const [ready, setReady] = useState(false);
  const [stage, setStage] = useState<"account-a" | "account-b" | "account-a-return" | "done">(
    "account-a",
  );
  const [snapshot, setSnapshot] = useState<{
    pendingAction: string | null;
    status: string;
    requestStatus: RequestStatus;
  } | null>(null);

  useEffect(() => {
    window.localStorage.setItem(
      `${REQUEST_ACCOUNT_SCOPE_STORAGE_KEY}:${ACCOUNT_A.toLowerCase()}`,
      JSON.stringify({
        pendingAction: "challenge",
        overlay: {
          status: "disputed",
          requestStatus: RequestStatus.DISPUTED_CLAIM,
          lastStatusChange: 20,
        },
        expiresAt: Date.now() + 60_000,
      }),
    );
    setReady(true);
  }, []);

  useEffect(() => {
    if (!snapshot) return;

    if (stage === "account-a") {
      if (
        snapshot.pendingAction !== "challenge" ||
        snapshot.status !== "disputed" ||
        snapshot.requestStatus !== RequestStatus.DISPUTED_CLAIM
      ) {
        return;
      }

      setStage("account-b");
      setAccount(ACCOUNT_B);
      return;
    }

    if (stage === "account-b" && account === ACCOUNT_B) {
      if (
        snapshot.pendingAction !== null ||
        snapshot.status !== initialRequestBase.status ||
        snapshot.requestStatus !== initialRequestBase.requestStatus
      ) {
        return;
      }

      setStage("account-a-return");
      setAccount(ACCOUNT_A);
      return;
    }

    if (stage === "account-a-return" && account === ACCOUNT_A) {
      if (
        snapshot.pendingAction !== "challenge" ||
        snapshot.status !== "disputed" ||
        snapshot.requestStatus !== RequestStatus.DISPUTED_CLAIM
      ) {
        return;
      }

      setStage("done");
      onResult({
        id: "request-account-scoped-storage",
        label: "Request storage is scoped to the active wallet",
        passed: true,
        detail: "Wallet A hydrates, wallet B stays clear, wallet A hydrates again.",
      });
    }
  }, [account, onResult, snapshot, stage]);

  if (!ready) return null;

  return (
    <RequestOptimisticProvider
      base={initialRequestBase}
      enablePolling={false}
      storageKey={REQUEST_ACCOUNT_SCOPE_STORAGE_KEY}
      account={account}
    >
      <RequestAccountScopeInner onSnapshot={setSnapshot} />
    </RequestOptimisticProvider>
  );
}

function RequestAccountScopeInner({
  onSnapshot,
}: {
  onSnapshot: (snapshot: {
    pendingAction: string | null;
    status: string;
    requestStatus: RequestStatus;
  }) => void;
}) {
  const { pendingAction, effective } = useRequestOptimistic();

  useEffect(() => {
    onSnapshot({
      pendingAction,
      status: effective.status,
      requestStatus: effective.requestStatus,
    });
  }, [effective.requestStatus, effective.status, onSnapshot, pendingAction]);

  return null;
}

export default function RequestProfileHarnessPage() {
  const [alignmentResults, setAlignmentResults] = useState<Record<string, AlignmentResult>>(
    {},
  );
  const [lifecycleResults, setLifecycleResults] = useState<Record<string, LifecycleResult>>(
    {},
  );

  const recordAlignment = (result: AlignmentResult) => {
    setAlignmentResults((current) => ({ ...current, [result.id]: result }));
  };

  const recordLifecycle = (result: LifecycleResult) => {
    setLifecycleResults((current) => ({ ...current, [result.id]: result }));
  };

  const orderedAlignmentResults = useMemo(
    () => Object.values(alignmentResults).sort((a, b) => a.label.localeCompare(b.label)),
    [alignmentResults],
  );
  const orderedLifecycleResults = useMemo(
    () => Object.values(lifecycleResults).sort((a, b) => a.label.localeCompare(b.label)),
    [lifecycleResults],
  );

  const allChecksPassed =
    orderedAlignmentResults.length === 10 &&
    orderedLifecycleResults.length === 6 &&
    orderedAlignmentResults.every((result) => result.passed) &&
    orderedLifecycleResults.every((result) => result.passed);

  return (
    <main className="min-h-screen bg-neutral-100 px-4 py-8 text-neutral-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <div>
          <h1 className="text-2xl font-semibold">Request/Profile Harness</h1>
          <p className="mt-2 max-w-3xl text-sm text-neutral-600">
            This page compares idle and tooltip-active button placement for the
            request/profile action patterns and auto-runs optimistic reconciliation
            probes without full page refreshes.
          </p>
        </div>

        <section className="rounded-xl border border-neutral-300 bg-white p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Status</h2>
            <span
              data-testid="harness-status"
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                allChecksPassed
                  ? "bg-green-100 text-green-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {allChecksPassed ? "passed" : "running"}
            </span>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <div className="mb-2 text-sm font-semibold">Alignment checks</div>
              <ul className="space-y-2 text-sm">
                {orderedAlignmentResults.map((result) => (
                  <li
                    key={result.id}
                    data-testid={`alignment-result-${result.id}`}
                    className="flex items-center justify-between gap-4 rounded border border-neutral-200 px-3 py-2"
                  >
                    <span>{result.label}</span>
                    <span className={result.passed ? "text-green-700" : "text-red-700"}>
                      {result.passed ? "pass" : `fail (${result.delta.toFixed(1)}px)`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="mb-2 text-sm font-semibold">Lifecycle checks</div>
              <ul className="space-y-2 text-sm">
                {orderedLifecycleResults.map((result) => (
                  <li
                    key={result.id}
                    data-testid={`lifecycle-result-${result.id}`}
                    className="rounded border border-neutral-200 px-3 py-2"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span>{result.label}</span>
                      <span className={result.passed ? "text-green-700" : "text-red-700"}>
                        {result.passed ? "pass" : "fail"}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-neutral-500">{result.detail}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <RequestHydrationProbe onResult={recordLifecycle} />
        <ProfileHydrationProbe onResult={recordLifecycle} />
        <RequestAccountScopeProbe onResult={recordLifecycle} />

        <section className="grid gap-4 xl:grid-cols-2">
          <ProbeCard
            title="Request: Fund opener"
            idle={
              <ActionButton
                onClick={() => undefined}
                label="Fund"
                className="mb-2 w-auto"
              />
            }
            active={
              <ActionButton
                onClick={() => undefined}
                label="Fund"
                className="mb-2 w-auto"
                disabled
                tooltip="Syncing"
              />
            }
            onMeasure={recordAlignment}
          />

          <ProbeCard
            title="Request: Fund submit"
            idle={
              <div className="group relative mt-6 flex justify-center">
                <ActionButton
                  disabled={false}
                  isLoading={false}
                  onClick={() => undefined}
                  label="Fund request"
                  className="w-auto"
                />
              </div>
            }
            active={
              <div className="group relative mt-6 flex justify-center">
                <ActionButton
                  disabled
                  isLoading={false}
                  onClick={() => undefined}
                  label="Fund request"
                  className="w-auto"
                />
                {tooltip("Syncing")}
              </div>
            }
            onMeasure={recordAlignment}
          />

          <ProbeCard
            title="Request: Add Evidence opener"
            frameClassName="flex min-h-[88px] flex-col items-stretch rounded border border-neutral-200 bg-white p-4"
            idle={
              <div className="group relative mt-4 mr-2 self-end">
                <ActionButton
                  disabled={false}
                  onClick={() => undefined}
                  label="Add Evidence"
                />
              </div>
            }
            active={
              <div className="group relative mt-4 mr-2 self-end">
                <ActionButton
                  disabled
                  onClick={() => undefined}
                  label="Add Evidence"
                />
                {tooltip("Syncing")}
              </div>
            }
            onMeasure={recordAlignment}
          />

          <ProbeCard
            title="Request: Challenge opener"
            idle={<ActionButton onClick={() => undefined} label="Challenge" />}
            active={
              <ActionButton
                onClick={() => undefined}
                label="Challenge"
                disabled
                tooltip="Syncing"
              />
            }
            onMeasure={recordAlignment}
          />

          <ProbeCard
            title="Request: Challenge submit"
            idle={
              <div className="flex flex-col items-center">
                <ActionButton
                  disabled={false}
                  className="mt-12"
                  onClick={() => undefined}
                  label="Challenge request"
                />
              </div>
            }
            active={
              <div className="flex flex-col items-center">
                <ActionButton
                  disabled
                  className="mt-12"
                  onClick={() => undefined}
                  label="Challenge request"
                  tooltip="Syncing"
                />
              </div>
            }
            onMeasure={recordAlignment}
          />

          <ProbeCard
            title="Request: Vouch opener"
            idle={
              <ActionButton
                onClick={() => undefined}
                label="Vouch"
                className="mb-2 w-auto"
              />
            }
            active={
              <ActionButton
                onClick={() => undefined}
                label="Vouch"
                className="mb-2 w-auto"
                disabled
                tooltip="Syncing"
              />
            }
            onMeasure={recordAlignment}
          />

          <ProbeCard
            title="Request: Remove Vouch"
            frameClassName="flex min-h-[88px] items-center justify-center rounded border border-neutral-200 bg-white p-4"
            idle={
              <div className="flex gap-4">
                <ActionButton
                  onClick={() => undefined}
                  label="Remove Vouch"
                  className="mb-2 w-auto"
                />
              </div>
            }
            active={
              <div className="flex gap-4">
                <ActionButton
                  onClick={() => undefined}
                  label="Remove Vouch"
                  className="mb-2 w-auto"
                  disabled
                  tooltip="Syncing"
                />
              </div>
            }
            onMeasure={recordAlignment}
          />

          <ProbeCard
            title="Profile: Revoke opener"
            frameClassName="flex min-h-[88px] flex-col items-center justify-center rounded border border-neutral-200 bg-white p-4"
            idle={<ActionButton onClick={() => undefined} label="Revoke" className="mb-4" />}
            active={
              <ActionButton
                onClick={() => undefined}
                label="Revoke"
                className="mb-4"
                disabled
                tooltip="Syncing"
              />
            }
            onMeasure={recordAlignment}
          />

          <ProbeCard
            title="Profile: Revoke submit"
            frameClassName="flex min-h-[88px] flex-col items-center justify-center rounded border border-neutral-200 bg-white p-4"
            idle={
              <ActionButton
                onClick={() => undefined}
                label="Revoke"
                className="mt-12"
              />
            }
            active={
              <ActionButton
                onClick={() => undefined}
                label="Revoke"
                className="mt-12"
                disabled
                tooltip="Syncing"
              />
            }
            onMeasure={recordAlignment}
          />

          <ProbeCard
            title="Profile: Cross-chain link button"
            idle={
              <div className="group relative">
                <button className="text-sky-500">Transfer</button>
              </div>
            }
            active={
              <div className="group relative">
                <button className="text-sky-500" disabled>
                  Transfer
                </button>
                {tooltip("Syncing")}
              </div>
            }
            onMeasure={recordAlignment}
          />
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <RequestLifecycleProbe onResult={recordLifecycle} />
          <ProfileLifecycleProbe onResult={recordLifecycle} />
        </section>
      </div>
    </main>
  );
}
