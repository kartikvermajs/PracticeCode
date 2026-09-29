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

function formatNextReviewTime(date?: Date | null): { text: string; isDue: boolean } {
  if (!date) return { text: "Not Scheduled", isDue: false };
  const now = new Date();
  const target = new Date(date);

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const diffDays = Math.round((targetDay.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return { text: "Due Today", isDue: true };
  } else if (diffDays === 1) {
    return { text: "Tomorrow", isDue: false };
  } else if (diffDays <= 7) {
    return { text: `In ${diffDays} days`, isDue: false };
  } else {
    return {
      text: target.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      isDue: false,
    };
  }
}

export interface ProblemsFilterOptions {
  q?: string;
  difficulty?: string;
  tag?: string;
  status?: string; // "all" | "solved" | "unsolved"
  revision?: string; // "all" | "due" | "upcoming"
  page?: number;
  limit?: number;
}

export interface ProblemLibraryItem {
  id: string;
  number: number;
  title: string;
  slug: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
  url: string;
  isSolved: boolean;
  statusText: "Solved" | "Attempted" | "Unsolved";
  isDue: boolean;
  lastPracticed: string;
  lastPracticedAt: Date | null;
  nextReview: string;
  nextReviewAt: Date | null;
  attemptCount: number;
}

export interface ProblemsLibraryResult {
  problems: ProblemLibraryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  allTags: string[];
  stats: {
    totalCount: number;
    solvedCount: number;
    dueCount: number;
  };
}

/**
 * Fetch and filter problems directly from the Problem database table
 */
export async function getProblemsLibrary(
  options: ProblemsFilterOptions = {}
): Promise<ProblemsLibraryResult> {
  const {
    q = "",
    difficulty = "All",
    tag = "All",
    status = "All",
    revision = "All",
    page = 1,
    limit = 10,
  } = options;

  try {
    // 1. Fetch all problems with relational data from Neon PostgreSQL
    const rawProblems = await prisma.problem.findMany({
      include: {
        solutions: {
          select: { isAccepted: true },
        },
        practiceAttempts: {
          select: { id: true, status: true, createdAt: true },
          orderBy: { createdAt: "desc" },
        },
        revisionSchedules: {
          select: { lastPracticedAt: true, nextReviewAt: true, status: true },
        },
      },
      orderBy: { leetcodeId: "asc" },
    });

    // 2. Collect all distinct tags for filter toolbar
    const tagSet = new Set<string>();
    rawProblems.forEach((p) => {
      p.tags.forEach((t) => tagSet.add(t));
    });
    const allTags = Array.from(tagSet).sort();

    // 3. Map into enriched items
    const allItems: ProblemLibraryItem[] = rawProblems.map((p) => {
      const hasAcceptedSolution = p.solutions.some((s) => s.isAccepted);
      const hasPassedAttempt = p.practiceAttempts.some((a) => a.status === "Passed");
      const isSolved = hasAcceptedSolution || hasPassedAttempt;

      const latestAttempt = p.practiceAttempts[0];
      const schedule = p.revisionSchedules[0];

      const lastPracticedAt =
        schedule?.lastPracticedAt || (latestAttempt ? latestAttempt.createdAt : null);
      const nextReviewAt = schedule?.nextReviewAt || null;

      const reviewInfo = formatNextReviewTime(nextReviewAt);

      let statusText: "Solved" | "Attempted" | "Unsolved" = "Unsolved";
      if (isSolved) {
        statusText = "Solved";
      } else if (p.practiceAttempts.length > 0) {
        statusText = "Attempted";
      }

      return {
        id: p.id,
        number: p.leetcodeId,
        title: p.title,
        slug: p.slug,
        difficulty: (p.difficulty as "Easy" | "Medium" | "Hard") || "Easy",
        tags: p.tags,
        url: p.url,
        isSolved,
        statusText,
        isDue: reviewInfo.isDue,
        lastPracticed: formatRelativeTime(lastPracticedAt),
        lastPracticedAt,
        nextReview: reviewInfo.text,
        nextReviewAt,
        attemptCount: p.practiceAttempts.length,
      };
    });

    // 4. Compute overall collection stats
    const totalCount = allItems.length;
    const solvedCount = allItems.filter((p) => p.isSolved).length;
    const dueCount = allItems.filter((p) => p.isDue).length;

    // 5. Apply filters
    const cleanQ = q.trim().toLowerCase();
    const queryNum = cleanQ.replace(/^#/, "");

    const filtered = allItems.filter((item) => {
      // Search matching (by Title or LeetCode #)
      if (cleanQ) {
        const matchesNumber = item.number.toString().includes(queryNum);
        const matchesTitle = item.title.toLowerCase().includes(cleanQ);
        const matchesTag = item.tags.some((t) => t.toLowerCase().includes(cleanQ));
        if (!matchesNumber && !matchesTitle && !matchesTag) {
          return false;
        }
      }

      // Difficulty filter
      if (difficulty !== "All" && item.difficulty.toLowerCase() !== difficulty.toLowerCase()) {
        return false;
      }

      // Topic / Tag filter
      if (tag !== "All" && !item.tags.some((t) => t.toLowerCase() === tag.toLowerCase())) {
        return false;
      }

      // Solved status filter
      if (status !== "All") {
        if (status.toLowerCase() === "solved" && !item.isSolved) {
          return false;
        }
        if (status.toLowerCase() === "unsolved" && item.isSolved) {
          return false;
        }
      }

      // Revision status filter
      if (revision !== "All") {
        if (revision.toLowerCase() === "due" && !item.isDue) {
          return false;
        }
        if (revision.toLowerCase() === "upcoming" && (item.isDue || !item.nextReviewAt)) {
          return false;
        }
      }

      return true;
    });

    // 6. Pagination
    const validLimit = Math.max(1, Math.min(50, limit));
    const totalPages = Math.ceil(filtered.length / validLimit) || 1;
    const currentPage = Math.min(Math.max(1, page), totalPages);
    const startIndex = (currentPage - 1) * validLimit;
    const paginatedProblems = filtered.slice(startIndex, startIndex + validLimit);

    return {
      problems: paginatedProblems,
      total: filtered.length,
      page: currentPage,
      limit: validLimit,
      totalPages,
      allTags,
      stats: {
        totalCount,
        solvedCount,
        dueCount,
      },
    };
  } catch (error) {
    console.error("Database query fallback in getProblemsLibrary:", error);
    return {
      problems: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 1,
      allTags: [],
      stats: {
        totalCount: 0,
        solvedCount: 0,
        dueCount: 0,
      },
    };
  }
}

