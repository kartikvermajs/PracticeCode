import React from "react";
import { cn } from "@/lib/utils";

interface TopicBadgeProps {
  topic: string;
  size?: "sm" | "md";
  className?: string;
}

export function TopicBadge({
  topic,
  size = "md",
  className,
}: TopicBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-md bg-slate-100/90 text-slate-700 border border-slate-200/80 transition-colors hover:bg-slate-200/70",
        size === "sm" ? "px-1.5 py-0.5 text-[11px]" : "px-2 py-0.5 text-xs",
        className
      )}
    >
      {topic}
    </span>
  );
}
