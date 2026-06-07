"use client";

import type { TagColor } from "@/types/chat";

const COLOR_MAP: Record<TagColor, string> = {
  orange: "bg-[#3d2e00] text-[#d29922] border-[#d29922]/30",
  blue: "bg-[#0d2137] text-[#388bfd] border-[#388bfd]/30",
  green: "bg-[#0d2818] text-[#3fb950] border-[#3fb950]/30",
  purple: "bg-[#1c1033] text-[#a371f7] border-[#a371f7]/30",
  gray: "bg-[var(--bg-hover)] text-[var(--text-secondary)] border-[var(--border)]",
};

interface TagBadgeProps {
  name: string;
  color?: TagColor;
  selected?: boolean;
  onClick?: () => void;
  size?: "sm" | "md";
}

export function TagBadge({
  name,
  color = "blue",
  selected = false,
  onClick,
  size = "md",
}: TagBadgeProps) {
  const sizeClass = size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center rounded border font-medium transition-all ${sizeClass} ${COLOR_MAP[color]} ${
        selected ? "ring-1 ring-current opacity-100" : "opacity-80 hover:opacity-100"
      } ${onClick ? "cursor-pointer" : "cursor-default"}`}
    >
      {name}
    </button>
  );
}
