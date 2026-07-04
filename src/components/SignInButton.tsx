import { useAtlasProvider } from "@kleros/kleros-app";
import { useAppKit } from "@reown/appkit/react";
import { toast } from "react-toastify";
import ActionButton, { ActionButtonProps } from "./ActionButton";
import { useAccount } from "wagmi";

export interface SignInButtonProps
  extends Omit<ActionButtonProps, "onClick" | "label"> {
  label?: string;
}

const SignInButton: React.FC<SignInButtonProps> = ({
  label = "Sign In",
  ...restProps
}) => {
  const { isSigningIn, authoriseUser } = useAtlasProvider();
  const { isConnected } = useAccount();
  const modal = useAppKit();

  const handleSignIn = async () => {
    if (!isConnected) {
      await modal.open({ view: "Connect" });
      return;
    }

    try {
      await authoriseUser();
      toast.success("Successfully Signed In");
    } catch (error) {
      toast.error("Failed to sign in");
    }
  };

  return (
    <ActionButton
      {...{
        ...restProps,
        isLoading: isSigningIn,
        label: !isConnected
          ? "Connect Wallet"
          : isSigningIn
            ? "Signing In..."
            : label,
        onClick: handleSignIn,
      }}
    />
  );
};

export default SignInButton;
