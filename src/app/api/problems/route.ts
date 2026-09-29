import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getProblemsLibrary } from "@/lib/db-queries";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const difficulty = searchParams.get("difficulty") || "All";
    const tag = searchParams.get("tag") || "All";
    const status = searchParams.get("status") || "All";
    const revision = searchParams.get("revision") || "All";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const data = await getProblemsLibrary({
      q,
      difficulty,
      tag,
      status,
      revision,
      page,
      limit,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/problems error:", error);
    return NextResponse.json(
      { error: "Failed to fetch problems from database" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      leetcodeId,
      title,
      difficulty = "Medium",
      tags = [],
      url,
      description = "",
      examples = [],
      constraints = [],
      solutionCode,
      solutionLanguage = "typescript",
    } = body;

    const numId = parseInt(leetcodeId, 10);
    if (isNaN(numId) || !title) {
      return NextResponse.json(
        { error: "LeetCode ID number and Problem Title are required." },
        { status: 400 }
      );
    }

    // Slug generator
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const problemUrl = url || `https://leetcode.com/problems/${slug}/`;

    // Process tags
    const cleanTags = Array.isArray(tags)
      ? tags.map((t: string) => t.trim()).filter(Boolean)
      : typeof tags === "string"
      ? tags.split(",").map((t: string) => t.trim()).filter(Boolean)
      : ["Algorithms"];

    // 1. Upsert Problem in Neon PostgreSQL
    const problem = await prisma.problem.upsert({
      where: { leetcodeId: numId },
      update: {
        title,
        slug,
        difficulty,
        url: problemUrl,
        description: description || `LeetCode #${numId} - ${title}`,
        tags: cleanTags.length > 0 ? cleanTags : ["Algorithms"],
        constraints: Array.isArray(constraints) ? constraints : [],
        examples: Array.isArray(examples) ? examples : [],
      },
      create: {
        leetcodeId: numId,
        title,
        slug,
        difficulty,
        url: problemUrl,
        description: description || `LeetCode #${numId} - ${title}`,
        tags: cleanTags.length > 0 ? cleanTags : ["Algorithms"],
        constraints: Array.isArray(constraints) ? constraints : [],
        examples: Array.isArray(examples) ? examples : [],
      },
    });

    // 2. User & Revision Schedule
    const user = await getCurrentUser();
    const userId = user?.id || null;

    if (userId) {
      await prisma.revisionSchedule.upsert({
        where: {
          problemId_userId: {
            problemId: problem.id,
            userId,
          },
        },
        update: {
          status: "Due",
          nextReviewAt: new Date(),
        },
        create: {
          problemId: problem.id,
          userId,
          status: "Due",
          nextReviewAt: new Date(),
          interval: 1,
        },
      });
    }

    // 3. Optional Solution
    if (solutionCode && solutionCode.trim()) {
      await prisma.solution.create({
        data: {
          problemId: problem.id,
          language: solutionLanguage,
          code: solutionCode.trim(),
          isAccepted: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      problem,
      message: `Problem #${problem.leetcodeId} "${problem.title}" added to your revision library!`,
    });
  } catch (error) {
    console.error("POST /api/problems error:", error);
    return NextResponse.json(
      { error: "Failed to create problem in database" },
      { status: 500 }
    );
  }
}
