"use client";

import XLogo from "icons/XLogo.svg";
import TelegramLogo from "icons/TelegramLogo.svg";
import WhatsAppLogo from "icons/WhatsAppLogo.svg";

interface ShareButtonsProps {
  link: string;
  message: string;
}

const ShareButtons: React.FC<ShareButtonsProps> = ({ link, message }) => {
  const encodedLink = encodeURIComponent(link);
  const encodedMsg = encodeURIComponent(message);

  const targets = [
    {
      label: "Share on X",
      Icon: XLogo,
      href: `https://twitter.com/intent/tweet?text=${encodedMsg}&url=${encodedLink}`,
    },
    {
      label: "Share on Telegram",
      Icon: TelegramLogo,
      href: `https://t.me/share/url?url=${encodedLink}&text=${encodedMsg}`,
    },
    {
      label: "Share on WhatsApp",
      Icon: WhatsAppLogo,
      href: `https://wa.me/?text=${encodeURIComponent(`${message} ${link}`)}`,
    },
  ];

  return (
    <div className="flex items-center gap-2">
      <span className="text-secondaryText text-sm">Share:</span>
      {targets.map(({ label, Icon, href }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="border-stroke text-secondaryText hover:border-orange hover:text-orange flex h-8 w-8 items-center justify-center rounded-full border transition-colors"
        >
          <Icon className="h-4 w-4" />
        </a>
      ))}
    </div>
  );
};

export default ShareButtons;
