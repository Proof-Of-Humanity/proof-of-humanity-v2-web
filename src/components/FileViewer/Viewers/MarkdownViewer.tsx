import { type DocRenderer, textFileLoader } from "@cyntler/react-doc-viewer";
import React from "react";
import ReactMarkdown from "react-markdown";
import { isAllowedIpfsGatewayUrl } from "utils/ipfs";

/**
 * MarkdownRenderer component to render markdown files using Tailwind CSS instead of styled-components.
 */
const MarkdownRenderer: DocRenderer = ({ mainState: { currentDocument } }) => {
  if (!currentDocument) return null;
  const markdown =
    typeof currentDocument.fileData === "string" ? currentDocument.fileData : "";

  return (
    <div id="md-renderer" className="p-4">
      <ReactMarkdown
        skipHtml
        className="bg-white"
        components={{
          a: ({ node, href, ...props }) => {
            const isSafeHref =
              href &&
              (href.startsWith("https://") || href.startsWith("http://"));

            return isSafeHref ? (
              <a
                className="text-base"
                href={href}
                rel="noopener noreferrer"
                target="_blank"
                {...props}
              />
            ) : (
              <span className="text-base" {...props} />
            );
          },
          code: ({ node, ...props }) => (
            <code className="text-secondary" {...props} />
          ),
          img: ({ node, src, alt, ...props }) =>
            src && isAllowedIpfsGatewayUrl(src) ? (
              <img alt={alt ?? ""} src={src} {...props} />
            ) : null,
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
