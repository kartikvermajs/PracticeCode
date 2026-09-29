"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X, ArrowRight, BookOpen, Play } from "lucide-react";
import { MOCK_PROBLEMS } from "@/data/mock-problems";
import { DifficultyBadge } from "./DifficultyBadge";

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickSearchModal({ isOpen, onClose }: QuickSearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open
          const evt = new CustomEvent("open-quick-search");
          window.dispatchEvent(evt);
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = MOCK_PROBLEMS.filter(
    (p) =>
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.number.toString().includes(query) ||
      p.topics.some((t) => t.toLowerCase().includes(query.toLowerCase()))
  );

  const handleSelect = (slug: string, mode: "details" | "practice") => {
    onClose();
    if (mode === "practice") {
      router.push(`/practice/${slug}`);
    } else {
      router.push(`/problems/${slug}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/40 backdrop-blur-xs">
      <div
        className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input bar */}
        <div className="relative flex items-center border-b border-slate-100 px-4 py-3">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search problems by name, number, or tag..."
            autoFocus
            className="w-full text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No matching problems found.
            </div>
          ) : (
            filtered.map((problem) => (
              <div
                key={problem.id}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
              >
                <div
                  className="flex items-center gap-3 cursor-pointer flex-1"
                  onClick={() => handleSelect(problem.slug, "details")}
                >
                  <span className="font-mono text-xs text-slate-500 font-bold">
                    #{problem.number}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900 group-hover:text-blue-600">
                        {problem.title}
                      </span>
                      <DifficultyBadge difficulty={problem.difficulty} size="sm" />
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {problem.topics.join(" · ")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleSelect(problem.slug, "details")}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 text-xs font-medium"
                    title="View Solution & Details"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleSelect(problem.slug, "practice")}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-2xs"
                  >
                    <Play className="w-3 h-3 fill-white" />
                    <span>Practice</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px]">ESC</kbd> to close
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px]">↵</kbd> to select
            </span>
          </div>
          <span>CodeRev Quick Search</span>
        </div>
      </div>
    </div>
  );
}
