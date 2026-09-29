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
  ExternalLink,
} from "lucide-react";
import {
  MOCK_USER_STATS,
  MOCK_PROBLEMS,
  MOCK_RECENT_PRACTICE,
} from "@/data/mock-problems";
import { StatCard } from "@/components/ui/StatCard";
import { RevisionCard } from "@/components/ui/RevisionCard";
import { ProgressCard } from "@/components/ui/ProgressCard";
import { QuickActions } from "@/components/ui/QuickActions";
import { DifficultyBadge } from "@/components/ui/DifficultyBadge";

export default function DashboardPage() {
  // Grab the 4 problems specifically requested for Today's Revision:
  // Single Number (#136), Two Sum (#1), Binary Search (#704), Valid Parentheses (#20)
  const todaysRevisionSlugs = [
    "single-number",
    "two-sum",
    "binary-search",
    "valid-parentheses",
  ];
  const revisionProblems = MOCK_PROBLEMS.filter((p) =>
    todaysRevisionSlugs.includes(p.slug)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Good morning, Kartik 👋
          </h1>
          <p className="mt-1 text-sm sm:text-base text-slate-500 font-medium">
            Keep your solved problems fresh. Practice what you&apos;ve already learned.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/practice/single-number"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-blue-200" />
            <span>Start Revision (4 Due)</span>
          </Link>
        </div>
      </div>

      {/* 2. Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Total Problems"
          value={MOCK_USER_STATS.totalProblems}
          subtitle="In your personal revision deck"
          icon={Layers}
          variant="blue"
        />
        <StatCard
          title="Solved"
          value={MOCK_USER_STATS.solvedCount}
          subtitle="100% verified solutions"
          icon={CheckCircle2}
          variant="emerald"
          trend={{ label: "+3 this week", positive: true }}
        />
        <StatCard
          title="Due Today"
          value={MOCK_USER_STATS.dueTodayCount}
          subtitle="Optimal retention interval"
          icon={ClockAlert}
          variant="orange"
          trend={{ label: "High Priority", positive: false }}
        />
        <StatCard
          title="Practice Streak"
          value={`${MOCK_USER_STATS.practiceStreakDays} Days`}
          subtitle="Personal best record: 21 days"
          icon={Flame}
          variant="violet"
          trend={{ label: "🔥 On fire!", positive: true }}
        />
      </div>

      {/* 3. Today's Revision Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">
                Today&apos;s Revision
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                4 Problems
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Problems scheduled for review today based on your memory decay curve.
            </p>
          </div>

          <Link
            href="/due"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
          >
            <span>View All Queue</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {revisionProblems.map((problem) => (
            <RevisionCard key={problem.id} problem={problem} />
          ))}
        </div>
      </section>

      {/* 4. Middle Row: Recently Practiced + Your Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recently Practiced List (2 Cols) */}
        <section className="lg:col-span-2 rounded-2xl bg-white border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Recently Practiced
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Latest recall and coding test attempts
                </p>
              </div>
              <Link
                href="/history"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>Full History</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Table / List */}
            <div className="overflow-x-auto mt-3">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    <th className="py-2.5 pr-4">Problem</th>
                    <th className="py-2.5 px-3">Difficulty</th>
                    <th className="py-2.5 px-3">Last Practiced</th>
                    <th className="py-2.5 px-3">Result</th>
                    <th className="py-2.5 pl-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {MOCK_RECENT_PRACTICE.map((item) => {
                    const prob = MOCK_PROBLEMS.find((p) => p.id === item.problemId);
                    const slug = prob?.slug || "single-number";
                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/70 transition-colors group"
                      >
                        <td className="py-3 pr-4">
                          <Link
                            href={`/problems/${slug}`}
                            className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-2"
                          >
                            <span className="font-mono text-slate-400 font-normal">
                              #{item.problemNumber}
                            </span>
                            <span>{item.problemTitle}</span>
                          </Link>
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap">
                          <DifficultyBadge difficulty={item.difficulty} size="sm" />
                        </td>

                        <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                          {item.practicedAt}
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap">
                          {item.result === "Passed" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                              <CheckCircle className="w-3 h-3 text-emerald-600" />
                              Passed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
                              <AlertCircle className="w-3 h-3 text-amber-600" />
                              Needs Review
                            </span>
                          )}
                        </td>

                        <td className="py-3 pl-3 text-right whitespace-nowrap">
                          <Link
                            href={`/practice/${slug}`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Practice Again</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Your Progress Section (1 Col) */}
        <section className="lg:col-span-1">
          <ProgressCard stats={MOCK_USER_STATS} />
        </section>
      </div>

      {/* 5. Quick Actions Section */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Quick Actions</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Common workflows to accelerate your DSA revision routine
          </p>
        </div>

        <QuickActions />
      </section>
    </div>
  );
}
