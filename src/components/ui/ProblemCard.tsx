import React from "react";
import Link from "next/link";
import { ArrowRight, Calendar, CheckCircle2, ChevronRight, Clock, Sparkles } from "lucide-react";
import { Problem } from "@/types";
import { DifficultyBadge } from "./DifficultyBadge";
import { TopicBadge } from "./TopicBadge";

interface ProblemCardProps {
  problem: Problem;
}

export function ProblemCard({ problem }: ProblemCardProps) {
  return (
    <div className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all duration-200">
      <div className="flex items-start gap-4">
        {/* Number badge */}
        <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 mt-0.5">
          #{problem.number}
        </span>

        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <Link
              href={`/problems/${problem.slug}`}
              className="text-base font-semibold text-slate-900 group-hover:text-blue-600 transition-colors"
            >
              {problem.title}
            </Link>
            <DifficultyBadge difficulty={problem.difficulty} size="sm" />
            {problem.isDue ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Due Today
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                Fresh
              </span>
            )}
          </div>

          {/* Topics and Meta */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {problem.topics.map((t) => (
              <TopicBadge key={t} topic={t} size="sm" />
            ))}
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              Last: {problem.lastPracticed}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
        <Link
          href={`/problems/${problem.slug}`}
          className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
        >
          View Solution
        </Link>
        <Link
          href={`/practice/${problem.slug}`}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all active:scale-95"
        >
          <span>Practice</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
