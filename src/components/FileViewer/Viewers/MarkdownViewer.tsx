import { type DocRenderer, textFileLoader } from "@cyntler/react-doc-viewer";
import React from "react";
import ReactMarkdown from "react-markdown";

/**
 * MarkdownRenderer component to render markdown files using Tailwind CSS instead of styled-components.
 */
const MarkdownRenderer: DocRenderer = ({ mainState: { currentDocument } }) => {
  if (!currentDocument) return null;
  const markdown =
    typeof currentDocument.fileData === "string"
      ? currentDocument.fileData
      : "";

  return (
    <div id="md-renderer" className="p-4">
      <ReactMarkdown
        className="bg-white"
        components={{
          a: ({ node, ...props }) => (
            <a
              className="text-base"
              {...props}
              rel="noopener noreferrer"
              target="_blank"
            />
          ),
          code: ({ node, ...props }) => (
            <code className="text-secondary" {...props} />
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
};

MarkdownRenderer.fileTypes = ["md", "markdown", "text/markdown", "text/plain"];
MarkdownRenderer.weight = 1;
MarkdownRenderer.fileLoader = textFileLoader;

export default MarkdownRenderer;
