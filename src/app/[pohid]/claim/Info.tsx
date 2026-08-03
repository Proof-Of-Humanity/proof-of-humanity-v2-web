import Field from "components/Field";
import { useAccount } from "wagmi";
import { SubmissionState } from "./Form";
import { ObservableObject, ObservablePrimitiveBaseFns } from "@legendapp/state";
import ActionButton from "components/ActionButton";
import LongArrowBoth from "icons/LongArrowBoth.svg";
import LongArrowRight from "icons/LongArrowRight.svg";
import Link from "next/link";
import { prettifyId } from "utils/identifier";
import { resolveTxState } from "utils/txState";
import { isValidEmailAddress } from "utils/validators";
import { Hash } from "viem";

export interface InfoState {
  stage: "details" | "identity";
  dataConsent: boolean;
  requestNotice: boolean;
  /** null: recoverable route, the user hasn't picked create vs recover yet. */
  recoverMode: boolean | null;
}

interface InfoProps {
  advance: () => void;
  state$: ObservableObject<SubmissionState>;
  email$: ObservablePrimitiveBaseFns<string>;
  infoState$: ObservableObject<InfoState>;
  pohId: Hash;
  competingClaims: number;
  isRenewal: boolean;
  isRecovery: boolean;
}

function Info({
  advance,
  state$,
  email$,
  infoState$,
  pohId,
  competingClaims,
  isRenewal,
  isRecovery,
}: InfoProps) {
  const { address } = useAccount();
  const stage = infoState$.stage.use();
  const dataConsent = infoState$.dataConsent.use();
  const requestNotice = infoState$.requestNotice.use();
  const recoverMode = infoState$.recoverMode.use();
  const name = state$.name.use();
  const trimmedName = name.trim();
  const email = email$.use();
  const trimmedEmail = email.trim();
  const showEmailError =
    trimmedEmail !== "" && !isValidEmailAddress(trimmedEmail);

  const detailsState = resolveTxState([
    { active: !trimmedName, message: "Enter your name to continue." },
    {
      active: showEmailError,
      message: "Fix or clear the email address to continue.",
    },
    { active: !dataConsent, message: "Accept the data notice to continue." },
    {
      active: isRenewal && !requestNotice,
      message: "Accept the renewal acknowledgement to continue.",
    },
  ]);

  if (stage === "identity")
    return (
      <div className="flex w-full flex-col items-center pb-6">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-primaryText text-2xl font-semibold">
            Humanity <span className="text-peach">ID</span>
          </h1>
          <p className="text-secondaryText mt-3 max-w-xl text-sm leading-6">
            When creating a profile for the first time, a Humanity ID
            (Soulbound) will be created for you. Humanity is your unique ID, and
            it&apos;s used to identify you as a unique being.
          </p>
          <p className="mt-4 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-peach">
            <span>1 Human</span>
            <span className="flex items-center gap-x-2">
              <LongArrowRight className="h-2.5 w-9 shrink-0" aria-hidden />1
              Wallet address
            </span>
            <span className="flex items-center gap-x-2">
              <LongArrowBoth className="h-2.5 w-9 shrink-0" aria-hidden />1
              Humanity ID
            </span>
          </p>
          <p className="text-secondaryText mt-4 max-w-xl text-sm leading-6">
            In case you lose access to your account you can claim the existing
            Humanity previously created for you, linking it to your new address.
          </p>
        </div>

        <div className="mt-8 flex w-full flex-col">
          <label
            className="text-primaryText flex cursor-pointer items-center gap-3 text-sm"
            htmlFor="humanity-create"
          >
            <input
              id="humanity-create"
              type="radio"
              name="humanity-mode"
              className="radio shrink-0"
              checked={recoverMode === false}
              onChange={() => {
                infoState$.recoverMode.set(false);
                // Consents must not carry over between create and recover.
                infoState$.requestNotice.set(false);
              }}
            />
            Create my Humanity ID for the first time.
          </label>

          {recoverMode === false && (
            <>
              <Field
                label="Your Humanity ID"
                labelClassName="mt-3"
                className="truncate"
                value={prettifyId(pohId)}
                disabled
              />
              <label
                className="text-primaryText mt-4 flex cursor-pointer items-start text-sm"
                htmlFor="request-notice"
              >
                <input
                  id="request-notice"
                  type="checkbox"
                  className="checkbox mt-0.5 cursor-pointer"
                  checked={requestNotice}
                  onChange={() => infoState$.requestNotice.toggle()}
                />
                <span className="ml-3">
                  I&apos;m not currently registered on PoH, and don&apos;t have
                  an active profile. I understand that a duplicate submission
                  can be challenged, and my{" "}
                  <span className="text-status-rejected font-medium">
                    deposit may be lost.
                  </span>
                </span>
              </label>
            </>
          )}

          <label
            className="text-primaryText mt-6 flex cursor-pointer items-center gap-3 text-sm"
            htmlFor="humanity-recover"
          >
            <input
              id="humanity-recover"
              type="radio"
              name="humanity-mode"
              className="radio shrink-0"
              checked={recoverMode === true}
              onChange={() => {
                infoState$.recoverMode.set(true);
                infoState$.requestNotice.set(false);
              }}
            />
            I&apos;ve had a Human Identification before. Claim (Recover) an
            existing Humanity ID.
          </label>

          {recoverMode === true && isRecovery && (
            <>
              <div className="border-orange text-secondaryText ml-2 mt-4 border-l-2 p-4 text-sm leading-6">
                You&apos;re in the right place — this claim recovers Humanity ID{" "}
                <span className="font-semibold">{prettifyId(pohId)}</span>.
                Continue to register your profile against it.
              </div>
              {competingClaims > 0 && (
                <div className="border-orange text-secondaryText ml-2 mt-4 border-l-2 p-4 text-sm leading-6">
                  {competingClaims === 1
                    ? "Someone else has a pending claim"
                    : `${competingClaims} other people have pending claims`}{" "}
                  to this Humanity ID. You can still proceed — only one claim
                  can ultimately succeed.
                </div>
              )}
              <label
                className="text-primaryText mt-4 flex cursor-pointer items-start text-sm"
                htmlFor="request-notice"
              >
                <input
                  id="request-notice"
                  type="checkbox"
                  className="checkbox mt-0.5 cursor-pointer"
                  checked={requestNotice}
                  onChange={() => infoState$.requestNotice.toggle()}
                />
                <span className="ml-3">
                  I confirm this Humanity ID belongs to me. I understand that a
                  claim I&apos;m not entitled to can be challenged, and my{" "}
                  <span className="text-status-rejected font-medium">
                    deposit may be lost.
                  </span>
                </span>
              </label>
            </>
          )}
          {recoverMode === true && !isRecovery && (
            <div className="border-orange text-secondaryText ml-2 mt-4 border-l-2 p-4 text-sm leading-6">
              <p className="mb-3">
                To recover a Humanity ID, open the profile you previously
                registered and start the claim from there. Coming from PoH v1
                and registering on v2 for the first time? You can either:{" "}
                <strong className="font-semibold">(a)</strong> claim your past
                (v1) profile, or <strong className="font-semibold">(b)</strong>{" "}
                register on the current interface (v2) with your previously
                used, or new wallet. Simultaneous submissions are not allowed.
              </p>
              <p className="mb-3">
                Click on your profile&apos;s PoH ID and select the relevant
                option:
              </p>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  <strong className="font-semibold">Renew</strong> — use the
                  same wallet to extend/refresh your v2 profile or update your
                  name/alias.
                </li>
                <li>
                  <strong className="font-semibold">Claim Humanity</strong> —
                  use a different/new wallet if you changed or lost the old one,
                  or if someone already registered you (even incorrectly). Works
                  for expired / withdrawn / revoked / rejected / pending /
                  challenged profiles.
                </li>
                <li>
                  <strong className="font-semibold">Revoke</strong> — if you
                  want to remove your profile, revoke it and then use the
                  correct flow above.
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* wrap-reverse: when the row breaks on mobile, the primary action
            stacks above the secondary one. */}
        <div className="mt-8 flex w-full flex-wrap-reverse items-center justify-center gap-3">
          <ActionButton
            onClick={() => infoState$.stage.set("details")}
            label="Back"
            variant="secondary"
            className="min-w-[170px]"
          />
          {recoverMode === true && !isRecovery ? (
            <Link href="/" className="btn-primary min-w-[170px]">
              Find my past profile
            </Link>
          ) : (
            <ActionButton
              onClick={advance}
              label="Next"
              disabled={!requestNotice}
              tooltip={
                requestNotice
                  ? undefined
                  : recoverMode === null
                    ? "Choose whether to create or recover a Humanity ID to continue."
                    : recoverMode
                      ? "Confirm this Humanity ID belongs to you to continue."
                      : "Confirm you're not already registered to continue."
              }
              className="min-w-[170px]"
            />
          )}
        </div>
      </div>
    );

  return (
    <div className="flex w-full flex-col items-center pb-6">
      <div className="flex flex-col items-center text-center">
        <h1 className="text-primaryText text-2xl font-semibold">
          {isRenewal ? "Renew" : "Create"} your{" "}
          <span className="text-peach">Proof of Humanity</span> Profile
        </h1>
        <p className="text-secondaryText mt-3 max-w-xl text-sm leading-6">
          {isRenewal
            ? "You are renewing the profile linked to your existing Humanity ID (Soulbound). Humanity is your unique ID, and it's used to identify you as a unique being."
            : "Submitting your profile to Proof of Humanity takes an average of 5-10 minutes, an existing Ethereum account, and a short video of yourself talking."}
        </p>
      </div>

      <div className="flex w-full flex-col">
        {!!address && (
          <Field label="Connected Wallet" value={address} disabled />
        )}
        {isRenewal && !!address && (
          <Field label="Your Humanity ID" value={prettifyId(pohId)} disabled />
        )}
        <Field
          label="Display Name"
          placeholder="Name by which you would like to be known."
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
          className="text-primaryText mt-8 flex cursor-pointer items-start text-sm"
          htmlFor="data-consent"
        >
          <input
            id="data-consent"
            type="checkbox"
            className="checkbox mt-0.5 cursor-pointer"
            checked={dataConsent}
            onChange={() => infoState$.dataConsent.toggle()}
          />
          <span className="ml-3">
            I agree that my photo, video, and wallet address will be public and
            permanently stored via decentralized systems (blockchain/IPFS). I
            understand this data cannot be deleted or changed, and consent to it
            being linked to my identity. I acknowledge this wallet should not be
            used for private or sensitive activity.
          </span>
        </label>

        {isRenewal && (
          <label
            className="text-primaryText mt-4 flex cursor-pointer items-start text-sm"
            htmlFor="request-notice"
          >
            <input
              id="request-notice"
              type="checkbox"
              className="checkbox mt-0.5 cursor-pointer"
              checked={requestNotice}
              onChange={() => infoState$.requestNotice.toggle()}
            />
            <span className="ml-3">
              I understand this renewal request is for my active PoH profile. It
              can be challenged if the submission is incorrect, and my{" "}
              <span className="text-status-rejected font-medium">
                deposit may be lost.
              </span>
            </span>
          </label>
        )}
      </div>

      <div className="mt-8 flex w-full justify-center">
        <ActionButton
          onClick={isRenewal ? advance : () => infoState$.stage.set("identity")}
          label="Next"
          disabled={detailsState.disabled}
          tooltip={detailsState.tooltip}
          className="min-w-[170px]"
        />
      </div>
    </div>
  );
}

export default Info;
