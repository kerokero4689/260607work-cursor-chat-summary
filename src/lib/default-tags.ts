import type { TagColor } from "@/types/chat";

export const DEFAULT_TAGS: { name: string; color: TagColor }[] = [
  { name: "Important", color: "orange" },
  { name: "Bug Fix", color: "blue" },
  { name: "Optimization", color: "blue" },
  { name: "Refactoring", color: "blue" },
  { name: "React", color: "green" },
  { name: "Python", color: "green" },
];
