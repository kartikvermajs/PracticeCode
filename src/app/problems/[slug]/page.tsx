import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  Play,
  Share2,
  Clock,
  Sparkles,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { MOCK_PROBLEMS } from "@/data/mock-problems";
import { DifficultyBadge } from "@/components/ui/DifficultyBadge";
import { TopicBadge } from "@/components/ui/TopicBadge";
import { CodePanel } from "@/components/ui/CodePanel";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProblemDetailPage({ params }: PageProps) {
  const { slug } = await params;

  // 1. Check real database first
  const dbProblem = await prisma.problem.findUnique({
    where: { slug },
    include: {
      solutions: true,
      practiceAttempts: { orderBy: { createdAt: "desc" }, take: 1 },
      revisionSchedules: true,
    },
  }).catch(() => null);

  let problem;
  if (dbProblem) {
    const primarySolution = dbProblem.solutions[0];
    const lastAttempt = dbProblem.practiceAttempts[0];
    const schedule = dbProblem.revisionSchedules[0];

    problem = {
      id: dbProblem.id,
      slug: dbProblem.slug,
      number: dbProblem.leetcodeId,
      title: dbProblem.title,
      difficulty: (dbProblem.difficulty as "Easy" | "Medium" | "Hard") || "Easy",
      topics: dbProblem.tags,
      status: "Solved" as const,
      lastPracticed: lastAttempt ? "Recently" : "Not yet",
      nextReview: schedule?.status || "Due",
      isDue: schedule?.status === "Due",
      leetcodeUrl: dbProblem.url,
      acceptanceRate: "72.4%",
      description: dbProblem.description,
      examples: (dbProblem.examples as Array<{ input: string; output: string; explanation?: string }>) || [],
      constraints: dbProblem.constraints || [],
      originalSolution: {
        language: primarySolution?.language || "typescript",
        code: primarySolution?.code || "// No accepted solution stored yet",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        notes: "Stored accepted solution from your personal library.",
      },
    };
  } else {
    problem = MOCK_PROBLEMS.find((p) => p.slug === slug);
  }

  if (!problem) {
    notFound();
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Back breadcrumb and top actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <Link
            href="/problems"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                #{problem.number}
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {problem.title}
              </h1>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <a
            href={problem.leetcodeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-xl shadow-2xs transition-colors"
          >
            <span>Open on LeetCode</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <Link
            href={`/practice/${problem.slug}`}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Start Practice</span>
          </Link>
        </div>
      </div>

      {/* Main Grid: Left Problem Statement, Right Original Solution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Problem Information (7 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-6">
            {/* Meta chips */}
            <div className="flex flex-wrap items-center gap-2.5 pb-4 border-b border-slate-100">
              <DifficultyBadge difficulty={problem.difficulty} />
              <div className="flex flex-wrap gap-1.5">
                {problem.topics.map((t) => (
                  <TopicBadge key={t} topic={t} />
                ))}
              </div>
              <div className="ml-auto flex items-center gap-1.5 text-xs text-slate-500">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Last practiced: {problem.lastPracticed}</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Problem Description
              </h3>
              <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line space-y-2">
                {problem.description}
              </div>
            </div>

            {/* Examples */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Examples
              </h3>
              {problem.examples.map((example, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/60 font-mono text-xs space-y-1.5"
                >
                  <p className="font-semibold text-slate-700">Example {idx + 1}:</p>
                  <div className="space-y-1 text-slate-600 pl-2 border-l-2 border-blue-500/40">
                    <p>
                      <strong className="text-slate-800">Input:</strong> {example.input}
                    </p>
                    <p>
                      <strong className="text-slate-800">Output:</strong> {example.output}
                    </p>
                    {example.explanation && (
                      <p className="font-sans text-[11px] text-slate-500 pt-0.5">
                        <strong className="text-slate-700">Explanation:</strong>{" "}
                        {example.explanation}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Constraints */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Constraints
              </h3>
              <ul className="space-y-1.5 list-disc pl-4 text-xs font-mono text-slate-600">
                {problem.constraints.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column: Original Solution / Reference Panel (6 cols) */}
        <div className="lg:col-span-6 space-y-5 lg:sticky lg:top-20">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-violet-500/10 border border-blue-200/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-blue-900">
                  Reference Vault
                </span>
              </div>
              <span className="text-[11px] text-blue-700 font-medium">
                Your past accepted submission
              </span>
            </div>
          </div>

          {/* Read-only Code Panel */}
          <CodePanel
            code={problem.originalSolution.code}
            language={problem.originalSolution.language}
            timeComplexity={problem.originalSolution.timeComplexity}
            spaceComplexity={problem.originalSolution.spaceComplexity}
            notes={problem.originalSolution.notes}
          />

          {/* Bottom Action Bar */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-slate-900">Ready to test your recall?</p>
              <p className="text-[11px] text-slate-500">
                Practice in the clean editor without glancing at this solution.
              </p>
            </div>
            <Link
              href={`/practice/${problem.slug}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all active:scale-95 shrink-0"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Launch Practice</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
