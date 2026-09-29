import {
  LeetCodeRawQuestion,
  LeetCodeParsedProblem,
  ParsedExample,
} from "./types";

/**
 * Decodes common HTML entities into plain text / markdown characters.
 */
function decodeHtmlEntities(html: string): string {
  return html
    .replace(/&nbsp;/gi, " ")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&le;/gi, "<=")
    .replace(/&ge;/gi, ">=")
    .replace(/&times;/gi, "*")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)));
}

/**
 * Strips HTML formatting, converting <code> to backticks, <sup> to ^, etc.
 */
function htmlToPlainText(html: string): string {
  if (!html) return "";
  let text = html
    .replace(/<sup[^>]*>(.*?)<\/sup>/gi, "^$1")
    .replace(/<sub[^>]*>(.*?)<\/sub>/gi, "[$1]")
    .replace(/<code[^>]*>(.*?)<\/code>/gi, "`$1`")
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, "$1")
    .replace(/<em[^>]*>(.*?)<\/em>/gi, "$1")
    .replace(/<b[^>]*>(.*?)<\/b>/gi, "$1")
    .replace(/<i[^>]*>(.*?)<\/i>/gi, "$1")
    .replace(/<span[^>]*>(.*?)<\/span>/gi, "$1")
    .replace(/<li[^>]*>/gi, "\n• ")
    .replace(/<\/li>/gi, "")
    .replace(/<p[^>]*>/gi, "\n\n")
    .replace(/<\/p>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, ""); // strip remaining tags

  text = decodeHtmlEntities(text);
  // Normalize consecutive newlines and whitespace
  return text
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Extracts constraints list from problem HTML content.
 */
function parseConstraints(html: string): string[] {
  const constraints: string[] = [];

  // Match constraints section
  const constraintsMatch = html.match(
    /<strong[^>]*>\s*Constraints:\s*<\/strong>[\s\S]*?(?:<ul[^>]*>([\s\S]*?)<\/ul>)/i
  );

  if (constraintsMatch && constraintsMatch[1]) {
    const listHtml = constraintsMatch[1];
    const liMatches = listHtml.match(/<li[^>]*>([\s\S]*?)<\/li>/gi);
    if (liMatches) {
      for (const li of liMatches) {
        const item = htmlToPlainText(li).replace(/^[•\-\*]\s*/, "").trim();
        if (item) constraints.push(item);
      }
    }
  }

  // Fallback: If no <ul> structure found, look for bullet lines after Constraints:
  if (constraints.length === 0) {
    const fallbackMatch = html.match(/Constraints:([\s\S]*?)(?:<p>&nbsp;<\/p>|$)/i);
    if (fallbackMatch && fallbackMatch[1]) {
      const plain = htmlToPlainText(fallbackMatch[1]);
      const lines = plain
        .split("\n")
        .map((l) => l.replace(/^[•\-\*]\s*/, "").trim())
        .filter((l) => l.length > 0);
      constraints.push(...lines);
    }
  }

  return constraints.length > 0
    ? constraints
    : [
        "1 <= nums.length <= 10^4",
        "Refer to official LeetCode problem statement for further constraints.",
      ];
}

/**
 * Extracts structured examples from problem HTML content.
 */
function parseExamples(html: string): ParsedExample[] {
  const examples: ParsedExample[] = [];

  // 1. Try matching <pre> blocks (Classic LeetCode format)
  const preMatches = html.match(/<pre[^>]*>([\s\S]*?)<\/pre>/gi);
  if (preMatches && preMatches.length > 0) {
    for (const pre of preMatches) {
      const plain = decodeHtmlEntities(
        pre
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim()
      );

      const inputMatch = plain.match(/Input:\s*(.*?)(?=\s*Output:|$)/i);
      const outputMatch = plain.match(/Output:\s*(.*?)(?=\s*Explanation:|$)/i);
      const explanationMatch = plain.match(/Explanation:\s*(.*)/i);

      if (inputMatch && outputMatch) {
        examples.push({
          input: inputMatch[1].trim(),
          output: outputMatch[1].trim(),
          explanation: explanationMatch ? explanationMatch[1].trim() : undefined,
        });
      }
    }
  }

  // 2. Try matching example-block divs (New LeetCode format)
  if (examples.length === 0) {
    const blockMatches = html.match(/<div class="example-block"[^>]*>([\s\S]*?)<\/div>/gi);
    if (blockMatches && blockMatches.length > 0) {
      for (const block of blockMatches) {
        const plain = decodeHtmlEntities(
          block
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .trim()
        );

        const inputMatch = plain.match(/Input:\s*(.*?)(?=\s*Output:|$)/i);
        const outputMatch = plain.match(/Output:\s*(.*?)(?=\s*Explanation:|$)/i);
        const explanationMatch = plain.match(/Explanation:\s*(.*)/i);

        if (inputMatch && outputMatch) {
          examples.push({
            input: inputMatch[1].trim(),
            output: outputMatch[1].trim(),
            explanation: explanationMatch ? explanationMatch[1].trim() : undefined,
          });
        }
      }
    }
  }

  // 3. Fallback: Parse directly via regex if neither block tag matched
  if (examples.length === 0) {
    const regex = /<strong>Input:<\/strong>\s*([\s\S]*?)<strong>Output:<\/strong>\s*([\s\S]*?)(?:<strong>Explanation:<\/strong>\s*([\s\S]*?))?(?=<p><strong class="example">|<strong>Constraints:<\/strong>|$)/gi;
    let match;
    while ((match = regex.exec(html)) !== null) {
      const input = htmlToPlainText(match[1]).trim();
      const output = htmlToPlainText(match[2]).trim();
      const explanation = match[3] ? htmlToPlainText(match[3]).trim() : undefined;
      if (input && output) {
        examples.push({ input, output, explanation });
      }
    }
  }

  return examples.length > 0
    ? examples
    : [{ input: "nums = [1]", output: "1", explanation: undefined }];
}

/**
 * Extracts the clean problem description before the examples and constraints.
 */
function parseDescription(html: string): string {
  // Cut off at first example or constraints
  const cutoffIndex = html.search(
    /(?:<p><strong class="example">|<strong class="example">|<div class="example-block"|<pre><strong>Input:|<strong[^>]*>Constraints:)/i
  );

  const descHtml = cutoffIndex > 0 ? html.substring(0, cutoffIndex) : html;
  const plain = htmlToPlainText(descHtml);

  return plain || "Problem description available on LeetCode.";
}

/**
 * Parses a raw LeetCode question object into a clean, structured LeetCodeParsedProblem.
 */
export function parseLeetCodeQuestion(
  raw: LeetCodeRawQuestion
): LeetCodeParsedProblem {
  const contentHtml = raw.content || "";

  const description = parseDescription(contentHtml);
  const examples = parseExamples(contentHtml);
  const constraints = parseConstraints(contentHtml);

  const tags =
    raw.topicTags && raw.topicTags.length > 0
      ? raw.topicTags.map((t) => t.name)
      : ["Algorithms"];

  const difficultyNormalized: "Easy" | "Medium" | "Hard" =
    raw.difficulty === "Medium"
      ? "Medium"
      : raw.difficulty === "Hard"
      ? "Hard"
      : "Easy";

  const numId = parseInt(raw.questionFrontendId || raw.questionId, 10);

  return {
    leetcodeId: isNaN(numId) ? 1 : numId,
    title: raw.title.trim(),
    slug: raw.titleSlug.trim().toLowerCase(),
    difficulty: difficultyNormalized,
    tags,
    description,
    examples,
    constraints,
    url: `https://leetcode.com/problems/${raw.titleSlug.trim().toLowerCase()}/`,
  };
}
