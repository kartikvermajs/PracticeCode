import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { applyRevisionRating, RecallRating } from "@/services/revision.service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const userId = user?.id || "user_kartik_dev";

    const body = await req.json();
    const { problemId, rating } = body;

    if (!problemId || !rating) {
      return NextResponse.json(
        { error: "problemId and rating ('Difficult' | 'Good' | 'Easy') are required." },
        { status: 400 }
      );
    }

    if (!["Difficult", "Good", "Easy"].includes(rating)) {
      return NextResponse.json(
        { error: "Invalid rating. Must be 'Difficult', 'Good', or 'Easy'." },
        { status: 400 }
      );
    }

    const result = await applyRevisionRating(
      problemId,
      userId,
      rating as RecallRating
    );

    return NextResponse.json({
      success: true,
      schedule: result.schedule,
      calculation: result.calculation,
      message: `Revision scheduled! Next review in ${result.calculation.interval} day${
        result.calculation.interval === 1 ? "" : "s"
      }.`,
    });
  } catch (error) {
    console.error("POST /api/revision/rate error:", error);
    return NextResponse.json(
      { error: "Failed to apply revision rating" },
      { status: 500 }
    );
  }
}
