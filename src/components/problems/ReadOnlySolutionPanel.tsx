"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Code2,
  Copy,
  Check,
  Play,
  ExternalLink,
  ShieldCheck,
  Terminal,
  Sparkles,
  Lock,
} from "lucide-react";

// Load Monaco Editor dynamically with ssr: false for Next.js App Router
const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] flex flex-col items-center justify-center gap-2 bg-slate-50 text-slate-400 font-mono text-xs border border-slate-100 rounded-xl">
      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <span>Loading Monaco Editor...</span>
    </div>
  ),
});

export interface SolutionItem {
  id: string;
  language: string;
  code: string;
  isAccepted: boolean;
}

interface ReadOnlySolutionPanelProps {
  solutions: SolutionItem[];
  slug: string;
  leetcodeUrl: string;
}

function getMonacoLanguage(lang: string): string {
  const normalized = lang.toLowerCase();
  if (normalized === "cpp" || normalized === "c++") return "cpp";
  if (normalized === "python" || normalized === "py") return "python";
  if (normalized === "javascript" || normalized === "js") return "javascript";
  if (normalized === "typescript" || normalized === "ts") return "typescript";
  if (normalized === "java") return "java";
  if (normalized === "c") return "c";
  if (normalized === "csharp" || normalized === "c#") return "csharp";
  if (normalized === "go") return "go";
  if (normalized === "rust") return "rust";
  return normalized;
}

function getLanguageLabel(lang: string): string {
  const normalized = lang.toLowerCase();
  if (normalized === "cpp" || normalized === "c++") return "C++";
  if (normalized === "python" || normalized === "py") return "Python";
  if (normalized === "typescript" || normalized === "ts") return "TypeScript";
  if (normalized === "javascript" || normalized === "js") return "JavaScript";
  if (normalized === "java") return "Java";
  return lang.toUpperCase();
}

export function ReadOnlySolutionPanel({
  solutions,
  slug,
  leetcodeUrl,
}: ReadOnlySolutionPanelProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<string>(() => {
    return solutions.length > 0 ? solutions[0].language : "typescript";
  });
  const [copied, setCopied] = useState(false);

  const activeSolution =
    solutions.find(
      (s) => s.language.toLowerCase() === selectedLanguage.toLowerCase()
    ) || solutions[0];

  const codeToDisplay =
    activeSolution?.code ||
    `// No accepted solution recorded yet for this problem.\n// Practice and submit your attempt to add one!`;

  const monacoLang = getMonacoLanguage(selectedLanguage);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeToDisplay);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="space-y-4">
      {/* Solution Card Container */}
      <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs">
        {/* Header Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-50/90 border-b border-slate-200/80">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Your Original Solution
                </h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                  <Lock className="w-2.5 h-2.5 text-slate-400" />
                  Read-only
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Selector */}
            {solutions.length > 0 && (
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="text-xs font-semibold bg-white border border-slate-200 text-slate-700 rounded-xl px-2.5 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs"
              >
                {solutions.map((sol) => (
                  <option key={sol.id || sol.language} value={sol.language}>
                    {getLanguageLabel(sol.language)}
                  </option>
                ))}
              </select>
            )}

            {/* Copy Code Button */}
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 hover:text-slate-900 border border-slate-200 rounded-xl shadow-2xs transition-all active:scale-95"
              title="Copy code to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Monaco Editor (Read-Only) */}
        <div className="p-1 bg-[#fffffe]">
          <Editor
            height="420px"
            language={monacoLang}
            value={codeToDisplay}
            theme="light"
            options={{
              readOnly: true,
              domReadOnly: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: 13,
              lineNumbers: "on",
              wordWrap: "on",
              lineDecorationsWidth: 12,
              lineNumbersMinChars: 3,
              folding: true,
              renderLineHighlight: "all",
              contextmenu: false,
              scrollbar: {
                verticalScrollbarSize: 8,
                horizontalScrollbarSize: 8,
              },
              fontFamily:
                "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace",
              smoothScrolling: true,
              automaticLayout: true,
            }}
          />
        </div>

        {/* Informative Footer */}
        <div className="px-4 py-2.5 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Accepted Submission Vault</span>
          </div>
          <span className="font-mono text-[10px] text-slate-400">
            {codeToDisplay.trim().split("\n").length} lines
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <h4 className="text-xs font-bold text-slate-900">
            Ready to test your recall?
          </h4>
          <p className="text-[11px] text-slate-500">
            Practice in the clean editor without glancing at this solution.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {leetcodeUrl && (
            <a
              href={leetcodeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-colors flex-1 sm:flex-none"
            >
              <span>Open on LeetCode</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          <Link
            href={`/practice/${slug}`}
            className="inline-flex items-center justify-center gap-2 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all active:scale-95 flex-1 sm:flex-none"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Start Practice</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
