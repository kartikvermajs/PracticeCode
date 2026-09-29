import React, { Suspense } from "react";
import { getDueProblemsForRevision } from "@/services/revision.service";
import { getCurrentUser } from "@/lib/auth";
import {
  RevisionSessionView,
  DueProblemItem,
} from "@/components/revision/RevisionSessionView";

export const dynamic = "force-dynamic";

export default async function RevisionSessionPage() {
  const user = await getCurrentUser();
  const rawDue = await getDueProblemsForRevision(user?.id);

  const dueProblems: DueProblemItem[] = rawDue.map((schedule) => ({
    problem: {
      id: schedule.problem.id,
      leetcodeId: schedule.problem.leetcodeId,
      title: schedule.problem.title,
      slug: schedule.problem.slug,
      difficulty:
        (schedule.problem.difficulty as "Easy" | "Medium" | "Hard") || "Easy",
      tags: schedule.problem.tags,
      url: schedule.problem.url,
      description: schedule.problem.description,
      examples: Array.isArray(schedule.problem.examples)
        ? (schedule.problem.examples as any)
        : [],
      constraints: schedule.problem.constraints || [],
    },
    acceptedSolutions: schedule.problem.solutions.map((s) => ({
      id: s.id,
      language: s.language,
      code: s.code,
      isAccepted: s.isAccepted,
    })),
    schedule: {
      interval: schedule.interval,
      nextReviewAt: schedule.nextReviewAt.toISOString(),
      lastPracticedAt: schedule.lastPracticedAt
        ? schedule.lastPracticedAt.toISOString()
        : null,
    },
  }));

  return (
    <Suspense
      fallback={
        <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-slate-500 font-medium text-xs">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span>Preparing Revision Session...</span>
          </div>
        </div>
      }
    >
      <RevisionSessionView dueProblems={dueProblems} />
    </Suspense>
  );
}
