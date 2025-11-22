import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Props = { children: string };

export default function Markdown({ children }: Props) {
  return (
    <div className="prose prose-neutral max-w-none dark:prose-invert">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          pre: ({ children }) => (
            <pre className="overflow-x-auto rounded-md p-3 bg-muted">{children}</pre>
          ),
          code: ({ inline, className, children }) =>
            inline ? (
              <code className="px-1 py-0.5 rounded bg-muted">{children}</code>
            ) : (
              <code className={className}>{children}</code>
            ),
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
        }}
        // Disallow raw HTML for safety
        skipHtml
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
