import Popover from "components/Popover";

interface DropdownProps {
  title: string;
  children: React.ReactNode;
}

const Dropdown: React.FC<DropdownProps> = ({ title, children }) => (
  <Popover
    trigger={
      <button className="text-primaryText border-stroke bg-whiteBackground w-64 rounded border p-2">
        {title}
      </button>
    }
  >
    <div className="bg-whiteBackground text-primaryText flex flex-col">
      {children}
    </div>
  </Popover>
);

export default Dropdown;
