import React from "react";
import Link from "next/link";
import { History, CheckCircle2, RotateCcw, Clock, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";
import { MOCK_RECENT_PRACTICE, MOCK_PROBLEMS } from "@/data/mock-problems";
import { DifficultyBadge } from "@/components/ui/DifficultyBadge";

export default function PracticeHistoryPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Practice History
          </h1>
          <p className="mt-1 text-sm text-slate-500 font-medium">
            Chronological log of your practice runs, recall tests, and submission stats.
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 pl-5 pr-3">Problem</th>
                <th className="py-3.5 px-3">Difficulty</th>
                <th className="py-3.5 px-3">Timestamp</th>
                <th className="py-3.5 px-3">Duration</th>
                <th className="py-3.5 px-3">Result</th>
                <th className="py-3.5 px-3">Confidence</th>
                <th className="py-3.5 pl-3 pr-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {MOCK_RECENT_PRACTICE.map((item) => {
                const prob = MOCK_PROBLEMS.find((p) => p.id === item.problemId);
                const slug = prob?.slug || "single-number";
                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="py-3.5 pl-5 pr-3 font-semibold text-slate-900">
                      <Link
                        href={`/problems/${slug}`}
                        className="group-hover:text-blue-600 transition-colors flex items-center gap-2"
                      >
                        <span className="font-mono text-slate-400 font-normal">
                          #{item.problemNumber}
                        </span>
                        <span>{item.problemTitle}</span>
                      </Link>
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <DifficultyBadge difficulty={item.difficulty} size="sm" />
                    </td>

                    <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap">
                      {item.practicedAt}
                    </td>

                    <td className="py-3.5 px-3 text-slate-600 font-mono whitespace-nowrap">
                      {item.duration}
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap">
                      {item.result === "Passed" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          Passed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                          Needs Review
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className="font-medium text-slate-700">
                        {item.confidence}
                      </span>
                    </td>

                    <td className="py-3.5 pl-3 pr-5 text-right whitespace-nowrap">
                      <Link
                        href={`/practice/${slug}`}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Re-test</span>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
