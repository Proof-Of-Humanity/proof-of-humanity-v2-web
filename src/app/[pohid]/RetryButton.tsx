"use client";

import { useRouter } from "next/navigation";

type RetryButtonProps = {
  label?: string;
  className?: string;
};

export default function RetryButton({
  label = "Try again",
  className,
}: RetryButtonProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      className={className}
      onClick={() => router.refresh()}
    >
      {label}
    </button>
  );
}
