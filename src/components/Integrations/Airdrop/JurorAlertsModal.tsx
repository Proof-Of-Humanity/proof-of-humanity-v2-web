"use client";
import React, { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { useAtlasProvider } from "@kleros/kleros-app";

import Modal from "components/Modal";
import ActionButton from "components/ActionButton";
import AuthGuard from "components/AuthGuard";
import ExternalLink from "components/ExternalLink";
import Field from "components/Field";
import WarningCircle16Icon from "icons/WarningCircle16.svg";
import { useSubmitEmail } from "components/Integrations/Airdrop/useSubmitEmail";

import { isValidEmailAddress } from "utils/validators";

type ModalStep = "warning" | "email";

const modalButtonClass =
  "w-auto max-w-full whitespace-nowrap px-5 py-3 text-[clamp(0.7rem,2.4vw,0.875rem)]";

interface JurorAlertsModalProps {
  open: boolean;
  onClose: () => void;
}

function StakeWarning() {
  return (
    <div className="mb-6 space-y-3 text-center">
      <p className="text-primaryText text-sm leading-relaxed">
        You&apos;re now staked and may be drawn as a juror.
      </p>
      <div className="flex flex-col items-center gap-2">
        <WarningCircle16Icon
          width={16}
          height={16}
          className="fill-orange flex-shrink-0"
        />
        <p className="text-orange max-w-xs text-sm leading-relaxed">
          If you&apos;re drawn and miss the vote deadline, you can lose locked
          stake.
        </p>
      </div>
    </div>
  );
}

export default function JurorAlertsModal({
  open,
  onClose,
}: JurorAlertsModalProps) {
  const [step, setStep] = useState<ModalStep>("warning");
  const [acknowledged, setAcknowledged] = useState(false);
  const [email, setEmail] = useState("");
  const wasOpen = useRef(false);
  const { isAddingUser, isUpdatingUser } = useAtlasProvider();

  const trimmedEmail = email.trim();
  const isEmailValid =
    trimmedEmail.length === 0 ? true : isValidEmailAddress(trimmedEmail);

  useEffect(() => {
    if (open && !wasOpen.current) {
      setStep("warning");
      setAcknowledged(false);
      setEmail("");
    }
    wasOpen.current = open;
  }, [open]);

  const handleModalClose = useCallback(() => {
    // Keep "continue without alerts" acknowledgment explicit on warning step.
    if (step === "warning" && !acknowledged) return;
    onClose();
  }, [acknowledged, onClose, step]);

  const { mutate: submitEmail, isPending: isSubmitting } = useSubmitEmail({
    onSuccess: (wasUpdated) => {
      if (!wasUpdated) return;
      onClose();
    },
  });

  const handleSubmit = useCallback(() => {
    if (!trimmedEmail) {
      toast.info("Please enter a valid email");
      return;
    }
    submitEmail({ nextEmail: trimmedEmail });
  }, [trimmedEmail, submitEmail]);

  const isBusy = isSubmitting || isAddingUser || isUpdatingUser;

  return (
    <Modal
      open={open}
      onClose={handleModalClose}
      formal
      header="Action required"
      className="max-w-2xl"
    >
      {step === "warning" ? (
        <div className="flex flex-col items-center p-6 text-center">
          <StakeWarning />

          <ActionButton
            onClick={() => setStep("email")}
            label="Enable Juror Alerts (important)"
            variant="primary"
            className={`mb-4 ${modalButtonClass}`}
          />

          <div className="mb-4 flex w-full items-center gap-3">
            <div className="border-stroke h-px flex-1 border-t" />
            <span className="text-secondaryText text-xs uppercase">or</span>
            <div className="border-stroke h-px flex-1 border-t" />
          </div>

          <label className="mb-4 flex w-full max-w-sm cursor-pointer items-start justify-center gap-2 text-left">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="checkbox mt-0.5 flex-shrink-0"
            />
            <span className="text-primaryText text-sm leading-relaxed">
              I understand I may be selected as a juror and can{" "}
              <ExternalLink
                href="https://docs.kleros.io/products/court/kleros-juror-tutorial#staking-and-cases"
                className="text-orange font-medium hover:underline"
              >
                lose my stake
              </ExternalLink>{" "}
              if I miss voting.
            </span>
          </label>

          <ActionButton
            onClick={handleModalClose}
            label="Continue without alerts"
            variant="secondary"
            disabled={!acknowledged}
            className={modalButtonClass}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center p-6 text-center">
          <StakeWarning />

          <div className="mb-2 w-full text-left">
            <label className="text-primaryText mb-2 block text-sm font-semibold">
              Email address
            </label>
            <Field
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isBusy}
              placeholder="Enter your email"
              className={!isEmailValid ? "!border-red-500" : ""}
            />
            {!isEmailValid && (
              <p className="mt-1 text-xs text-red-500">
                Please enter a valid email
              </p>
            )}
          </div>

          <AuthGuard
            signInButtonProps={{ className: `mt-4 ${modalButtonClass}` }}
          >
            <ActionButton
              onClick={handleSubmit}
              label="Enable Alerts"
              disabled={!trimmedEmail || !isEmailValid || isBusy}
              isLoading={isBusy}
              variant="primary"
              className={`mt-4 ${modalButtonClass}`}
            />
          </AuthGuard>

          <button
            type="button"
            onClick={() => setStep("warning")}
            className="text-secondaryText hover:text-primaryText mt-4 w-full text-center text-sm transition"
          >
            &larr; Go back
          </button>
        </div>
      )}
    </Modal>
  );
}
