import React from 'react';

export const addLinkToText = (text: string): React.ReactNode[] => {
  const nodes: React.ReactNode[] = [];
  const formatRegex = /(\[([^\]]+)\]\((https?:\/\/[^\s)]+)\))|(\*\*([^*]+)\*\*)|(~~([^~]+)~~)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let nodeKey = 0;

  while ((match = formatRegex.exec(text)) !== null) {
    // Add text before the match, preserving newlines
    if (match.index > lastIndex) {
      const textBefore = text.slice(lastIndex, match.index);
      nodes.push(...processTextWithNewlines(textBefore, `text-${nodeKey}`));
      nodeKey++;
    }

    // Check if it's a markdown link [text](url)
    if (match[1]) {
      const label = match[2];
      const url = match[3];
      nodes.push(
        <a
          key={`link-${nodeKey++}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-orange cursor-pointer underline decoration-text-orange"
        >
          {label}
        </a>
      );
    }
    // Check if it's bold **text**
    else if (match[4]) {
      const boldText = match[5];
      nodes.push(
        <strong key={`bold-${nodeKey++}`} className="font-semibold">
          {boldText}
        </strong>
      );
    }
    // Check if it's purple ~~text~~
    else if (match[6]) {
      const purpleText = match[7];
      nodes.push(
        <span key={`purple-${nodeKey++}`} className="font-semibold" style={{ color: '#511279' }}>
          {purpleText}
        </span>
      );
    }

    lastIndex = formatRegex.lastIndex;
  }

  // Add remaining text, preserving newlines
  if (lastIndex < text.length) {
    const remainingText = text.slice(lastIndex);
    nodes.push(...processTextWithNewlines(remainingText, `text-${nodeKey}`));
  }

  return nodes;
};

// Helper function to process text and preserve newlines as <br /> elements
const processTextWithNewlines = (text: string, keyPrefix: string): React.ReactNode[] => {
  const lines = text.split('\n');
  return lines.flatMap((line, lineIdx) => {
    const elements: React.ReactNode[] = [];
    if (line) {
      elements.push(line);
    }
    // Add <br /> after each line except the last one
    if (lineIdx < lines.length - 1) {
      elements.push(<br key={`${keyPrefix}-br-${lineIdx}`} />);
    }
    return elements;
  });
};