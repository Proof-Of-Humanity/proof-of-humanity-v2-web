"use client";

import { useAppKit } from "@reown/appkit/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAccount } from "wagmi";
import { prettifyId } from "utils/identifier";
import { MeData } from "data/user";

interface RegisterLinkProps {
  me: MeData | undefined;
  address?: `0x${string}`;
  className?: string;
  pendingRegisterIntent?: boolean;
  setPendingRegisterIntent?: (value: boolean) => void;
}

const RegisterLink = ({
  me,
  address,
  className,
  pendingRegisterIntent = false,
  setPendingRegisterIntent,
}: RegisterLinkProps) => {
  const modal = useAppKit();
  const router = useRouter();
  const { isConnected } = useAccount();

  useEffect(() => {
    if (!pendingRegisterIntent || !isConnected || !address) return;

    setPendingRegisterIntent?.(false);
    const registerUrl = me?.currentRequest
      ? `/${prettifyId(me.currentRequest.humanity.id)}/${me.currentRequest.chain.name}/${me.currentRequest.index}`
      : `/${prettifyId(address)}/claim`;

    if (registerUrl.includes("/claim")) {
      window.open(registerUrl, "_blank", "noopener,noreferrer");
      return;
    }

    router.push(registerUrl);
  }, [address, isConnected, me, pendingRegisterIntent, router, setPendingRegisterIntent]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isConnected) {
      e.preventDefault();
      setPendingRegisterIntent?.(true);
      modal.open({ view: "Connect" });
    }
  };

  if (me?.pohId && typeof me.pohId === "string") {
    return (
      <Link
        href={`/${prettifyId(me.pohId as `0x${string}`)}`}
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
    : "#";
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
