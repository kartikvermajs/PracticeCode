import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchLeetCodeProblem } from "@/lib/leetcode";
import { createProblem } from "@/services/problem.service";
import { extractSlugFromLeetCodeUrl } from "@/lib/problem-utils";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const raw = body.urlOrSlug ? String(body.urlOrSlug).trim() : "";

    if (!raw) {
      return NextResponse.json(
        { status: "failed", error: "Missing problem URL or slug" },
        { status: 400 }
      );
    }

    // Extract slug
    let slug = extractSlugFromLeetCodeUrl(raw);
    if (!slug) {
      slug = raw.toLowerCase().replace(/[^\w-]/g, "");
    }

    if (!slug) {
      return NextResponse.json({
        status: "failed",
        raw,
        error: "Invalid problem URL or slug format",
      });
    }

    // 1. Detect duplicate by slug in Neon PostgreSQL
    const existingBySlug = await prisma.problem.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        title: true,
        leetcodeId: true,
        difficulty: true,
      },
    });

    if (existingBySlug) {
      return NextResponse.json({
        status: "skipped",
        slug,
        title: existingBySlug.title,
        leetcodeId: existingBySlug.leetcodeId,
        difficulty: existingBySlug.difficulty,
        reason: "Already in library",
      });
    }

    // 2. Fetch public problem data via compliant LeetCode GraphQL
    let parsedProblem;
    try {
      parsedProblem = await fetchLeetCodeProblem(slug);
    } catch (fetchErr: any) {
      return NextResponse.json({
        status: "failed",
        slug,
        error: fetchErr.message || "Failed to fetch from LeetCode public API",
      });
    }

    // 3. Detect duplicate by leetcodeId in Neon PostgreSQL
    const existingById = await prisma.problem.findUnique({
      where: { leetcodeId: parsedProblem.leetcodeId },
      select: {
        id: true,
        slug: true,
        title: true,
        leetcodeId: true,
        difficulty: true,
      },
    });

    if (existingById) {
      return NextResponse.json({
        status: "skipped",
        slug: parsedProblem.slug,
        title: existingById.title,
        leetcodeId: existingById.leetcodeId,
        difficulty: existingById.difficulty,
        reason: `Problem #${existingById.leetcodeId} already exists`,
      });
    }

    // 4. Import new problem into database
    const user = await getCurrentUser();
    const created = await createProblem({
      url: parsedProblem.url,
      leetcodeId: parsedProblem.leetcodeId,
      title: parsedProblem.title,
      slug: parsedProblem.slug,
      difficulty: parsedProblem.difficulty,
      tags: parsedProblem.tags,
      description: parsedProblem.description,
      examples: parsedProblem.examples,
      constraints: parsedProblem.constraints,
      userId: user?.id || null,
    });

    return NextResponse.json({
      status: "imported",
      slug: created.slug,
      title: created.title,
      leetcodeId: created.leetcodeId,
      difficulty: created.difficulty,
      tags: created.tags,
    });
  } catch (error: any) {
    console.error("POST /api/problems/import/item error:", error);
    return NextResponse.json({
      status: "failed",
      error: error.message || "An unexpected error occurred during import",
    });
  }
}
