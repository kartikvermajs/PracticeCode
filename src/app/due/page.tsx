import React from "react";
import Link from "next/link";
import { Sparkles, ClockAlert, ArrowRight, CheckCircle2, RotateCcw } from "lucide-react";
import { MOCK_PROBLEMS } from "@/data/mock-problems";
import { DifficultyBadge } from "@/components/ui/DifficultyBadge";
import { TopicBadge } from "@/components/ui/TopicBadge";

export default function DueForRevisionPage() {
  const dueProblems = MOCK_PROBLEMS.filter((p) => p.isDue);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Due for Revision
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              {dueProblems.length} Pending
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500 font-medium">
            Calculated using spaced-repetition memory decay curves to maximize long-term retention.
          </p>
        </div>

        <Link
          href={`/practice/${dueProblems[0]?.slug || "single-number"}`}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all active:scale-95"
        >
          <Sparkles className="w-4 h-4 text-blue-200" />
          <span>Start Revision Batch</span>
        </Link>
      </div>

      {/* Grid of Due Problems */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dueProblems.map((problem) => (
          <div
            key={problem.id}
            className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                    #{problem.number}
                  </span>
                  <DifficultyBadge difficulty={problem.difficulty} size="sm" />
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  ⚡ Immediate Review
                </span>
              </div>

              <Link
                href={`/problems/${problem.slug}`}
                className="text-base font-bold text-slate-900 hover:text-blue-600 transition-colors"
              >
                {problem.title}
              </Link>

              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {problem.topics.map((t) => (
                  <TopicBadge key={t} topic={t} size="sm" />
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Last practiced: {problem.lastPracticed}</span>
              <div className="flex items-center gap-2">
                <Link
                  href={`/problems/${problem.slug}`}
                  className="px-3 py-1.5 font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Solution
                </Link>
                <Link
                  href={`/practice/${problem.slug}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors"
                >
                  <span>Practice</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
