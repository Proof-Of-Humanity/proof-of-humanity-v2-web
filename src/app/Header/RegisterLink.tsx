"use client";

import { useAppKit } from "@reown/appkit/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAccount } from "wagmi";
import { prettifyId } from "utils/identifier";

interface RegisterLinkProps {
  me: any;
  address?: `0x${string}`;
  pathname: string;
  className?: string;
  pendingRegisterIntent: boolean;
  setPendingRegisterIntent: (value: boolean) => void;
}

const RegisterLink = ({ 
  me, 
  address, 
  pathname, 
  className, 
  pendingRegisterIntent, 
  setPendingRegisterIntent 
}: RegisterLinkProps) => {
  const modal = useAppKit();
  const { isConnected } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (pendingRegisterIntent && isConnected && address) {
      setPendingRegisterIntent(false);

      const registerUrl = me?.currentRequest
        ? `/${prettifyId(me.currentRequest.humanity.id)}/${me.currentRequest.chain.name}/${me.currentRequest.index}`
        : `/${prettifyId(address)}/claim`;

      const isClaimRoute = registerUrl.includes("/claim");
      if (isClaimRoute) {
        const opened = window.open(registerUrl, "_blank", "noopener,noreferrer");
        if (!opened) router.push(registerUrl);
      } else {
        router.push(registerUrl);
      }
    }
  }, [pendingRegisterIntent, isConnected, address, me, router, setPendingRegisterIntent]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isConnected) {
      e.preventDefault();
      setPendingRegisterIntent(true);
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
