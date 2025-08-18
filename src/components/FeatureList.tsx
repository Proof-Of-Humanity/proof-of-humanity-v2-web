"use client";
import React from "react";
import CheckCircleIcon from "icons/CheckCircle.svg";
import CheckCircleMinorIcon from "icons/CheckCircleMinor.svg";
import WarningCircleIcon from "icons/WarningCircle16.svg";
import CrossCircleIcon from "icons/CrossCircle16.svg";
import HourglassIcon from "icons/Hourglass.svg";
import { addLinkToText } from "./addLinkToText";

export interface FeatureItem {
  text: string;
  iconType?: 'check' | 'success' | 'warning' | 'error' | 'pending';
  customIcon?: React.ReactNode;
}

interface FeatureListProps {
  items: FeatureItem[];
  className?: string;
  iconSize?: 'sm' | 'md' | 'lg';
  iconWidth?: number;
  iconHeight?: number;
  iconClassName?: string;
  spacing?: 'compact' | 'normal' | 'relaxed';
  textClassName?: string;
}

const FeatureList: React.FC<FeatureListProps> = ({
  items,
  className = "",
  iconSize = 'sm',
  iconWidth,
  iconHeight,
  iconClassName = "",
  spacing = 'normal',
  textClassName = "text-primaryText text-base leading-[1.36] whitespace-pre-line",
}) => {
  const spacingMap = {
    compact: 'space-y-1',
    normal: 'space-y-3',
    relaxed: 'space-y-4'
  };

  const getIconSize = () => {
    if (iconWidth && iconHeight) return { width: iconWidth, height: iconHeight };
    const sizeMap = {
      sm: { width: 16, height: 16 },
      md: { width: 24, height: 24 },
      lg: { width: 64, height: 64 }
    };
    return sizeMap[iconSize];
  };

  const renderIcon = (iconType: string) => {
    const size = getIconSize();
    const props = { ...size, className: iconClassName };

    switch (iconType) {
      case 'check':
        return <CheckCircleIcon {...props} />;
      case 'success':
        return <CheckCircleMinorIcon {...props} />;
      case 'warning':
        return <WarningCircleIcon {...props} />;
      case 'error':
        return <CrossCircleIcon {...props} />;
      case 'pending':
        return <HourglassIcon {...props} />;
      default:
        return <CheckCircleIcon {...props} />;
    }
  };

  return (
    <div className={`${spacingMap[spacing]} ${className}`}>
      {items.map((item, index) => (
        <div key={index} className="flex items-start gap-2">
          <div className="flex-shrink-0 mt-1">
            {item.customIcon || renderIcon(item.iconType || 'check')}
          </div>
          <div className="flex-1">
            <span className={textClassName}>
              {addLinkToText(item.text)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FeatureList;
