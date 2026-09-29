"use client";

import React, { useState } from "react";
import { Plus, BookOpen, CheckCircle2, Sparkles, Layers } from "lucide-react";
import { ProblemsLibraryResult } from "@/lib/db-queries";
import { ProblemsFilterToolbar } from "./ProblemsFilterToolbar";
import { ProblemsTable } from "./ProblemsTable";
import { ProblemsPagination } from "./ProblemsPagination";
import { AddProblemModal } from "./AddProblemModal";

interface ProblemsLibraryViewProps {
  data: ProblemsLibraryResult;
}

export function ProblemsLibraryView({ data }: ProblemsLibraryViewProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { problems, total, page, limit, totalPages, allTags, stats } = data;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* 1. Page Header with Real Stats Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Problems
            </h1>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {stats.totalCount} Total
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                {stats.solvedCount} Solved
              </span>
              {stats.dueCount > 0 && (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300">
                  ⚡ {stats.dueCount} Due
                </span>
              )}
            </div>
          </div>
          <p className="mt-1 text-sm text-slate-500 font-medium">
            Your personal LeetCode revision library. Practice what you have already learned.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Problem</span>
          </button>
        </div>
      </div>

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
