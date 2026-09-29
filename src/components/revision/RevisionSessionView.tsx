"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X,
  RotateCcw,
  Check,
  Calendar,
  Layers,
  Flame,
  Award,
} from "lucide-react";
import { PracticeEditorView, ProblemPracticeData, AcceptedSolutionData } from "@/components/practice/PracticeEditorView";
import { RecallRating } from "@/services/revision.service";

export interface DueProblemItem {
  problem: ProblemPracticeData;
  acceptedSolutions: AcceptedSolutionData[];
  schedule: {
    interval: number;
    nextReviewAt: string;
    lastPracticedAt: string | null;
  };
}

interface RevisionSessionViewProps {
  dueProblems: DueProblemItem[];
}

export function RevisionSessionView({ dueProblems }: RevisionSessionViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedProblems, setCompletedProblems] = useState<
    Array<{
      title: string;
      slug: string;
      number: number;
      rating: RecallRating;
      interval: number;
    }>
  >([]);
  const [isSessionComplete, setIsSessionComplete] = useState(false);

  // If no problems are due today
  if (dueProblems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-6 animate-in fade-in duration-300">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/80 shadow-xs">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Spaced Repetition Queue Clear</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            All Caught Up!
          </h1>
          <p className="text-sm text-slate-500 max-w-md mx-auto font-medium">
            You don&apos;t have any problems due for revision today. Your memory consolidation curve is in great shape!
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/problems"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
          >
            <span>Explore Problem Library</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold transition-colors"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // If the session has finished
  if (isSessionComplete || currentIndex >= dueProblems.length) {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4 space-y-8 animate-in fade-in duration-300">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-lg">
            <Award className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
              Batch Complete
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Revision Session Completed! 🎉
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              You reviewed {dueProblems.length} problem{dueProblems.length === 1 ? "" : "s"} due today. Your recall intervals have been updated.
            </p>
          </div>
        </div>

        {/* Reviewed Problems Summary */}
        <div className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider">
            Problems Reviewed in this Session
          </div>
          <div className="divide-y divide-slate-100 text-xs">
            {dueProblems.map((item, idx) => {
              const comp = completedProblems.find(
                (c) => c.slug === item.problem.slug
              );
              return (
                <div
                  key={item.problem.id}
                  className="px-6 py-4 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      #{item.problem.leetcodeId}
                    </span>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">
                        {item.problem.title}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {item.problem.difficulty} · {item.problem.tags.join(", ")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {comp ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Check className="w-3.5 h-3.5" />
                        <span>Next review in {comp.interval} days</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                        Reviewed
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-4 pt-2">
          <Link
            href="/"
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
          >
            Back to Dashboard
          </Link>
          <Link
            href="/problems"
            className="px-6 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold transition-colors"
          >
            Browse Problems
          </Link>
        </div>
      </div>
    );
  }

  const currentItem = dueProblems[currentIndex];
  const progressPercent = Math.round(
    ((currentIndex + 1) / dueProblems.length) * 100
  );

  return (
    <div className="space-y-3 animate-in fade-in duration-300">
      {/* Revision Session Header & Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-slate-900">
                Revision Session
              </h1>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-amber-100/80 text-amber-800">
                Problem {currentIndex + 1} of {dueProblems.length}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Reviewing due problems one at a time to maximize recall retention.
            </p>
          </div>
        </div>

        {/* Progress Bar & Skip */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end gap-1">
            <span className="text-[11px] font-bold text-slate-500 font-mono">
              {progressPercent}% Complete
            </span>
            <div className="w-32 sm:w-44 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <Link
            href="/"
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Exit revision session"
          >
            <X className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Embedded Practice Editor View for Active Due Problem */}
      <PracticeEditorView
        key={currentItem.problem.id}
        problem={currentItem.problem}
        acceptedSolutions={currentItem.acceptedSolutions}
      />
    </div>
  );
}
