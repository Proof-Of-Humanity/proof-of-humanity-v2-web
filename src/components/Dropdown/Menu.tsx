import Popover from "components/Popover";

interface DropdownProps {
  title: string;
  children: React.ReactNode;
}

const Dropdown: React.FC<DropdownProps> = ({ title, children }) => (
  <Popover
    trigger={
      <button className="text-primaryText border-stroke bg-whiteBackground hover:border-orange w-full rounded-input border p-3 shadow-inset transition duration-200 ease-premium sm:w-64">
        {title}
      </button>
    }
  >
    <div className="bg-whiteBackground text-primaryText border-stroke flex flex-col overflow-hidden rounded-2xl border shadow-soft">
      {children}
    </div>
  </Popover>
);

export default Dropdown;
