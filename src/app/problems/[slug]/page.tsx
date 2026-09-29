import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  Play,
  Clock,
  Sparkles,
  BookOpen,
  HelpCircle,
  FileCode2,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { MOCK_PROBLEMS } from "@/data/mock-problems";
import { DifficultyBadge } from "@/components/ui/DifficultyBadge";
import { TopicBadge } from "@/components/ui/TopicBadge";
import {
  ReadOnlySolutionPanel,
  SolutionItem,
} from "@/components/problems/ReadOnlySolutionPanel";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProblemDetailPage({ params }: PageProps) {
  const { slug } = await params;

  // 1. Fetch real problem data directly from Neon PostgreSQL
  const dbProblem = await prisma.problem
    .findUnique({
      where: { slug },
      include: {
        solutions: {
          where: { isAccepted: true },
          orderBy: { createdAt: "asc" },
        },
        revisionSchedules: true,
        practiceAttempts: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    })
    .catch(() => null);

  // 2. Prepare problem structure (with fallback to mock if DB doesn't have it yet)
  let problemNumber: number;
  let problemTitle: string;
  let problemDifficulty: "Easy" | "Medium" | "Hard";
  let problemTags: string[];
  let problemDescription: string;
  let problemExamples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  let problemConstraints: string[];
  let problemUrl: string;
  let solutionsList: SolutionItem[] = [];

  if (dbProblem) {
    problemNumber = dbProblem.leetcodeId;
    problemTitle = dbProblem.title;
    problemDifficulty =
      (dbProblem.difficulty as "Easy" | "Medium" | "Hard") || "Easy";
    problemTags = dbProblem.tags;
    problemDescription = dbProblem.description;
    problemExamples = Array.isArray(dbProblem.examples)
      ? (dbProblem.examples as Array<{
          input: string;
          output: string;
          explanation?: string;
        }>)
      : [];
    problemConstraints = dbProblem.constraints || [];
    problemUrl = dbProblem.url;

    solutionsList = dbProblem.solutions.map((s) => ({
      id: s.id,
      language: s.language,
      code: s.code,
      isAccepted: s.isAccepted,
    }));
  } else {
    // Fallback to mock problem
    const mock = MOCK_PROBLEMS.find((p) => p.slug === slug);
    if (!mock) {
      notFound();
    }
    problemNumber = mock.number;
    problemTitle = mock.title;
    problemDifficulty = mock.difficulty;
    problemTags = mock.topics;
    problemDescription = mock.description;
    problemExamples = mock.examples;
    problemConstraints = mock.constraints;
    problemUrl = mock.leetcodeUrl;

    if (mock.originalSolution) {
      solutionsList = [
        {
          id: "mock-sol-1",
          language: mock.originalSolution.language,
          code: mock.originalSolution.code,
          isAccepted: true,
        },
      ];
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Top Breadcrumb & Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <Link
            href="/problems"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Back to Problems Library"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                #{problemNumber}
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {problemTitle}
              </h1>
              <DifficultyBadge difficulty={problemDifficulty} size="sm" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          {problemUrl && (
            <a
              href={problemUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-colors"
            >
              <span>Open on LeetCode</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          <Link
            href={`/practice/${slug}`}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Start Practice</span>
          </Link>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Problem Information (Description, Examples, Constraints) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-6">
            {/* Tags & Meta Chips */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex flex-wrap gap-1.5">
                {problemTags.map((tag) => (
                  <TopicBadge key={tag} topic={tag} />
                ))}
              </div>
              <span className="text-[11px] font-semibold text-slate-400">
                LeetCode #{problemNumber}
              </span>
            </div>

            {/* Problem Description */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Problem Description</span>
              </div>
              <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line space-y-3 font-normal">
                {problemDescription}
              </div>
            </div>

            {/* Examples */}
            {problemExamples.length > 0 && (
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Examples
                </h3>
                <div className="space-y-3">
                  {problemExamples.map((ex, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 font-mono text-xs space-y-2"
                    >
                      <p className="font-bold text-slate-700 font-sans text-xs">
                        Example {idx + 1}:
                      </p>
                      <div className="space-y-1.5 pl-3 border-l-2 border-blue-500/50">
                        <div className="flex flex-wrap items-baseline gap-1.5">
                          <span className="font-bold text-slate-800 font-sans">
                            Input:
                          </span>
                          <span className="text-slate-700 font-mono">
                            {ex.input}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-baseline gap-1.5">
                          <span className="font-bold text-slate-800 font-sans">
                            Output:
                          </span>
                          <span className="text-slate-700 font-mono">
                            {ex.output}
                          </span>
                        </div>
                        {ex.explanation && (
                          <div className="pt-1 font-sans text-[11px] text-slate-500">
                            <strong className="text-slate-700">
                              Explanation:
                            </strong>{" "}
                            {ex.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Constraints */}
            {problemConstraints.length > 0 && (
              <div className="space-y-2.5 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Constraints
                </h3>
                <ul className="space-y-1.5 list-disc pl-5 text-xs font-mono text-slate-700 bg-slate-50/50 p-4 rounded-xl border border-slate-200/60">
                  {problemConstraints.map((constraint, i) => (
                    <li key={i} className="leading-relaxed">
                      {constraint}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: "Your Original Solution" (Read-Only Monaco Editor) */}
        <div className="lg:col-span-6 lg:sticky lg:top-20 space-y-4">
          <ReadOnlySolutionPanel
            solutions={solutionsList}
            slug={slug}
            leetcodeUrl={problemUrl}
          />
        </div>
      </div>
    </div>
  );
}
