import { prisma } from "@/lib/prisma";
import { cachedQuery, CACHE_TAGS } from "@/lib/cache";

export type RecallRating = "Difficult" | "Good" | "Easy";

export interface RevisionScheduleInput {
  rating: RecallRating;
  previousInterval?: number | null;
  previousRating?: number | null;
  now?: Date;
}

export interface NextReviewCalculation {
  interval: number; // in days
  nextReviewAt: Date;
  lastPracticedAt: Date;
  difficultyRating: number;
  status: "Due" | "Reviewing" | "Mastered";
}

/**
 * Reusable Revision Service for Spaced Repetition (CodeRev Revision Algorithm)
 *
 * Core Schedule Rules:
 * - Difficult: 2 days (urgent recall reinforcement)
 * - Good: 7 days (standard spaced recall)
 * - Easy: 14 days (long-term memory consolidation)
 *
 * For successive successful reviews, intervals expand reliably.
 */
export function calculateNextReview(
  input: RevisionScheduleInput
): NextReviewCalculation {
  const { rating, previousInterval, now = new Date() } = input;

  let intervalDays: number;
  let difficultyRatingVal: number;
  let statusVal: "Due" | "Reviewing" | "Mastered";

  switch (rating) {
    case "Difficult":
      // Difficult resets to 2 days for urgent reinforcement
      intervalDays = 2;
      difficultyRatingVal = 1.5;
      statusVal = "Due";
      break;

    case "Good":
      // Good schedules 7 days for initial review, or expands if previousInterval was established
      if (previousInterval && previousInterval >= 7) {
        intervalDays = Math.round(previousInterval * 1.8);
      } else {
        intervalDays = 7;
      }
      difficultyRatingVal = 2.5;
      statusVal = "Reviewing";
      break;

    case "Easy":
      // Easy schedules 14 days for initial review, or expands if previousInterval was established
      if (previousInterval && previousInterval >= 14) {
        intervalDays = Math.round(previousInterval * 2.2);
      } else {
        intervalDays = 14;
      }
      difficultyRatingVal = 3.5;
      statusVal = "Mastered";
      break;

    default:
      intervalDays = 7;
      difficultyRatingVal = 2.5;
      statusVal = "Reviewing";
  }

  const nextReviewAt = new Date(
    now.getTime() + intervalDays * 24 * 60 * 60 * 1000
  );

  return {
    interval: intervalDays,
    nextReviewAt,
    lastPracticedAt: now,
    difficultyRating: difficultyRatingVal,
    status: statusVal,
  };
}

/**
 * Updates a problem's revision schedule in PostgreSQL using calculateNextReview
 */
export async function applyRevisionRating(
  problemId: string,
  userId: string,
  rating: RecallRating
) {
  // Find real problem ID if slug or cuid was passed
  const foundProblem = await prisma.problem.findFirst({
    where: {
      OR: [{ id: problemId }, { slug: problemId }],
    },
  });

  const realProblemId = foundProblem ? foundProblem.id : problemId;

  const existingSchedule = await prisma.revisionSchedule.findFirst({
    where: {
      problemId: realProblemId,
      userId,
    },
  });

  const calculated = calculateNextReview({
    rating,
    previousInterval: existingSchedule?.interval,
    previousRating: existingSchedule?.difficultyRating,
  });

  const updatedSchedule = await prisma.revisionSchedule.upsert({
    where: {
      problemId_userId: {
        problemId: realProblemId,
        userId,
      },
    },
    update: {
      lastPracticedAt: calculated.lastPracticedAt,
      nextReviewAt: calculated.nextReviewAt,
      interval: calculated.interval,
      difficultyRating: calculated.difficultyRating,
      status: calculated.status,
    },
    create: {
      problemId: realProblemId,
      userId,
      lastPracticedAt: calculated.lastPracticedAt,
      nextReviewAt: calculated.nextReviewAt,
      interval: calculated.interval,
      difficultyRating: calculated.difficultyRating,
      status: calculated.status,
    },
  });

  return {
    schedule: updatedSchedule,
    calculation: calculated,
  };
}

/**
 * Fetches all problems due for revision (nextReviewAt <= current date) with caching
 */
export async function getDueProblemsForRevision(userId?: string) {
  return cachedQuery(
    `due-problems-${userId || "all"}`,
    async () => {
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);

      return prisma.revisionSchedule.findMany({
        where: {
          nextReviewAt: { lte: endOfToday },
          ...(userId ? { userId } : {}),
        },
        include: {
          problem: {
            include: {
              solutions: {
                where: { isAccepted: true },
              },
            },
          },
        },
        orderBy: { nextReviewAt: "asc" },
      });
    },
    { ttlSeconds: 60, tags: [CACHE_TAGS.DUE_REVISION, CACHE_TAGS.DASHBOARD] }
  );
}

