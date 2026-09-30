import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MOCK_PROBLEMS } from "@/data/mock-problems";
import { invalidateCacheTags, CACHE_TAGS } from "@/lib/cache";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { problemId, slug, solutionId, language, code } = body;

    if (!code || typeof code !== "string" || !code.trim()) {
      return NextResponse.json(
        { error: "Solution code cannot be empty." },
        { status: 400 }
      );
    }

    if (!language || typeof language !== "string" || !language.trim()) {
      return NextResponse.json(
        { error: "Language is required." },
        { status: 400 }
      );
    }

    const cleanCode = code.trim();
    const cleanLanguage = language.trim().toLowerCase();

    // 1. If solutionId is provided, update the existing solution record
    if (solutionId) {
      const existing = await prisma.solution.findUnique({
        where: { id: solutionId },
      });

      if (!existing) {
        return NextResponse.json(
          { error: "Solution record not found." },
          { status: 404 }
        );
      }

      const updated = await prisma.solution.update({
        where: { id: solutionId },
        data: {
          language: cleanLanguage,
          code: cleanCode,
          isAccepted: true,
        },
      });

      return NextResponse.json({
        success: true,
        solution: {
          id: updated.id,
          language: updated.language,
          code: updated.code,
          isAccepted: updated.isAccepted,
        },
      });
    }

    // 2. Otherwise find or resolve target problem ID
    let targetProblemId = problemId;

    if (!targetProblemId && slug) {
      const problemBySlug = await prisma.problem.findUnique({
        where: { slug },
      });
      if (problemBySlug) {
        targetProblemId = problemBySlug.id;
      }
    }

    // Fallback: If problem doesn't exist in DB yet, check mock problems and create DB record
    if (!targetProblemId && slug) {
      const mock = MOCK_PROBLEMS.find((p) => p.slug === slug);
      if (mock) {
        const createdProblem = await prisma.problem.create({
          data: {
            leetcodeId: mock.number,
            title: mock.title,
            slug: mock.slug,
            difficulty: mock.difficulty,
            url: mock.leetcodeUrl,
            description: mock.description,
            tags: mock.topics,
            constraints: mock.constraints,
            examples: mock.examples,
          },
        });
        targetProblemId = createdProblem.id;

        // Also create default revision schedule
        await prisma.revisionSchedule.create({
          data: {
            problemId: createdProblem.id,
            userId: "user_kartik_dev",
            status: "Due",
            nextReviewAt: new Date(),
            interval: 1,
            difficultyRating: 2.0,
            lastPracticedAt: null,
          },
        }).catch(() => null);
      }
    }

    if (!targetProblemId) {
      return NextResponse.json(
        { error: "Problem not found to associate solution with." },
        { status: 404 }
      );
    }

    // 3. Create the Solution record with isAccepted = true
    const created = await prisma.solution.create({
      data: {
        problemId: targetProblemId,
        language: cleanLanguage,
        code: cleanCode,
        isAccepted: true,
      },
    });

    return NextResponse.json({
      success: true,
      solution: {
        id: created.id,
        language: created.language,
        code: created.code,
        isAccepted: created.isAccepted,
      },
    });
  } catch (error: any) {
    console.error("Error creating/updating solution:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to save solution." },
      { status: 500 }
    );
  }
}
