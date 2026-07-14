import { twMerge } from "tailwind-merge";

interface MediaFallbackProps {
  error?: boolean;
  label?: string;
  className?: string;
}

export default function MediaFallback({
  error = false,
  label,
  className,
}: MediaFallbackProps) {
  if (error) {
    return (
      <div
        className={twMerge(
          "bg-grey text-secondaryText flex items-center justify-center p-4 text-center text-sm",
          className,
        )}
      >
        {label}
      </div>
    );
  }

  return <div className={twMerge("bg-grey animate-pulse", className)} />;
}
