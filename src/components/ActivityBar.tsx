"use client";

import {
  Blocks,
  Files,
  GitBranch,
  Search,
  Settings,
  User,
} from "lucide-react";

const ICONS = [
  { icon: Files, label: "Explorer", active: true },
  { icon: Search, label: "Search" },
  { icon: GitBranch, label: "Source Control" },
  { icon: Blocks, label: "Extensions" },
];

export function ActivityBar() {
  return (
    <aside className="flex w-12 shrink-0 flex-col items-center border-r border-[var(--border)] bg-[var(--bg-secondary)] py-2">
      {ICONS.map(({ icon: Icon, label, active }) => (
        <button
          key={label}
          title={label}
          className={`mb-1 flex h-10 w-10 items-center justify-center rounded transition-colors ${
            active
              ? "border-l-2 border-[var(--accent)] text-[var(--text-primary)]"
              : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
          }`}
        >
          <Icon size={22} />
        </button>
      ))}
      <div className="mt-auto flex flex-col items-center gap-1">
        <button
          title="Account"
          className="flex h-10 w-10 items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
        >
          <User size={20} />
        </button>
        <button
          title="Settings"
          className="flex h-10 w-10 items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
        >
          <Settings size={20} />
        </button>
      </div>
    </aside>
  );
}
