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
