"use client";

import withClientConnected from "components/HighOrder/withClientConnected";
import useWeb3Loaded from "hooks/useWeb3Loaded";
import Link from "next/link";
import { prettifyId } from "utils/identifier";
import { Address, Hash } from "viem";
import { useAccount } from "wagmi";

interface RenewProps extends JSX.IntrinsicAttributes {
  pohId: Hash;
  claimer: Address;
}

export default withClientConnected<RenewProps>(function Renew({
  pohId,
  claimer,
}) {
  const web3Loaded = useWeb3Loaded();
  const { address } = useAccount();

  if (!web3Loaded || claimer !== address?.toLowerCase()) return null;

  return (
    <Link className="btn-main mb-4 mt-6" href={`/${prettifyId(pohId)}/claim`}>
      Renew
    </Link>
  );
});
