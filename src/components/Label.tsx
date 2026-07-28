import React from "react";
import { twMerge } from "tailwind-merge";

interface LabelProps {
  className?: string;
  children: React.ReactNode;
}

const Label: React.FC<LabelProps> = ({ children, className }) => (
  <legend
    className={twMerge(
      "text-orange mb-2 mt-8 font-medium uppercase",
      className,
    )}
  >
    {children}
  </legend>
);

export default Label;
