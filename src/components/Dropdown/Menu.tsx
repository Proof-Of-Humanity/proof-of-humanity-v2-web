import Popover from "components/Popover";

interface DropdownProps {
  title: string;
  children: React.ReactNode;
}

const Dropdown: React.FC<DropdownProps> = ({ title, children }) => (
  <Popover
    trigger={
      <button className="text-primaryText hover:border-orange w-full rounded-input border border-[rgba(255,255,255,0.08)] bg-[#17141F] p-3 transition duration-200 ease-premium sm:w-64">
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
