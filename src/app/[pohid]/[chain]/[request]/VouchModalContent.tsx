"use client";

import { useState } from "react";
import cn from "classnames";
import ActionButton from "components/ActionButton";
import {
  RequestModalActions,
  RequestModalHeader,
} from "components/RequestModal";
import VouchIcon from "icons/Vouch.svg";
import UsersIcon from "icons/Users.svg";
import FileTextIcon from "icons/FileText.svg";
import AlertTriangleIcon from "icons/AlertTriangle.svg";
import SignatureIcon from "icons/Signature.svg";
import ChainLinkIcon from "icons/ChainLink.svg";

export type VouchMethod = "gasless" | "onchain";

const METHOD_OPTIONS: Array<{
  value: VouchMethod;
  title: string;
  caption: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}> = [
  {
    value: "gasless",
    title: "Gasless",
    caption: "Free · expires in 6 months · can't be revoked",
    Icon: SignatureIcon,
  },
  {
    value: "onchain",
    title: "On-chain",
    caption: "Pays gas · removable anytime",
    Icon: ChainLinkIcon,
  },
];

interface VouchModalContentProps {
  submitted: boolean;
  onClose: () => void;
  onVouch: (method: VouchMethod) => void;
  isSubmitting: boolean;
  disabled?: boolean;
  tooltip?: string;
}

export default function VouchModalContent({
  submitted,
  onClose,
  onVouch,
  isSubmitting,
  disabled,
  tooltip,
}: VouchModalContentProps) {
  const [acknowledged, setAcknowledged] = useState(false);
  const [method, setMethod] = useState<VouchMethod>("gasless");

  if (submitted)
    return (
      <>
        <RequestModalHeader
          title={
            <>
              Success!
              <br />
              Your vouch has been submitted.
            </>
          }
          description="Thanks!"
        />
        <VouchIcon className="mx-auto mt-4 h-32 w-32 text-[#CA80FF]" />
        <RequestModalActions onReturn={onClose} returnLabel="Close" />
      </>
    );

  const locked = isSubmitting || !!disabled;

  return (
    <>
      <RequestModalHeader
        title={
          <>
            Vouch for <span className="text-peach">this Profile</span>
          </>
        }
        description="Confirm the statement below to continue."
      />
      <div className="mx-auto mt-8 flex w-full max-w-md flex-col">
        <div className="bg-whiteBackground border-stroke flex flex-col gap-3 rounded-card border p-5 text-left">
          <div className="flex items-center gap-3">
            <UsersIcon className="h-5 w-5 shrink-0 text-peach" />
            <span className="text-primaryText text-sm">
              You know this person and are sure they exist
            </span>
          </div>
          <div className="flex items-center gap-3">
            <FileTextIcon className="h-5 w-5 shrink-0 text-peach" />
            <span className="text-primaryText text-sm">
              Their submission follows the Policy
            </span>
          </div>
          <div className="flex items-center gap-3">
            <AlertTriangleIcon className="h-5 w-5 shrink-0 text-[#FFE16B]" />
            <span className="text-primaryText text-sm">
              If this request is rejected as fraudulent (Sybil attack or
              identity theft), your profile will be removed alongside it.
            </span>
          </div>
        </div>
        <label className="mt-5 flex cursor-pointer items-center gap-3 self-center">
          <input
            type="checkbox"
            className="checkbox"
            checked={acknowledged}
            onChange={(event) => setAcknowledged(event.target.checked)}
            disabled={isSubmitting}
          />
          <span className="text-primaryText text-sm font-medium">
            I confirm all of the above
          </span>
        </label>
        <div
          role="radiogroup"
          aria-label="Vouch method"
          className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2"
        >
          {METHOD_OPTIONS.map((option) => {
            const selected = method === option.value;
            const Icon = option.Icon;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setMethod(option.value)}
                disabled={isSubmitting}
                className={cn(
                  "rounded-card border p-4 text-center transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50",
                  selected
                    ? "border-peach bg-peach/10"
                    : "border-stroke hover:border-peach/40",
                )}
              >
                <span className="text-primaryText flex items-center justify-center gap-2 text-sm font-semibold">
                  <Icon className="h-4 w-4 shrink-0 text-peach" />
                  {option.title}
                </span>
                <span className="text-secondaryText mt-1 block text-xs">
                  {option.caption}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <RequestModalActions onReturn={onClose} returnDisabled={isSubmitting}>
        <ActionButton
          className="w-full sm:w-auto sm:min-w-[170px]"
          label="Vouch"
          onClick={() => onVouch(method)}
          disabled={!acknowledged || locked}
          isLoading={isSubmitting}
          tooltip={
            tooltip ??
            (!acknowledged ? "Confirm the statement above to vouch" : undefined)
          }
        />
      </RequestModalActions>
    </>
  );
}
