import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting CodeRev database seeding on Neon PostgreSQL...");

  // 1. Seed Default User
  const user = await prisma.user.upsert({
    where: { email: "kartik@coderev.dev" },
    update: {
      name: "Kartik",
    },
    create: {
      id: "user_kartik_dev",
      name: "Kartik",
      email: "kartik@coderev.dev",
      image: null,
    },
  });

  console.log(`👤 User verified: ${user.name} (${user.email})`);

  // 2. Define the 8 Required Problems
  const problems = [
    {
      leetcodeId: 136,
      title: "Single Number",
      slug: "single-number",
      difficulty: "Easy",
      url: "https://leetcode.com/problems/single-number/",
      description: `Given a non-empty array of integers nums, every element appears twice except for one. Find that single one.

You must implement a solution with a linear runtime complexity and use only constant extra space.`,
      examples: [
        { input: "nums = [2,2,1]", output: "1" },
        { input: "nums = [4,1,2,1,2]", output: "4" },
        { input: "nums = [1]", output: "1" },
      ],
      constraints: [
        "1 <= nums.length <= 3 * 10^4",
        "-3 * 10^4 <= nums[i] <= 3 * 10^4",
        "Each element in the array appears twice except for one element which appears only once.",
      ],
      tags: ["Array", "Bit Manipulation"],
      solutions: [
        {
          language: "cpp",
          isAccepted: true,
          code: `#include <vector>

class Solution {
public:
    int singleNumber(std::vector<int>& nums) {
        int result = 0;
        for (int num : nums) {
            result ^= num; // Bitwise XOR cancels pairs: A ^ A = 0, A ^ 0 = A
        }
        return result;
    }
};`,
        },
        {
          language: "typescript",
          isAccepted: true,
          code: `function singleNumber(nums: number[]): number {
  let unique = 0;
  for (const num of nums) {
    unique ^= num;
  }
  return unique;
}`,
        },
      ],
      isDue: true,
      lastPracticedAgoDays: 3,
    },
    {
      leetcodeId: 1,
      title: "Two Sum",
      slug: "two-sum",
      difficulty: "Easy",
      url: "https://leetcode.com/problems/two-sum/",
      description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.`,
      examples: [
        {
          input: "nums = [2,7,11,15], target = 9",
          output: "[0,1]",
          explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
        },
        { input: "nums = [3,2,4], target = 6", output: "[1,2]" },
        { input: "nums = [3,3], target = 6", output: "[0,1]" },
      ],
      constraints: [
        "2 <= nums.length <= 10^4",
        "-10^9 <= nums[i] <= 10^9",
        "-10^9 <= target <= 10^9",
        "Only one valid answer exists.",
      ],
      tags: ["Array", "Hash Table"],
      solutions: [
        {
          language: "typescript",
          isAccepted: true,
          code: `function twoSum(nums: number[], target: number): number[] {
  const map = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement)!, i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
        },
      ],
      isDue: true,
      lastPracticedAgoDays: 5,
    },
    {
      leetcodeId: 20,
      title: "Valid Parentheses",
      slug: "valid-parentheses",
      difficulty: "Easy",
      url: "https://leetcode.com/problems/valid-parentheses/",
      description: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
      examples: [
        { input: 's = "()"', output: "true" },
        { input: 's = "()[]{}"', output: "true" },
        { input: 's = "(]"', output: "false" },
        { input: 's = "([])"', output: "true" },
      ],
      constraints: [
        "1 <= s.length <= 10^4",
        "s consists of parentheses only '()[]{}'.",
      ],
      tags: ["String", "Stack"],
      solutions: [
        {
          language: "typescript",
          isAccepted: true,
          code: `function isValid(s: string): boolean {
  const stack: string[] = [];
  const map: Record<string, string> = { ')': '(', '}': '{', ']': '[' };
  for (const char of s) {
    if (char in map) {
      if (stack.pop() !== map[char]) return false;
    } else {
      stack.push(char);
    }
  }
  return stack.length === 0;
}`,
        },
      ],
      isDue: true,
      lastPracticedAgoDays: 4,
    },
    {
      leetcodeId: 704,
      title: "Binary Search",
      slug: "binary-search",
      difficulty: "Easy",
      url: "https://leetcode.com/problems/binary-search/",
      description: `Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1.

You must write an algorithm with O(log n) runtime complexity.`,
      examples: [
        { input: "nums = [-1,0,3,5,9,12], target = 9", output: "4", explanation: "9 exists in nums and its index is 4" },
        { input: "nums = [-1,0,3,5,9,12], target = 2", output: "-1", explanation: "2 does not exist in nums so return -1" },
      ],
      constraints: [
        "1 <= nums.length <= 10^4",
        "-10^4 < nums[i], target < 10^4",
        "All integers in nums are unique.",
        "nums is sorted in ascending order.",
      ],
      tags: ["Array", "Binary Search"],
      solutions: [
        {
          language: "typescript",
          isAccepted: true,
          code: `function search(nums: number[], target: number): number {
  let left = 0;
  let right = nums.length - 1;
  while (left <= right) {
    const mid = Math.floor(left + (right - left) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`,
        },
      ],
      isDue: true,
      lastPracticedAgoDays: 7,
    },
    {
      leetcodeId: 121,
      title: "Best Time to Buy and Sell Stock",
      slug: "best-time-to-buy-and-sell-stock",
      difficulty: "Easy",
      url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
      description: `You are given an array prices where prices[i] is the price of a given stock on the ith day.

You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.

Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.`,
      examples: [
        {
          input: "prices = [7,1,5,3,6,4]",
          output: "5",
          explanation: "Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.",
        },
        {
          input: "prices = [7,6,4,3,1]",
          output: "0",
          explanation: "In this case, no transactions are done and max profit = 0.",
        },
      ],
      constraints: [
        "1 <= prices.length <= 10^5",
        "0 <= prices[i] <= 10^4",
      ],
      tags: ["Array", "Dynamic Programming"],
      solutions: [
        {
          language: "typescript",
          isAccepted: true,
          code: `function maxProfit(prices: number[]): number {
  let minPrice = Infinity;
  let maxProfit = 0;
  for (const price of prices) {
    if (price < minPrice) {
      minPrice = price;
    } else if (price - minPrice > maxProfit) {
      maxProfit = price - minPrice;
    }
  }
  return maxProfit;
}`,
        },
      ],
      isDue: false,
      lastPracticedAgoDays: 2,
    },
    {
      leetcodeId: 217,
      title: "Contains Duplicate",
      slug: "contains-duplicate",
      difficulty: "Easy",
      url: "https://leetcode.com/problems/contains-duplicate/",
      description: `Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.`,
      examples: [
        { input: "nums = [1,2,3,1]", output: "true" },
        { input: "nums = [1,2,3,4]", output: "false" },
        { input: "nums = [1,1,1,3,3,4,3,2,4,2]", output: "true" },
      ],
      constraints: [
        "1 <= nums.length <= 10^5",
        "-10^9 <= nums[i] <= 10^9",
      ],
      tags: ["Array", "Hash Table", "Sorting"],
      solutions: [
        {
          language: "typescript",
          isAccepted: true,
          code: `function containsDuplicate(nums: number[]): boolean {
  const seen = new Set<number>();
  for (const num of nums) {
    if (seen.has(num)) return true;
    seen.add(num);
  }
  return false;
}`,
        },
      ],
      isDue: false,
      lastPracticedAgoDays: 8,
    },
    {
      leetcodeId: 242,
      title: "Valid Anagram",
      slug: "valid-anagram",
      difficulty: "Easy",
      url: "https://leetcode.com/problems/valid-anagram/",
      description: `Given two strings s and t, return true if t is an anagram of s, and false otherwise.

An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.`,
      examples: [
        { input: 's = "anagram", t = "nagaram"', output: "true" },
        { input: 's = "rat", t = "car"', output: "false" },
      ],
      constraints: [
        "1 <= s.length, t.length <= 5 * 10^4",
        "s and t consist of lowercase English letters.",
      ],
      tags: ["Hash Table", "String", "Sorting"],
      solutions: [
        {
          language: "typescript",
          isAccepted: true,
          code: `function isAnagram(s: string, t: string): boolean {
  if (s.length !== t.length) return false;
  const count = new Array(26).fill(0);
  const aCode = 'a'.charCodeAt(0);
  for (let i = 0; i < s.length; i++) {
    count[s.charCodeAt(i) - aCode]++;
    count[t.charCodeAt(i) - aCode]--;
  }
  return count.every(c => c === 0);
}`,
        },
      ],
      isDue: false,
      lastPracticedAgoDays: 6,
    },
    {
      leetcodeId: 53,
      title: "Maximum Subarray",
      slug: "maximum-subarray",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/maximum-subarray/",
      description: `Given an integer array nums, find the subarray with the largest sum, and return its sum. (Kadane's Algorithm)`,
      examples: [
        {
          input: "nums = [-2,1,-3,4,-1,2,1,-5,4]",
          output: "6",
          explanation: "The subarray [4,-1,2,1] has the largest sum 6.",
        },
        { input: "nums = [1]", output: "1" },
        { input: "nums = [5,4,-1,7,8]", output: "23" },
      ],
      constraints: [
        "1 <= nums.length <= 10^5",
        "-10^4 <= nums[i] <= 10^4",
      ],
      tags: ["Array", "Divide and Conquer", "Dynamic Programming"],
      solutions: [
        {
          language: "typescript",
          isAccepted: true,
          code: `function maxSubArray(nums: number[]): number {
  let currentSum = nums[0];
  let maxSum = nums[0];
  for (let i = 1; i < nums.length; i++) {
    currentSum = Math.max(nums[i], currentSum + nums[i]);
    maxSum = Math.max(maxSum, currentSum);
  }
  return maxSum;
}`,
        },
      ],
      isDue: false,
      lastPracticedAgoDays: 9,
    },
  ];

  // 3. Upsert Problems, Solutions, and Revision Schedules
  const now = new Date();

  for (const probData of problems) {
    const { solutions, isDue, lastPracticedAgoDays, ...problemFields } = probData;

    const problem = await prisma.problem.upsert({
      where: { leetcodeId: problemFields.leetcodeId },
      update: {
        ...problemFields,
      },
      create: {
        ...problemFields,
      },
    });

    console.log(`✓ Problem #${problem.leetcodeId}: "${problem.title}" seeded.`);

    // Upsert Solutions
    for (const sol of solutions) {
      const existingSol = await prisma.solution.findFirst({
        where: {
          problemId: problem.id,
          language: sol.language,
        },
      });

      if (!existingSol) {
        await prisma.solution.create({
          data: {
            problemId: problem.id,
            language: sol.language,
            code: sol.code,
            isAccepted: sol.isAccepted,
          },
        });
        console.log(`   + Solution (${sol.language}) created.`);
      }
    }

    // Upsert Revision Schedule
    const lastPracticedAt = new Date(
      now.getTime() - lastPracticedAgoDays * 24 * 60 * 60 * 1000
    );
    const nextReviewAt = isDue
      ? new Date(now.getTime() - 2 * 60 * 60 * 1000) // 2 hours ago = Due today
      : new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000); // 4 days later

    await prisma.revisionSchedule.upsert({
      where: {
        problemId_userId: {
          problemId: problem.id,
          userId: user.id,
        },
      },
      update: {
        lastPracticedAt,
        nextReviewAt,
        status: isDue ? "Due" : "Mastered",
      },
      create: {
        problemId: problem.id,
        userId: user.id,
        lastPracticedAt,
        nextReviewAt,
        interval: isDue ? 1 : 4,
        difficultyRating: 2.5,
        status: isDue ? "Due" : "Mastered",
      },
    });

    // Create an initial practice attempt record
    await prisma.practiceAttempt.create({
      data: {
        problemId: problem.id,
        userId: user.id,
        language: "typescript",
        code: solutions[0].code,
        status: "Passed",
        startedAt: lastPracticedAt,
        completedAt: new Date(lastPracticedAt.getTime() + 8 * 60 * 1000), // 8 mins duration
      },
    });
  }

  console.log("✅ Seeding completed successfully on Neon PostgreSQL!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
