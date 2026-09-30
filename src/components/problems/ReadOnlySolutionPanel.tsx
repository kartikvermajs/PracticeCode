"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Code2,
  Copy,
  Check,
  Play,
  ExternalLink,
  ShieldCheck,
  Terminal,
  Lock,
  Plus,
  Pencil,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useInvalidateQueries } from "@/hooks/useQueries";

// Load Monaco Editor dynamically with ssr: false for Next.js App Router
const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="h-[380px] flex flex-col items-center justify-center gap-2 bg-slate-50 text-slate-400 font-mono text-xs border border-slate-100 rounded-xl">
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
  problemId?: string;
  problemTitle?: string;
}

const DEFAULT_STARTERS: Record<string, string> = {
  cpp: "class Solution {\npublic:\n    \n};",
  c: "int solution() {\n    \n}",
  java: "class Solution {\n    \n}",
  python: "class Solution:\n    def solution(self):\n        pass",
  javascript: "var solution = function() {\n    \n};",
  typescript: "function solution(): void {\n    \n}",
};

function getMonacoLanguage(lang: string): string {
  const normalized = lang.toLowerCase();
  if (normalized === "cpp" || normalized === "c++") return "cpp";
  if (normalized === "c") return "c";
  if (normalized === "python" || normalized === "py") return "python";
  if (normalized === "javascript" || normalized === "js") return "javascript";
  if (normalized === "typescript" || normalized === "ts") return "typescript";
  if (normalized === "java") return "java";
  if (normalized === "csharp" || normalized === "c#") return "csharp";
  if (normalized === "go") return "go";
  if (normalized === "rust") return "rust";
  return normalized;
}

function getLanguageLabel(lang: string): string {
  const normalized = lang.toLowerCase();
  if (normalized === "cpp" || normalized === "c++") return "C++";
  if (normalized === "c") return "C";
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
  problemId,
  problemTitle,
}: ReadOnlySolutionPanelProps) {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const { invalidateProblems, invalidateProblem } = useInvalidateQueries();

  const [solutionsList, setSolutionsList] = useState<SolutionItem[]>(solutions);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(() => {
    return solutions.length > 0 ? solutions[0].language : "cpp";
  });
  const [copied, setCopied] = useState(false);

  // Sync state if parent props update
  useEffect(() => {
    setSolutionsList(solutions);
    if (
      solutions.length > 0 &&
      !solutions.some(
        (s) => s.language.toLowerCase() === selectedLanguage.toLowerCase()
      )
    ) {
      setSelectedLanguage(solutions[0].language);
    }
  }, [solutions, selectedLanguage]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [modalLanguage, setModalLanguage] = useState<string>("cpp");
  const [modalCode, setModalCode] = useState<string>("");
  const [editingSolutionId, setEditingSolutionId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const hasSolution = solutionsList.length > 0;

  const activeSolution =
    solutionsList.find(
      (s) => s.language.toLowerCase() === selectedLanguage.toLowerCase()
    ) || solutionsList[0];

  const codeToDisplay = activeSolution?.code || "";
  const monacoLang = getMonacoLanguage(selectedLanguage);

  const handleCopy = async () => {
    if (!codeToDisplay) return;
    try {
      await navigator.clipboard.writeText(codeToDisplay);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleOpenAddModal = () => {
    setModalMode("add");
    setEditingSolutionId(null);
    setModalLanguage("cpp");
    setModalCode(DEFAULT_STARTERS.cpp || "");
    setSaveError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = () => {
    if (!activeSolution) return;
    setModalMode("edit");
    setEditingSolutionId(activeSolution.id);
    setModalLanguage(activeSolution.language.toLowerCase());
    setModalCode(activeSolution.code);
    setSaveError(null);
    setIsModalOpen(true);
  };

  const handleModalLanguageChange = (newLang: string) => {
    const prevDefault = DEFAULT_STARTERS[modalLanguage] || "";
    // If the editor has never been modified or is empty, switch template
    if (!modalCode.trim() || modalCode.trim() === prevDefault.trim()) {
      setModalCode(DEFAULT_STARTERS[newLang] || "");
    }
    setModalLanguage(newLang);
  };

  const handleSaveSolution = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!modalCode.trim()) {
      setSaveError("Please enter or paste your accepted solution code.");
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const res = await fetch("/api/problems/solution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId,
          slug,
          solutionId: editingSolutionId,
          language: modalLanguage,
          code: modalCode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save solution.");
      }

      const savedSol: SolutionItem = data.solution;

      if (modalMode === "add") {
        setSolutionsList((prev) => [...prev, savedSol]);
        setSelectedLanguage(savedSol.language);
      } else {
        setSolutionsList((prev) =>
          prev.map((s) => (s.id === savedSol.id ? savedSol : s))
        );
        setSelectedLanguage(savedSol.language);
      }

      invalidateProblems();
      invalidateProblem(slug);

      setIsModalOpen(false);
      router.refresh();
    } catch (err: any) {
      setSaveError(err.message || "An error occurred while saving the solution.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Solution Card Container */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs">
        {/* Header Toolbar (Always retains YOUR ORIGINAL SOLUTION title) */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-700/80">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Your Original Solution
                </h3>
                {hasSolution && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 shadow-2xs">
                    <Lock className="w-2.5 h-2.5 text-slate-400" />
                    Read-only
                  </span>
                )}
              </div>
            </div>
          </div>

          {hasSolution && (
            <div className="flex flex-wrap items-center gap-2">
              {/* Language Selector if solutions exist */}
              {solutionsList.length > 1 && (
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs"
                >
                  {solutionsList.map((sol) => (
                    <option key={sol.id || sol.language} value={sol.language}>
                      {getLanguageLabel(sol.language)}
                    </option>
                  ))}
                </select>
              )}

              {/* Edit Solution Button */}
              <button
                type="button"
                onClick={handleOpenEditModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xs transition-all active:scale-95 cursor-pointer"
                title="Edit original solution"
              >
                <Pencil className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>Edit Solution</span>
              </button>

              {/* Copy Code Button */}
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xs transition-all active:scale-95 cursor-pointer"
                title="Copy code to clipboard"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-700 dark:text-emerald-300">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Content Area: Empty State Card vs Read-Only Monaco Editor */}
        {hasSolution ? (
          <>
            {/* Monaco Editor (Read-Only) */}
            <div className="p-1 bg-[#fffffe] dark:bg-[#1e1e1e]">
              <Editor
                height="420px"
                language={monacoLang}
                value={codeToDisplay}
                theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
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
            <div className="px-4 py-2.5 bg-slate-50/60 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Accepted Submission Vault ({getLanguageLabel(selectedLanguage)})</span>
              </div>
              <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">
                {codeToDisplay.trim().split("\n").length} lines
              </span>
            </div>
          </>
        ) : (
          /* Clean Empty State Card */
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-4 bg-white dark:bg-slate-900">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-2xs">
              <Code2 className="w-7 h-7" />
            </div>
            <div className="max-w-md space-y-1.5">
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Original solution not added yet
              </h4>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Add your previously accepted LeetCode solution here so you can use it as a reference while practicing.
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Original Solution</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons: Practice Prompt */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs flex flex-col xl:flex-row xl:items-center justify-between gap-3.5 overflow-hidden">
        <div className="min-w-0 flex-1">
          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
            Ready to test your recall?
          </h4>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Practice in the clean editor without glancing at this solution.
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-2.5 w-full xl:w-auto shrink-0">
          {leetcodeUrl && (
            <a
              href={leetcodeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xs transition-colors flex-1 sm:flex-none"
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

      {/* Dedicated Solution Modal / Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-2xs">
                  {modalMode === "add" ? (
                    <Plus className="w-5 h-5" />
                  ) : (
                    <Pencil className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {modalMode === "add"
                      ? "Add Original Solution"
                      : "Edit Original Solution"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {problemTitle ? `${problemTitle} · ` : ""}
                    Paste your accepted LeetCode code for future reference
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => !isSaving && setIsModalOpen(false)}
                disabled={isSaving}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveSolution} className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Error Banner if any */}
              {saveError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{saveError}</span>
                </div>
              )}

              {/* Language Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Solution Language
                </label>
                <select
                  value={modalLanguage}
                  onChange={(e) => handleModalLanguageChange(e.target.value)}
                  disabled={isSaving}
                  className="w-full sm:w-64 px-3 py-2 text-xs font-semibold bg-white border border-slate-200 text-slate-800 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-2xs cursor-pointer"
                >
                  <option value="cpp">C++</option>
                  <option value="c">C</option>
                  <option value="java">Java</option>
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                </select>
              </div>

              {/* Monaco Code Input Area */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Code Editor (Accepted Reference)
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Syntax: {getLanguageLabel(modalLanguage)}
                  </span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden bg-[#fffffe] shadow-2xs">
                  <Editor
                    height="380px"
                    language={getMonacoLanguage(modalLanguage)}
                    value={modalCode}
                    onChange={(val) => setModalCode(val || "")}
                    theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
                    options={{
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      fontSize: 13,
                      lineNumbers: "on",
                      wordWrap: "on",
                      folding: true,
                      renderLineHighlight: "all",
                      tabSize: 4,
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
                <p className="text-[11px] text-slate-400">
                  Tip: This solution will only be stored in your reference vault and will never overwrite or prefill your practice attempts.
                </p>
              </div>

              {/* Modal Footer Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Original Solution...</span>
                    </>
                  ) : (
                    <span>Save Original Solution</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
