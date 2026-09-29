import {
  LeetCodeGraphQLResponse,
  LeetCodeParsedProblem,
} from "./types";
import { parseLeetCodeQuestion } from "./parser";

const LEETCODE_GRAPHQL_ENDPOINT = "https://leetcode.com/graphql";

const QUESTION_DATA_QUERY = `
query questionData($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    questionId
    questionFrontendId
    title
    titleSlug
    content
    difficulty
    isPaidOnly
    topicTags {
      name
      slug
    }
  }
}
`;

/**
 * Compliant public fetcher for LeetCode problem data.
 *
 * Security Guarantees:
 * - Never asks for user passwords or tokens.
 * - Never stores authentication cookies or sessions.
 * - Only queries public problem statements.
 * - Gracefully falls back to manual entry when restricted or unavailable.
 */
export async function fetchLeetCodeProblem(
  slug: string
): Promise<LeetCodeParsedProblem> {
  const cleanSlug = slug.trim().toLowerCase();
  if (!cleanSlug) {
    throw new Error("A valid problem slug is required.");
  }

  const payload = {
    query: QUESTION_DATA_QUERY,
    variables: { titleSlug: cleanSlug },
  };

  let response: Response;
  try {
    response = await fetch(LEETCODE_GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Referer: `https://leetcode.com/problems/${cleanSlug}/`,
        Origin: "https://leetcode.com",
      },
      body: JSON.stringify(payload),
      // 8 second timeout to prevent hanging
      signal: AbortSignal.timeout(8000),
    });
  } catch (netErr: any) {
    if (netErr.name === "TimeoutError" || netErr.name === "AbortError") {
      throw new Error(
        "Request to LeetCode timed out. Please check your connection or use manual entry."
      );
    }
    throw new Error(
      `Unable to reach LeetCode public API: ${netErr.message || "Network error"}. Please use manual entry.`
    );
  }

  if (!response.ok) {
    throw new Error(
      `LeetCode responded with status ${response.status}. Please use manual entry.`
    );
  }

  const json: LeetCodeGraphQLResponse = await response.json();

  if (json.errors && json.errors.length > 0) {
    throw new Error(json.errors[0].message || "Failed to query LeetCode problem data.");
  }

  const rawQuestion = json.data?.question;
  if (!rawQuestion) {
    throw new Error(
      `No problem found on LeetCode with slug "${cleanSlug}". Please verify the URL or enter manually.`
    );
  }

  if (rawQuestion.isPaidOnly) {
    throw new Error(
      `Problem "${rawQuestion.title}" is a LeetCode Premium problem. Please paste its details manually.`
    );
  }

  if (!rawQuestion.content) {
    throw new Error(
      `Problem statement content is unavailable for "${rawQuestion.title}". Please enter details manually.`
    );
  }

  return parseLeetCodeQuestion(rawQuestion);
}
