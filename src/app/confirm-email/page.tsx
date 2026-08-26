"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useAtlasProvider } from "@kleros/kleros-app";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import WarningCircle from "icons/WarningCircleMajor.svg";
import MinusCircle from "icons/MinusCircleMajor.svg";
import WarningCircleMinor from "icons/WarningCircleMinor.svg";
import MinusCircleMinor from "icons/MinusCircleMinor.svg";
import VerifiedSparkle from "icons/VerifiedSparkle.svg";
import VerifiedCheckOrbit from "icons/VerifiedCheckOrbit.svg";
import ArrowRight from "icons/ArrowRight.svg";
import ActionButton from "components/ActionButton";
import { extractStatusCode } from "utils/errors";

type VerificationStatus =
  | "loading"
  | "success"
  | "expired"
  | "invalid"
  | "error";

const getVerificationErrorDescription = (error: unknown): string => {
  const statusCode = extractStatusCode(error);

  if (statusCode === 401 || statusCode === 403) {
    return "Your verification session expired. Please request a new email link.";
  }
  if (statusCode === 408 || statusCode === 504) {
    return "Verification timed out. Please try again.";
  }
  if (statusCode === 429) {
    return "Too many attempts. Please wait a minute and retry.";
  }
  if (statusCode !== null && statusCode >= 500) {
    return "Verification service is temporarily unavailable. Please try again.";
  }

  return "We could not verify your email right now. Please check your connection and try again.";
};

const ConfirmEmailPage: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { confirmEmail } = useAtlasProvider();
  const queryClient = useQueryClient();
  const [{ address, token }] = useState(() => ({
    address: searchParams.get("address"),
    token: searchParams.get("token"),
  }));

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ["confirmEmail", address, token],
    queryFn: async () => {
      if (!address || !token) {
        throw new Error("Missing address or token");
      }

      try {
        const result = await confirmEmail({ address, token });
        if (result.isConfirmed) {
          queryClient.invalidateQueries({ queryKey: ["UserSettings"] });
          queryClient.invalidateQueries({ queryKey: ["isSubscribed"] });
        }
        return result;
      } finally {
        router.replace("/confirm-email", { scroll: false });
      }
    },
    enabled: !!address && !!token,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const getVerificationStatus = (): VerificationStatus => {
    // Still loading or no params
    if (!address || !token) {
      return "invalid";
    }
    if (isPending) {
      return "loading";
    }
    if (isError || data?.isError) {
      return "error";
    }
    if (data?.isConfirmed) {
      return "success";
    }
    if (data?.isTokenExpired) {
      return "expired";
    }
    if (data?.isTokenInvalid) {
      return "invalid";
    }
    return "invalid";
  };

  const status = getVerificationStatus();

  interface StatusConfig {
    title: string | React.ReactNode;
    description: string;
    titleColor: string;
    icon?: React.ComponentType<{ className?: string }>;
    largeIcon?: React.ComponentType<{ className?: string }>;
    iconClassName?: string;
    largeIconClassName?: string;
    onClick?: () => void;
    buttonText?: React.ReactNode;
    buttonClassName?: string;
  }

  const statusConfig: Record<VerificationStatus, StatusConfig> = {
    loading: {
      title: "Verifying your email...",
      description: "Please wait while we confirm your email address.",
      titleColor: "text-orange",
    },
    success: {
      title: (
        <>
          <span className="text-primaryText">Congratulations! 🎉</span>
          <div className="my-1" />
          Your email has been verified.
        </>
      ),
      description:
        "We'll remind you when your actions are required on PoH, and send you notifications on key moments to help you achieve the best of Proof of Humanity.",
      titleColor: "text-status-registered",
      buttonText: (
        <span className="inline-flex items-center gap-3">
          Let&apos;s get started
          <ArrowRight aria-hidden className="h-3.5 w-3.5 fill-current" />
        </span>
      ),
      buttonClassName: "btn-celebrate",
      icon: VerifiedSparkle,
      largeIcon: VerifiedCheckOrbit,
      iconClassName: "h-[100px] w-[100px]",
      largeIconClassName: "h-[440px] w-[440px] max-w-full",
      onClick: () => {
        router.push("/");
      },
    },
    expired: {
      title: "Verification link expired...",
      description:
        "Oops, this verification link has expired. Return to the app and use Juror Alerts to resend a new verification email.",
      titleColor: "text-status-revocation",
      buttonText: "Go to App",
      icon: WarningCircleMinor,
      largeIcon: WarningCircle,
      onClick: () => {
        router.push("/app");
      },
    },
    invalid: {
      title: "Invalid link!",
      description: "Oops, seems like you followed an invalid link.",
      titleColor: "text-primaryText",
      buttonText: "Contact support",
      icon: MinusCircleMinor,
      largeIcon: MinusCircle,
      onClick: () => {
        window.open(
          "https://t.me/proofhumanity",
          "_blank",
          "noopener,noreferrer",
        );
      },
    },
    error: {
      title: "Could not verify right now",
      description: getVerificationErrorDescription(error),
      titleColor: "text-status-revocation",
      buttonText: "Try Again",
      icon: WarningCircleMinor,
      largeIcon: WarningCircle,
      onClick: () => {
        void refetch();
      },
    },
  };

  const config = statusConfig[status];
  const {
    title,
    description,
    titleColor,
    buttonText,
    buttonClassName,
    onClick,
    icon: IconComponent,
    largeIcon: LargeIconComponent,
    iconClassName,
    largeIconClassName,
  } = config;

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-grow items-center justify-center py-12 lg:mt-24 lg:py-24">
        <div className="mx-auto w-full px-4">
          <div className="grid grid-cols-1 items-center gap-8 lg:mx-10 lg:grid-cols-6 lg:gap-12 xl:mx-20">
            {/* Content Section */}
            <div className="flex flex-col items-center space-y-8 text-center lg:col-span-3 lg:items-start lg:text-left">
              {IconComponent && (
                <div className="flex justify-center lg:justify-start">
                  <IconComponent className={iconClassName} />
                </div>
              )}

              <h1
                className={`text-2xl font-semibold md:text-3xl lg:text-4xl ${titleColor} leading-tight`}
              >
                {title}
              </h1>

              <p className="text-secondaryText w-full max-w-xl text-base leading-relaxed md:text-lg">
                {description}
              </p>

              {onClick && buttonText && (
                <ActionButton
                  onClick={onClick}
                  label={buttonText}
                  className={`px-8 py-3 ${buttonClassName ?? ""}`}
                />
              )}
            </div>

            {/* Decorative Icon Section */}
            {LargeIconComponent && (
              <div className="flex items-center justify-center lg:col-span-3 lg:justify-end">
                <LargeIconComponent className={largeIconClassName} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmEmailPage;
