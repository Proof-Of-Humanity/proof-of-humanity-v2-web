import { useMemo, useState } from "react";
import { useAtlasProvider } from "@kleros/kleros-app";
import { toast } from "react-toastify";
import { useSubmitEmail } from "components/Integrations/Airdrop/useSubmitEmail";
import { useSettingsPopover } from "context/SettingsPopoverContext";
import useIsSubscribed from "hooks/useIsSubscribed";
import { isValidEmailAddress } from "utils/validators";

/**
 * Owns all state and logic for the settings popover: the email draft, its
 * validation, the post-update cooldown, and the save / resend / unsubscribe
 * actions. SettingsPopover consumes this and stays purely presentational.
 */
export const useEmailSettings = () => {
  const { isOpen, closeSettingsPopover, toggleSettingsPopover } =
    useSettingsPopover();

  const {
    isVerified,
    isUpdatingUser,
    isAddingUser,
    isDeletingUser,
    isFetchingUser,
    user,
    deleteUser,
  } = useAtlasProvider();

  // Resolves without a signed-in session, so the nudge can be shown to anyone
  // with a wallet connected.
  const { isSubscribed: isWalletSubscribed, refetch: refetchSubscription } =
    useIsSubscribed();

  const savedEmail = user?.email ?? "";

  const [email, setEmail] = useState<string>(savedEmail);
  const [prevSavedEmail, setPrevSavedEmail] = useState(savedEmail);
  const [isUnsubscribeModalOpen, setIsUnsubscribeModalOpen] = useState(false);

  if (savedEmail !== prevSavedEmail) {
    setPrevSavedEmail(savedEmail);
    setEmail(savedEmail);
  }

  const trimmedEmail = email.trim();

  const isEmailValid = useMemo(
    () => trimmedEmail.length === 0 || isValidEmailAddress(trimmedEmail),
    [trimmedEmail],
  );

  const validFutureUpdateDate = useMemo(() => {
    if (!savedEmail || !user?.emailUpdateableAt) return null;

    const updateableAt = new Date(user.emailUpdateableAt);
    if (Number.isNaN(updateableAt.getTime()) || updateableAt <= new Date()) {
      return null;
    }

    return updateableAt;
  }, [savedEmail, user?.emailUpdateableAt]);

  const minutesUntilUpdateable = validFutureUpdateDate
    ? Math.max(
        1,
        Math.round((validFutureUpdateDate.getTime() - Date.now()) / 60000),
      )
    : 0;

  const {
    mutate: submitEmail,
    isPending: isSubmitting,
    variables: submitVariables,
  } = useSubmitEmail({
    onSuccess: () => closeSettingsPopover(),
  });

  const isBusy = [
    isSubmitting,
    isUpdatingUser,
    isAddingUser,
    isDeletingUser,
    isFetchingUser,
  ].some(Boolean);

  const isResend = Boolean(submitVariables?.isResend);
  const isResending = isSubmitting && isResend;
  const isSavingEmail = isSubmitting && !isResend;

  // Save is enabled only when the user has typed a different, valid email and
  // we're not mid-request or inside the post-update cooldown window. This single
  // condition covers both new users (no saved email yet) and existing users
  // changing their address.
  const isSaveDisabled =
    !trimmedEmail ||
    !isEmailValid ||
    isBusy ||
    savedEmail === trimmedEmail ||
    Boolean(validFutureUpdateDate);

  const showEmailError = !isEmailValid && trimmedEmail !== "";
  const isEmailVerified = Boolean(user?.isEmailVerified);
  const hasVerifiedEmail = Boolean(savedEmail) && isEmailVerified;
  const showVerificationNotice = Boolean(savedEmail) && !isEmailVerified;

  const isSubscribed = hasVerifiedEmail || isWalletSubscribed;

  const cooldownTooltip = validFutureUpdateDate
    ? `You can update email in ${minutesUntilUpdateable} ${
        minutesUntilUpdateable === 1 ? "minute" : "minutes"
      }`
    : undefined;

  const saveEmail = () => {
    if (isSaveDisabled) return;
    submitEmail({ nextEmail: trimmedEmail });
  };

  // Discard any unsaved edit so reopening shows the saved email. Used both for
  // the Escape key and for any other way the popover gets closed.
  const closeAndDiscardChanges = () => {
    closeSettingsPopover();
    setEmail(savedEmail);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveEmail();
    } else if (e.key === "Escape") {
      e.preventDefault();
      closeAndDiscardChanges();
    }
  };

  const resendVerification = () => {
    if (!savedEmail) return;
    submitEmail({ nextEmail: savedEmail, isResend: true });
  };

  const confirmUnsubscribe = async () => {
    try {
      const deleted = await deleteUser();
      if (!deleted) throw new Error("Failed to unsubscribe");
      await refetchSubscription();
      toast.success("You have been unsubscribed from PoH notifications.");
      setIsUnsubscribeModalOpen(false);
      closeSettingsPopover();
    } catch {
      toast.error("Failed to unsubscribe. Please try again.");
    }
  };

  return {
    // popover visibility
    isOpen,
    toggleSettingsPopover,
    closeAndDiscardChanges,
    isVerified,
    isSubscribed,
    // email field
    email,
    setEmail,
    showEmailError,
    hasSavedEmail: Boolean(savedEmail),
    hasVerifiedEmail,
    handleKeyDown,
    // verification notice
    showVerificationNotice,
    canResend: !validFutureUpdateDate,
    isBusy,
    isResending,
    minutesUntilUpdateable,
    resendVerification,
    // save button
    isSavingEmail,
    isSaveDisabled,
    cooldownTooltip,
    saveEmail,
    // unsubscribe
    isUnsubscribeModalOpen,
    openUnsubscribeModal: () => setIsUnsubscribeModalOpen(true),
    closeUnsubscribeModal: () => setIsUnsubscribeModalOpen(false),
    confirmUnsubscribe,
    isDeleting: isDeletingUser,
  };
};
