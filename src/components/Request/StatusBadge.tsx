import { twMerge } from "tailwind-merge";
import StatusIcon from "components/StatusIcon";
import type { RequestStatus } from "utils/status";

interface StatusBadgeProps {
  color: string;
  label: string;
  status: RequestStatus;
  large?: boolean;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  color,
  label,
  status,
  large = false,
  className,
}) => (
  <span
    className={twMerge(
      "inline-flex items-center whitespace-nowrap rounded-full border border-white/[0.08] bg-[#2F333D]/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-sm",
      large
        ? "gap-3 px-5 py-2.5 text-base font-semibold"
        : "gap-2 px-2.5 py-1 text-xs font-normal leading-[13px]",
      className,
    )}
  >
    <StatusIcon status={status} className={large ? "h-4 w-4" : "h-3 w-3"} />
    <span className={`text-status-${color}`}>{label}</span>
  </span>
);

export default StatusBadge;
