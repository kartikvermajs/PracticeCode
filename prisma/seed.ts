import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding CodeRev database with exactly one question: LeetCode #136 Single Number...");

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

  // 2. Clear out any other questions to ensure ONLY Single Number (#136) exists
  const deleted = await prisma.problem.deleteMany({
    where: {
      leetcodeId: {
        not: 136,
      },
    },
  });
  if (deleted.count > 0) {
    console.log(`🧹 Removed ${deleted.count} other problem(s) to leave only #136 Single Number.`);
  }

  // 3. Define exact LeetCode #136 Problem
  const singleNumberData = {
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
  };

  // Upsert Problem #136
  const problem = await prisma.problem.upsert({
    where: { leetcodeId: 136 },
    update: {
      ...singleNumberData,
    },
    create: {
      ...singleNumberData,
    },
  });

  console.log(`✓ Problem #${problem.leetcodeId}: "${problem.title}" created/updated successfully.`);

  // 4. Solutions (C++ and TypeScript)
  const solutions = [
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

  // 5. Revision Schedule for Problem #136 (Due today for spaced repetition revision)
  const now = new Date();
  const lastPracticedAt = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000); // 3 days ago
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
        completedAt: new Date(lastPracticedAt.getTime() + 4 * 60 * 1000), // 4 mins duration
      },
    });
    console.log("   + Practice attempt recorded.");
  }

  console.log("\n✅ Database now contains ONLY 1 question: #136 Single Number (https://leetcode.com/problems/single-number/)");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
