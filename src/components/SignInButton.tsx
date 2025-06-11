import { useAtlasProvider } from "@kleros/kleros-app";
import { toast } from "react-toastify";
import ActionButton, { ActionButtonProps } from "./ActionButton";
import { twMerge } from "tailwind-merge";

export interface SignInButtonProps extends Omit<ActionButtonProps, 'onClick' | 'label'> {
  label?: string;
}

const SignInButton: React.FC<SignInButtonProps> = ({
  label = "Sign In",
  className,
  ...restProps
}) => {
  const { isSigningIn, authoriseUser } = useAtlasProvider();

  const handleSignIn = async () => {
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
        className: twMerge("px-5 py-2", className),
        isLoading: isSigningIn,
        label: isSigningIn ? "Signing In..." : label,
        onClick: handleSignIn,
      }}
    />
  );
};

export default SignInButton; 