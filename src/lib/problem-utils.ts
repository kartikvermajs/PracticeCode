/**
 * Utility functions for LeetCode problem parsing and slug extraction.
 * Safe for both Client and Server components.
 */

/**
 * Automatically extracts the problem slug from a LeetCode URL.
 * Examples:
 * - "https://leetcode.com/problems/single-number/" -> "single-number"
 * - "https://leetcode.com/problems/two-sum" -> "two-sum"
 * - "https://leetcode.com/problems/valid-parentheses/description/" -> "valid-parentheses"
 * - "https://leetcode.cn/problems/binary-search/" -> "binary-search"
 */
export function extractSlugFromLeetCodeUrl(url: string): string {
  if (!url) return "";
  const trimmed = url.trim();
  try {
    const match = trimmed.match(/leetcode\.(?:com|cn)\/problems\/([^/?#]+)/i);
    if (match && match[1]) {
      return match[1].toLowerCase().trim().replace(/[^\w-]/g, "");
    }
  } catch {
    // Return empty on error
  }
  return "";
}

/**
 * Formats a slug into a display title.
 * Example: "single-number" -> "Single Number"
 */
export function slugToTitle(slug: string): string {
  if (!slug) return "";
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Parses user bulk input (URLs, slugs, comma/newline separated)
 * into a unique list of problem slugs.
 */
export function parseBulkImportInput(text: string): string[] {
  if (!text) return [];
  const lines = text.split(/[\r\n,;]+/);
  const seen = new Set<string>();
  const results: string[] = [];

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    // If it is a full URL, extract slug
    let slug = extractSlugFromLeetCodeUrl(trimmed);

    // If not a URL, sanitize as a direct slug (e.g. "two-sum")
    if (!slug) {
      slug = trimmed
        .toLowerCase()
        .replace(/^https?:\/\/.*?\//i, "")
        .replace(/[^\w-]/g, "");
    }

    if (slug && !seen.has(slug)) {
      seen.add(slug);
      results.push(slug);
    }
  }

  return results;
}
