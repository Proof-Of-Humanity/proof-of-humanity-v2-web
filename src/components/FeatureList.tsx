"use client";
import React from "react";
import CheckCircleIcon from "icons/CheckCircle.svg";
import { addLinkToText } from "./addLinkToText";

export interface FeatureItem {
  text: string;
  /** Only a check icon is rendered; widen this union only alongside an icon switch. */
  iconType?: "check";
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
  iconClassName = "text-status-registered",
  spacing = "normal",
  textClassName = "text-primaryText text-base leading-[1.36] whitespace-pre-line",
}) => (
  <div className={`${spacingMap[spacing]} ${className}`}>
    {items.map((item, index) => (
      <div key={index} className={`flex items-start gap-2 ${textClassName}`}>
        <div
          aria-hidden
          className="flex h-[1lh] flex-shrink-0 items-center"
        >
          <CheckCircleIcon
            width={iconWidth}
            height={iconHeight}
            className={iconClassName}
          />
        </div>
        <span className="min-w-0 flex-1">{addLinkToText(item.text)}</span>
      </div>
    ))}
  </div>
);

export default FeatureList;
