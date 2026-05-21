import cn from "classnames";
import { twMerge } from "tailwind-merge";

interface StatusBadgeProps {
  color: string;
  label: string;
  large?: boolean;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  color,
  label,
  large = false,
  className,
}) => (
  <span
    className={twMerge(
      "bg-grey border-stroke inline-flex items-center whitespace-nowrap rounded-full border font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]",
      large ? "gap-3 px-5 py-2.5 text-base" : "gap-2.5 px-3.5 py-1.5 text-xs",
      className,
    )}
  >
    <span
      className={cn(
        "relative flex shrink-0 items-center justify-center",
        large ? "h-2.5 w-2.5" : "h-2 w-2",
        `text-status-${color}`,
      )}
    >
      <span
        className={cn(
          "absolute rounded-full bg-current opacity-30 blur-[3px]",
          large ? "h-4 w-4" : "h-3.5 w-3.5",
        )}
      />
      <span
        className={cn(
          "relative rounded-full bg-current",
          large ? "h-2.5 w-2.5" : "h-2 w-2",
        )}
      />
    </span>
    <span className={`text-status-${color}`}>{label}</span>
  </span>
);

export default StatusBadge;
