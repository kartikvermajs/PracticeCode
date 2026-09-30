import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateNextReview, type RecallRating } from "@/services/revision.service";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const {
      problemId,
      language,
      code,
      status = "Passed",
      rating,
      // Client sends its local YYYY-MM-DD string so we stay timezone-safe
      clientDate,
    } = await req.json();

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

    // 1. Upsert today's attempt — one per problem per calendar day.
    //    We match on UTC window so stored timestamps stay consistent.
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setUTCHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setUTCHours(23, 59, 59, 999);

    const todayAttempt = await prisma.practiceAttempt.findFirst({
      where: {
        problemId: realProblemId,
        ...(user?.id ? { userId: user.id } : {}),
        createdAt: { gte: todayStart, lte: todayEnd },
      },
      orderBy: { createdAt: "asc" },
    });

    let attempt;
    if (todayAttempt) {
      attempt = await prisma.practiceAttempt.update({
        where: { id: todayAttempt.id },
        data: {
          language: language || "typescript",
          code,
          status: status || "Passed",
          completedAt: now,
        },
      });
    } else {
      attempt = await prisma.practiceAttempt.create({
        data: {
          problemId: realProblemId,
          userId: user?.id || null,
          language: language || "typescript",
          code,
          status: status || "Passed",
          startedAt: new Date(now.getTime() - 5 * 60 * 1000),
          completedAt: now,
        },
      });
    }

    // 2. Update RevisionSchedule
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

    // 3. Compute streak using the client's local date to stay timezone-safe.
    //    clientDate is "YYYY-MM-DD" in the user's local timezone.
    const userAttempts = await prisma.practiceAttempt.findMany({
      where: user?.id ? { userId: user.id } : {},
      select: { createdAt: true },
      orderBy: { createdAt: "desc" },
    });

    // Use client's local date if provided, otherwise fall back to UTC date
    const todayStr: string =
      clientDate && /^\d{4}-\d{2}-\d{2}$/.test(clientDate)
        ? clientDate
        : now.toISOString().split("T")[0];

    // Build a date string for each attempt using UTC date (consistent with storage)
    // We compare relative offsets from todayStr
    const todayDate = new Date(todayStr + "T00:00:00Z");
    const yesterdayDate = new Date(todayDate.getTime() - 86400000);
    const yesterdayStr = yesterdayDate.toISOString().split("T")[0];

    // Deduplicate attempt dates (UTC calendar days relative to server)
    const dateSet = new Set<string>();
    userAttempts.forEach((a) => {
      // Compute how many full days before todayStr this attempt was
      const attemptUTC = new Date(a.createdAt).toISOString().split("T")[0];
      // Map server UTC date to "local equivalent" using the offset
      // clientDate offset from UTC: number of MS difference
      const serverToday = now.toISOString().split("T")[0];
      const offsetDays =
        (new Date(todayStr + "T00:00:00Z").getTime() -
          new Date(serverToday + "T00:00:00Z").getTime()) /
        86400000;
      // Shift the attempt date by same offset
      const shiftedDate = new Date(
        new Date(attemptUTC + "T00:00:00Z").getTime() + offsetDays * 86400000
      )
        .toISOString()
        .split("T")[0];
      dateSet.add(shiftedDate);
    });

    const sortedDates = Array.from(dateSet).sort().reverse();

    // Count consecutive streak starting from today (or yesterday)
    let streak = 0;
    if (sortedDates.length > 0 && (sortedDates[0] === todayStr || sortedDates[0] === yesterdayStr)) {
      let checkStr = sortedDates[0];
      for (const dateStr of sortedDates) {
        if (dateStr === checkStr) {
          streak++;
          // Go back one day
          const prev = new Date(new Date(checkStr + "T00:00:00Z").getTime() - 86400000);
          checkStr = prev.toISOString().split("T")[0];
        } else {
          break;
        }
      }
    }

    // 4. Detect streak break:
    //    A streak broke if this is a NEW attempt today (not an update)
    //    AND the most recent prior practice was more than 1 day ago (not yesterday).
    let streakBroke = false;
    if (!todayAttempt) {
      // Find the most recent date that isn't today
      const prevDate = sortedDates.find((d) => d !== todayStr);
      if (prevDate && prevDate !== yesterdayStr) {
        streakBroke = true;
      }
    }

    return NextResponse.json({
      success: true,
      attemptId: attempt.id,
      isUpdate: !!todayAttempt,
      streak,
      streakBroke,
      nextReviewDays: calc.interval,
      message: todayAttempt
        ? `Today's attempt updated! Streak: ${streak} day${streak === 1 ? "" : "s"}.`
        : `Practice attempt saved! Streak: ${streak} day${streak === 1 ? "" : "s"}.`,
    });
  } catch (error) {
    console.error("Save attempt API error:", error);
    return NextResponse.json(
      { error: "Failed to record practice attempt" },
      { status: 500 }
    );
  }
}

