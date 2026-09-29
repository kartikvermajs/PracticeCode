import { Problem, PracticeHistoryItem, UserStats } from "@/types";

export const MOCK_USER_STATS: UserStats = {
  totalProblems: 1,
  solvedCount: 1,
  dueTodayCount: 1,
  practiceStreakDays: 14,
  easyTotal: 1,
  easySolved: 1,
  mediumTotal: 0,
  mediumSolved: 0,
  hardTotal: 0,
  hardSolved: 0,
};

export const MOCK_PROBLEMS: Problem[] = [
  {
    id: "p-136",
    slug: "single-number",
    number: 136,
    title: "Single Number",
    difficulty: "Easy",
    topics: ["Array", "Bit Manipulation"],
    status: "Due",
    lastPracticed: "3 days ago",
    nextReview: "Today",
    isDue: true,
    leetcodeUrl: "https://leetcode.com/problems/single-number/",
    acceptanceRate: "72.4%",
    description: `Given a **non-empty** array of integers \`nums\`, every element appears twice except for one. Find that single one.

You must implement a solution with a linear runtime complexity and use only constant extra space.`,
    examples: [
      {
        input: "nums = [2,2,1]",
        output: "1",
      },
      {
        input: "nums = [4,1,2,1,2]",
        output: "4",
      },
      {
        input: "nums = [1]",
        output: "1",
      },
    ],
    constraints: [
      "1 <= nums.length <= 3 * 10^4",
      "-3 * 10^4 <= nums[i] <= 3 * 10^4",
      "Each element in the array appears twice except for one element which appears only once.",
    ],
    starterCode: {
      typescript: `function singleNumber(nums: number[]): number {
  // Your practice implementation here
  // Remember: O(n) time and O(1) space!
  
}`,
      python: `class Solution:
    def singleNumber(self, nums: List[int]) -> int:
        # Your practice implementation here
        pass`,
      cpp: `class Solution {
public:
    int singleNumber(vector<int>& nums) {
        // Your practice implementation here
        
    }
};`,
    },
    originalSolution: {
      language: "cpp",
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
      timeComplexity: "O(n)",
      spaceComplexity: "O(1)",
      notes: "Using XOR bitwise operation eliminates the need for hash map memory. Bitwise XOR property (A ^ A = 0, A ^ 0 = A) cancels duplicate number pairs cleanly.",
    },
  },
];

export const MOCK_RECENT_PRACTICE: PracticeHistoryItem[] = [
  {
    id: "hist-1",
    problemId: "p-136",
    problemNumber: 136,
    problemTitle: "Single Number",
    difficulty: "Easy",
    practicedAt: "3 days ago",
    duration: "4m 12s",
    result: "Passed",
    confidence: "High",
    codeSnippet: "function singleNumber(nums: number[]) { ... }",
  },
];
