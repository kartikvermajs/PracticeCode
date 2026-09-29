"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCcw,
  Check,
  X,
  ExternalLink,
  Loader2,
  Play,
  Layers,
  ArrowRight,
  Info,
  ListPlus,
  RefreshCw,
} from "lucide-react";
import { parseBulkImportInput } from "@/lib/problem-utils";
import { DifficultyBadge } from "@/components/ui/DifficultyBadge";

export interface BulkImportItem {
  slug: string;
  status: "pending" | "processing" | "imported" | "skipped" | "failed";
  title?: string;
  leetcodeId?: number;
  difficulty?: "Easy" | "Medium" | "Hard";
  error?: string;
  skipReason?: string;
}

const PRESET_PACKS = [
  {
    name: "Blind 75 Essentials (10)",
    slugs: [
      "two-sum",
      "valid-parentheses",
      "best-time-to-buy-and-sell-stock",
      "contains-duplicate",
      "maximum-subarray",
      "valid-anagram",
      "binary-search",
      "linked-list-cycle",
      "invert-binary-tree",
      "single-number",
    ],
  },
  {
    name: "Arrays & Hashing (5)",
    slugs: [
      "two-sum",
      "contains-duplicate",
      "valid-anagram",
      "group-anagrams",
      "top-k-frequent-elements",
    ],
  },
  {
    name: "Two Pointers & Binary Search (5)",
    slugs: [
      "valid-palindrome",
      "two-sum-ii-input-array-is-sorted",
      "3sum",
      "binary-search",
      "search-a-2d-matrix",
    ],
  },
];

export function BulkImportView() {
  const [inputText, setInputText] = useState("");
  const [items, setItems] = useState<BulkImportItem[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const isCancelledRef = useRef(false);

  // Derived counts
  const importedCount = items.filter((i) => i.status === "imported").length;
  const skippedCount = items.filter((i) => i.status === "skipped").length;
  const failedCount = items.filter((i) => i.status === "failed").length;
  const processedCount = importedCount + skippedCount + failedCount;
  const totalCount = items.length;
  const progressPercent =
    totalCount > 0 ? Math.round((processedCount / totalCount) * 100) : 0;

  // 1. Load preset packs
  const loadPreset = (slugs: string[]) => {
    setInputText(slugs.map((s) => `https://leetcode.com/problems/${s}/`).join("\n"));
  };

  // 2. Prepare items from input
  const handleParseInput = () => {
    const parsedSlugs = parseBulkImportInput(inputText);
    const newItems: BulkImportItem[] = parsedSlugs.map((slug) => ({
      slug,
      status: "pending",
    }));
    setItems(newItems);
    setIsCompleted(false);
  };

  // 3. Process items sequentially with safe spacing (250ms) to respect public rate limits
  const runImport = async (targetItems: BulkImportItem[]) => {
    setIsImporting(true);
    isCancelledRef.current = false;

    for (let i = 0; i < targetItems.length; i++) {
      if (isCancelledRef.current) break;

      const current = targetItems[i];
      if (current.status === "imported" || current.status === "skipped") {
        continue;
      }

      // Mark processing
      setItems((prev) =>
        prev.map((item) =>
          item.slug === current.slug
            ? { ...item, status: "processing" }
            : item
        )
      );

      try {
        const res = await fetch("/api/problems/import/item", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ urlOrSlug: current.slug }),
        });

        const data = await res.json();

        setItems((prev) =>
          prev.map((item) => {
            if (item.slug !== current.slug) return item;

            if (data.status === "imported") {
              return {
                ...item,
                status: "imported",
                title: data.title,
                leetcodeId: data.leetcodeId,
                difficulty: data.difficulty,
              };
            } else if (data.status === "skipped") {
              return {
                ...item,
                status: "skipped",
                title: data.title,
                leetcodeId: data.leetcodeId,
                difficulty: data.difficulty,
                skipReason: data.reason || "Already exists",
              };
            } else {
              return {
                ...item,
                status: "failed",
                error: data.error || "Failed to import",
              };
            }
          })
        );
      } catch (err: any) {
        setItems((prev) =>
          prev.map((item) =>
            item.slug === current.slug
              ? {
                  ...item,
                  status: "failed",
                  error: err.message || "Network error",
                }
              : item
          )
        );
      }

      // Safe pause between requests to prevent rate limiting
      await new Promise((resolve) => setTimeout(resolve, 250));
    }

    setIsImporting(false);
    setIsCompleted(true);
  };

  // 4. Start fresh import
  const handleStartImport = () => {
    const parsedSlugs = parseBulkImportInput(inputText);
    if (parsedSlugs.length === 0) return;

    const newItems: BulkImportItem[] = parsedSlugs.map((slug) => ({
      slug,
      status: "pending",
    }));

    setItems(newItems);
    runImport(newItems);
  };

  // 5. Retry failed items only
  const handleRetryFailed = () => {
    const failedSlugs = items
      .filter((i) => i.status === "failed")
      .map((i) => i.slug);

    if (failedSlugs.length === 0) return;

    // Reset failed items to pending
    const resetItems = items.map((i) =>
      i.status === "failed" ? { ...i, status: "pending" as const, error: undefined } : i
    );
    setItems(resetItems);
    runImport(resetItems);
  };

  return (
    <div className="space-y-8 max-w-4xl pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/problems"
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Problems</span>
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Import Solved Problems
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
            Bulk import your previously solved LeetCode problems into your personal spaced-repetition deck.
          </p>
        </div>

        {/* Compliant Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Compliant Public Data Source</span>
        </div>
      </div>

      {/* Real-time Status Counters */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Imported
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-emerald-600">
            {importedCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Added to revision deck
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Skipped
            </span>
            <RotateCcw className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-amber-600">
            {skippedCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Already in database
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Failed
            </span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-rose-600">
            {failedCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Errors / Premium
          </p>
        </div>
      </div>

      {/* Input Section (When not actively importing or completed) */}
      {!isImporting && !isCompleted && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Paste LeetCode URLs or Problem Slugs
            </label>
            <p className="text-xs text-slate-500 mb-2">
              Enter one URL or slug per line (e.g. <code className="font-mono text-slate-700">https://leetcode.com/problems/two-sum/</code> or <code className="font-mono text-slate-700">two-sum</code>).
            </p>
            <textarea
              rows={7}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`https://leetcode.com/problems/two-sum/\nhttps://leetcode.com/problems/valid-parentheses/\nbest-time-to-buy-and-sell-stock\nbinary-search\ncontains-duplicate`}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-mono rounded-xl border border-slate-300 bg-white placeholder:font-sans focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
            />
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Or load preset:</span>
            </span>
            {PRESET_PACKS.map((pack) => (
              <button
                key={pack.name}
                type="button"
                onClick={() => loadPreset(pack.slugs)}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
              >
                {pack.name}
              </button>
            ))}
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              <span>
                Duplicate problems are automatically detected and preserved without overwriting.
              </span>
            </div>

            <button
              type="button"
              onClick={handleStartImport}
              disabled={!inputText.trim()}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-xl shadow-xs transition-all active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Bulk Import</span>
            </button>
          </div>
        </div>
      )}

      {/* Progress Bar (When importing or items exist) */}
      {items.length > 0 && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {isImporting
                  ? `Importing problems (${processedCount} of ${totalCount})...`
                  : isCompleted
                  ? "Import Finished"
                  : `Prepared ${totalCount} problems`}
              </h3>
              <p className="text-xs text-slate-500">
                {isImporting
                  ? "Processing problem-by-problem with safe pacing to prevent rate limits."
                  : `${importedCount} newly imported, ${skippedCount} already existed, ${failedCount} failed.`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {failedCount > 0 && !isImporting && (
                <button
                  type="button"
                  onClick={handleRetryFailed}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Failed ({failedCount})</span>
                </button>
              )}

              {isCompleted && (
                <button
                  type="button"
                  onClick={() => {
                    setIsCompleted(false);
                    setItems([]);
                    setInputText("");
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg transition-colors"
                >
                  Import More
                </button>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-2.5 rounded-full transition-all duration-300 ${
                failedCount > 0 && progressPercent === 100
                  ? "bg-amber-500"
                  : "bg-blue-600"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Problem List */}
          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto pt-2">
            {items.map((item, idx) => (
              <div
                key={item.slug + idx}
                className="py-3 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Status Indicator */}
                  {item.status === "processing" && (
                    <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
                  )}
                  {item.status === "imported" && (
                    <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                  {item.status === "skipped" && (
                    <div className="w-5 h-5 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                      <RotateCcw className="w-3 h-3" />
                    </div>
                  )}
                  {item.status === "failed" && (
                    <div className="w-5 h-5 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                      <X className="w-3 h-3" />
                    </div>
                  )}
                  {item.status === "pending" && (
                    <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
                      <Clock className="w-3 h-3" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {item.leetcodeId && (
                        <span className="font-mono text-[11px] font-bold text-slate-500">
                          #{item.leetcodeId}
                        </span>
                      )}
                      <span className="font-bold text-slate-900 truncate">
                        {item.title || item.slug}
                      </span>
                      {item.difficulty && (
                        <DifficultyBadge difficulty={item.difficulty} size="sm" />
                      )}
                    </div>
                    <div className="font-mono text-[11px] text-slate-400 truncate">
                      problems/{item.slug}
                    </div>
                  </div>
                </div>

                {/* Status message / action */}
                <div className="shrink-0 text-right">
                  {item.status === "imported" && (
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[11px]">
                      Imported
                    </span>
                  )}
                  {item.status === "skipped" && (
                    <span className="inline-flex items-center gap-1 font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 text-[11px]">
                      {item.skipReason || "Already exists"}
                    </span>
                  )}
                  {item.status === "failed" && (
                    <span className="inline-flex items-center gap-1 font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md text-[11px]" title={item.error}>
                      {item.error || "Failed"}
                    </span>
                  )}
                  {item.status === "processing" && (
                    <span className="text-blue-600 font-medium text-[11px]">
                      Fetching...
                    </span>
                  )}
                  {item.status === "pending" && (
                    <span className="text-slate-400 text-[11px]">Queued</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completion Summary Card */}
      {isCompleted && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl space-y-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Import Session Complete</h3>
              <p className="text-xs text-slate-300">
                Summary of processed LeetCode problems
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-white/5 border border-white/10 text-center">
            <div>
              <div className="text-2xl font-black text-emerald-400">
                {importedCount}
              </div>
              <div className="text-xs text-slate-300 mt-0.5">
                Problems Imported
              </div>
            </div>

            <div>
              <div className="text-2xl font-black text-amber-400">
                {skippedCount}
              </div>
              <div className="text-xs text-slate-300 mt-0.5">
                Already Existed
              </div>
            </div>

            <div>
              <div className="text-2xl font-black text-rose-400">
                {failedCount}
              </div>
              <div className="text-xs text-slate-300 mt-0.5">
                Failed
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <span className="text-xs text-slate-400">
              Your revision library and spaced-repetition deck are up to date.
            </span>

            <div className="flex items-center gap-2">
              <Link
                href="/problems"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
              >
                <span>Problems Library</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <Link
                href="/revision"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                <span>Start Revision</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
