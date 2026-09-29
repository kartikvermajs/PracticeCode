import { prisma } from "./prisma";

export interface DashboardStats {
  totalProblems: number;
  totalSolved: number;
  solvedCount: number;
  dueTodayCount: number;
  practiceStreakDays: number;
  easyTotal: number;
  easySolved: number;
  mediumTotal: number;
  mediumSolved: number;
  hardTotal: number;
  hardSolved: number;
}

export interface DashboardRevisionItem {
  id: string;
  number: number;
  title: string;
  slug: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topics: string[];
  lastPracticed: string;
  nextReview: string;
}

export interface DashboardRecentItem {
  id: string;
  problemNumber: number;
  problemTitle: string;
  slug: string;
  difficulty: "Easy" | "Medium" | "Hard";
  lastPracticed: string;
  result: "Passed" | "Partial" | "Needs Review";
}

export interface DashboardData {
  stats: DashboardStats;
  revisionProblems: DashboardRevisionItem[];
  recentPractices: DashboardRecentItem[];
}

function formatRelativeTime(date?: Date | null): string {
  if (!date) return "Never";
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay === 0) {
    if (diffHour === 0) {
      if (diffMin <= 1) return "Just now";
      return `${diffMin} mins ago`;
    }
    return `${diffHour} hour${diffHour > 1 ? "s" : ""} ago`;
  }
  if (diffDay === 1) return "Yesterday";
  if (diffDay < 30) return `${diffDay} days ago`;
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function calculateStreak(attempts: { createdAt: Date }[]): number {
  if (attempts.length === 0) return 0;

  // Extract unique calendar dates in YYYY-MM-DD
  const dateSet = new Set<string>();
  attempts.forEach((a) => {
    const d = new Date(a.createdAt);
    dateSet.add(d.toISOString().split("T")[0]);
  });

  const sortedDates = Array.from(dateSet).sort().reverse();
  if (sortedDates.length === 0) return 0;

  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  // Must have practiced today or yesterday to have an active streak
  const mostRecent = sortedDates[0];
  if (mostRecent !== today && mostRecent !== yesterday) {
    return 0;
  }

  let streak = 0;
  let checkDate = new Date(mostRecent);

  for (const dateStr of sortedDates) {
    const expected = checkDate.toISOString().split("T")[0];
    if (dateStr === expected) {
      streak++;
      // Move to day before
      checkDate = new Date(checkDate.getTime() - 86400000);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Fetch all dashboard metrics with real database queries
 */
export async function getDashboardData(): Promise<DashboardData> {
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  try {
    // 1. Parallel database queries for performance
    const [
      allProblems,
      dueSchedules,
      recentAttempts,
      passedAttempts,
      acceptedSolutions,
      allAttemptsForStreak,
    ] = await Promise.all([
      prisma.problem.findMany({
        select: {
          id: true,
          leetcodeId: true,
          title: true,
          slug: true,
          difficulty: true,
          tags: true,
        },
        orderBy: { leetcodeId: "asc" },
      }),

      prisma.revisionSchedule.findMany({
        where: {
          nextReviewAt: { lte: endOfToday },
        },
        include: {
          problem: true,
        },
        orderBy: { nextReviewAt: "asc" },
        take: 8,
      }),

      prisma.practiceAttempt.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          problem: true,
        },
      }),

      prisma.practiceAttempt.findMany({
        where: { status: "Passed" },
        select: { problemId: true },
        distinct: ["problemId"],
      }),

      prisma.solution.findMany({
        where: { isAccepted: true },
        select: { problemId: true },
        distinct: ["problemId"],
      }),

      prisma.practiceAttempt.findMany({
        select: { createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
    ]);

    // 2. Compute Solved Problem Set
    const solvedProblemIdSet = new Set<string>();
    passedAttempts.forEach((a) => solvedProblemIdSet.add(a.problemId));
    acceptedSolutions.forEach((s) => solvedProblemIdSet.add(s.problemId));

    // 3. Difficulty Breakdown
    let easyTotal = 0;
    let easySolved = 0;
    let mediumTotal = 0;
    let mediumSolved = 0;
    let hardTotal = 0;
    let hardSolved = 0;

    allProblems.forEach((p) => {
      const isSolved = solvedProblemIdSet.has(p.id);
      const diff = p.difficulty as "Easy" | "Medium" | "Hard";
      if (diff === "Easy") {
        easyTotal++;
        if (isSolved) easySolved++;
      } else if (diff === "Medium") {
        mediumTotal++;
        if (isSolved) mediumSolved++;
      } else if (diff === "Hard") {
        hardTotal++;
        if (isSolved) hardSolved++;
      }
    });

    // 4. Calculate Streak
    const practiceStreakDays = calculateStreak(allAttemptsForStreak);

    // 5. Map Revision Items
    const revisionProblems: DashboardRevisionItem[] = dueSchedules.map((schedule) => ({
      id: schedule.problem.id,
      number: schedule.problem.leetcodeId,
      title: schedule.problem.title,
      slug: schedule.problem.slug,
      difficulty: schedule.problem.difficulty as "Easy" | "Medium" | "Hard",
      topics: schedule.problem.tags,
      lastPracticed: formatRelativeTime(schedule.lastPracticedAt),
      nextReview: "Today",
    }));

    // 6. Map Recent Practice Items
    const recentPractices: DashboardRecentItem[] = recentAttempts.map((attempt) => ({
      id: attempt.id,
      problemNumber: attempt.problem.leetcodeId,
      problemTitle: attempt.problem.title,
      slug: attempt.problem.slug,
      difficulty: attempt.problem.difficulty as "Easy" | "Medium" | "Hard",
      lastPracticed: formatRelativeTime(attempt.createdAt),
      result: (attempt.status as "Passed" | "Partial" | "Needs Review") || "Passed",
    }));

    return {
      stats: {
        totalProblems: allProblems.length,
        totalSolved: solvedProblemIdSet.size,
        solvedCount: solvedProblemIdSet.size,
        dueTodayCount: dueSchedules.length,
        practiceStreakDays,
        easyTotal,
        easySolved,
        mediumTotal,
        mediumSolved,
        hardTotal,
        hardSolved,
      },
      revisionProblems,
      recentPractices,
    };
  } catch (error) {
    console.error("Database query fallback in getDashboardData:", error);
    return {
      stats: {
        totalProblems: 0,
        totalSolved: 0,
        solvedCount: 0,
        dueTodayCount: 0,
        practiceStreakDays: 0,
        easyTotal: 0,
        easySolved: 0,
        mediumTotal: 0,
        mediumSolved: 0,
        hardTotal: 0,
        hardSolved: 0,
      },
      revisionProblems: [],
      recentPractices: [],
    };
  }
}
