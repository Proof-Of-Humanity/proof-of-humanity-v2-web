"use client";

import { useAtlasProvider } from "@kleros/kleros-app";
import SignInButton from "components/SignInButton";
import { useQuery } from "@tanstack/react-query";
import { fetchReferralDashboard } from "data/referral";
import ReferralIcon from "icons/Referral.svg";
import { useAccount } from "wagmi";
import ReferralCard from "./ReferralCard";

// Static card shell shown in every state (Figma: header of Card-Referral).
const CardShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="paper p-5 md:p-7">
    <div className="text-orange mb-4 flex items-center gap-2">
      <ReferralIcon className="h-8 w-auto" />
      <h2 className="text-xl font-semibold">Referral</h2>
    </div>

    <h3 className="text-primaryText font-semibold">Invite Humans</h3>
    <p className="text-secondaryText mt-1 max-w-3xl text-sm">
      Earn 250 PNK when someone you invite becomes verified on PoH. Completing 5
      successful verified referrals, you get the exclusive Human Connector
      badge.
    </p>

    {children}
  </div>
);

/**
 * Referral feature card on the Rewards page. Owns the auth gating and data
 * fetching; renders `ReferralCard` once the signed-in user's referral data is
 * loaded.
 */
const ReferralDashboard = () => {
  const { address } = useAccount();
  const { isVerified: isSignedIn } = useAtlasProvider();
  const account = address?.toLowerCase() as `0x${string}` | undefined;
  const canFetch = Boolean(account && isSignedIn);

  const { data, error, refetch } = useQuery({
    queryKey: ["referral-dashboard", account],
    queryFn: () => {
      if (!account) throw new Error("Wallet not connected");
      return fetchReferralDashboard(account);
    },
    enabled: canFetch,
  });

  if (!canFetch)
    return (
      <CardShell>
        <div className="mt-5 flex flex-col items-start gap-3">
          <p className="text-secondaryText text-sm">
            {address
              ? "Sign in to get your referral link and track your rewards."
              : "Connect your wallet and sign in to get your referral link."}
          </p>
          <SignInButton />
        </div>
      </CardShell>
    );

  if (error)
    return (
      <CardShell>
        <div className="mt-5 flex flex-col items-start gap-3">
          <p className="text-secondaryText text-sm">
            Could not load your referral data.
          </p>
          <button
            type="button"
            className="btn-secondary px-6 py-2"
            onClick={() => refetch()}
          >
            Retry
          </button>
        </div>
      </CardShell>
    );

  if (data === undefined)
    return (
      <CardShell>
        <div className="mt-5 flex animate-pulse flex-col gap-4">
          <div className="bg-grey h-6 w-2/3 rounded-full" />
          <div className="bg-grey h-11 w-48 rounded-full" />
        </div>
      </CardShell>
    );

  if (data === null)
    return (
      <CardShell>
        <p className="text-secondaryText mt-5 text-sm">
          Only verified humans can invite others. Claim your humanity to get
          your referral link.
        </p>
      </CardShell>
    );

  return (
    <CardShell>
      <ReferralCard data={data} />
    </CardShell>
  );
};

export default ReferralDashboard;
