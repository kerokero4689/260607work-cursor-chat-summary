"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "./CodeBlock";

interface MarkdownContentProps {
  content: string;
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className ?? "");
          const codeString = String(children).replace(/\n$/, "");

          if (match) {
            return <CodeBlock code={codeString} language={match[1]} />;
          }

          return (
            <code
              className="rounded bg-[var(--bg-hover)] px-1.5 py-0.5 font-mono text-sm text-[#ff7b72]"
              {...props}
            >
              {children}
            </code>
          );
        },
        pre({ children }) {
          return <>{children}</>;
        },
        p({ children }) {
          return (
            <p className="mb-3 leading-relaxed text-[var(--text-primary)]">
              {children}
            </p>
          );
        },
        h3({ children }) {
          return (
            <h3 className="mb-2 mt-4 text-base font-semibold text-[var(--text-primary)]">
              {children}
            </h3>
          );
        },
        ol({ children }) {
          return (
            <ol className="mb-3 list-decimal space-y-1 pl-5 text-[var(--text-primary)]">
              {children}
            </ol>
          );
        },
        ul({ children }) {
          return (
            <ul className="mb-3 list-disc space-y-1 pl-5 text-[var(--text-primary)]">
              {children}
            </ul>
          );
        },
        li({ children }) {
          return <li className="leading-relaxed">{children}</li>;
        },
        strong({ children }) {
          return <strong className="font-semibold text-[var(--text-primary)]">{children}</strong>;
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
