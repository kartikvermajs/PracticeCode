import React from "react";
import { TrendingUp, Award, Flame, CheckCircle, BarChart3, Target } from "lucide-react";
import { MOCK_USER_STATS } from "@/data/mock-problems";
import { ProgressCard } from "@/components/ui/ProgressCard";

export default function ProgressPage() {
  const topics = [
    { name: "Array & Hashing", solved: 24, total: 25, color: "bg-blue-500" },
    { name: "Two Pointers", solved: 14, total: 15, color: "bg-indigo-500" },
    { name: "Sliding Window", solved: 10, total: 12, color: "bg-cyan-500" },
    { name: "Stack", solved: 12, total: 14, color: "bg-violet-500" },
    { name: "Binary Search", solved: 8, total: 10, color: "bg-emerald-500" },
    { name: "Linked List", solved: 7, total: 9, color: "bg-teal-500" },
    { name: "Dynamic Programming", solved: 4, total: 12, color: "bg-rose-500" },
    { name: "Graphs & BFS/DFS", solved: 3, total: 8, color: "bg-amber-500" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="pb-2 border-b border-slate-200/80">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Progress & Analytics
        </h1>
        <p className="mt-1 text-sm text-slate-500 font-medium">
          Comprehensive breakdown of your DSA topic coverage and spaced repetition health.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ProgressCard stats={MOCK_USER_STATS} />
        </div>

        {/* Topic Breakdown */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Topic Mastery Distribution
              </h3>
              <p className="text-xs text-slate-500">
                Problems solved and retained per algorithm category
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
              8 Core Categories
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {topics.map((t) => {
              const pct = Math.round((t.solved / t.total) * 100);
              return (
                <div
                  key={t.name}
                  className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/60 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{t.name}</span>
                    <span className="font-mono text-slate-500">
                      {t.solved} / {t.total} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200/70 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${t.color}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
