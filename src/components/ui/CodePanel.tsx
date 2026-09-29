"use client";

import React, { useState } from "react";
import { Check, Copy, Terminal } from "lucide-react";

interface CodePanelProps {
  code: string;
  language: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  notes?: string;
  availableLanguages?: string[];
  onLanguageChange?: (lang: string) => void;
}

export function CodePanel({
  code,
  language,
  timeComplexity,
  spaceComplexity,
  notes,
  availableLanguages = ["typescript", "python", "cpp"],
  onLanguageChange,
}: CodePanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const lines = code.trim().split("\n");

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-xs">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50/80 border-b border-slate-200/80">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Your Original Solution
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => onLanguageChange?.(e.target.value)}
            className="text-xs bg-white border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs"
          >
            {availableLanguages.map((lang) => (
              <option key={lang} value={lang}>
                {lang === "cpp" ? "C++" : lang.charAt(0).toUpperCase() + lang.slice(1)}
              </option>
            ))}
          </select>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 bg-white hover:text-slate-900 border border-slate-200 rounded-lg shadow-2xs transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Viewer */}
      <div className="p-4 bg-[#FAFAFA] font-mono text-xs overflow-x-auto text-slate-800 leading-relaxed border-b border-slate-100">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className="hover:bg-slate-100/60 transition-colors">
                <td className="pr-4 text-right select-none text-slate-400 font-mono text-[11px] w-8 align-top">
                  {idx + 1}
                </td>
                <td className="whitespace-pre font-mono text-slate-800">
                  {line || " "}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Complexity and Notes footer */}
      {(timeComplexity || spaceComplexity || notes) && (
        <div className="p-4 bg-white space-y-2.5 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            {timeComplexity && (
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-medium">Time:</span>
                <span className="font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                  {timeComplexity}
                </span>
              </div>
            )}
            {spaceComplexity && (
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-medium">Space:</span>
                <span className="font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60">
                  {spaceComplexity}
                </span>
              </div>
            )}
          </div>
          {notes && (
            <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs leading-relaxed">
              <strong className="text-slate-800 font-medium">Recall Note: </strong>
              {notes}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
