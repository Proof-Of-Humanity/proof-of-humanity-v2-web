"use client";

import Link from "next/link";
import { prettifyId } from "utils/identifier";
import { Address, Hash } from "viem";
import { useAccount } from "wagmi";

interface RenewProps {
  pohId: Hash;
  claimer: Address;
}

export default function Renew({ pohId, claimer }: RenewProps) {
  const { address } = useAccount();

  if (claimer !== address?.toLowerCase()) return null;

  return (
    <Link
      className="btn-primary w-[170px] whitespace-nowrap"
      href={`/${prettifyId(pohId)}/claim`}
      target="_blank"
      rel="noopener noreferrer"
    >
      Renew
    </Link>
  );
}
