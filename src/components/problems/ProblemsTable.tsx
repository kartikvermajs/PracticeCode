"use client";

import React from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  ExternalLink,
  ArrowRight,
  Sparkles,
  Clock,
  CheckCircle2,
  Calendar,
  Layers,
  Code2,
  AlertCircle,
  RotateCcw,
  BookOpen,
} from "lucide-react";
import { ProblemLibraryItem } from "@/lib/db-queries";
import { DifficultyBadge } from "@/components/ui/DifficultyBadge";
import { TopicBadge } from "@/components/ui/TopicBadge";
import { EmptyState } from "@/components/ui/EmptyState";

interface ProblemsTableProps {
  problems: ProblemLibraryItem[];
  totalInDb: number;
  onOpenAddModal: () => void;
}

export function ProblemsTable({
  problems,
  totalInDb,
  onOpenAddModal,
}: ProblemsTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleTagClick = (tag: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tag", tag);
    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleClearFilters = () => {
    router.replace(pathname, { scroll: false });
  };

  // Case 1: Database has zero problems
  if (totalInDb === 0) {
    return (
      <div className="p-12 text-center rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
          <BookOpen className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-900">
            Your Revision Library is Empty
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Add your first solved LeetCode problem to start tracking spaced repetition intervals and practice attempts.
          </p>
        </div>
        <button
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
        >
          <span>Add Your First Problem</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Case 2: Filters yielded zero problems
  if (problems.length === 0) {
    return (
      <EmptyState
        title="No problems match your filters"
        description="Try adjusting your search query, difficulty, or topic tags to find problems in your revision library."
        actionLabel="Clear all filters"
        onAction={handleClearFilters}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table View */}
      <div className="hidden md:block rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-700/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3.5 pl-6 pr-3 w-20">#</th>
                <th className="py-3.5 px-4 min-w-[220px]">Title</th>
                <th className="py-3.5 px-4 w-28">Difficulty</th>
                <th className="py-3.5 px-4 min-w-[200px]">Tags</th>
                <th className="py-3.5 px-4 w-32">Status</th>
                <th className="py-3.5 px-4 w-36">Last Practiced</th>
                <th className="py-3.5 px-4 w-36">Next Review</th>
                <th className="py-3.5 pl-4 pr-6 text-right w-44">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-medium">
              {problems.map((problem) => (
                <tr
                  key={problem.id}
                  className="hover:bg-blue-50/30 dark:hover:bg-slate-850 transition-colors group"
                >
                  {/* Problem Number */}
                  <td className="py-4 pl-6 pr-3 font-mono font-bold text-slate-400 dark:text-slate-500 group-hover:text-blue-600 transition-colors">
                    #{problem.number}
                  </td>

                  {/* Title & LeetCode URL */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/problems/${problem.slug}`}
                        className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1"
                      >
                        {problem.title}
                      </Link>
                      {problem.url && (
                        <a
                          href={problem.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-opacity"
                          title="Open on LeetCode"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </td>

                  {/* Difficulty */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <DifficultyBadge difficulty={problem.difficulty} size="sm" />
                  </td>

                  {/* Tags */}
                  <td className="py-4 px-4">
                    <div className="flex flex-wrap gap-1.5 max-w-sm">
                      {problem.tags.map((t) => (
                        <button
                          key={t}
                          onClick={() => handleTagClick(t)}
                          type="button"
                          className="hover:scale-105 transition-transform"
                          title={`Filter by ${t}`}
                        >
                          <TopicBadge topic={t} size="sm" />
                        </button>
                      ))}
                    </div>
                  </td>

                  {/* Solved Status */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    {problem.isSolved ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/80">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Solved</span>
                      </span>
                    ) : problem.statusText === "Attempted" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200/80 dark:border-blue-800/80">
                        <Code2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>Attempted</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700/80">
                        <span>Unsolved</span>
                      </span>
                    )}
                  </td>

                  {/* Last Practiced */}
                  <td className="py-4 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{problem.lastPracticed}</span>
                    </div>
                  </td>

                  {/* Next Review */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    {problem.isDue ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 shadow-2xs animate-pulse">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 fill-amber-500" />
                        <span>Due Today</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{problem.nextReview}</span>
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-4 pl-4 pr-6 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/problems/${problem.slug}`}
                        className="px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        Solution
                      </Link>
                      <Link
                        href={`/practice/${problem.slug}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all active:scale-95"
                      >
                        <span>Practice</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {problems.map((problem) => (
          <div
            key={problem.id}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="font-mono text-xs font-bold text-slate-400 dark:text-slate-500">
                    #{problem.number}
                  </span>
                  <Link
                    href={`/problems/${problem.slug}`}
                    className="font-bold text-sm text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {problem.title}
                  </Link>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  <DifficultyBadge difficulty={problem.difficulty} size="sm" />
                  {problem.isDue ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                      Due Today
                    </span>
                  ) : problem.isSolved ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                      Solved
                    </span>
                  ) : null}
                </div>
              </div>

              {problem.url && (
                <a
                  href={problem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1">
              {problem.tags.map((t) => (
                <button key={t} onClick={() => handleTagClick(t)}>
                  <TopicBadge topic={t} size="sm" />
                </button>
              ))}
            </div>

            {/* Timings */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                Last: {problem.lastPracticed}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                Next: {problem.nextReview}
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 pt-1">
              <Link
                href={`/problems/${problem.slug}`}
                className="flex-1 text-center py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors"
              >
                View Solution
              </Link>
              <Link
                href={`/practice/${problem.slug}`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all active:scale-95"
              >
                <span>Practice</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
