import React from 'react';

export const addLinkToText = (text: string): React.ReactNode[] => {
  return text.split('|').map((segment, idx) => {
    // split into [displayText, url], ignore further colons
    const [displayText, url] = segment.split(';', 2);
    if (url) {
      return (
        <a
          key={`link-${idx}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className='text-orange cursor-pointer underline decoration-text-orange'
        >
          {displayText}
        </a>
      );
    }
    return displayText;
  });
};