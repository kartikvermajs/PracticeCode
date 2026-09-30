"use client";

import React from "react";
import Link from "next/link";
import {
  Layers,
  CheckCircle2,
  ClockAlert,
  Flame,
  ArrowRight,
  Sparkles,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  PlusCircle,
  CalendarCheck2,
} from "lucide-react";
import { DashboardData } from "@/lib/db-queries";
import { StatCard } from "@/components/ui/StatCard";
import { RevisionCard } from "@/components/ui/RevisionCard";
import { ProgressCard } from "@/components/ui/ProgressCard";
import { QuickActions } from "@/components/ui/QuickActions";
import { DifficultyBadge } from "@/components/ui/DifficultyBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { useDashboardQuery } from "@/hooks/useQueries";
import { RandomMotivationalCard } from "@/components/ui/RandomMotivationalCard";

interface DashboardViewProps {
  initialData: DashboardData;
}

export function DashboardView({ initialData }: DashboardViewProps) {
  // TanStack Query for advanced client-side caching
  const { data: cachedData } = useDashboardQuery(initialData);
  const { stats, revisionProblems, recentPractices } = cachedData || initialData;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Good morning, Kartik 👋
          </h1>
          <p className="mt-1 text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium">
            Keep your solved problems fresh. Practice what you&apos;ve already learned.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {stats.dueTodayCount > 0 ? (
            <Link
              href="/revision"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-blue-200" />
              <span>Start Revision ({stats.dueTodayCount} Due)</span>
            </Link>
          ) : stats.totalProblems > 0 ? (
            <Link
              href="/problems"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-all active:scale-95"
            >
              <CalendarCheck2 className="w-4 h-4 text-emerald-400" />
              <span>All Caught Up · View Problems</span>
            </Link>
          ) : (
            <Link
              href="/problems/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add First Problem</span>
            </Link>
          )}
        </div>
      </div>

      {/* Motivational Cheer Banner */}
      <RandomMotivationalCard pool="ambient" variant="card" />

      {/* 2. Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Total Problems"
          value={stats.totalProblems}
          subtitle="In your personal revision deck"
          icon={Layers}
          variant="blue"
        />
        <StatCard
          title="Solved"
          value={stats.totalSolved}
          subtitle={
            stats.totalProblems > 0
              ? `${Math.round((stats.totalSolved / stats.totalProblems) * 100)}% verified solutions`
              : "0 verified solutions"
          }
          icon={CheckCircle2}
          variant="emerald"
          trend={stats.totalSolved > 0 ? { label: "+1 active", positive: true } : undefined}
        />
        <StatCard
          title="Due Today"
          value={stats.dueTodayCount}
          subtitle="Optimal retention interval"
          icon={ClockAlert}
          variant="orange"
          trend={
            stats.dueTodayCount > 0
              ? { label: "High Priority", positive: false }
              : { label: "All Clear", positive: true }
          }
        />
        <StatCard
          title="Practice Streak"
          value={`${stats.practiceStreakDays} Days`}
          subtitle={
            stats.practiceStreakDays > 0
              ? "Daily recall on track"
              : "Practice today to build your streak"
          }
          icon={Flame}
          variant="violet"
          trend={stats.practiceStreakDays > 0 ? { label: "🔥 Active", positive: true } : undefined}
        />
      </div>

      {/* 3. Today's Revision Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Today&apos;s Revision
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                {revisionProblems.length} Problem{revisionProblems.length === 1 ? "" : "s"}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Problems scheduled for review today based on your memory decay curve.
            </p>
          </div>

          {revisionProblems.length > 0 && (
            <Link
              href="/due"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 group"
            >
              <span>View All Queue</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          )}
        </div>

        {revisionProblems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {revisionProblems.map((problem) => (
              <RevisionCard key={problem.id} problem={problem} />
            ))}
          </div>
        ) : stats.totalProblems === 0 ? (
          <EmptyState
            title="Your revision deck is empty"
            description="You don't have any problems in your library yet. Add your first solved LeetCode problem to start your spaced repetition cycle."
            actionLabel="Add Problem"
            actionHref="/problems/new"
          />
        ) : (
          <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-3 shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CalendarCheck2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              All caught up for today! 🎉
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              No problems are currently due for review based on your spaced repetition decay curve. Practice a random problem to stay ahead.
            </p>
            <div className="pt-2">
              <Link
                href="/problems"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-xl transition-colors"
              >
                <span>Browse All Problems</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* 4. Middle Row: Recently Practiced + Your Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recently Practiced List (2 Cols) */}
        <section className="lg:col-span-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  Recently Practiced
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Latest recall and coding test attempts
                </p>
              </div>
              <Link
                href="/history"
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
              >
                <span>Full History</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentPractices.length > 0 ? (
              <div className="overflow-x-auto mt-3">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800">
                      <th className="py-2.5 pr-4">Problem</th>
                      <th className="py-2.5 px-3">Difficulty</th>
                      <th className="py-2.5 px-3">Last Practiced</th>
                      <th className="py-2.5 px-3">Result</th>
                      <th className="py-2.5 pl-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {recentPractices.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors group"
                      >
                        <td className="py-3 pr-4">
                          <Link
                            href={`/problems/${item.slug}`}
                            className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center gap-2"
                          >
                            <span className="font-mono text-slate-400 dark:text-slate-500 font-normal">
                              #{item.problemNumber}
                            </span>
                            <span>{item.problemTitle}</span>
                          </Link>
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap">
                          <DifficultyBadge difficulty={item.difficulty} size="sm" />
                        </td>

                        <td className="py-3 px-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {item.lastPracticed}
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap">
                          {item.result === "Passed" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                              <CheckCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                              Passed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60">
                              <AlertCircle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                              Needs Review
                            </span>
                          )}
                        </td>

                        <td className="py-3 pl-3 text-right whitespace-nowrap">
                          <Link
                            href={`/practice/${item.slug}`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Practice Again</span>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center">
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  No practice sessions logged yet. Launch a session to begin recording attempts.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Your Progress Section (1 Col) */}
        <section className="lg:col-span-1">
          <ProgressCard stats={stats} />
        </section>
      </div>

      {/* 5. Quick Actions Section */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Quick Actions</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Common workflows to accelerate your DSA revision routine
          </p>
        </div>

        <QuickActions />
      </section>
    </div>
  );
}
