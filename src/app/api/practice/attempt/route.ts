import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateNextReview, type RecallRating } from "@/services/revision.service";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const { problemId, language, code, status = "Passed", rating } = await req.json();

    if (!problemId || !code) {
      return NextResponse.json(
        { error: "problemId and code are required" },
        { status: 400 }
      );
    }

    // Resolve real problem in DB if problemId is slug or id
    const foundProblem = await prisma.problem.findFirst({
      where: {
        OR: [{ id: problemId }, { slug: problemId }],
      },
    });

    const realProblemId = foundProblem ? foundProblem.id : problemId;

    // 1. Create PracticeAttempt record (never overwrites old attempts)
    const now = new Date();
    const attempt = await prisma.practiceAttempt.create({
      data: {
        problemId: realProblemId,
        userId: user?.id || null,
        language: language || "typescript",
        code,
        status: status || "Passed",
        startedAt: new Date(now.getTime() - 5 * 60 * 1000), // ~5 mins ago
        completedAt: now,
      },
    });

    // 2. Update RevisionSchedule using reusable revision service
    const existingSchedule = await prisma.revisionSchedule.findFirst({
      where: {
        problemId: realProblemId,
        ...(user?.id ? { userId: user.id } : {}),
      },
    });

    const chosenRating = (rating as RecallRating) || "Good";
    const calc = calculateNextReview({
      rating: chosenRating,
      previousInterval: existingSchedule?.interval,
      previousRating: existingSchedule?.difficultyRating,
      now,
    });

    await prisma.revisionSchedule.upsert({
      where: {
        problemId_userId: {
          problemId: realProblemId,
          userId: user?.id || "user_kartik_dev",
        },
      },
      update: {
        lastPracticedAt: calc.lastPracticedAt,
        nextReviewAt: calc.nextReviewAt,
        interval: calc.interval,
        difficultyRating: calc.difficultyRating,
        status: calc.status,
      },
      create: {
        problemId: realProblemId,
        userId: user?.id || "user_kartik_dev",
        lastPracticedAt: calc.lastPracticedAt,
        nextReviewAt: calc.nextReviewAt,
        interval: calc.interval,
        difficultyRating: calc.difficultyRating,
        status: calc.status,
      },
    });

    // 3. Compute new streak
    const userAttempts = await prisma.practiceAttempt.findMany({
      where: user?.id ? { userId: user.id } : {},
      select: { createdAt: true },
      orderBy: { createdAt: "desc" },
    });

    // Unique calendar dates
    const dateSet = new Set<string>();
    userAttempts.forEach((a) => {
      dateSet.add(new Date(a.createdAt).toISOString().split("T")[0]);
    });
    const sortedDates = Array.from(dateSet).sort().reverse();

    let streak = 0;
    const today = now.toISOString().split("T")[0];
    const yesterday = new Date(now.getTime() - 86400000).toISOString().split("T")[0];

    if (sortedDates[0] === today || sortedDates[0] === yesterday) {
      let checkDate = new Date(sortedDates[0]);
      for (const dateStr of sortedDates) {
        if (dateStr === checkDate.toISOString().split("T")[0]) {
          streak++;
          checkDate = new Date(checkDate.getTime() - 86400000);
        } else {
          break;
        }
      }
    }

    return NextResponse.json({
      success: true,
      attemptId: attempt.id,
      streak,
      nextReviewDays: calc.interval,
      message: `Practice attempt saved! Your current streak is ${streak} day${streak === 1 ? "" : "s"}.`,
    });
  } catch (error) {
    console.error("Save attempt API error:", error);
    return NextResponse.json(
      { error: "Failed to record practice attempt" },
      { status: 500 }
    );
  }
}
