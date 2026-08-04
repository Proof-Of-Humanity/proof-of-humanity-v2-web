"use client";
import React from "react";
import CheckCircleIcon from "icons/CheckCircle.svg";
import { addLinkToText } from "./addLinkToText";

export interface FeatureItem {
  text: string;
  iconType?: "check" | "success" | "warning" | "error" | "pending";
}

interface FeatureListProps {
  items: FeatureItem[];
  className?: string;
  iconWidth?: number;
  iconHeight?: number;
  iconClassName?: string;
  spacing?: "compact" | "normal" | "relaxed";
  textClassName?: string;
}

const spacingMap = {
  compact: "space-y-1",
  normal: "space-y-3",
  relaxed: "space-y-4",
};

const FeatureList: React.FC<FeatureListProps> = ({
  items,
  className = "",
  iconWidth = 16,
  iconHeight = 16,
  iconClassName = "",
  spacing = "normal",
  textClassName = "text-primaryText text-base leading-[1.36] whitespace-pre-line",
}) => (
  <div className={`${spacingMap[spacing]} ${className}`}>
    {items.map((item, index) => (
      <div key={index} className="flex items-start gap-2">
        <div className="mt-1 flex-shrink-0">
          <CheckCircleIcon
            width={iconWidth}
            height={iconHeight}
            className={iconClassName}
          />
        </div>
        <div className="flex-1">
          <span className={textClassName}>{addLinkToText(item.text)}</span>
        </div>
      </div>
    ))}
  </div>
);

export default FeatureList;
