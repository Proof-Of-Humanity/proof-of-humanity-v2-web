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
      "text-md flex cursor-pointer items-center rounded p-2",
      selected ? "bg-whiteBackground" : "hover:bg-primaryBackground",
    )}
    onClick={onSelect}
  >
    {icon}
    {name}
  </span>
);

export default DropdownItem;
