import StatusIcon from "components/StatusIcon";
import { getStatusColor, getStatusLabel, RequestStatus } from "utils/status";

interface StatusBadgeProps {
  status: RequestStatus;
  size?: "compact" | "large";
  overlay?: boolean;
}

const overlayShell =
  "dark border-white/[0.08] bg-[#2F333D]/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]";
const themedShell =
  "border-black/[0.08] bg-white/90 shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:border-white/[0.08] dark:bg-[#2F333D]/85 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]";

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = "compact",
  overlay = false,
}) => {
  const color = getStatusColor(status);

  return (
    <span
      data-theme={overlay ? "dark" : undefined}
      className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full border font-normal backdrop-blur-sm ${
        overlay ? overlayShell : themedShell
      } ${
        size === "large"
          ? "px-3 py-2 text-sm leading-none"
          : "px-2.5 py-1 text-xs leading-[13px]"
      }`}
    >
      <StatusIcon
        status={status}
        className={size === "large" ? "h-4 w-4" : "h-3 w-3"}
      />
      <span className={`text-status-${color}`}>{getStatusLabel(status)}</span>
    </span>
  );
};

export default StatusBadge;
