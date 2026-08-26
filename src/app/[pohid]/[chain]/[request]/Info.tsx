"use client";

import ActionButton from "components/ActionButton";
import RequestModal, { RequestModalHeader } from "components/RequestModal";
import InfoIcon from "icons/info.svg";
import { useState } from "react";

interface InfoProps {
  nbRequests: number;
  label: string;
}

export default function Info({ nbRequests, label }: InfoProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 text-sm font-normal text-peach hover:opacity-80"
      >
        {label}
        <InfoIcon className="h-4 w-4 shrink-0 stroke-current stroke-2" />
      </button>
      <RequestModal open={open} onClose={() => setOpen(false)}>
        <RequestModalHeader
          title={
            <>
              What is a <span className="text-peach">PoH ID</span>?
            </>
          }
          description={
            <div className="flex flex-col gap-4 text-center">
              <p>
                A PoH ID is a unique, non-transferable identity for a verified
                human on Proof of Humanity.
              </p>
              <p>
                For a first registration, it is normally derived from the
                registering wallet address. The identifier stays attached to the
                human and can be reclaimed from a different wallet when the
                protocol&apos;s recovery conditions are met.
              </p>
              <p>
                This POH ID had {nbRequests} requests claimed in this chain.
              </p>
            </div>
          }
        />
        <div className="mt-8 flex justify-center">
          <ActionButton
            label="Got it"
            onClick={() => setOpen(false)}
            className="w-full sm:w-fit sm:min-w-[170px]"
          />
        </div>
      </RequestModal>
    </>
  );
}
