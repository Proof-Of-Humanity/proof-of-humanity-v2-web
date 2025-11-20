import CircleCancel from "icons/CircleCancelMinor.svg";
import CircleTick from "icons/CircleTickMinor.svg";
import WarningIcon from "icons/WarningCircle16.svg";

interface ChecklistItem {
  text: string;
  isValid: boolean;
}

interface ChecklistProps {
  title: string;
  items: ChecklistItem[];
  warning?: string;
}

const Checklist: React.FC<ChecklistProps> = ({ title, items, warning }) => {
  return (
    <div className="bg-whiteBackground mt-4 w-full rounded-lg border border-slate-200 p-6 shadow-sm">
      <div className="mb-3 flex items-center justify-center">
        <WarningIcon className="mr-1" />
        <h3 className="text-orange text-xl font-semibold">{title}</h3>
      </div>
      
      {warning && (
        <p className="text-red-500 mb-6 text-center text-sm font-medium">
          {warning}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-start gap-3">
            {item.isValid ? (
              <CircleTick className="mt-0.5 h-5 w-5 flex-shrink-0 fill-green-500" />
            ) : (
              <CircleCancel className="mt-0.5 h-5 w-5 flex-shrink-0 fill-red-500" />
            )}
            <span className="text-primaryText text-sm leading-relaxed font-medium">{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Checklist;

