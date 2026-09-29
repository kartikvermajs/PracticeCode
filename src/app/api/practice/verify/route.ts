import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  buildTestHarness,
  normalizeOutput,
  type TestCase,
} from "@/lib/code-runner";

const JUDGE0_API_URL = "https://judge0-ce.p.rapidapi.com";
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY ?? "";

// Judge0 status IDs
const JUDGE0_STATUS = {
  IN_QUEUE: 1,
  PROCESSING: 2,
  ACCEPTED: 3,
  WRONG_ANSWER: 4,
  TIME_LIMIT_EXCEEDED: 5,
  COMPILATION_ERROR: 6,
  RUNTIME_ERROR_SIGSEGV: 7,
  RUNTIME_ERROR_SIGXFSZ: 8,
  RUNTIME_ERROR_SIGFPE: 9,
  RUNTIME_ERROR_SIGABRT: 10,
  RUNTIME_ERROR_NZEC: 11,
  RUNTIME_ERROR_OTHER: 12,
  INTERNAL_ERROR: 13,
  EXEC_FORMAT_ERROR: 14,
} as const;

export interface VerifyRequest {
  problemId: string; // Problem ID or slug
  language: string;
  code: string;
}

export interface CaseResult {
  index: number;
  passed: boolean;
  input: string;
  expected: string;
  output: string;
  explanation?: string;
}

export interface VerifyResponse {
  status: "Accepted" | "Wrong Answer" | "Compilation Error" | "Runtime Error" | "No Test Cases" | "Error";
  message?: string;
  runtime?: string;    // e.g. "42 ms"
  results: CaseResult[];
  compilationError?: string;
}

/**
 * Submits source + stdin to Judge0 CE and polls for completion.
 * Returns the raw Judge0 submission object.
 */
async function submitToJudge0(
  source: string,
  languageId: number,
  stdin: string
): Promise<{
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  status: { id: number; description: string };
  time: string | null;
  memory: number | null;
}> {
  if (!JUDGE0_API_KEY) {
    throw new Error("JUDGE0_API_KEY is not configured.");
  }

  // Encode as base64 (Judge0 CE expects base64 when using base64_encoded=true)
  const encoded = {
    source_code: Buffer.from(source).toString("base64"),
    language_id: languageId,
    stdin: Buffer.from(stdin).toString("base64"),
  };

  // Create submission
  const createRes = await fetch(
    `${JUDGE0_API_URL}/submissions?base64_encoded=true&wait=false`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": JUDGE0_API_KEY,
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
      },
      body: JSON.stringify(encoded),
    }
  );

  if (!createRes.ok) {
    const text = await createRes.text();
    throw new Error(`Judge0 submission failed: ${createRes.status} ${text}`);
  }

  const { token } = await createRes.json() as { token: string };

  // Poll for result (max 15 seconds, 500ms intervals)
  const maxAttempts = 30;
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, 500));

    const pollRes = await fetch(
      `${JUDGE0_API_URL}/submissions/${token}?base64_encoded=true`,
      {
        headers: {
          "X-RapidAPI-Key": JUDGE0_API_KEY,
          "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
        },
      }
    );

    if (!pollRes.ok) continue;

    const result = await pollRes.json() as {
      stdout: string | null;
      stderr: string | null;
      compile_output: string | null;
      status: { id: number; description: string };
      time: string | null;
      memory: number | null;
    };

    // If still processing, keep polling
    if (
      result.status.id === JUDGE0_STATUS.IN_QUEUE ||
      result.status.id === JUDGE0_STATUS.PROCESSING
    ) {
      continue;
    }

    // Decode base64 fields
    const decode = (s: string | null) =>
      s ? Buffer.from(s, "base64").toString("utf-8") : null;

    return {
      ...result,
      stdout: decode(result.stdout),
      stderr: decode(result.stderr),
      compile_output: decode(result.compile_output),
    };
  }

  throw new Error("Code execution timed out (15s).");
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as VerifyRequest;
    const { problemId, language, code } = body;

    if (!problemId || !language || !code) {
      return NextResponse.json<VerifyResponse>(
        { status: "Error", message: "problemId, language, and code are required.", results: [] },
        { status: 400 }
      );
    }

    if (!JUDGE0_API_KEY) {
      return NextResponse.json<VerifyResponse>(
        {
          status: "Error",
          message: "Code execution is not configured. Please add your JUDGE0_API_KEY to environment variables.",
          results: [],
        },
        { status: 503 }
      );
    }

    // Fetch problem examples from DB
    const problem = await prisma.problem.findFirst({
      where: { OR: [{ id: problemId }, { slug: problemId }] },
      select: { examples: true },
    });

    if (!problem) {
      return NextResponse.json<VerifyResponse>(
        { status: "Error", message: "Problem not found.", results: [] },
        { status: 404 }
      );
    }

    const examples = Array.isArray(problem.examples)
      ? (problem.examples as unknown as TestCase[])
      : [];

    if (examples.length === 0) {
      return NextResponse.json<VerifyResponse>({
        status: "No Test Cases",
        message: "No example test cases found for this problem.",
        results: [],
      });
    }

    // Build harness code + stdin
    const { source, languageId, stdin } = buildTestHarness(code, language, examples);

    // Submit to Judge0
    let judgeResult: Awaited<ReturnType<typeof submitToJudge0>>;
    try {
      judgeResult = await submitToJudge0(source, languageId, stdin);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return NextResponse.json<VerifyResponse>({
        status: "Error",
        message: msg,
        results: [],
      });
    }

    // Handle compilation error
    if (judgeResult.status.id === JUDGE0_STATUS.COMPILATION_ERROR) {
      return NextResponse.json<VerifyResponse>({
        status: "Compilation Error",
        compilationError: judgeResult.compile_output ?? judgeResult.stderr ?? "Unknown compilation error",
        results: examples.map((ex, idx) => ({
          index: idx,
          passed: false,
          input: ex.input,
          expected: ex.output,
          output: "",
          explanation: ex.explanation,
        })),
      });
    }

    // Handle runtime error
    if (
      judgeResult.status.id >= JUDGE0_STATUS.RUNTIME_ERROR_SIGSEGV &&
      judgeResult.status.id <= JUDGE0_STATUS.RUNTIME_ERROR_OTHER
    ) {
      return NextResponse.json<VerifyResponse>({
        status: "Runtime Error",
        message: judgeResult.stderr ?? judgeResult.stdout ?? "Runtime error occurred.",
        results: examples.map((ex, idx) => ({
          index: idx,
          passed: false,
          input: ex.input,
          expected: ex.output,
          output: "",
          explanation: ex.explanation,
        })),
      });
    }

    // Parse stdout — one result per line (matching test case order)
    const rawOutput = judgeResult.stdout ?? "";
    const outputLines = rawOutput
      .trim()
      .split("\n")
      .map((l) => l.trim());

    // Build per-case results
    const caseResults: CaseResult[] = examples.map((ex, idx) => {
      const actualOutput = outputLines[idx] ?? "";
      const passed =
        normalizeOutput(actualOutput) === normalizeOutput(ex.output);
      return {
        index: idx,
        passed,
        input: ex.input,
        expected: ex.output,
        output: actualOutput,
        explanation: ex.explanation,
      };
    });

    const allPassed = caseResults.every((r) => r.passed);
    const runtime = judgeResult.time ? `${Math.round(parseFloat(judgeResult.time) * 1000)} ms` : undefined;

    return NextResponse.json<VerifyResponse>({
      status: allPassed ? "Accepted" : "Wrong Answer",
      runtime,
      results: caseResults,
    });
  } catch (error) {
    console.error("Verify API error:", error);
    return NextResponse.json<VerifyResponse>(
      {
        status: "Error",
        message: "Internal server error during code verification.",
        results: [],
      },
      { status: 500 }
    );
  }
}
