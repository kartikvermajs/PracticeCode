"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Search,
  X,
  Filter,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Clock,
  Layers,
} from "lucide-react";

interface ProblemsFilterToolbarProps {
  allTags: string[];
  totalCount: number;
  filteredCount: number;
}

export function ProblemsFilterToolbar({
  allTags,
  totalCount,
  filteredCount,
}: ProblemsFilterToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Read current active filters from URL search params
  const currentQ = searchParams.get("q") || "";
  const currentDifficulty = searchParams.get("difficulty") || "All";
  const currentTag = searchParams.get("tag") || "All";
  const currentStatus = searchParams.get("status") || "All";
  const currentRevision = searchParams.get("revision") || "All";

  // Local state for debounced search input
  const [searchVal, setSearchVal] = useState(currentQ);

  // Sync local search when URL changes from outside
  useEffect(() => {
    setSearchVal(currentQ);
  }, [currentQ]);

  // Helper to push updated URL params
  const updateFilters = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newParams).forEach(([key, val]) => {
      if (!val || val === "All" || val === "") {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });

    // Reset pagination to page 1 whenever filters change
    params.delete("page");

    startTransition(() => {
      const qs = params.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    });
  };

  // Debounced search typing handler
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchVal !== currentQ) {
        updateFilters({ q: searchVal });
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchVal]);

  const handleClearAll = () => {
    setSearchVal("");
    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
  };

  // Check if any filter is active
  const hasActiveFilters = Boolean(
    currentQ ||
    currentDifficulty !== "All" ||
    currentTag !== "All" ||
    currentStatus !== "All" ||
    currentRevision !== "All"
  );

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
      {/* 1. Main Search & Dropdown Row */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Search by title (e.g. Single Number) or LeetCode # (e.g. 136)..."
            className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50/70 hover:bg-slate-50 focus:bg-white rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-3 focus:ring-blue-100 transition-all font-medium"
          />
          {searchVal && (
            <button
              onClick={() => {
                setSearchVal("");
                updateFilters({ q: null });
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Difficulty Dropdown */}
          <div className="relative">
            <select
              value={currentDifficulty}
              onChange={(e) => updateFilters({ difficulty: e.target.value })}
              className={`text-xs font-semibold rounded-xl px-3 py-2.5 border transition-all cursor-pointer shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                currentDifficulty !== "All"
                  ? "bg-blue-50 border-blue-300 text-blue-800"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          {/* Topic / Tag Dropdown */}
          <div className="relative">
            <select
              value={currentTag}
              onChange={(e) => updateFilters({ tag: e.target.value })}
              className={`text-xs font-semibold rounded-xl px-3 py-2.5 border transition-all cursor-pointer shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                currentTag !== "All"
                  ? "bg-blue-50 border-blue-300 text-blue-800"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <option value="All">All Topics</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>

          {/* Solved Status Dropdown */}
          <div className="relative">
            <select
              value={currentStatus}
              onChange={(e) => updateFilters({ status: e.target.value })}
              className={`text-xs font-semibold rounded-xl px-3 py-2.5 border transition-all cursor-pointer shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                currentStatus !== "All"
                  ? "bg-blue-50 border-blue-300 text-blue-800"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <option value="All">All Statuses</option>
              <option value="solved">Solved & Mastered</option>
              <option value="unsolved">Unsolved</option>
            </select>
          </div>

          {/* Due for Revision Dropdown */}
          <div className="relative">
            <select
              value={currentRevision}
              onChange={(e) => updateFilters({ revision: e.target.value })}
              className={`text-xs font-semibold rounded-xl px-3 py-2.5 border transition-all cursor-pointer shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                currentRevision !== "All"
                  ? "bg-amber-50 border-amber-300 text-amber-800"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <option value="All">All Review Schedules</option>
              <option value="due">⚡ Due for Revision</option>
              <option value="upcoming">Upcoming Review</option>
            </select>
          </div>

          {/* Reset Button */}
          {hasActiveFilters && (
            <button
              onClick={handleClearAll}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 border border-rose-200/80 rounded-xl transition-colors"
              title="Reset all search parameters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Quick Filter Pills Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
        <div className="flex flex-wrap items-center gap-2">
          {/* Difficulty Quick Pills */}
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Difficulty:
          </span>
          {["All", "Easy", "Medium", "Hard"].map((diff) => {
            const isActive = currentDifficulty.toLowerCase() === diff.toLowerCase();
            return (
              <button
                key={diff}
                onClick={() => updateFilters({ difficulty: diff })}
                className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  isActive
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800"
                }`}
              >
                {diff}
              </button>
            );
          })}

          <span className="text-slate-300 mx-1.5">|</span>

          {/* Status Quick Pills */}
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Revision:
          </span>
          <button
            onClick={() =>
              updateFilters({
                revision: currentRevision === "due" ? null : "due",
              })
            }
            className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-semibold transition-all ${
              currentRevision === "due"
                ? "bg-amber-600 text-white shadow-2xs"
                : "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/60"
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Due for Review</span>
          </button>

          <button
            onClick={() =>
              updateFilters({
                status: currentStatus === "solved" ? null : "solved",
              })
            }
            className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-semibold transition-all ${
              currentStatus === "solved"
                ? "bg-emerald-600 text-white shadow-2xs"
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60"
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>Solved Only</span>
          </button>
        </div>

        {/* Counter */}
        <div className="text-xs text-slate-500 font-medium ml-auto flex items-center gap-1.5">
          {isPending ? (
            <span className="inline-block w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Layers className="w-3.5 h-3.5 text-slate-400" />
          )}
          <span>
            Showing <strong className="text-slate-900 font-bold">{filteredCount}</strong> of{" "}
            {totalCount} problem{totalCount === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      {/* 3. Active Filters Chips (if any) */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-[11px] font-semibold text-slate-400">
            Active filters:
          </span>
          {currentQ && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
              Search: &quot;{currentQ}&quot;
              <button
                onClick={() => {
                  setSearchVal("");
                  updateFilters({ q: null });
                }}
                className="hover:text-slate-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {currentDifficulty !== "All" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-medium border border-blue-200/60">
              Difficulty: {currentDifficulty}
              <button
                onClick={() => updateFilters({ difficulty: null })}
                className="hover:text-blue-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {currentTag !== "All" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-medium border border-indigo-200/60">
              Topic: {currentTag}
              <button
                onClick={() => updateFilters({ tag: null })}
                className="hover:text-indigo-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {currentStatus !== "All" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-medium border border-emerald-200/60">
              Status: {currentStatus}
              <button
                onClick={() => updateFilters({ status: null })}
                className="hover:text-emerald-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {currentRevision !== "All" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 font-medium border border-amber-200/60">
              Revision: {currentRevision}
              <button
                onClick={() => updateFilters({ revision: null })}
                className="hover:text-amber-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
