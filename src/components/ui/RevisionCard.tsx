import React from "react";
import Link from "next/link";
import { ArrowRight, Calendar, Clock, Sparkles } from "lucide-react";
import { Problem } from "@/types";
import { DifficultyBadge } from "./DifficultyBadge";
import { TopicBadge } from "./TopicBadge";

interface RevisionCardProps {
  problem: Problem;
}

export function RevisionCard({ problem }: RevisionCardProps) {
  return (
    <div className="group relative flex flex-col justify-between rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300">
      {/* Due badge top highlight */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
            #{problem.number}
          </span>
          <DifficultyBadge difficulty={problem.difficulty} size="sm" />
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
          <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
          Due for Review
        </span>
      </div>

      <div>
        <Link
          href={`/problems/${problem.slug}`}
          className="group-hover:text-blue-600 transition-colors inline-block"
        >
          <h4 className="text-base font-semibold text-slate-900 line-clamp-1">
            {problem.title}
          </h4>
        </Link>

        {/* Topics */}
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {problem.topics.slice(0, 2).map((t) => (
            <TopicBadge key={t} topic={t} size="sm" />
          ))}
          {problem.topics.length > 2 && (
            <span className="text-[11px] text-slate-400 self-center">
              +{problem.topics.length - 2}
            </span>
          )}
        </div>
      </div>

      <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Last: {problem.lastPracticed}</span>
        </div>

        <Link
          href={`/practice/${problem.slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600 text-white shadow-xs hover:bg-blue-700 active:scale-95 transition-all"
        >
          <span>Practice</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
