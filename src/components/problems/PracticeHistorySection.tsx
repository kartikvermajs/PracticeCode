"use client";

import React, { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  History,
  Eye,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Code2,
  Calendar,
  X,
  Copy,
  Check,
  Lock,
  ArrowRight,
  ShieldCheck,
  FileCode2,
} from "lucide-react";
import { useTheme } from "next-themes";

// Dynamically load Monaco Editor with SSR disabled for Next.js App Router
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="h-[360px] flex flex-col items-center justify-center gap-2 bg-slate-50 text-slate-400 font-mono text-xs">
      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <span>Loading Attempt Code...</span>
    </div>
  ),
});

export interface PracticeAttemptItem {
  id: string;
  attemptNumber: number;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  language: string;
  code: string;
  status: string;
  duration: string;
}

interface PracticeHistorySectionProps {
  attempts: PracticeAttemptItem[];
  problemSlug: string;
  problemTitle: string;
}

function getLanguageBadge(lang: string) {
  const normalized = lang.toLowerCase();
  let label = lang.toUpperCase();
  if (normalized === "cpp" || normalized === "c++") label = "C++";
  else if (normalized === "c") label = "C";
  else if (normalized === "python" || normalized === "py") label = "Python";
  else if (normalized === "typescript" || normalized === "ts") label = "TypeScript";
  else if (normalized === "javascript" || normalized === "js") label = "JavaScript";
  else if (normalized === "java") label = "Java";

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md font-mono text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
      <Code2 className="w-3 h-3 text-slate-500" />
      <span>{label}</span>
    </span>
  );
}

function getStatusBadge(status: string) {
  const norm = status.toLowerCase();
  if (norm === "passed" || norm === "mastered") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        <span>Passed</span>
      </span>
    );
  }
  if (norm === "needs review" || norm === "partial") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
        <span>Needs Review</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
      <Clock className="w-3.5 h-3.5 text-blue-600" />
      <span>Attempted</span>
    </span>
  );
}

function getMonacoLanguage(lang: string): string {
  const norm = lang.toLowerCase();
  if (norm === "cpp" || norm === "c++") return "cpp";
  if (norm === "python" || norm === "py") return "python";
  if (norm === "typescript" || norm === "ts") return "typescript";
  if (norm === "javascript" || norm === "js") return "javascript";
  if (norm === "java") return "java";
  if (norm === "c") return "c";
  return norm;
}

export function PracticeHistorySection({
  attempts,
  problemSlug,
  problemTitle,
}: PracticeHistorySectionProps) {
  const [viewingAttempt, setViewingAttempt] = useState<PracticeAttemptItem | null>(
    null
  );
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  // Sort newest attempts first for display
  const sortedAttempts = [...attempts].reverse();
  const { resolvedTheme } = useTheme();

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden space-y-0">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/60 shadow-2xs">
            <History className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Practice History
              </h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {attempts.length} Attempt{attempts.length === 1 ? "" : "s"}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              One attempt recorded per day. Re-saving updates today&apos;s entry.
            </p>
          </div>
        </div>

        <Link
          href={`/practice/${problemSlug}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all active:scale-95 self-start sm:self-auto shrink-0"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span>New Practice Session</span>
        </Link>
      </div>

      {/* Attempts Table / Empty State */}
      {attempts.length === 0 ? (
        <div className="p-8 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
            <History className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No Practice Attempts Recorded Yet
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Start practicing this problem in the clean editor. Every attempt you save will be recorded here chronologically.
            </p>
          </div>
          <Link
            href={`/practice/${problemSlug}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
          >
            <span>Start First Practice Attempt</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                <th className="py-3 pl-6 pr-3 w-36 whitespace-nowrap">Attempt #</th>
                <th className="py-3 px-4 min-w-[160px] whitespace-nowrap">Date & Time</th>
                <th className="py-3 px-4 w-32 whitespace-nowrap">Language</th>
                <th className="py-3 px-4 w-32 whitespace-nowrap">Status</th>
                <th className="py-3 px-4 w-28 whitespace-nowrap">Duration</th>
                <th className="py-3 pl-4 pr-6 text-right w-52 whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-medium">
              {sortedAttempts.map((attempt) => (
                <tr
                  key={attempt.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group"
                >
                  {/* Attempt # */}
                  <td className="py-3.5 pl-6 pr-3 font-mono font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                    <span className="inline-block px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 whitespace-nowrap">
                      Attempt #{attempt.attemptNumber}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{attempt.createdAt}</span>
                    </div>
                  </td>

                  {/* Language */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {getLanguageBadge(attempt.language)}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {getStatusBadge(attempt.status)}
                  </td>

                  {/* Duration */}
                  <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 font-mono text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{attempt.duration}</span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 pl-4 pr-6 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      {/* View Button (Read-Only Monaco) */}
                      <button
                        type="button"
                        onClick={() => setViewingAttempt(attempt)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-all shadow-2xs active:scale-95"
                        title="View attempt code in read-only editor"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                        <span>View</span>
                      </button>

                      {/* Continue Attempt Button */}
                      <Link
                        href={`/practice/${problemSlug}?continueAttemptId=${attempt.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200/70 dark:border-blue-800/70 rounded-xl transition-all shadow-2xs active:scale-95"
                        title="Load this attempt's code into practice editor to continue practicing"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Continue</span>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: Read-Only Attempt Code Viewer                     */}
      {/* ======================================================== */}
      {/* ======================================================== */}
      {/* MODAL: Read-Only Attempt Code Viewer                     */}
      {/* ======================================================== */}
      {viewingAttempt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-3xl rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/60">
                  <FileCode2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Attempt #{viewingAttempt.attemptNumber} · {problemTitle}
                    </h3>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-2xs">
                      <Lock className="w-2.5 h-2.5 text-slate-400" />
                      Immutable
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Practiced on {viewingAttempt.createdAt} · Duration: {viewingAttempt.duration}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {getLanguageBadge(viewingAttempt.language)}
                {getStatusBadge(viewingAttempt.status)}

                {/* Copy button */}
                <button
                  type="button"
                  onClick={() => handleCopyCode(viewingAttempt.code)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors shadow-2xs"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 dark:text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setViewingAttempt(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Monaco Editor (Read-Only) */}
            <div className="flex-1 min-h-[380px] p-2 bg-white dark:bg-[#1e1e1e]">
              <MonacoEditor
                height="400px"
                language={getMonacoLanguage(viewingAttempt.language)}
                value={viewingAttempt.code}
                theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
                options={{
                  readOnly: true,
                  domReadOnly: true,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  fontSize: 13,
                  lineNumbers: "on",
                  wordWrap: "on",
                  folding: true,
                  scrollbar: {
                    verticalScrollbarSize: 8,
                    horizontalScrollbarSize: 8,
                  },
                  fontFamily:
                    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace",
                  smoothScrolling: true,
                }}
              />
            </div>

            {/* Modal Footer with "Continue Attempt" action */}
            <div className="px-6 py-3.5 bg-slate-50/80 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>This attempt record is permanently saved and will never be overwritten.</span>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => setViewingAttempt(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Close
                </button>

                <Link
                  href={`/practice/${problemSlug}?continueAttemptId=${viewingAttempt.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Continue Attempt in Editor</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
