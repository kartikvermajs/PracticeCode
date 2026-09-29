import React from "react";
import { Difficulty } from "@/types";
import { cn } from "@/lib/utils";

interface DifficultyBadgeProps {
  difficulty: Difficulty;
  size?: "sm" | "md";
  className?: string;
}

export function DifficultyBadge({
  difficulty,
  size = "md",
  className,
}: DifficultyBadgeProps) {
  const styles: Record<Difficulty, { bg: string; text: string; dot: string; border: string }> = {
    Easy: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      dot: "bg-emerald-500",
      border: "border-emerald-200/80",
    },
    Medium: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      dot: "bg-amber-500",
      border: "border-amber-200/80",
    },
    Hard: {
      bg: "bg-rose-50",
      text: "text-rose-700",
      dot: "bg-rose-500",
      border: "border-rose-200/80",
    },
  };

  const current = styles[difficulty] || styles.Easy;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium rounded-full border transition-colors",
        current.bg,
        current.text,
        current.border,
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs",
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", current.dot)} />
      {difficulty}
    </span>
  );
}
