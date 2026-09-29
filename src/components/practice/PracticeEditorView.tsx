"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  ArrowLeft,
  RotateCcw,
  Save,
  Eye,
  CheckCircle2,
  AlertTriangle,
  X,
  FileCheck,
  ExternalLink,
  Code2,
  Lock,
  Copy,
  Check,
  Sparkles,
  CloudCheck,
} from "lucide-react";
import { DifficultyBadge } from "@/components/ui/DifficultyBadge";
import { TopicBadge } from "@/components/ui/TopicBadge";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  SUPPORTED_LANGUAGES,
  SupportedLanguage,
  getStarterTemplate,
} from "@/lib/starter-templates";
import { HowDidThisFeelModal } from "./HowDidThisFeelModal";

// Dynamically load Monaco Editor with SSR disabled for Next.js App Router
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="h-full min-h-[400px] flex flex-col items-center justify-center gap-2 bg-slate-50 text-slate-400 font-mono text-xs">
      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <span>Loading Monaco Editor...</span>
    </div>
  ),
});

export interface ProblemPracticeData {
  id: string;
  leetcodeId: number;
  title: string;
  slug: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
  url: string;
  description: string;
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  constraints: string[];
}

export interface AcceptedSolutionData {
  id: string;
  language: string;
  code: string;
  isAccepted: boolean;
}

export interface ContinueAttemptData {
  id: string;
  language: string;
  code: string;
  status?: string;
  attemptNumber?: number;
}

interface PracticeEditorViewProps {
  problem: ProblemPracticeData;
  acceptedSolutions: AcceptedSolutionData[];
  continueAttempt?: ContinueAttemptData | null;
}

export function PracticeEditorView({
  problem,
  acceptedSolutions,
  continueAttempt,
}: PracticeEditorViewProps) {
  const { incrementStreak } = useAuth();

  // Active language state
  const [language, setLanguage] = useState<SupportedLanguage>(() => {
    if (continueAttempt?.language) {
      const match = SUPPORTED_LANGUAGES.find(
        (l) => l.id === continueAttempt.language.toLowerCase()
      );
      if (match) return match.id;
    }
    return "cpp";
  });

  // Code state
  const [code, setCode] = useState<string>(() => {
    return continueAttempt?.code || "";
  });

  // Editor states & notifications
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showRevealModal, setShowRevealModal] = useState(false);
  const [showRevealConfirm, setShowRevealConfirm] = useState(false);
  const [revealSolutionLang, setRevealSolutionLang] = useState<string>("cpp");
  const [copiedSolution, setCopiedSolution] = useState(false);
  const [isDraftRestored, setIsDraftRestored] = useState(false);
  const [showFeelModal, setShowFeelModal] = useState(false);
  const isInitialMount = useRef(true);

  // Storage key generator for persistent local drafts
  const getStorageKey = useCallback(
    (lang: SupportedLanguage) => `coderev_practice_${problem.slug}_${lang}`,
    [problem.slug]
  );

  // Load code when language or problem changes:
  // 1. If continuing an attempt on mount, load that attempt's code.
  // 2. Otherwise check localStorage draft.
  // 3. Otherwise load clean starter template (NEVER loads accepted solution).
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (continueAttempt?.code) {
        setCode(continueAttempt.code);
        setNotification(
          `Resumed Attempt #${continueAttempt.attemptNumber || 1}. Past records remain immutable; saving creates a new record.`
        );
        setTimeout(() => setNotification(null), 4000);
        return;
      }
    }

    const key = getStorageKey(language);
    const savedDraft = typeof window !== "undefined" ? localStorage.getItem(key) : null;

    if (savedDraft && savedDraft.trim()) {
      setCode(savedDraft);
      setIsDraftRestored(true);
      const timer = setTimeout(() => setIsDraftRestored(false), 2500);
      return () => clearTimeout(timer);
    } else {
      // Load clean starter template for the selected language
      const template = getStarterTemplate(problem.slug, language);
      setCode(template);
      setIsDraftRestored(false);
    }
  }, [language, problem.slug, getStorageKey, continueAttempt]);

  // Handle code change and persist draft to localStorage
  const handleCodeChange = (newVal: string | undefined) => {
    const val = newVal ?? "";
    setCode(val);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(getStorageKey(language), val);
      } catch {
        // quota exceeded fallback
      }
    }
  };

  // Language switch handler
  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setLanguage(newLang);
  };

  // Reset current code to clean starter template
  const handleConfirmReset = () => {
    const template = getStarterTemplate(problem.slug, language);
    setCode(template);
    if (typeof window !== "undefined") {
      localStorage.removeItem(getStorageKey(language));
    }
    setShowResetConfirm(false);
    setNotification("Reset to clean starter template.");
    setTimeout(() => setNotification(null), 2500);
  };

  // Save Practice Attempt (never overwrites previous attempts)
  const handleSaveAttempt = async () => {
    if (!code.trim()) {
      setNotification("Please write some code before saving.");
      setTimeout(() => setNotification(null), 2500);
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/practice/attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId: problem.id,
          language,
          code,
          status: "Passed",
        }),
      });

      const data = await res.json();
      setIsSaving(false);

      if (data.success) {
        if (typeof data.streak === "number") {
          incrementStreak(data.streak);
        }
        setNotification(
          data.message || `Practice attempt saved! Active streak: ${data.streak} days.`
        );
        setTimeout(() => setNotification(null), 3500);
        // Show "How did this feel?" recall rating prompt
        setShowFeelModal(true);
      } else {
        setNotification(data.error || "Failed to save attempt.");
        setTimeout(() => setNotification(null), 3000);
      }
    } catch {
      setIsSaving(false);
      setNotification("Network error: Could not save attempt.");
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // Handle copying revealed solution
  const handleCopyRevealedSolution = async (codeToCopy: string) => {
    try {
      await navigator.clipboard.writeText(codeToCopy);
      setCopiedSolution(true);
      setTimeout(() => setCopiedSolution(false), 2000);
    } catch {
      // fallback
    }
  };

  // Active solution to reveal
  const activeRevealedSolution =
    acceptedSolutions.find(
      (s) => s.language.toLowerCase() === revealSolutionLang.toLowerCase()
    ) || acceptedSolutions[0];

  return (
    <div className="flex flex-col h-[calc(100vh-6.25rem)] min-h-[640px] space-y-3 animate-in fade-in duration-300">
      {/* 1. Practice Top Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1 shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href={`/problems/${problem.slug}`}
            className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors"
            title="Back to Problem Description"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
              #{problem.leetcodeId}
            </span>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              {problem.title}
            </h2>
            <DifficultyBadge difficulty={problem.difficulty} size="sm" />
          </div>
        </div>

        {/* Status notification toast */}
        <div className="flex items-center gap-2">
          {notification && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{notification}</span>
            </div>
          )}

          {isDraftRestored && !notification && (
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-xs font-medium animate-in fade-in">
              <CloudCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Restored draft</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Split Workspace Layout: LEFT 45% / RIGHT 55% */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0 overflow-hidden">
        {/* ======================================================== */}
        {/* LEFT PANEL 45%: Problem Statement                        */}
        {/* ======================================================== */}
        <div className="w-full lg:w-[45%] flex flex-col rounded-2xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50/80 border-b border-slate-200/80 text-xs font-semibold text-slate-700 shrink-0">
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-blue-600" />
              <span>Problem Statement</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {problem.tags.map((t) => (
                <TopicBadge key={t} topic={t} size="sm" />
              ))}
            </div>
          </div>

          {/* Scrollable Problem Statement Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs sm:text-sm">
            {/* Description */}
            <div className="text-slate-700 leading-relaxed whitespace-pre-line space-y-2">
              {problem.description}
            </div>

            {/* Examples */}
            {problem.examples.length > 0 && (
              <div className="space-y-3 pt-2">
                <p className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-400">
                  Examples
                </p>
                {problem.examples.map((example, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 font-mono text-xs space-y-1.5"
                  >
                    <p className="text-slate-500 font-sans font-semibold text-xs">
                      Example {i + 1}:
                    </p>
                    <div className="space-y-1 pl-2.5 border-l-2 border-blue-500/50">
                      <p>
                        <span className="text-slate-700 font-sans font-semibold">
                          Input:{" "}
                        </span>
                        <span className="text-slate-600 font-mono">
                          {example.input}
                        </span>
                      </p>
                      <p>
                        <span className="text-slate-700 font-sans font-semibold">
                          Output:{" "}
                        </span>
                        <span className="text-slate-600 font-mono">
                          {example.output}
                        </span>
                      </p>
                      {example.explanation && (
                        <p className="font-sans text-[11px] text-slate-500 pt-0.5">
                          <strong className="text-slate-700">Explanation: </strong>
                          {example.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Constraints */}
            {problem.constraints.length > 0 && (
              <div className="space-y-2 pt-2">
                <p className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-400">
                  Constraints
                </p>
                <ul className="list-disc pl-4 space-y-1.5 font-mono text-xs text-slate-600 bg-slate-50/60 p-3 rounded-xl border border-slate-200/60">
                  {problem.constraints.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* External Reference Link */}
          {problem.url && (
            <div className="px-4 py-2 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 shrink-0">
              <span>View full problem online:</span>
              <a
                href={problem.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold"
              >
                <span>LeetCode #{problem.leetcodeId}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* RIGHT PANEL 55%: Monaco Practice Code Editor            */}
        {/* ======================================================== */}
        <div className="w-full lg:w-[55%] flex flex-col rounded-2xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
          {/* Editor Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-slate-50/90 border-b border-slate-200/80 shrink-0">
            {/* Language Selector */}
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-blue-600" />
              <select
                value={language}
                onChange={(e) =>
                  handleLanguageChange(e.target.value as SupportedLanguage)
                }
                className="text-xs bg-white border border-slate-200 text-slate-800 font-semibold rounded-xl px-3 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.id} value={lang.id}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Toolbar Buttons: Reset, Save Attempt, Reveal Solution */}
            <div className="flex items-center gap-2">
              {/* Reset Button */}
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors shadow-2xs active:scale-95"
                title="Reset code to clean starter template"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>

              {/* Reveal Solution Button */}
              <button
                type="button"
                onClick={() => setShowRevealConfirm(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100/80 border border-amber-200/80 rounded-xl transition-colors shadow-2xs active:scale-95"
                title="Inspect original accepted solution in a read-only vault"
              >
                <Eye className="w-3.5 h-3.5 text-amber-600" />
                <span>Reveal Solution</span>
              </button>

              {/* Save Attempt Button */}
              <button
                type="button"
                onClick={handleSaveAttempt}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all active:scale-95 disabled:opacity-50"
                title="Save this practice attempt to your revision history"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? "Saving..." : "Save Attempt"}</span>
              </button>
            </div>
          </div>

          {/* Monaco Editor Container */}
          <div className="flex-1 w-full min-h-[350px] relative bg-white">
            <MonacoEditor
              height="100%"
              language={
                SUPPORTED_LANGUAGES.find((l) => l.id === language)?.monacoLang ||
                "cpp"
              }
              value={code}
              onChange={handleCodeChange}
              theme="light"
              options={{
                fontSize: 13.5,
                lineNumbers: "on",
                lineNumbersMinChars: 3,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: "on",
                automaticLayout: true,
                tabSize: language === "python" ? 4 : 2,
                formatOnPaste: true,
                folding: true,
                renderLineHighlight: "all",
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

          {/* Footer Bar: Auto-save status and recall tip */}
          <div className="px-4 py-2 bg-slate-50/80 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Draft auto-saved locally</span>
            </div>
            <span className="text-slate-400">
              Practice from recall · Syntax highlighting active
            </span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. CONFIRMATION MODAL: Reset Code                        */}
      {/* ======================================================== */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 rounded-xl bg-rose-50 border border-rose-200">
                <RotateCcw className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Reset Practice Editor?
                </h3>
                <p className="text-xs text-slate-500">
                  This will clear your unsaved code.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
              Are you sure you want to clear your code? The editor will be reset to the clean starter template for{" "}
              <strong className="text-slate-900">
                {SUPPORTED_LANGUAGES.find((l) => l.id === language)?.name}
              </strong>
              .
            </p>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors"
              >
                Reset Code
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. CONFIRMATION MODAL: Reveal Solution Prompt            */}
      {/* ======================================================== */}
      {showRevealConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="p-2 rounded-xl bg-amber-50 border border-amber-200">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Reveal Original Solution?
                </h3>
                <p className="text-xs text-slate-500">
                  Spaced repetition works best when attempting from memory!
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              We recommend attempting the problem from memory for at least 5 minutes before checking the accepted solution. The solution will open in a read-only viewer and will <strong className="text-slate-900">never</strong> overwrite your practice editor.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setShowRevealConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Keep Trying
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowRevealConfirm(false);
                  setShowRevealModal(true);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-colors"
              >
                View Solution
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. REVEALED SOLUTION MODAL (Strictly Read-Only)          */}
      {/* ======================================================== */}
      {showRevealModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50/90 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Accepted Reference Solution
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Read-only view · Your practice editor is untouched
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Language Switcher if multiple solutions exist */}
                {acceptedSolutions.length > 1 && (
                  <select
                    value={revealSolutionLang}
                    onChange={(e) => setRevealSolutionLang(e.target.value)}
                    className="text-xs font-semibold bg-white border border-slate-200 text-slate-800 rounded-xl px-2.5 py-1 focus:outline-hidden"
                  >
                    {acceptedSolutions.map((s) => (
                      <option key={s.id || s.language} value={s.language}>
                        {s.language.toUpperCase()}
                      </option>
                    ))}
                  </select>
                )}

                {/* Copy code button */}
                {activeRevealedSolution && (
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyRevealedSolution(activeRevealedSolution.code)
                    }
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
                  >
                    {copiedSolution ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowRevealModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Read-Only Monaco Editor in Reveal Modal */}
            <div className="flex-1 min-h-[350px] p-2 bg-white">
              <MonacoEditor
                height="380px"
                language={
                  activeRevealedSolution?.language === "cpp"
                    ? "cpp"
                    : activeRevealedSolution?.language || "typescript"
                }
                value={
                  activeRevealedSolution?.code ||
                  "// No accepted solution available for this problem in the database."
                }
                theme="light"
                options={{
                  readOnly: true,
                  domReadOnly: true,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  fontSize: 13,
                  lineNumbers: "on",
                  wordWrap: "on",
                  folding: true,
                  fontFamily:
                    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace",
                  smoothScrolling: true,
                }}
              />
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-500">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>This solution cannot be injected into the editor.</span>
              </div>
              <button
                type="button"
                onClick={() => setShowRevealModal(false)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
              >
                Close Solution
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. "HOW DID THIS FEEL?" RECALL RATING MODAL              */}
      {/* ======================================================== */}
      <HowDidThisFeelModal
        isOpen={showFeelModal}
        onClose={() => setShowFeelModal(false)}
        problemId={problem.id}
        problemSlug={problem.slug}
        problemTitle={problem.title}
      />
    </div>
  );
}
