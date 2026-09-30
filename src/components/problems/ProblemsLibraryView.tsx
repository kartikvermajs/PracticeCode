"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, BookOpen, CheckCircle2, Sparkles, Layers, Download } from "lucide-react";
import { ProblemsLibraryResult } from "@/lib/db-queries";
import { ProblemsFilterToolbar } from "./ProblemsFilterToolbar";
import { ProblemsTable } from "./ProblemsTable";
import { ProblemsPagination } from "./ProblemsPagination";
import { AddProblemModal } from "./AddProblemModal";
import { RandomMotivationalCard } from "@/components/ui/RandomMotivationalCard";
import { useProblemsLibraryQuery } from "@/hooks/useQueries";

interface ProblemsLibraryViewProps {
  data: ProblemsLibraryResult;
}

export function ProblemsLibraryView({ data: initialData }: ProblemsLibraryViewProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // TanStack Query for client-side caching & instant retrieval
  const { data: queryData } = useProblemsLibraryQuery(undefined, initialData);
  const data = queryData || initialData;

  const { problems, total, page, limit, totalPages, allTags, stats } = data;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* 1. Page Header with Real Stats Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Problems
            </h1>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {stats.totalCount} Total
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/80">
                {stats.solvedCount} Solved
              </span>
              {stats.dueCount > 0 && (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                  ⚡ {stats.dueCount} Due
                </span>
              )}
            </div>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 font-medium">
            Your personal LeetCode revision library. Practice what you have already learned.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/problems/import"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-bold shadow-2xs transition-all active:scale-95"
          >
            <Download className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>Bulk Import</span>
          </Link>

          <Link
            href="/problems/new"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Problem</span>
          </Link>
        </div>
      </div>

      {/* Motivational message banner */}
      <RandomMotivationalCard pool="ambient" variant="subtle" />

      {/* 2. Polished Filter Toolbar */}
      <ProblemsFilterToolbar
        allTags={allTags}
        totalCount={stats.totalCount}
        filteredCount={total}
      />

      {/* 3. Problems Table / Cards */}
      <ProblemsTable
        problems={problems}
        totalInDb={stats.totalCount}
        onOpenAddModal={() => setIsAddModalOpen(true)}
      />

      {/* 4. Pagination */}
      <ProblemsPagination
        page={page}
        totalPages={totalPages}
        total={total}
        limit={limit}
      />

      {/* 5. Add Problem Modal */}
      <AddProblemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
