import React from 'react';

export const addLinkToText = (text: string): React.ReactNode[] => {
  const nodes: React.ReactNode[] = [];
  const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    const label = match[1];
    const url = match[2];
    nodes.push(
      <a
        key={`link-${nodes.length}`}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-orange cursor-pointer decoration-text-orange"
      >
        {label}
      </a>
    );
    lastIndex = linkRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
};