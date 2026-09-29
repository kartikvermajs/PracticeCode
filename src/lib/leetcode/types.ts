/**
 * Types for the compliant LeetCode public GraphQL importer.
 */

export interface LeetCodeTopicTag {
  name: string;
  slug: string;
}

export interface LeetCodeRawQuestion {
  questionId: string;
  questionFrontendId: string;
  title: string;
  titleSlug: string;
  content: string | null;
  difficulty: "Easy" | "Medium" | "Hard" | string;
  isPaidOnly?: boolean;
  topicTags: LeetCodeTopicTag[];
}

export interface LeetCodeGraphQLResponse {
  data?: {
    question?: LeetCodeRawQuestion | null;
  };
  errors?: Array<{ message: string }>;
}

export interface ParsedExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface LeetCodeParsedProblem {
  leetcodeId: number;
  title: string;
  slug: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
  description: string;
  examples: ParsedExample[];
  constraints: string[];
  url: string;
}

export interface ImportPreviewResponse {
  success: boolean;
  exists: boolean;
  existingSlug?: string;
  existingTitle?: string;
  problem?: LeetCodeParsedProblem;
  error?: string;
}
