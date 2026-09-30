import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("🌱 Seeding CodeRev database with exactly one question: LeetCode #1 Two Sum...");

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

  // 2. Clear out any other questions to ensure ONLY Two Sum (#1) exists
  const deleted = await prisma.problem.deleteMany({
    where: {
      leetcodeId: {
        not: 1,
      },
    },
  });
  if (deleted.count > 0) {
    console.log(`🧹 Removed ${deleted.count} other problem(s) to leave only #1 Two Sum.`);
  }

  // 3. Define exact LeetCode #1 Problem
  const twoSumData = {
    leetcodeId: 1,
    title: "Two Sum",
    slug: "two-sum",
    difficulty: "Easy",
    url: "https://leetcode.com/problems/two-sum/",
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]",
      },
      {
        input: "nums = [3,3], target = 6",
        output: "[0,1]",
      },
    ],
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists.",
    ],
    tags: ["Array", "Hash Table"],
  };

  // Upsert Problem #1
  const problem = await prisma.problem.upsert({
    where: { leetcodeId: 1 },
    update: {
      ...twoSumData,
    },
    create: {
      ...twoSumData,
    },
  });

  console.log(`✓ Problem #${problem.leetcodeId}: "${problem.title}" created/updated successfully.`);

  // 4. Solutions (C++ and TypeScript)
  const solutions = [
    {
      language: "cpp",
      isAccepted: true,
      code: `#include <vector>
#include <unordered_map>

class Solution {
public:
    std::vector<int> twoSum(std::vector<int>& nums, int target) {
        std::unordered_map<int, int> numMap;
        for (int i = 0; i < nums.size(); i++) {
            int complement = target - nums[i];
            if (numMap.find(complement) != numMap.end()) {
                return {numMap[complement], i};
            }
            numMap[nums[i]] = i;
        }
        return {};
    }
};`,
    },
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
  ];

  for (const sol of solutions) {
    const existing = await prisma.solution.findFirst({
      where: {
        problemId: problem.id,
        language: sol.language,
      },
    });

    if (!existing) {
      await prisma.solution.create({
        data: {
          problemId: problem.id,
          language: sol.language,
          code: sol.code,
          isAccepted: sol.isAccepted,
        },
      });
      console.log(`   + Solution (${sol.language}) created.`);
    } else {
      await prisma.solution.update({
        where: { id: existing.id },
        data: {
          code: sol.code,
          isAccepted: sol.isAccepted,
        },
      });
      console.log(`   + Solution (${sol.language}) updated.`);
    }
  }

  // 5. Revision Schedule for Problem #1 (Due today for spaced repetition revision)
  const now = new Date();
  const lastPracticedAt = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000); // 2 days ago
  const nextReviewAt = new Date(now.getTime() - 1 * 60 * 60 * 1000); // 1 hour ago = Due Today

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
      status: "Due",
      interval: 1,
    },
    create: {
      problemId: problem.id,
      userId: user.id,
      lastPracticedAt,
      nextReviewAt,
      interval: 1,
      difficultyRating: 2.5,
      status: "Due",
    },
  });

  // 6. Record sample practice attempt
  const existingAttempts = await prisma.practiceAttempt.count({
    where: { problemId: problem.id },
  });

  if (existingAttempts === 0) {
    await prisma.practiceAttempt.create({
      data: {
        problemId: problem.id,
        userId: user.id,
        language: "typescript",
        code: solutions[1].code,
        status: "Passed",
        startedAt: lastPracticedAt,
        completedAt: new Date(lastPracticedAt.getTime() + 3 * 60 * 1000), // 3 mins duration
      },
    });
    console.log("   + Practice attempt recorded.");
  }

  console.log("\n✅ Database now contains ONLY 1 question: #1 Two Sum (https://leetcode.com/problems/two-sum/)");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
