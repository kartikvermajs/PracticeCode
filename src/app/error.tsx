"use client";

import React, { useEffect } from "react";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error caught by boundary:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[55vh] p-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-600 flex items-center justify-center mb-4 shadow-xs">
        <AlertCircle className="w-7 h-7" />
      </div>

      <h2 className="text-xl font-bold text-slate-900 tracking-tight">
        Something went wrong loading your dashboard
      </h2>
      <p className="mt-1.5 text-xs text-slate-500 max-w-md leading-relaxed">
        We encountered a database connection or rendering issue while retrieving your revision statistics.
      </p>

      {error.message && (
        <pre className="mt-3 p-3 max-w-lg overflow-x-auto text-[11px] font-mono bg-slate-100 text-slate-700 rounded-xl border border-slate-200/80 text-left">
          {error.message}
        </pre>
      )}

      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Try Again</span>
        </button>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-colors"
        >
          <Home className="w-3.5 h-3.5 text-slate-500" />
          <span>Reload Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
