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

interface JurorAlertsModalProps {
  open: boolean;
  onClose: () => void;
}

export default function JurorAlertsModal({ open, onClose }: JurorAlertsModalProps) {
  const [step, setStep] = useState<ModalStep>("warning");
  const [acknowledged, setAcknowledged] = useState(false);
  const [email, setEmail] = useState("");
  const wasOpen = useRef(false);
  const {
    isAddingUser,
    isUpdatingUser,
  } = useAtlasProvider();

  const trimmedEmail = email.trim();
  const isEmailValid = trimmedEmail.length === 0 ? true : isValidEmailAddress(trimmedEmail);

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
    <Modal open={open} onClose={handleModalClose} formal header="Action required">
      {step === "warning" ? (
        <div className="p-6">
          <ul className="space-y-3 mb-6">
            <li className="flex items-start gap-2">
              <div className="mt-2 h-1.5 w-1.5 rounded-full bg-primaryText flex-shrink-0" />
              <span className="text-primaryText text-sm">
                You&apos;re now staked and may be drawn as a juror.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <WarningCircle16Icon width={16} height={16} className="fill-orange flex-shrink-0 mt-0.5" />
              <span className="text-orange text-sm">
                If you&apos;re drawn and miss the vote deadline, you can lose locked stake.
              </span>
            </li>
          </ul>

          <ActionButton
            onClick={() => setStep("email")}
            label="Enable Juror Alerts (important)"
            variant="primary"
            className="w-full py-3 mb-4"
          />

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px border-t border-stroke" />
            <span className="text-secondaryText text-xs uppercase">or</span>
            <div className="flex-1 h-px border-t border-stroke" />
          </div>

          <label className="flex items-start gap-2 mb-4 cursor-pointer">
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
                className="text-orange hover:underline font-medium"
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
            className="w-full py-3"
          />
        </div>
      ) : (
        <div className="p-6">
          <ul className="space-y-3 mb-6">
            <li className="flex items-start gap-2">
              <div className="mt-2 h-1.5 w-1.5 rounded-full bg-primaryText flex-shrink-0" />
              <span className="text-primaryText text-sm">
                You&apos;re now staked and may be drawn as a juror.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <WarningCircle16Icon width={16} height={16} className="fill-orange flex-shrink-0 mt-0.5" />
              <span className="text-orange text-sm">
                If you&apos;re drawn and miss the vote deadline, you can lose locked stake.
              </span>
            </li>
          </ul>

          <div className="mb-2">
            <label className="text-primaryText text-sm font-semibold block mb-2">
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
              <p className="mt-1 text-xs text-red-500">Please enter a valid email</p>
            )}
          </div>

          <AuthGuard signInButtonProps={{ className: "w-full py-3 mt-4" }}>
            <ActionButton
              onClick={handleSubmit}
              label="Enable Alerts"
              disabled={!trimmedEmail || !isEmailValid || isBusy}
              isLoading={isBusy}
              variant="primary"
              className="w-full py-3 mt-4"
            />
          </AuthGuard>

          <button
            onClick={() => setStep("warning")}
            className="mt-4 w-full text-center text-secondaryText text-sm hover:text-primaryText transition"
          >
            &larr; Go back
          </button>
        </div>
      )}
    </Modal>
  );
}
