import { type DocRenderer, textFileLoader } from "@cyntler/react-doc-viewer";
import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

const remarkPlugins = [remarkGfm as any];
const rehypePlugins = [
  rehypeRaw as any,
  [
    rehypeSanitize as any,
    {
      tagNames: [
        "a",
        "blockquote",
        "br",
        "code",
        "del",
        "details",
        "em",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "hr",
        "img",
        "input",
        "li",
        "ol",
        "p",
        "pre",
        "section",
        "span",
        "strong",
        "summary",
        "table",
        "tbody",
        "td",
        "th",
        "thead",
        "tr",
        "ul",
      ],
      attributes: {
        a: ["href", "title"],
        img: ["src", "alt", "title", "width", "height"],
        input: ["type", "checked", "disabled"],
        td: ["colspan", "rowspan"],
        th: ["scope", "colspan", "rowspan"],
        details: ["open"],
      },
    },
  ],
];

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
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
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
