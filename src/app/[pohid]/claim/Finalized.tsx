import Link from "next/link";
import ExternalLink from "components/ExternalLink";

interface FinalizedProps {
  requiredVouches: number;
}

const Finalized: React.FC<FinalizedProps> = ({ requiredVouches }) => (
  <>
    <div className="my-4 flex w-full flex-col text-2xl font-extralight">
      <span>
        🎉 Welcome to
        <strong className="ml-2 font-semibold uppercase">
          Proof of Humanity
        </strong>
        🎉
      </span>
      <div className="divider mt-4 w-2/3" />
    </div>

    <div>
      <div>
        Your profile starts with the status:
        <span className="bg-status-vouching ml-2 rounded-full px-3 py-1 text-white">
          Vouching
        </span>
      </div>
      <div className="my-8 text-slate-400">
        What you need to advance:
        <ul className="ml-6 list-disc">
          {requiredVouches && (
            <li>
              Get a vouch from a registered human.{" "}
              <ExternalLink
                href="https://t.me/proofhumanity"
                className="text-orange font-semibold underline underline-offset-2"
              >
                Get a vouch
              </ExternalLink>
              <span className="ml-1">
                ↗️
              </span>
            </li>
          )}
          <li>
            Fully fund your{" "}
            <strong className="text-status-vouching">initial deposit</strong>
          </li>
        </ul>
      </div>

      <Link href="/" className="btn-main">
        Return to homepage
      </Link>
    </div>
  </>
);

export default Finalized;
