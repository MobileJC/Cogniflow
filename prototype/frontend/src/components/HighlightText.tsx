import React from 'react';

type Props = {
  content: string;
  highlights: string[];
  messageId: string;
};

// Render plain text with simple gray <mark> highlights for each phrase.
// Assumes small, non-overlapping phrases; safe fallback if overlaps occur.
export default function HighlightText({ content, highlights, messageId }: Props) {
  if (!highlights || highlights.length === 0) return <p>{content}</p>;
  let nodes: Array<string | JSX.Element> = [content];
  highlights.forEach((phrase, idx) => {
    const next: Array<string | JSX.Element> = [];
    nodes.forEach((node) => {
      if (typeof node !== 'string') { next.push(node); return; }
      if (!phrase) { next.push(node); return; }
      const parts = node.split(phrase);
      parts.forEach((p, i) => {
        if (i > 0) {
          next.push(
            <mark key={`h-${messageId}-${idx}-${i}`} className="bg-gray-300 text-foreground rounded px-0.5">{phrase}</mark>
          );
        }
      if (p) next.push(p);
      });
    });
    nodes = next;
  });
  return <>{nodes}</>;
}

