interface LoadingSpinnerProps {
  message?: string;
  size?: "small" | "medium" | "large";
  color?: "white" | "orange";
}

export default function LoadingSpinner({
  message,
  size = "medium",
  color = "orange",
}: LoadingSpinnerProps) {
  const sizeClass = {
    small: "w-4 h-4",
    medium: "w-6 h-6",
    large: "w-8 h-8",
  }[size];

  const colorClass = {
    white: "border-white",
    orange: "border-orange-400",
  }[color];

  return (
    <div className="flex flex-col items-center">
      <span
        className={`inline-block ${sizeClass} border-2 border-t-transparent ${colorClass} mb-2 animate-spin rounded-full`}
      ></span>
      {message && <span className="text-secondaryText">{message}</span>}
    </div>
  );
}
