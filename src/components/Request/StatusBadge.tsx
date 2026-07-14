import StatusIcon from "components/StatusIcon";
import { getStatusColor, getStatusLabel, RequestStatus } from "utils/status";

interface StatusBadgeProps {
  status: RequestStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const color = getStatusColor(status);

  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-white/[0.08] bg-[#2F333D]/85 px-2.5 py-1 text-xs font-normal leading-[13px] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-sm">
      <StatusIcon status={status} className="h-3 w-3" />
      <span className={`text-status-${color}`}>{getStatusLabel(status)}</span>
    </span>
  );
};

export default StatusBadge;
