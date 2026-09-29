"use client";

import React from "react";
import Link from "next/link";
import {
  X,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
  Edit3,
  Loader2,
  Check,
  ShieldCheck,
} from "lucide-react";
import { DifficultyBadge } from "@/components/ui/DifficultyBadge";
import { TopicBadge } from "@/components/ui/TopicBadge";
import { LeetCodeParsedProblem } from "@/lib/leetcode/types";

interface ImportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  problem: LeetCodeParsedProblem | null;
  exists: boolean;
  existingSlug?: string;
  existingTitle?: string;
  existingNumber?: number;
  onConfirmImport: () => Promise<void>;
  onUpdateManually: (problem: LeetCodeParsedProblem) => void;
  isImporting: boolean;
}

export function ImportPreviewModal({
  isOpen,
  onClose,
  problem,
  exists,
  existingSlug,
  existingTitle,
  existingNumber,
  onConfirmImport,
  onUpdateManually,
  isImporting,
}: ImportPreviewModalProps) {
  if (!isOpen || !problem) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Import Preview
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title="Close Preview"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-900">
          {/* Duplicate Problem Banner if exists */}
          {exists && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 font-bold text-sm text-amber-950">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>This problem already exists.</span>
              </div>
              <p className="text-xs text-amber-800">
                Problem #{existingNumber || problem.leetcodeId} (&ldquo;
                {existingTitle || problem.title}&rdquo;) is already recorded in
                your revision library. CodeRev does not automatically overwrite
                existing problems.
              </p>
              <div className="pt-1 flex flex-wrap items-center gap-2">
                {existingSlug && (
                  <Link
                    href={`/problems/${existingSlug}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-lg shadow-2xs transition-colors"
                  >
                    <span>View Problem</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => onUpdateManually(problem)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-900 bg-white hover:bg-amber-100/60 border border-amber-300 rounded-lg transition-colors"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Update manually</span>
                </button>
              </div>
            </div>
          )}

          {/* Problem Meta Header */}
          <div className="space-y-2 pb-4 border-b border-slate-100">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                #{problem.leetcodeId}
              </span>
              <DifficultyBadge difficulty={problem.difficulty} size="sm" />
              <span className="text-xs font-mono text-slate-400">
                slug: {problem.slug}
              </span>
            </div>

            <h2 className="text-xl font-extrabold text-slate-900">
              {problem.title}
            </h2>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {problem.tags.map((tag) => (
                <TopicBadge key={tag} topic={tag} size="sm" />
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Description
            </h3>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-sans">
              {problem.description}
            </div>
          </div>

          {/* Examples */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Examples ({problem.examples.length})
            </h3>
            <div className="space-y-2.5">
              {problem.examples.map((ex, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1.5"
                >
                  <div className="font-bold text-slate-800">Example {idx + 1}:</div>
                  <div className="font-mono text-slate-700">
                    <span className="text-slate-400 font-sans font-semibold">
                      Input:{" "}
                    </span>
                    {ex.input}
                  </div>
                  <div className="font-mono text-slate-700">
                    <span className="text-slate-400 font-sans font-semibold">
                      Output:{" "}
                    </span>
                    {ex.output}
                  </div>
                  {ex.explanation && (
                    <div className="text-slate-600">
                      <span className="text-slate-400 font-semibold">
                        Explanation:{" "}
                      </span>
                      {ex.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Constraints */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Constraints ({problem.constraints.length})
            </h3>
            <ul className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs font-mono text-slate-700 space-y-1 list-disc list-inside">
              {problem.constraints.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/70">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 rounded-xl transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            {exists ? (
              <button
                type="button"
                onClick={() => onUpdateManually(problem)}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition-all"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Update manually</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onConfirmImport}
                disabled={isImporting}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-xl shadow-xs transition-all active:scale-95"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Importing Problem...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 text-blue-200" />
                    <span>Confirm Import</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
