"use client";

import useWeb3Loaded from "hooks/useWeb3Loaded";
import Link from "next/link";
import { prettifyId } from "utils/identifier";
import { Address, Hash } from "viem";
import { useAccount } from "wagmi";

interface RenewProps {
  pohId: Hash;
  claimer: Address;
  className?: string;
}

export default function Renew({ pohId, claimer, className }: RenewProps) {
  const web3Loaded = useWeb3Loaded();
  const { address } = useAccount();

  if (!web3Loaded || claimer !== address?.toLowerCase()) return null;

  return (
    <Link
      className={`btn-primary ${className ?? ""}`}
      href={`/${prettifyId(pohId)}/claim`}
      target="_blank"
      rel="noopener noreferrer"
    >
      Renew
    </Link>
  );
}
