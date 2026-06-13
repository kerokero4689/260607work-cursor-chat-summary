"use client";

import {
  Blocks,
  Files,
  GitBranch,
  LogOut,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const ICONS = [
  { icon: Files, label: "Explorer", active: true },
  { icon: Search, label: "Search" },
  { icon: GitBranch, label: "Source Control" },
  { icon: Blocks, label: "Extensions" },
];

export function ActivityBar() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <aside className="flex w-12 shrink-0 flex-col items-center border-r border-[var(--border)] bg-[var(--bg-secondary)] py-2">
      {ICONS.map(({ icon: Icon, label, active }) => (
        <button
          key={label}
          title={label}
          type="button"
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
          type="button"
          title="Logout"
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex h-10 w-10 items-center justify-center text-[var(--text-muted)] transition-colors hover:text-red-400 disabled:opacity-50"
        >
          <LogOut size={20} />
        </button>
      </div>
    </aside>
  );
}
