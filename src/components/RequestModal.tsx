"use client";

import Modal from "components/Modal";
import ActionButton from "components/ActionButton";
import type { ReactNode } from "react";

interface RequestModalProps {
  open: boolean;
  onClose: () => void;
  canClose?: boolean;
  children: ReactNode;
  className?: string;
}

export default function RequestModal({
  open,
  onClose,
  canClose,
  children,
  className,
}: RequestModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      canClose={canClose}
      className={`max-h-[calc(100vh-2rem)] !w-[calc(100vw-2rem)] max-w-[800px] overflow-hidden ${className ?? ""}`}
    >
      <div className="text-primaryText max-h-[calc(100vh-2rem)] w-full overflow-y-auto p-4 sm:p-8">
        {children}
      </div>
    </Modal>
  );
}

export function RequestModalHeader({
  title,
  description,
}: {
  title: ReactNode;
  description?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <h2 className="text-2xl font-semibold leading-tight">{title}</h2>
      {description && (
        <div className="text-secondaryText max-w-[46rem] text-sm font-normal leading-[normal]">
          {description}
        </div>
      )}
    </div>
  );
}

export function RequestModalActions({
  onReturn,
  returnDisabled,
  returnLabel = "Return",
  children,
}: {
  onReturn: () => void;
  returnDisabled?: boolean;
  returnLabel?: string;
  children?: ReactNode;
}) {
  return (
    <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
      {children}
      <ActionButton
        className="w-full sm:w-auto sm:min-w-[170px]"
        label={returnLabel}
        onClick={onReturn}
        disabled={returnDisabled}
        variant="secondary"
      />
    </div>
  );
}

export function RequestAmountPill({
  amount,
  icon,
}: {
  amount: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="border-stroke bg-whiteBackground inline-flex min-h-14 items-center justify-center gap-2 rounded-input border px-8 py-4 text-base font-semibold">
      <span>{amount}</span>
      {icon}
    </div>
  );
}

export function RequestWarning({ children }: { children: ReactNode }) {
  return (
    <div className="mt-6 flex items-center gap-4 rounded-input border border-[#FFE16B] px-5 py-5 text-left sm:px-6">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#FFE16B] text-[#1E2129]">
        <span className="text-base font-bold leading-none">!</span>
      </span>
      <div className="text-primaryText text-sm font-normal leading-[normal]">
        <strong className="block text-base font-semibold text-[#FFE16B]">
          Important!
        </strong>
        {children}
      </div>
    </div>
  );
}
