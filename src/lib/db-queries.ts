import { prisma } from "./prisma";

/**
 * Fetch all problems with their accepted solutions and revision schedules
 */
export async function getProblemsFromDb() {
  return prisma.problem.findMany({
    include: {
      solutions: {
        where: { isAccepted: true },
      },
      revisionSchedules: true,
    },
    orderBy: {
      leetcodeId: "asc",
    },
  });
}

/**
 * Fetch a single problem by its unique slug
 */
export async function getProblemBySlugFromDb(slug: string) {
  return prisma.problem.findUnique({
    where: { slug },
    include: {
      solutions: true,
      practiceAttempts: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      revisionSchedules: true,
    },
  });
}

/**
 * Fetch problems that are currently due for review
 */
export async function getDueProblemsFromDb(userId?: string) {
  const now = new Date();
  return prisma.revisionSchedule.findMany({
    where: {
      status: "Due",
      nextReviewAt: {
        lte: now,
      },
      ...(userId ? { userId } : {}),
    },
    include: {
      problem: {
        include: {
          solutions: true,
        },
      },
    },
    orderBy: {
      nextReviewAt: "asc",
    },
  });
}

/**
 * Record a practice attempt for a problem
 */
export async function savePracticeAttemptToDb(data: {
  problemId: string;
  userId?: string;
  language: string;
  code: string;
  status: "Passed" | "Partial" | "Needs Review";
  startedAt?: Date;
  completedAt?: Date;
}) {
  return prisma.practiceAttempt.create({
    data: {
      problemId: data.problemId,
      userId: data.userId,
      language: data.language,
      code: data.code,
      status: data.status,
      startedAt: data.startedAt ?? new Date(),
      completedAt: data.completedAt ?? new Date(),
    },
  });
}

/**
 * Update revision schedule after a practice attempt
 */
export async function updateRevisionScheduleInDb(data: {
  problemId: string;
  userId: string;
  confidence: "High" | "Medium" | "Low";
}) {
  const current = await prisma.revisionSchedule.findUnique({
    where: {
      problemId_userId: {
        problemId: data.problemId,
        userId: data.userId,
      },
    },
  });

  const currentInterval = current?.interval ?? 1;
  const multiplier = data.confidence === "High" ? 2.0 : data.confidence === "Medium" ? 1.5 : 1.0;
  const nextInterval = Math.max(1, Math.round(currentInterval * multiplier));
  const nextReviewAt = new Date(Date.now() + nextInterval * 24 * 60 * 60 * 1000);

  return prisma.revisionSchedule.upsert({
    where: {
      problemId_userId: {
        problemId: data.problemId,
        userId: data.userId,
      },
    },
    update: {
      lastPracticedAt: new Date(),
      nextReviewAt,
      interval: nextInterval,
      status: "Mastered",
    },
    create: {
      problemId: data.problemId,
      userId: data.userId,
      lastPracticedAt: new Date(),
      nextReviewAt,
      interval: nextInterval,
      status: "Mastered",
    },
  });
}
