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
  <button
    type="button"
    role="menuitemradio"
    aria-checked={selected}
    className={cn(
      "flex min-h-9 cursor-pointer items-center whitespace-nowrap border-l-2 px-4 py-1.5 text-left text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-peach",
      selected
        ? "border-l-[#FFB08A] bg-[#FFF4EC] dark:bg-[#3A3E48]"
        : "border-l-transparent hover:bg-[#FFF7F0] dark:hover:bg-[#2F333D]",
    )}
    onClick={onSelect}
  >
    {icon}
    {name}
  </button>
);

export default DropdownItem;
