"use client";

import { useAppKit } from "@reown/appkit/react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { prettifyId } from "utils/identifier";

interface RegisterLinkProps {
  me: any;
  address?: `0x${string}`;
  className?: string;
}

const RegisterLink = ({ 
  me, 
  address, 
  className
}: RegisterLinkProps) => {
  const modal = useAppKit();
  const { isConnected } = useAccount();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isConnected) {
      e.preventDefault();
      modal.open({ view: "Connect" });
    }
  };

  if (me?.pohId) {
    return (
      <Link
        href={`/${prettifyId(me.pohId)}`}
        className={className}
      >
        PoH ID
      </Link>
    );
  }

  const registerUrl = isConnected && address
    ? (me?.currentRequest
        ? `/${prettifyId(me.currentRequest.humanity.id)}/${me.currentRequest.chain.name}/${me.currentRequest.index}`
        : `/${prettifyId(address)}/claim`)
    : "#"; // Use # as placeholder when not connected
  const shouldOpenInNewTab = registerUrl.includes("/claim");

  return (
    <Link
      href={registerUrl}
      onClick={handleClick}
      className={className}
      target={shouldOpenInNewTab ? "_blank" : undefined}
      rel={shouldOpenInNewTab ? "noopener noreferrer" : undefined}
    >
      Register
    </Link>
  );
};

export default RegisterLink;
