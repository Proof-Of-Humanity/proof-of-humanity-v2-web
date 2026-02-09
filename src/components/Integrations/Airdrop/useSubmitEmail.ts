import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useAccount } from "wagmi";
import { useAtlasProvider } from "@kleros/kleros-app";
import { getEmailFlowErrorMessage } from "utils/emailFlowErrors";

interface UseSubmitEmailOptions {
    onSuccess?: (wasUpdated: boolean, variables: { nextEmail: string; isResend?: boolean }) => void;
    onError?: (error: unknown, variables: { nextEmail: string; isResend?: boolean }) => void;
}

export function useSubmitEmail(options?: UseSubmitEmailOptions) {
    const { address } = useAccount();
    const { user, addUser, updateEmail } = useAtlasProvider();

    return useMutation({
        mutationFn: async (args: { nextEmail: string; isResend?: boolean }): Promise<boolean> => {
            if (!address) throw new Error("Wallet not connected");
            const trimmedEmail = args.nextEmail.trim();

            if (user?.email) {
                const isSameEmail = user.email.toLowerCase() === trimmedEmail.toLowerCase();

                // If same email:
                // 1. If explicit resend, allow update (resends verification).
                // 2. If already verified, do nothing (unchanged).
                // 3. If not verified and not explicit resend, we proceed to update.
                if (isSameEmail && !args.isResend) {
                    if (user.isEmailVerified) return false;
                    // If not verified, we allow falling through to updateEmail to trigger a resend/update
                }

                const updated = await updateEmail({ newEmail: trimmedEmail });
                if (!updated) throw new Error("Failed to update email");
                return true;
            }

            try {
                const added = await addUser({ email: trimmedEmail });
                if (!added) throw new Error("Failed to save email");
            } catch {
                const updated = await updateEmail({ newEmail: trimmedEmail });
                if (!updated) throw new Error("Failed to update email");
            }
            return true;
        },
        onSuccess: (wasUpdated, variables) => {
            if (variables?.isResend) {
                if (wasUpdated) {
                    toast.success("Verification email resent. Check your inbox and spam folder.");
                } else {
                    toast.info("Verification email is already pending for this address.");
                }
            } else if (wasUpdated) {
                toast.success("Email saved! Check your inbox to verify.");
            } else {
                if (user?.isEmailVerified) {
                    toast.info("Email is already verified with this address.");
                } else {
                    toast.info("Email is already set to this address.");
                }
            }

            options?.onSuccess?.(wasUpdated, variables);
        },
        onError: (err, variables) => {
            toast.error(getEmailFlowErrorMessage(err, { isResend: variables?.isResend }));
            options?.onError?.(err, variables);
        },
    });
}
