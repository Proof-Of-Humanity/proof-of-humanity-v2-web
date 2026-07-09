import cn from "classnames";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
  small?: boolean;
}

function Switch({ checked, onChange, label, className, small }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative shrink-0 rounded-full border transition-colors duration-200 ease-premium",
        small ? "h-4 w-8" : "h-6 w-12",
        checked
          ? "border-[#FFB08A] bg-[#FFB08A]"
          : "border-[#3A3E48] bg-[#292D35]",
        className,
      )}
    >
      <span
        className={cn(
          "absolute top-1/2 -translate-y-1/2 rounded-full bg-white transition-transform duration-200 ease-premium",
          small ? "h-3 w-3" : "h-5 w-5",
          checked
            ? small
              ? "translate-x-[17px]"
              : "translate-x-[25px]"
            : "translate-x-[1px]",
        )}
      />
    </button>
  );
}

export default Switch;
