"use client";
import React from "react";
import { twMerge } from "tailwind-merge";
import CheckCircleIcon from "icons/CheckCircle.svg";
import { addLinkToText } from "./addLinkToText";

interface FeatureListProps {
  items: string[];
  className?: string;
  iconClassName?: string;
  textClassName?: string;
}

const FeatureList: React.FC<FeatureListProps> = ({
  items,
  className = "",
  iconClassName = "",
  textClassName = "text-primaryText text-base leading-[1.36] whitespace-pre-line",
}) => (
  <ul className={twMerge("space-y-3", className)}>
    {items.map((text) => (
      <li key={text} className="flex items-start gap-2">
        <div className="mt-1 flex-shrink-0" aria-hidden>
          <CheckCircleIcon width={16} height={16} className={iconClassName} />
        </div>
        <div className="flex-1">
          <span className={textClassName}>{addLinkToText(text)}</span>
        </div>
      </li>
    ))}
  </ul>
);

export default FeatureList;
