import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getProblemsLibrary } from "@/lib/db-queries";
import { getCurrentUser } from "@/lib/auth";
import {
  createProblem,
  extractSlugFromLeetCodeUrl,
  CreateProblemInput,
} from "@/services/problem.service";

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
    const user = await getCurrentUser();

    // Auto-extract slug from url if slug not provided
    const url = body.url ? String(body.url).trim() : "";
    let slug = body.slug ? String(body.slug).trim() : "";
    if (!slug && url) {
      slug = extractSlugFromLeetCodeUrl(url);
    }

    const payload: CreateProblemInput = {
      url,
      leetcodeId: Number(body.leetcodeId),
      title: body.title ? String(body.title).trim() : "",
      slug,
      difficulty: body.difficulty || "Medium",
      tags: Array.isArray(body.tags)
        ? body.tags
        : typeof body.tags === "string"
        ? body.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
        : [],
      description: body.description ? String(body.description).trim() : "",
      examples: Array.isArray(body.examples) ? body.examples : [],
      constraints: Array.isArray(body.constraints)
        ? body.constraints
        : typeof body.constraints === "string"
        ? body.constraints.split("\n").map((c: string) => c.trim()).filter(Boolean)
        : [],
      solutionCode: body.solutionCode,
      solutionLanguage: body.solutionLanguage || "typescript",
      userId: user?.id || null,
    };

    const problem = await createProblem(payload);

    return NextResponse.json(
      {
        success: true,
        problem,
        message: `Problem #${problem.leetcodeId} "${problem.title}" added to your revision library!`,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/problems error:", error);

    if (error.status === 409) {
      return NextResponse.json(
        {
          error: error.message || "A duplicate problem was found.",
          field: error.field,
        },
        { status: 409 }
      );
    }

    if (error.status === 400 && error.errors) {
      return NextResponse.json(
        {
          error: "Validation failed. Please correct the highlighted errors.",
          errors: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to create problem in database." },
      { status: 500 }
    );
  }
}
