import Field from "components/Field";
import { useState } from "react";
import { useAccount } from "wagmi";
import { SubmissionState } from "./Form";
import { ObservableObject } from "@legendapp/state";
import ExternalLink from "components/ExternalLink";

interface InfoProps {
  advance: () => void;
  state$: ObservableObject<SubmissionState>;
}

function Info({ advance, state$ }: InfoProps) {
  const { address } = useAccount();
  const [walletNotice, setWalletNotice] = useState(false);
  const [duplicateNotice, setDuplicateNotice] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const name = state$.name.use();

  return (
    <>
      <div className="my-4 flex w-full flex-col text-2xl font-extralight">
        <span>Create your</span>
        <span>
          <strong className="font-semibold uppercase">Proof of Humanity</strong>{" "}
          Profile
        </span>
        <div className="divider mt-4 w-2/3" />
      </div>

      <span className="mb-6">
        Submitting your profile to Proof of Humanity takes 5-10 and requires an
        Ethereum wallet and a short video.
      </span>

      <Field label="Connected wallet" value={address} disabled />
      <Field
        label="Display Name"
        placeholder="name by which you are known"
        value={name}
        onChange={(e) => state$.name.set(e.target.value)}
      />

      <div className="mb-4 mt-8 flex items-start">
        <input
          id="wallet-notice"
          type="checkbox"
          className="checkbox mt-1 cursor-pointer"
          checked={walletNotice}
          onChange={() => setWalletNotice((c) => !c)}
        />
        <label className="ml-3 cursor-pointer" htmlFor="notice">
          I understand this wallet will be irreversibly linked to my real-world
          identity and I will not use that wallet for any private or sensitive
          information.
        </label>
      </div>

      <div className="mb-8 flex flex-col items-start">
        <div className="flex items-start">
          <input
            id="duplicate-notice"
            type="checkbox"
            className="checkbox mt-1 cursor-pointer"
            checked={duplicateNotice}
            onChange={() => setDuplicateNotice((c) => !c)}
          />
          <label className="ml-3 cursor-pointer text-primaryText" htmlFor="duplicate-notice">
          I'm not currently registered on PoH, and don't have an active profile. 
          I understand that a duplicate submission can be challenged, and my{" "}
            <span className="text-red-500 font-medium">deposit may be lost.</span>
          </label>
        </div>
        
        <button
          className="ml-7 mt-2 flex items-center gap-1 text-sm text-orange-500 font-normal"
          onClick={() => setShowDetails((s) => !s)}
        >
          Details {showDetails ? <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-chevron-down h-3 w-3 transition-transform rotate-180"><path d="m6 9 6 6 6-6"></path></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-chevron-down h-3 w-3 transition-transform"><path d="m6 9 6 6 6-6"></path></svg>}
        </button>

        {showDetails && (
          <div className="ml-7 mt-3 bg-orange-50/30 dark:bg-dark-lightOrange p-5 text-sm border-l-[#F5E5DD] dark:border-l-dark-orange border-l-2 text-secondaryText">
            <p className="mb-3">
             <span className="font-medium">Coming from PoH v1 and registering on v2 for the first time? </span> You can either: <strong className="font-semibold">(a)</strong> claim your past (v1) profile, or <strong className="font-semibold">(b)</strong> register on the current interface (v2) with your <strong className="font-semibold">previously used</strong>, or <strong className="font-semibold">new</strong> wallet. Simultaneous submissions not allowed.
            </p>
            <p className="mb-3">
              Click on your profile's PoH ID and select the relevant option:
            </p>
            <ul className="mb-4 list-disc space-y-2 pl-5">
              <li>
                <strong className="font-semibold">Renew</strong> — use the same wallet to extend/refresh your v2 profile or update your name/alias.
              </li>
              <li>
                <strong className="font-semibold">Claim Humanity</strong> — use a different/new wallet if you changed or lost the old one, or if someone already registered you (even incorrectly). Works for expired / withdrawn / revoked / rejected / pending / challenged profiles.
              </li>
              <li>
                <strong className="font-semibold">Revoke</strong> — if you want to remove your profile, revoke it and then use the correct flow above.
              </li>
            </ul>
            <div className="flex items-center gap-2 flex-wrap">
              <span>Search here to find your past profiles:</span>
              <ExternalLink 
                href="/" 
                className="inline-flex h-6 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-orange-200 dark:border-dark-orange bg-background/50 dark:bg-dark-whiteBackground/50 px-3 text-xs font-medium ring-offset-background transition-all hover:border-orange-500 dark:hover:border-dark-orange hover:bg-orange-500/10 dark:hover:bg-dark-orange/10 hover:text-orange-500 dark:hover:text-dark-orange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
              >
                All Profiles
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-up-right h-3 w-3">
                  <path d="M7 7h10v10"></path>
                  <path d="M7 17 17 7"></path>
                </svg>
              </ExternalLink>
            </div>
          </div>
        )}
      </div>

      <button
        className="btn-main"
        disabled={!name || !walletNotice || !duplicateNotice}
        onClick={advance}
      >
        NEXT
      </button>
    </>
  );
}

export default Info;
