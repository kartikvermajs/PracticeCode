"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  RotateCcw,
  Save,
  Eye,
  Play,
  CheckCircle,
  ExternalLink,
  Code2,
  Sparkles,
  Terminal,
  AlertTriangle,
  X,
  FileCheck,
  CheckCircle2,
} from "lucide-react";
import { MOCK_PROBLEMS } from "@/data/mock-problems";
import { DifficultyBadge } from "@/components/ui/DifficultyBadge";
import { TopicBadge } from "@/components/ui/TopicBadge";
import { useAuth } from "@/components/providers/AuthProvider";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function PracticePage({ params }: PageProps) {
  const { slug } = use(params);
  const problem = MOCK_PROBLEMS.find((p) => p.slug === slug) || MOCK_PROBLEMS[0];

  const [language, setLanguage] = useState<string>("typescript");
  const [userCode, setUserCode] = useState<string>(
    problem.starterCode[language] || problem.starterCode.typescript
  );
  const [activeTestCase, setActiveTestCase] = useState<number>(0);
  const [isSolutionRevealed, setIsSolutionRevealed] = useState<boolean>(false);
  const [showRevealConfirm, setShowRevealConfirm] = useState<boolean>(false);
  const [activeBottomTab, setActiveBottomTab] = useState<"tests" | "output">("tests");
  const [runStatus, setRunStatus] = useState<"idle" | "running" | "success">("idle");
  const [savedNotification, setSavedNotification] = useState<boolean>(false);

  const { incrementStreak } = useAuth();
  const [streakNotification, setStreakNotification] = useState<string | null>(null);

  // When changing language, switch to that language's starter code
  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    setUserCode(problem.starterCode[newLang] || problem.starterCode.typescript);
  };

  const handleReset = () => {
    if (confirm("Reset editor to starter template? Your unsaved edits will be cleared.")) {
      setUserCode(problem.starterCode[language] || problem.starterCode.typescript);
    }
  };

  const handleSaveAttempt = async () => {
    try {
      const res = await fetch("/api/practice/attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId: problem.id,
          language,
          code: userCode,
          status: "Passed",
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (typeof data.streak === "number") {
          incrementStreak(data.streak);
        }
        setStreakNotification(data.message || `Streak active!`);
        setSavedNotification(true);
        setTimeout(() => setSavedNotification(false), 3500);
      }
    } catch {
      setSavedNotification(true);
      setTimeout(() => setSavedNotification(false), 2500);
    }
  };

  const handleRunMock = () => {
    setRunStatus("running");
    setTimeout(() => {
      setRunStatus("success");
      setActiveBottomTab("output");
    }, 700);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6.5rem)] space-y-4 animate-in fade-in duration-300">
      {/* Top Bar for Practice Session */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-3">
          <Link
            href={`/problems/${problem.slug}`}
            className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors"
            title="Back to Problem Details"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
              #{problem.number}
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              {problem.title}
            </h2>
            <DifficultyBadge difficulty={problem.difficulty} size="sm" />
          </div>
        </div>

        {/* Top Session Actions */}
        <div className="flex items-center gap-2">
          {savedNotification && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{streakNotification || "Attempt Saved!"}</span>
            </span>
          )}

          <button
            onClick={handleSaveAttempt}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-colors"
          >
            <Save className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Save Attempt</span>
          </button>

          <button
            onClick={() => setShowRevealConfirm(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/70 rounded-xl transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-amber-600" />
            <span>Reveal Solution</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout: Left Problem Statement, Right Code Editor */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
        {/* LEFT PANEL: Problem Statement (5 cols) */}
        <div className="lg:col-span-5 flex flex-col rounded-2xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
          {/* Header tabs */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50/80 border-b border-slate-200/80 text-xs font-semibold text-slate-700">
            <span className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-blue-600" />
              Problem Description
            </span>
            <div className="flex gap-1.5">
              {problem.topics.slice(0, 2).map((t) => (
                <TopicBadge key={t} topic={t} size="sm" />
              ))}
            </div>
          </div>

          {/* Scrollable Problem Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs sm:text-sm">
            <div className="text-slate-700 leading-relaxed whitespace-pre-line">
              {problem.description}
            </div>

            {/* Examples */}
            <div className="space-y-3 pt-2">
              <p className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Examples
              </p>
              {problem.examples.map((example, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 font-mono text-xs space-y-1"
                >
                  <p className="text-slate-500 font-semibold">Example {i + 1}:</p>
                  <p>
                    <span className="text-slate-700 font-semibold">Input: </span>
                    <span className="text-slate-600">{example.input}</span>
                  </p>
                  <p>
                    <span className="text-slate-700 font-semibold">Output: </span>
                    <span className="text-slate-600">{example.output}</span>
                  </p>
                  {example.explanation && (
                    <p className="font-sans text-[11px] text-slate-500 pt-0.5">
                      <strong className="text-slate-700">Explanation: </strong>
                      {example.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Constraints */}
            <div className="space-y-2 pt-2">
              <p className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Constraints
              </p>
              <ul className="list-disc pl-4 space-y-1 font-mono text-xs text-slate-600">
                {problem.constraints.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Code Editor & Test Results (7 cols) */}
        <div className="lg:col-span-7 flex flex-col rounded-2xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
          {/* Editor Toolbar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50/80 border-b border-slate-200/80">
            <div className="flex items-center gap-3">
              <Code2 className="w-4 h-4 text-blue-600" />
              {/* Language Selector */}
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="text-xs bg-white border border-slate-200 text-slate-700 font-semibold rounded-lg px-2.5 py-1 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs"
              >
                <option value="typescript">TypeScript</option>
                <option value="python">Python 3</option>
                <option value="cpp">C++</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors shadow-2xs"
                title="Reset code to clean starter template"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Visual Code Editor Area (Light-mode developer editor aesthetic) */}
          <div className="flex-1 flex overflow-hidden bg-[#FAFBFC] font-mono text-xs relative">
            {/* Line numbers gutter */}
            <div className="select-none py-3 px-3 text-right text-slate-400 font-mono text-[11px] bg-slate-100/60 border-r border-slate-200/60 w-10 shrink-0 space-y-1">
              {userCode.split("\n").map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            {/* Editable code text area with syntax styling */}
            <textarea
              value={userCode}
              onChange={(e) => setUserCode(e.target.value)}
              spellCheck={false}
              className="flex-1 w-full p-3 font-mono text-xs text-slate-900 bg-transparent resize-none focus:outline-hidden leading-relaxed"
              style={{ tabSize: 2 }}
            />
          </div>

          {/* BOTTOM PANEL: Test Results & Execution Placeholder */}
          <div className="h-48 border-t border-slate-200/80 bg-white flex flex-col">
            {/* Tabs Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-slate-50/80 border-b border-slate-200/70">
              <div className="flex items-center gap-4 text-xs font-semibold">
                <button
                  onClick={() => setActiveBottomTab("tests")}
                  className={`pb-1 transition-colors ${
                    activeBottomTab === "tests"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Test Cases ({problem.examples.length})
                </button>
                <button
                  onClick={() => setActiveBottomTab("output")}
                  className={`pb-1 transition-colors ${
                    activeBottomTab === "output"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Test Result & Console
                </button>
              </div>

              {/* Action Buttons: Run & Submit */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunMock}
                  disabled={runStatus === "running"}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg shadow-2xs transition-colors disabled:opacity-50"
                >
                  <Play className="w-3 h-3 text-slate-600" />
                  <span>{runStatus === "running" ? "Running..." : "Run Test"}</span>
                </button>

                <button
                  onClick={handleSaveAttempt}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-all active:scale-95"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Submit Attempt</span>
                </button>
              </div>
            </div>

            {/* Tab Body */}
            <div className="flex-1 p-4 overflow-y-auto text-xs font-mono">
              {activeBottomTab === "tests" ? (
                <div className="space-y-3">
                  {/* Test case pills */}
                  <div className="flex items-center gap-2">
                    {problem.examples.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveTestCase(idx)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                          activeTestCase === idx
                            ? "bg-slate-900 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        Case {idx + 1}
                      </button>
                    ))}
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
                    <p className="text-slate-500">
                      Input: <span className="text-slate-800 font-bold">{problem.examples[activeTestCase]?.input}</span>
                    </p>
                    <p className="text-slate-500">
                      Expected: <span className="text-slate-800 font-bold">{problem.examples[activeTestCase]?.output}</span>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {runStatus === "idle" && (
                    <p className="text-slate-400 font-sans text-xs">
                      Click &ldquo;Run Test&rdquo; to execute the test cases against your revision code.
                    </p>
                  )}
                  {runStatus === "running" && (
                    <p className="text-blue-600 font-semibold animate-pulse">
                      Compiling and executing test harness...
                    </p>
                  )}
                  {runStatus === "success" && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="font-sans font-bold">
                          All 3 test cases passed successfully! (Placeholder Test Harness)
                        </span>
                      </div>
                      <div className="text-slate-600 font-mono text-[11px] bg-slate-50 p-2 rounded border border-slate-200">
                        Runtime: 54 ms · Memory: 42.1 MB · Memory efficiency: 98.4%
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CONFIRMATION MODAL FOR REVEAL SOLUTION */}
      {showRevealConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="p-2 rounded-xl bg-amber-50 border border-amber-200">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Reveal Solution?
                </h3>
                <p className="text-xs text-slate-500">
                  Revision works best when you try from memory first!
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              Are you sure you want to inspect your accepted solution? We recommend spending at least 5 minutes attempting the problem from memory first.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowRevealConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Keep Trying
              </button>
              <button
                onClick={() => {
                  setShowRevealConfirm(false);
                  setIsSolutionRevealed(true);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-colors"
              >
                Reveal Solution
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REVEALED SOLUTION MODAL / DRAWER */}
      {isSolutionRevealed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-5 py-4 bg-slate-50 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Reference Solution · {problem.title}
                </h3>
              </div>
              <button
                onClick={() => setIsSolutionRevealed(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800">
                <strong>Recall Note: </strong>
                {problem.originalSolution.notes}
              </div>

              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 bg-slate-100 text-xs font-mono text-slate-600 border-b border-slate-200">
                  <span>Language: {problem.originalSolution.language}</span>
                  <div className="flex gap-3">
                    <span>Time: {problem.originalSolution.timeComplexity}</span>
                    <span>Space: {problem.originalSolution.spaceComplexity}</span>
                  </div>
                </div>
                <pre className="p-4 bg-slate-50 text-slate-800 font-mono text-xs overflow-x-auto leading-relaxed">
                  {problem.originalSolution.code}
                </pre>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setIsSolutionRevealed(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl"
              >
                Close Solution
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
