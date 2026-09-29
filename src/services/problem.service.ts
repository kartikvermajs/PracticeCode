import { prisma } from "@/lib/prisma";

export interface ProblemExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface CreateProblemInput {
  url: string;
  leetcodeId: number;
  title: string;
  slug: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
  description: string;
  examples: ProblemExample[];
  constraints: string[];
  solutionCode?: string;
  solutionLanguage?: string;
  userId?: string | null;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

import { extractSlugFromLeetCodeUrl } from "@/lib/problem-utils";
export { extractSlugFromLeetCodeUrl };

/**
 * Validates all required fields for creating a problem.
 */
export function validateProblemInput(
  input: Partial<CreateProblemInput>
): ValidationResult {
  const errors: Record<string, string> = {};

  // 1. LeetCode URL
  if (!input.url || !input.url.trim()) {
    errors.url = "LeetCode URL is required.";
  } else {
    const trimmedUrl = input.url.trim();
    if (!/^https?:\/\//i.test(trimmedUrl)) {
      errors.url = "URL must start with http:// or https://";
    } else if (!/leetcode\.(?:com|cn)\/problems\//i.test(trimmedUrl)) {
      errors.url = "Must be a valid LeetCode problem URL (e.g. https://leetcode.com/problems/single-number/).";
    }
  }

  // 2. Problem Number (leetcodeId)
  if (
    input.leetcodeId === undefined ||
    input.leetcodeId === null ||
    isNaN(Number(input.leetcodeId)) ||
    Number(input.leetcodeId) <= 0
  ) {
    errors.leetcodeId = "Problem number must be a positive integer.";
  }

  // 3. Title
  if (!input.title || !input.title.trim()) {
    errors.title = "Problem title is required.";
  }

  // 4. Slug
  if (!input.slug || !input.slug.trim()) {
    errors.slug = "Problem slug is required.";
  } else {
    const cleanSlug = input.slug.trim().toLowerCase();
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(cleanSlug)) {
      errors.slug = "Slug must contain only lowercase letters, numbers, and single hyphens.";
    }
  }

  // 5. Difficulty
  if (
    !input.difficulty ||
    !["Easy", "Medium", "Hard"].includes(input.difficulty)
  ) {
    errors.difficulty = "Difficulty must be Easy, Medium, or Hard.";
  }

  // 6. Tags
  if (
    !input.tags ||
    !Array.isArray(input.tags) ||
    input.tags.filter((t) => t && t.trim()).length === 0
  ) {
    errors.tags = "At least one topic tag is required (e.g. Array, Bit Manipulation).";
  }

  // 7. Description
  if (!input.description || !input.description.trim()) {
    errors.description = "Problem description is required.";
  }

  // 8. Examples
  if (
    !input.examples ||
    !Array.isArray(input.examples) ||
    input.examples.length === 0
  ) {
    errors.examples = "At least one example is required.";
  } else {
    const hasValidExample = input.examples.some(
      (ex) => ex && ex.input && ex.input.trim() && ex.output && ex.output.trim()
    );
    if (!hasValidExample) {
      errors.examples = "Each example must provide both Input and Output.";
    }
  }

  // 9. Constraints
  if (
    !input.constraints ||
    !Array.isArray(input.constraints) ||
    input.constraints.filter((c) => c && c.trim()).length === 0
  ) {
    errors.constraints = "At least one constraint is required.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  field?: "leetcodeId" | "slug";
  message?: string;
}

/**
 * Checks if a problem already exists in Neon PostgreSQL by leetcodeId or slug.
 */
export async function checkDuplicateProblem(
  leetcodeId: number,
  slug: string
): Promise<DuplicateCheckResult> {
  // Check leetcodeId uniqueness
  const existingById = await prisma.problem.findUnique({
    where: { leetcodeId },
    select: { id: true, title: true, leetcodeId: true },
  });

  if (existingById) {
    return {
      isDuplicate: true,
      field: "leetcodeId",
      message: `A problem with LeetCode ID #${leetcodeId} already exists: "${existingById.title}".`,
    };
  }

  // Check slug uniqueness
  const existingBySlug = await prisma.problem.findUnique({
    where: { slug },
    select: { id: true, title: true, slug: true },
  });

  if (existingBySlug) {
    return {
      isDuplicate: true,
      field: "slug",
      message: `A problem with slug "${slug}" already exists: "${existingBySlug.title}".`,
    };
  }

  return { isDuplicate: false };
}

/**
 * Creates a new Problem in Neon PostgreSQL.
 * Designed cleanly so an automated importer can invoke it directly.
 */
export async function createProblem(input: CreateProblemInput) {
  // 1. Validate fields
  const validation = validateProblemInput(input);
  if (!validation.isValid) {
    const error = new Error("Validation failed");
    (error as any).errors = validation.errors;
    (error as any).status = 400;
    throw error;
  }

  const numId = Number(input.leetcodeId);
  const cleanSlug = input.slug.trim().toLowerCase();

  // 2. Duplicate prevention (leetcodeId & slug)
  const duplicate = await checkDuplicateProblem(numId, cleanSlug);
  if (duplicate.isDuplicate) {
    const error = new Error(duplicate.message);
    (error as any).field = duplicate.field;
    (error as any).status = 409;
    throw error;
  }

  // 3. Clean up payload arrays
  const cleanTags = input.tags
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  const cleanConstraints = input.constraints
    .map((c) => c.trim())
    .filter((c) => c.length > 0);

  const cleanExamples = input.examples.map((ex) => ({
    input: ex.input.trim(),
    output: ex.output.trim(),
    explanation: ex.explanation ? ex.explanation.trim() : undefined,
  }));

  // 4. Create Problem record in database
  const problem = await prisma.problem.create({
    data: {
      leetcodeId: numId,
      title: input.title.trim(),
      slug: cleanSlug,
      difficulty: input.difficulty,
      url: input.url.trim(),
      description: input.description.trim(),
      tags: cleanTags,
      constraints: cleanConstraints,
      examples: cleanExamples,
    },
  });

  // 5. Create initial RevisionSchedule for user so it appears in revision deck
  const userId = input.userId || "user_kartik_dev";
  await prisma.revisionSchedule.create({
    data: {
      problemId: problem.id,
      userId,
      status: "Due",
      nextReviewAt: new Date(),
      interval: 1,
      difficultyRating: 2.0,
      lastPracticedAt: null,
    },
  });

  // 6. Optional accepted solution
  if (input.solutionCode && input.solutionCode.trim()) {
    await prisma.solution.create({
      data: {
        problemId: problem.id,
        language: input.solutionLanguage || "typescript",
        code: input.solutionCode.trim(),
        isAccepted: true,
      },
    });
  }

  return problem;
}
