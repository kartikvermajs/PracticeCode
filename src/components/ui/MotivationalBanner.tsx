"use client";

import React, { useState, useEffect } from "react";
import { type MotivationalMessage } from "@/data/motivational-messages";

interface MotivationalBannerProps {
  message: MotivationalMessage;
  /** Visual style variant */
  variant?: "subtle" | "card" | "inline";
  className?: string;
}

/**
 * Displays a single motivational message with a gentle fade-in.
 * Designed to be placed at various touch-points across the app.
 */
export function MotivationalBanner({
  message,
  variant = "subtle",
  className = "",
}: MotivationalBannerProps) {
  const [visible, setVisible] = useState(false);

  // Fade in shortly after mount so it feels non-intrusive
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 180);
    return () => clearTimeout(t);
  }, []);

  if (variant === "card") {
    return (
      <div
        className={`transition-all duration-500 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
        } rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/30 px-5 py-4 shadow-2xs ${className}`}
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl leading-none select-none">{message.emoji}</span>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-snug">
            {message.text}
          </p>
        </div>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div
        className={`transition-all duration-500 ${
          visible ? "opacity-100" : "opacity-0"
        } flex items-center gap-2 ${className}`}
      >
        <span className="text-base leading-none select-none">{message.emoji}</span>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 italic">
          {message.text}
        </span>
      </div>
    );
  }

  // subtle (default) — minimal pill strip
  return (
    <div
      className={`transition-all duration-500 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
      } flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800 ${className}`}
    >
      <span className="text-base leading-none select-none">{message.emoji}</span>
      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{message.text}</span>
    </div>
  );
}
