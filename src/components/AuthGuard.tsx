import { useAtlasProvider } from "@kleros/kleros-app";
import SignInButton, { SignInButtonProps } from "./SignInButton";
import React from "react";

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  signInButtonProps?: SignInButtonProps;
}

const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  fallback,
  signInButtonProps,
}) => {
  const { isVerified } = useAtlasProvider();

  const defaultFallback = <SignInButton {...signInButtonProps} />;

  return <>{isVerified ? children : (fallback ?? defaultFallback)}</>;
};

export default AuthGuard; 