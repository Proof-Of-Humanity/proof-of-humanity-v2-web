import React from 'react';

export const addLinkToText = (text: string): React.ReactNode[] => {
  return text.split('|').flatMap((segment, idx) => {
    // split into [displayText, url], ignore further colons
    const [displayText, url] = segment.split(';', 2);
    
    const processText = (text: string, keyPrefix: string) => {
      // Split by newlines and insert <br /> elements
      const lines = text.split('\n');
      return lines.flatMap((line, lineIdx) => {
        const elements: React.ReactNode[] = [line];
        // Add <br /> after each line except the last one
        if (lineIdx < lines.length - 1) {
          elements.push(<br key={`${keyPrefix}-br-${lineIdx}`} />);
        }
        return elements;
      });
    };
    
    if (url) {
      return (
        <a
          key={`link-${idx}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className='text-orange cursor-pointer underline decoration-text-orange'
        >
          {processText(displayText, `link-${idx}`)}
        </a>
      );
    }
    return processText(displayText, `text-${idx}`);
  });
};