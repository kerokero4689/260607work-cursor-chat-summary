"use client";

import { ClipboardPaste, FileUp, Loader2, X } from "lucide-react";
import { useRef, useState } from "react";

interface ImportModalProps {
  open: boolean;
  onClose: () => void;
  onImport: (raw: string, title?: string) => Promise<void>;
}

export function ImportModal({ open, onClose, onImport }: ImportModalProps) {
  const [raw, setRaw] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const handleImport = async () => {
    if (!raw.trim()) {
      setError("インポートデータを入力してください");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await onImport(raw, title.trim() || undefined);
      setRaw("");
      setTitle("");
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "インポートに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setRaw(text);
      setError("");
    } catch {
      setError("クリップボードの読み取りに失敗しました");
    }
  };

  const handleFile = async (file: File) => {
    const text = await file.text();
    setRaw(text);
    setError("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-2xl rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] shadow-xl">
        <header className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              Import Cursor Chat
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              .jsonl / .json ファイルまたはクリップボードから取り込み
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-[var(--text-muted)] hover:bg-[var(--bg-hover)]"
          >
            <X size={18} />
          </button>
        </header>

        <div className="space-y-4 p-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handlePaste}
              className="flex items-center gap-2 rounded-md border border-[var(--border)] px-3 py-2 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
            >
              <ClipboardPaste size={14} />
              クリップボードから貼り付け
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 rounded-md border border-[var(--border)] px-3 py-2 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
            >
              <FileUp size={14} />
              ファイルを選択
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".json,.jsonl,.txt"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
          </div>

          <input
            type="text"
            placeholder="タイトル（省略可・自動生成）"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--border-active)] focus:outline-none"
          />

          <textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder='Cursorのエクスポート JSON / JSONL を貼り付け…'
            rows={12}
            className="w-full resize-none rounded-md border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 font-mono text-xs leading-relaxed text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--border-active)] focus:outline-none"
          />

          {error && (
            <p className="text-xs text-red-400">{error}</p>
          )}
        </div>

        <footer className="flex justify-end gap-2 border-t border-[var(--border)] px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleImport}
            disabled={loading}
            className="flex items-center gap-2 rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)] disabled:opacity-50"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            インポート
          </button>
        </footer>
      </div>
    </div>
  );
}
