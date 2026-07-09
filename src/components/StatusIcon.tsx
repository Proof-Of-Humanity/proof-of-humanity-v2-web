import cn from "classnames";
import { twMerge } from "tailwind-merge";
import ChallengeIcon from "icons/Challenge.svg";
import CheckCircleOutlineIcon from "icons/CheckCircleOutline.svg";
import CloseCircleOutlineIcon from "icons/CloseCircleOutline.svg";
import EyeIcon from "icons/Eye.svg";
import HourglassIcon from "icons/Hourglass.svg";
import NeedsVouchIcon from "icons/NeedsVouch.svg";
import TransferIcon from "icons/Transfer.svg";
import type { ComponentType, SVGProps } from "react";
import { getStatusColor, RequestStatus } from "utils/status";

const STATUS_ICONS: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  vouching: NeedsVouchIcon,
  claim: EyeIcon,
  registered: CheckCircleOutlineIcon,
  challenged: ChallengeIcon,
  rejected: CloseCircleOutlineIcon,
  expired: HourglassIcon,
  transferred: TransferIcon,
  transferring: TransferIcon,
};

interface StatusIconProps {
  status: RequestStatus;
  className?: string;
}

export default function StatusIcon({ status, className }: StatusIconProps) {
  const color = getStatusColor(status);
  const Icon = STATUS_ICONS[color];
  if (Icon)
    return (
      <Icon
        className={twMerge(
          cn("h-3.5 w-3.5 shrink-0", `text-status-${color}`),
          className,
        )}
      />
    );
  return (
    <span
      className={cn(
        "inline-block h-2 w-2 shrink-0 rounded-full",
        color === "white" ? "bg-white" : `bg-status-${color}`,
        className,
      )}
    />
  );
}
