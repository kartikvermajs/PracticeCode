import React from "react";

export default function ProblemsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-slate-200 rounded-xl" />
          <div className="h-4 w-72 bg-slate-100 rounded-lg" />
        </div>
        <div className="h-10 w-32 bg-slate-200 rounded-xl" />
      </div>

      {/* Filter toolbar skeleton */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="h-10 flex-1 bg-slate-100 rounded-xl" />
          <div className="flex gap-2">
            <div className="h-10 w-28 bg-slate-100 rounded-xl" />
            <div className="h-10 w-28 bg-slate-100 rounded-xl" />
            <div className="h-10 w-28 bg-slate-100 rounded-xl" />
          </div>
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-slate-100">
          <div className="flex gap-2">
            <div className="h-6 w-16 bg-slate-100 rounded-lg" />
            <div className="h-6 w-16 bg-slate-100 rounded-lg" />
            <div className="h-6 w-16 bg-slate-100 rounded-lg" />
          </div>
          <div className="h-4 w-32 bg-slate-100 rounded" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-2xs p-4 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-14 w-full bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between px-4"
          >
            <div className="flex items-center gap-3">
              <div className="h-5 w-8 bg-slate-200 rounded" />
              <div className="h-5 w-40 bg-slate-200 rounded" />
              <div className="h-5 w-16 bg-slate-100 rounded-full" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-20 bg-slate-100 rounded-xl" />
              <div className="h-8 w-20 bg-blue-100 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
