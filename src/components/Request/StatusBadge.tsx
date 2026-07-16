import StatusIcon from "components/StatusIcon";
import { getStatusColor, getStatusLabel, RequestStatus } from "utils/status";

interface StatusBadgeProps {
  status: RequestStatus;
  size?: "compact" | "large";
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = "compact",
}) => {
  const color = getStatusColor(status);

  return (
    <span
      className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-white/[0.08] bg-[#2F333D]/85 font-normal shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-sm ${
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
