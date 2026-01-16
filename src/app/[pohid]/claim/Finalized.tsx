import Link from "next/link";
import ExternalLink from "components/ExternalLink";
import NewTabIcon from "icons/NewTab.svg";

interface FinalizedProps {
  requiredVouches: number;
  challengePeriodDuration: number;
  pohId: string;
}

const Finalized: React.FC<FinalizedProps> = ({ requiredVouches, challengePeriodDuration, pohId }) => {
  const days = challengePeriodDuration / 86400;

  return (
    <div className="my-8 flex w-full flex-col items-center">
      <div className="text-center text-2xl font-normal">
        <span>
          🎉 Welcome to
          <strong className="ml-2 font-semibold uppercase">
            Proof of Humanity
          </strong>
          🎉
        </span>
      </div>

      <div className="mt-6 flex items-center text-lg">
        Your profile starts with the status:
        <span className="bg-status-vouching ml-2 rounded-full px-3 py-1 text-base font-semibold text-white">
          Needs Vouch
        </span>
      </div>

      <div className="my-8 flex w-full max-w-2xl flex-col lg:max-w-4xl">
        <div className="mb-6 flex flex-col items-center">
          <h3 className="mb-2 font-bold uppercase tracking-wider text-slate-700">Next Steps</h3>
          <div className="h-px w-full px-2 bg-slate-200" />
        </div>

        <div className="flex flex-col space-y-6 text-left">
          {requiredVouches > 0 && (
            <div className="flex gap-3">
              <span className="text-slate-400">1.</span>
              <div className="text-slate-600">
                <span className="font-bold text-slate-900">Get Vouched:</span> Ask a registered human to vouch for you.{" "}
                <ExternalLink
                  href="https://t.me/proofhumanity"
                  className="text-orange whitespace-nowrap font-semibold hover:text-orange-400 inline-flex items-center gap-1"
                >
                  Get a vouch
                  <NewTabIcon className="fill-orange" width={12} height={12} />
                </ExternalLink>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <span className="text-slate-400">{requiredVouches > 0 ? "2." : "1."}</span>
            <div className="text-slate-600">
              <span className="font-bold text-slate-900">Fund Deposit:</span> Submit your full security deposit (if not done already). <span className="text-sm text-slate-400">Fully refunded once you attain the 'Verified Human' status, or slashed if your profile is 'Rejected' due to failure to follow our submission policy.</span>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="text-slate-400">{requiredVouches > 0 ? "3." : "2."}</span>
            <div className="text-slate-600">
              <span className="font-bold text-slate-900">Wait {days} Days:</span> Once the above steps are done, a security timer starts.
            </div>
          </div>

          <div className="flex gap-3">
            <span className="text-slate-400">{requiredVouches > 0 ? "4." : "3."}</span>
            <div className="text-slate-600">
              <span className="font-bold text-slate-900">Claim:</span> Return to your profile to register it, and claim your airdrop{" "}
              <Link href={`/app/pnk-airdrop`} className="text-orange font-semibold hover:text-orange-400">
                here.
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Link href="/" className="btn-main w-full py-3 text-center text-lg font-bold text-white hover:opacity-90">
        Return to Homepage
      </Link>
    </div>
  );
};

export default Finalized;
