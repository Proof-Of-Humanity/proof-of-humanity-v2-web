"use client";

import { useState } from "react";
import Modal from "components/Modal";
import InfoIcon from "icons/info.svg";
import Image from "next/image";

interface InfoProps {
  nbRequests: number;
  label: string;
}

export default function Info({ nbRequests, label }: InfoProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <span
        className="flex cursor-pointer gap-x-[4px] text-slate-500 hover:text-slate-700"
        onClick={() => setIsOpen(true)}
      >
        {label}&nbsp;
        <InfoIcon className="h-6 w-6 stroke-slate-500 stroke-2 hover:stroke-slate-700" />
      </span>
      <Modal
        formal
        className="flex flex-col p-8"
        open={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <Image
          alt="poh id"
          src="/logo/pohid.svg"
          className="mx-auto mb-8"
          height={128}
          width={128}
        />
        <p className="text-primaryText">
          The Proof of Humanity ID is a soulbound ID. It corresponds to each
          unique human registered on Proof of Humanity.
        </p>
        <p className="text-primaryText">
          This POH ID had <strong>{nbRequests} requests</strong> claimed in this
          chain
        </p>
      </Modal>
    </>
  );
}
