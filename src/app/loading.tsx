import React from "react";

export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* 1. Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-slate-200 rounded-xl" />
          <div className="h-4 w-96 max-w-full bg-slate-200/70 rounded-lg" />
        </div>
        <div className="h-10 w-48 bg-slate-200 rounded-xl" />
      </div>

      {/* 2. Stats Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-24 bg-slate-200 rounded" />
              <div className="h-9 w-9 rounded-xl bg-slate-100" />
            </div>
            <div className="h-8 w-20 bg-slate-200 rounded-lg" />
            <div className="h-3 w-36 bg-slate-100 rounded" />
          </div>
        ))}
      </div>

      {/* 3. Today's Revision Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="h-5 w-40 bg-slate-200 rounded" />
            <div className="h-3.5 w-72 bg-slate-100 rounded" />
          </div>
          <div className="h-4 w-28 bg-slate-200 rounded" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs space-y-4 h-48 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex justify-between">
                  <div className="h-5 w-12 bg-slate-200 rounded" />
                  <div className="h-4 w-20 bg-slate-100 rounded-full" />
                </div>
                <div className="h-5 w-36 bg-slate-200 rounded" />
                <div className="flex gap-1.5 pt-1">
                  <div className="h-4 w-14 bg-slate-100 rounded" />
                  <div className="h-4 w-16 bg-slate-100 rounded" />
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                <div className="h-3 w-20 bg-slate-100 rounded" />
                <div className="h-7 w-20 bg-slate-200 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Bottom Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200/80 p-6 space-y-4">
          <div className="h-5 w-44 bg-slate-200 rounded" />
          <div className="space-y-3 pt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 w-full bg-slate-100 rounded-xl" />
            ))}
          </div>
        </div>
        <div className="lg:col-span-1 rounded-2xl bg-white border border-slate-200/80 p-6 space-y-4">
          <div className="h-5 w-32 bg-slate-200 rounded" />
          <div className="space-y-3 pt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-1.5">
                <div className="h-3.5 w-full bg-slate-100 rounded" />
                <div className="h-2.5 w-full bg-slate-200 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
