import ReactMarkdown from "react-markdown";

interface MarkdownTextProps {
  text: string;
  className?: string;
}

/** Renders user-submitted markdown. Raw HTML stays escaped (react-markdown
 *  default), so untrusted content cannot inject markup. */
export default function MarkdownText({ text, className }: MarkdownTextProps) {
  return (
    <ReactMarkdown
      className={className}
      components={{
        a: ({ node: _node, ...props }) => (
          <a
            className="text-peach underline underline-offset-2 hover:opacity-80"
            target="_blank"
            rel="noopener noreferrer"
            {...props}
          />
        ),
        p: ({ node: _node, ...props }) => (
          <p className="mb-2 last:mb-0" {...props} />
        ),
        h1: ({ node: _node, ...props }) => (
          <p
            className="text-primaryText mb-1 mt-2 text-base font-semibold first:mt-0"
            {...props}
          />
        ),
        h2: ({ node: _node, ...props }) => (
          <p
            className="text-primaryText mb-1 mt-2 font-semibold first:mt-0"
            {...props}
          />
        ),
        h3: ({ node: _node, ...props }) => (
          <p
            className="text-primaryText mb-1 mt-2 font-semibold first:mt-0"
            {...props}
          />
        ),
        h4: ({ node: _node, ...props }) => (
          <p
            className="text-primaryText mb-1 mt-2 font-semibold first:mt-0"
            {...props}
          />
        ),
        h5: ({ node: _node, ...props }) => (
          <p
            className="text-primaryText mb-1 mt-2 font-semibold first:mt-0"
            {...props}
          />
        ),
        h6: ({ node: _node, ...props }) => (
          <p
            className="text-primaryText mb-1 mt-2 font-semibold first:mt-0"
            {...props}
          />
        ),
        strong: ({ node: _node, ...props }) => (
          <strong className="text-primaryText font-semibold" {...props} />
        ),
        ul: ({ node: _node, ordered: _ordered, depth: _depth, ...props }) => (
          <ul className="mb-2 list-disc pl-5 last:mb-0" {...props} />
        ),
        ol: ({ node: _node, ordered: _ordered, depth: _depth, ...props }) => (
          <ol className="mb-2 list-decimal pl-5 last:mb-0" {...props} />
        ),
        blockquote: ({ node: _node, ...props }) => (
          <blockquote
            className="border-stroke mb-2 border-l-2 pl-3 italic last:mb-0"
            {...props}
          />
        ),
        code: ({ node: _node, inline, ...props }) =>
          inline ? (
            <code
              className="bg-grey rounded px-1 py-0.5 font-mono text-xs"
              {...props}
            />
          ) : (
            <code
              className="bg-grey mb-2 block overflow-x-auto rounded-lg p-3 font-mono text-xs last:mb-0"
              {...props}
            />
          ),
        hr: ({ node: _node, ...props }) => (
          <hr className="border-stroke my-2" {...props} />
        ),
        img: () => null,
      }}
    >
      {text}
    </ReactMarkdown>
  );
}
