"use client";

import { useAppKit } from "@reown/appkit/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
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
  const navigateToRegister = useCallback(
    (url: string) => {
      // Claim flow must open as a full document in a new tab for cross-origin isolation.
      if (url.includes("/claim")) {
        window.open(url, "_blank", "noopener,noreferrer");
        return;
      }
      router.push(url);
    },
    [router],
  );

  useEffect(() => {
    if (pendingRegisterIntent && isConnected && address) {
      setPendingRegisterIntent(false);

      const registerUrl = me?.currentRequest
        ? `/${prettifyId(me.currentRequest.humanity.id)}/${me.currentRequest.chain.name}/${me.currentRequest.index}`
        : `/${prettifyId(address)}/claim`;

      navigateToRegister(registerUrl);
    }
  }, [pendingRegisterIntent, isConnected, address, me, navigateToRegister, setPendingRegisterIntent]);

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
