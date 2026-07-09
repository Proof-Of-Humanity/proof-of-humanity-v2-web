import cn from "classnames";

interface DropdownItemProps {
  icon?: React.ReactNode;
  selected: boolean;
  name: string;
  onSelect: () => void;
}

const DropdownItem: React.FC<DropdownItemProps> = ({
  icon,
  selected,
  name,
  onSelect,
}) => (
  <span
    className={cn(
      "flex min-h-9 cursor-pointer items-center border-l-2 px-4 py-1.5 text-sm transition-colors duration-200",
      selected
        ? "border-l-[#FFB08A] bg-[#3A3E48]"
        : "border-l-transparent hover:bg-[#2F333D]",
    )}
    onClick={onSelect}
  >
    {icon}
    {name}
  </span>
);

export default DropdownItem;
