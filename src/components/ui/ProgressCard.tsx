import React from "react";
import { UserStats } from "@/types";
import { CheckCircle2, Trophy } from "lucide-react";

interface ProgressCardProps {
  stats: UserStats;
}

export function ProgressCard({ stats }: ProgressCardProps) {
  const categories = [
    {
      label: "Easy",
      solved: stats.easySolved,
      total: stats.easyTotal,
      percentage: stats.easyTotal > 0 ? Math.round((stats.easySolved / stats.easyTotal) * 100) : 0,
      barColor: "bg-emerald-500",
      textColor: "text-emerald-700",
      bgLight: "bg-emerald-50",
      pillBorder: "border-emerald-200/80",
    },
    {
      label: "Medium",
      solved: stats.mediumSolved,
      total: stats.mediumTotal,
      percentage: stats.mediumTotal > 0 ? Math.round((stats.mediumSolved / stats.mediumTotal) * 100) : 0,
      barColor: "bg-amber-500",
      textColor: "text-amber-700",
      bgLight: "bg-amber-50",
      pillBorder: "border-amber-200/80",
    },
    {
      label: "Hard",
      solved: stats.hardSolved,
      total: stats.hardTotal,
      percentage: stats.hardTotal > 0 ? Math.round((stats.hardSolved / stats.hardTotal) * 100) : 0,
      barColor: "bg-rose-500",
      textColor: "text-rose-700",
      bgLight: "bg-rose-50",
      pillBorder: "border-rose-200/80",
    },
  ];

  const totalPool = stats.easyTotal + stats.mediumTotal + stats.hardTotal;
  const totalMastery = totalPool > 0
    ? Math.round(
        ((stats.easySolved + stats.mediumSolved + stats.hardSolved) / totalPool) * 100
      )
    : 0;

  return (
    <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between h-full">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Your Progress</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Revision mastery by difficulty level
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60 text-xs font-semibold">
          <Trophy className="w-3.5 h-3.5 text-blue-600" />
          <span>{totalMastery}% Retention</span>
        </div>
      </div>

      <div className="space-y-4 my-4">
        {categories.map((cat) => (
          <div key={cat.label} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className={`font-semibold ${cat.textColor}`}>{cat.label}</span>
                <span className="text-slate-400 font-mono">
                  {cat.solved} / {cat.total}
                </span>
              </div>
              <span className="font-semibold text-slate-700 font-mono">
                {cat.percentage}%
              </span>
            </div>

            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${cat.barColor}`}
                style={{ width: `${cat.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          {stats.solvedCount} problems in active spaced-repetition loop
        </span>
      </div>
    </div>
  );
}
