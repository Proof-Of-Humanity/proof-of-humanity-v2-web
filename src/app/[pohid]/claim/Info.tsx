import Field from "components/Field";
import { useState } from "react";
import { useAccount } from "wagmi";
import { SubmissionState } from "./Form";
import { ObservableObject, ObservablePrimitiveBaseFns } from "@legendapp/state";
import ExternalLink from "components/ExternalLink";
import { isValidEmailAddress } from "utils/validators";

interface InfoProps {
  advance: () => void;
  state$: ObservableObject<SubmissionState>;
  email$: ObservablePrimitiveBaseFns<string>;
  isRenewal: boolean;
}

function Info({ advance, state$, email$, isRenewal }: InfoProps) {
  const { address } = useAccount();
  const [walletNotice, setWalletNotice] = useState(false);
  const [requestNotice, setRequestNotice] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const name = state$.name.use();
  const email = email$.use();
  const trimmedEmail = email.trim();
  // Email is optional: only flag an actual malformed entry, never an empty one.
  const showEmailError =
    trimmedEmail !== "" && !isValidEmailAddress(trimmedEmail);

  return (
    <>
      <div className="my-4 flex w-full flex-col text-2xl font-extralight">
        <span>{isRenewal ? "Renew your" : "Create your"}</span>
        <span>
          <strong className="font-semibold uppercase">Proof of Humanity</strong>{" "}
          Profile
        </span>
        <div className="divider mt-4 w-2/3" />
      </div>

      <span className="mb-6">
        {isRenewal
          ? "Renewing your Proof of Humanity profile takes 5-10 minutes and requires your linked wallet and a short video."
          : "Submitting your profile to Proof of Humanity takes 5-10 minutes and requires an Ethereum wallet and a short video."}
      </span>

      <Field label="Connected wallet" value={address} disabled />
      <Field
        label="First and Last Name"
        placeholder="name by which you are known"
        value={name}
        onChange={(e) => state$.name.set(e.target.value)}
      />
      <Field
        type="email"
        label={
          <>
            Email{" "}
            <span className="text-secondaryText text-xs font-normal normal-case">
              (optional)
            </span>
          </>
        }
        placeholder="get notified about your profile request"
        value={email}
        onChange={(e) => email$.set(e.target.value)}
        status={showEmailError ? "error" : undefined}
        message={showEmailError ? "Please enter a valid email" : undefined}
      />

      <label
        className="mb-4 mt-8 flex cursor-pointer items-start"
        htmlFor="wallet-notice"
      >
        <input
          id="wallet-notice"
          type="checkbox"
          className="checkbox mt-1 cursor-pointer"
          checked={walletNotice}
          onChange={() => setWalletNotice((c) => !c)}
        />
        <span className="ml-3">
          {isRenewal
            ? "I understand this wallet is linked to my real-world identity and I will not use it for any private or sensitive information."
            : "I understand this wallet will be irreversibly linked to my real-world identity and I will not use that wallet for any private or sensitive information."}
        </span>
      </label>

      <div className="mb-8 flex flex-col items-start">
        <label
          className="text-primaryText flex cursor-pointer items-start"
          htmlFor="request-notice"
        >
          <input
            id="request-notice"
            type="checkbox"
            className="checkbox mt-1 cursor-pointer"
            checked={requestNotice}
            onChange={() => setRequestNotice((c) => !c)}
          />
          <span className="ml-3">
            {isRenewal ? (
              <>
                I understand this renewal request is for my active PoH profile.
                It can be challenged if the submission is incorrect, and my{" "}
                <span className="font-medium text-red-500">
                  deposit may be lost.
                </span>
              </>
            ) : (
              <>
                I'm not currently registered on PoH, and don't have an active
                profile. I understand that a duplicate submission can be
                challenged, and my{" "}
                <span className="font-medium text-red-500">
                  deposit may be lost.
                </span>
              </>
            )}
          </span>
        </label>

        <button
          className="ml-7 mt-2 flex items-center gap-1 text-sm font-normal text-orange-500"
          onClick={() => setShowDetails((s) => !s)}
        >
          Details{" "}
          {showDetails ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-chevron-down h-3 w-3 rotate-180 transition-transform"
            >
              <path d="m6 9 6 6 6-6"></path>
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-chevron-down h-3 w-3 transition-transform"
            >
              <path d="m6 9 6 6 6-6"></path>
            </svg>
          )}
        </button>

        {showDetails && (
          <div className="text-secondaryText ml-7 mt-3 border-l-2 border-l-[#F5E5DD] p-5 text-sm dark:border-l-dark-orange">
            <p className="mb-3">
              <span className="font-medium">
                Coming from PoH v1 and registering on v2 for the first
                time?{" "}
              </span>{" "}
              You can either: <strong className="font-semibold">(a)</strong>{" "}
              claim your past (v1) profile, or{" "}
              <strong className="font-semibold">(b)</strong> register on the
              current interface (v2) with your{" "}
              <strong className="font-semibold">previously used</strong>, or{" "}
              <strong className="font-semibold">new</strong> wallet.
              Simultaneous submissions not allowed.
            </p>
            <p className="mb-3">
              Click on your profile's PoH ID and select the relevant option:
            </p>
            <ul className="mb-4 list-disc space-y-2 pl-5">
              <li>
                <strong className="font-semibold">Renew</strong> — use the same
                wallet to extend/refresh your v2 profile or update your
                name/alias.
              </li>
              <li>
                <strong className="font-semibold">Claim Humanity</strong> — use
                a different/new wallet if you changed or lost the old one, or if
                someone already registered you (even incorrectly). Works for
                expired / withdrawn / revoked / rejected / pending / challenged
                profiles.
              </li>
              <li>
                <strong className="font-semibold">Revoke</strong> — if you want
                to remove your profile, revoke it and then use the correct flow
                above.
              </li>
            </ul>
            <div className="flex flex-wrap items-center gap-2">
              <span>Search here to find your past profiles:</span>
              <ExternalLink
                href="/"
                className="bg-background/50 ring-offset-background focus-visible:ring-ring inline-flex h-6 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-orange-200 px-3 text-xs font-medium transition-all hover:border-orange-500 hover:bg-orange-500/10 hover:text-orange-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:border-dark-orange dark:bg-dark-whiteBackground/50 dark:hover:border-dark-orange dark:hover:bg-dark-orange/10 dark:hover:text-dark-orange [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
              >
                All Profiles
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-arrow-up-right h-3 w-3"
                >
                  <path d="M7 7h10v10"></path>
                  <path d="M7 17 17 7"></path>
                </svg>
              </ExternalLink>
            </div>
          </div>
        )}
      </div>

      <button
        className="btn-primary"
        disabled={!name || !walletNotice || !requestNotice || showEmailError}
        onClick={advance}
      >
        NEXT
      </button>
    </>
  );
}

export default Info;
