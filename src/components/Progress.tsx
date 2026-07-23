import cn from "classnames";

interface ProgressProps {
  value: number;
  label: string;
  labelClassName?: string;
}

const Progress: React.FC<ProgressProps> = ({
  value,
  label,
  labelClassName,
}) => (
  <div className="mt-4 flex flex-col items-center gap-3">
    <div
      className={cn(
        "text-secondaryText text-center text-xs font-normal",
        labelClassName,
      )}
    >
      {label}
    </div>
    <div className="h-2 w-full overflow-hidden rounded-full bg-[#DDDDDD]">
      <div
        className="h-full rounded-full bg-[#79FFDC] transition-[width] duration-200"
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);

export default Progress;
