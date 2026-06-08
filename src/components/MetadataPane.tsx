"use client";

import { FileDown, Sparkles, X } from "lucide-react";
import { useState } from "react";
import type { Tag } from "@/types/chat";
import { TagBadge } from "./TagBadge";

interface MetadataPaneProps {
  tags: Tag[];
  selectedTagIds: string[];
  project: string;
  note: string;
  noteSaveState?: "idle" | "saving" | "saved";
  onToggleTag: (tagId: string) => void;
  onNoteChange: (note: string) => void;
  onAddTag: (name: string) => void;
  onExport: () => Promise<void>;
}

export function MetadataPane({
  tags,
  selectedTagIds,
  project,
  note,
  noteSaveState = "idle",
  onToggleTag,
  onNoteChange,
  onAddTag,
  onExport,
}: MetadataPaneProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [customTag, setCustomTag] = useState("");

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExport();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <aside className="flex w-[25%] min-w-[200px] shrink-0 flex-col border-l border-[var(--border)] bg-[var(--bg-secondary)]">
      <header className="flex items-center justify-between border-b border-[var(--border)] px-4 py-2.5">
        <p className="text-sm font-semibold text-[var(--text-primary)]">
          Metadata &amp; Tags
        </p>
        <button
          type="button"
          className="rounded p-1 text-[var(--text-muted)] hover:bg-[var(--bg-hover)]"
        >
          <X size={16} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Tags */}
        <section className="mb-5">
          <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
            Tags
          </label>
          <input
            type="text"
            placeholder="Add Tag..."
            value={customTag}
            onChange={(e) => setCustomTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && customTag.trim()) {
                onAddTag(customTag.trim());
                setCustomTag("");
              }
            }}
            className="mb-3 w-full rounded-md border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-1.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--border-active)] focus:outline-none"
          />
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <TagBadge
                key={tag.id}
                name={tag.name}
                color={tag.color}
                selected={selectedTagIds.includes(tag.id)}
                onClick={() => onToggleTag(tag.id)}
              />
            ))}
          </div>
        </section>

        {/* Project */}
        <section className="mb-5">
          <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
            Project / Context
          </label>
          <div className="rounded-md border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-secondary)]">
            Project: {project || "—"}
          </div>
        </section>

        {/* Notes */}
        <section className="mb-5">
          <div className="mb-2 flex items-center justify-between">
            <label
              htmlFor="notes"
              className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]"
            >
              Notes
            </label>
            {noteSaveState === "saving" && (
              <span className="text-[10px] text-[var(--text-muted)]">保存中…</span>
            )}
            {noteSaveState === "saved" && (
              <span className="text-[10px] text-[#3fb950]">保存しました</span>
            )}
          </div>
          <textarea
            id="notes"
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            placeholder="Add your personal context..."
            rows={6}
            className="w-full resize-none rounded-md border border-[var(--border)] border-l-4 border-l-[var(--accent)] bg-[var(--bg-primary)] px-3 py-2 text-sm leading-relaxed text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--border-active)] focus:outline-none"
          />
        </section>
      </div>

      {/* Export */}
      <div className="border-t border-[var(--border)] p-4">
        <div className="mb-3">
          <p className="text-sm font-medium text-[var(--text-primary)]">
            Save to Word
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            Export the whole conversation.
          </p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          disabled={isExporting}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--bg-hover)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--accent)] hover:bg-[var(--bg-tertiary)] disabled:opacity-50"
        >
          {isExporting ? (
            <>
              <Sparkles size={16} className="animate-pulse text-[var(--accent)]" />
              Generating...
            </>
          ) : (
            <>
              <FileDown size={16} />
              Save to Word
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
