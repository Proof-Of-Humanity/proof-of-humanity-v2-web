import React, { ChangeEvent } from "react";
import Accordion from "components/Accordion";
import Label from "components/Label";
import Field from "components/Field";
import InfoIcon from "icons/info.svg";
import CircleCheckIcon from "icons/CheckCircle.svg";
import ActionButton from "components/ActionButton";
import CirclesAddressDisplay from "./CirclesAddressDisplay";
import LoadingSpinner from "./LoadingSpinner";

interface CirclesLinkAccountStepProps {
  linkStatus: "idle" | "linked" | "expired";
  walletAddress: string;
  onAddressChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  onLinkAccount: () => void;
  onRenewTrust: () => void;
  isLoading: boolean;
  isError: boolean;
  getActionButtonProps: (
    action: () => void,
    defaultLabel: string,
  ) => {
    onClick: () => void;
    label: string;
    disabled: boolean;
  };
  pending: boolean;
  isOpen: boolean;
  onToggle: () => void;
}

export default function CirclesLinkAccountStep({
  linkStatus,
  walletAddress,
  onAddressChange,
  onLinkAccount,
  onRenewTrust,
  isLoading,
  isError,
  getActionButtonProps,
  pending,
  isOpen,
  onToggle,
}: CirclesLinkAccountStepProps) {
  return (
    <Accordion
      title="Step 2 - Link Your Gnosis App (Circles) Account"
      className="bg-primaryBackground w-full rounded-[28px] [&>button:focus-visible]:outline-none [&>button:focus-visible]:ring-2 [&>button:focus-visible]:ring-orange [&>button:focus-visible]:ring-offset-2 dark:[&>button:focus-visible]:ring-offset-[#292D35] [&>button]:min-h-20 [&>button]:rounded-[28px] [&>button]:px-8"
      isOpen={isOpen}
      onToggle={onToggle}
    >
      {isLoading ? (
        <div className="my-5 flex items-center justify-center pt-3 md:pt-4">
          <LoadingSpinner message="Loading Circles account info..." />
        </div>
      ) : isError ? (
        <div className="flex w-full flex-col pt-3 md:pt-4">
          <Label className="mt-0 normal-case" aria-live="assertive">
            Error fetching Circles account
          </Label>
          <span className="text-secondaryText mb-2" role="alert">
            Try again later.
          </span>
        </div>
      ) : (
        <>
          {linkStatus === "idle" && (
            <div className="mx-auto flex w-[calc(100%-60px)] max-w-[1095px] flex-col pb-2 pt-3 md:pt-4">
              <Label className="text-secondaryText -mt-1 mb-1 normal-case">
                Paste your Gnosis App (Circles) Wallet Address
              </Label>
              <div className="mt-4 flex flex-col gap-2 md:flex-row md:items-stretch">
                <div className="min-w-0 flex-1">
                  <Field
                    value={walletAddress}
                    onChange={onAddressChange}
                    placeholder="0x..."
                    aria-label="Circles Wallet Address"
                  />
                </div>
                {(() => {
                  const { onClick, label, disabled } = getActionButtonProps(
                    onLinkAccount,
                    "Link",
                  );
                  return (
                    <ActionButton
                      onClick={onClick}
                      label={label}
                      ariaLabel="Link Circles account"
                      disabled={disabled}
                      isLoading={pending}
                      className="min-w-[170px] shrink-0 self-center whitespace-nowrap px-8"
                      variant={label === "Link" ? "primary" : "secondary"}
                    />
                  );
                })()}
              </div>
              <div className="mt-2 flex items-start text-xs">
                <InfoIcon
                  width={16}
                  height={16}
                  className="mr-1 mt-0.5 stroke-orange-400 stroke-2"
                />
                <span className="text-secondaryText">
                  Make sure this is your correct Circles address. You need to be
                  invited into Circles to be able to join the group. Make sure
                  you were invited before proceeding. Please, double check it
                  before linking the accounts as its a{" "}
                  <span className="font-semibold text-[#EF4444]">
                    permanent action
                  </span>
                  .
                </span>
              </div>
            </div>
          )}
          {linkStatus === "linked" && (
            <div className="mx-auto flex w-[calc(100%-60px)] max-w-[1095px] flex-col space-y-4 pt-3 md:pt-4">
              <div className="flex items-center">
                <span className="text-primaryText">
                  Circles account successfully linked to POHID
                </span>
                <CircleCheckIcon className="ml-1 h-4 w-4" />
              </div>
              <CirclesAddressDisplay walletAddress={walletAddress} />
              <span className="font-medium text-green-400">
                Ready to start collecting Circles!
              </span>
            </div>
          )}
          {linkStatus === "expired" && (
            <div className="mx-auto flex w-[calc(100%-60px)] max-w-[1095px] flex-col space-y-4 pt-3 md:pt-4">
              <div className="flex items-center">
                <span className="text-orange-400">
                  The humanity expired. Please renew trust on POH Group.
                </span>
                <InfoIcon
                  width={16}
                  height={16}
                  className="ml-1 stroke-orange-400 stroke-2"
                />
              </div>
              <CirclesAddressDisplay walletAddress={walletAddress} />
              {(() => {
                const { onClick, label, disabled } = getActionButtonProps(
                  onRenewTrust,
                  "Renew",
                );
                return (
                  <ActionButton
                    onClick={onClick}
                    label={label}
                    ariaLabel="Renew Circles trust"
                    disabled={disabled}
                    isLoading={pending}
                    className="mt-2 self-start"
                    variant={label === "Renew" ? "primary" : "secondary"}
                  />
                );
              })()}
            </div>
          )}
        </>
      )}
    </Accordion>
  );
}
