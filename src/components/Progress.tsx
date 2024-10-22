interface ProgressProps {
  value: number;
  label: string;
}

const Progress: React.FC<ProgressProps> = ({ value, label }) => (
  <div className="mt-2 flex flex-col items-center">
    <div className="mb-1">{label}</div>
    <div className="mb-4 h-2 w-full rounded-full bg-slate-200">
      <div
        className="h-full rounded-full bg-lime-500"
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);

export default Progress;
