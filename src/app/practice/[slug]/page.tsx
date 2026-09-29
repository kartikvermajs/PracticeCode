import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MOCK_PROBLEMS } from "@/data/mock-problems";
import {
  PracticeEditorView,
  ProblemPracticeData,
  AcceptedSolutionData,
} from "@/components/practice/PracticeEditorView";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PracticePage({ params }: PageProps) {
  const { slug } = await params;

  // 1. Fetch real problem data from Neon PostgreSQL
  const dbProblem = await prisma.problem
    .findUnique({
      where: { slug },
      include: {
        solutions: {
          where: { isAccepted: true },
          orderBy: { createdAt: "asc" },
        },
      },
    })
    .catch(() => null);

  let problemData: ProblemPracticeData;
  let acceptedSolutions: AcceptedSolutionData[] = [];

  if (dbProblem) {
    problemData = {
      id: dbProblem.id,
      leetcodeId: dbProblem.leetcodeId,
      title: dbProblem.title,
      slug: dbProblem.slug,
      difficulty:
        (dbProblem.difficulty as "Easy" | "Medium" | "Hard") || "Easy",
      tags: dbProblem.tags,
      url: dbProblem.url,
      description: dbProblem.description,
      examples: Array.isArray(dbProblem.examples)
        ? (dbProblem.examples as Array<{
            input: string;
            output: string;
            explanation?: string;
          }>)
        : [],
      constraints: dbProblem.constraints || [],
    };

    acceptedSolutions = dbProblem.solutions.map((s) => ({
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

    problemData = {
      id: mock.id,
      leetcodeId: mock.number,
      title: mock.title,
      slug: mock.slug,
      difficulty: mock.difficulty,
      tags: mock.topics,
      url: mock.leetcodeUrl,
      description: mock.description,
      examples: mock.examples,
      constraints: mock.constraints,
    };

    if (mock.originalSolution) {
      acceptedSolutions = [
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
    <Suspense
      fallback={
        <div className="h-[calc(100vh-7rem)] flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-slate-500 font-medium text-xs">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span>Loading Practice Session...</span>
          </div>
        </div>
      }
    >
      <PracticeEditorView
        problem={problemData}
        acceptedSolutions={acceptedSolutions}
      />
    </Suspense>
  );
}
