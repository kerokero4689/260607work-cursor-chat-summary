"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language = "text" }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="hljs-container group relative my-3 overflow-hidden rounded-md border border-[#30363d]">
      <div className="flex items-center justify-between border-b border-[#30363d] bg-[#2d2d2d] px-3 py-1.5">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#858585]">
          {language}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 rounded px-2 py-0.5 text-xs text-[#8b949e] transition-colors hover:bg-[#3c3c3c] hover:text-[#e6edf3]"
        >
          {copied ? (
            <>
              <Check size={12} className="text-[#3fb950]" />
              Copied!
            </>
          ) : (
            <>
              <Copy size={12} />
              Copy Code
            </>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          padding: "1rem",
          background: "#1e1e1e",
          fontSize: "0.8125rem",
          lineHeight: "1.6",
          borderLeft: "3px solid var(--accent)",
        }}
        codeTagProps={{
          style: { fontFamily: "'Cascadia Code', 'Fira Code', Consolas, monospace" },
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
