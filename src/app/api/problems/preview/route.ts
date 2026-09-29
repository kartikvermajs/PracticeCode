import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchLeetCodeProblem } from "@/lib/leetcode";
import { extractSlugFromLeetCodeUrl } from "@/lib/problem-utils";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawUrl = body.url ? String(body.url).trim() : "";
    let slug = body.slug ? String(body.slug).trim() : "";

    if (!slug && rawUrl) {
      slug = extractSlugFromLeetCodeUrl(rawUrl);
    }

    if (!slug) {
      return NextResponse.json(
        {
          error:
            "Invalid LeetCode URL. Could not extract problem slug (e.g. https://leetcode.com/problems/single-number/).",
        },
        { status: 400 }
      );
    }

    // 1. Fetch public question data via compliant public GraphQL
    const parsedProblem = await fetchLeetCodeProblem(slug);

    // 2. Check if problem already exists in Neon PostgreSQL by slug or leetcodeId
    const existingProblem = await prisma.problem.findFirst({
      where: {
        OR: [
          { slug: parsedProblem.slug },
          { leetcodeId: parsedProblem.leetcodeId },
        ],
      },
      select: {
        id: true,
        slug: true,
        title: true,
        leetcodeId: true,
      },
    });

    const exists = Boolean(existingProblem);

    return NextResponse.json({
      success: true,
      exists,
      existingSlug: existingProblem?.slug,
      existingTitle: existingProblem?.title,
      existingNumber: existingProblem?.leetcodeId,
      problem: parsedProblem,
    });
  } catch (error: any) {
    console.error("POST /api/problems/preview error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch LeetCode problem data.",
        fallback: true,
      },
      { status: 422 }
    );
  }
}
