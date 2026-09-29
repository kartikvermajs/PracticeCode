export type Difficulty = "Easy" | "Medium" | "Hard";

export type ProblemStatus = "Solved" | "Due" | "Reviewing" | "Mastered";

export interface Problem {
  id: string;
  slug: string;
  number: number;
  title: string;
  difficulty: Difficulty;
  topics: string[];
  status: ProblemStatus;
  lastPracticed: string; // e.g. "3 days ago"
  nextReview: string;    // e.g. "Today" or "In 2 days"
  isDue: boolean;
  leetcodeUrl: string;
  acceptanceRate: string;
  description: string;
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  constraints: string[];
  starterCode: {
    [key: string]: string; // language -> template
  };
  originalSolution: {
    language: string;
    code: string;
    timeComplexity: string;
    spaceComplexity: string;
    notes: string;
  };
}

export interface PracticeHistoryItem {
  id: string;
  problemId: string;
  problemNumber: number;
  problemTitle: string;
  difficulty: Difficulty;
  practicedAt: string;
  duration: string;
  result: "Passed" | "Partial" | "Needs Review";
  confidence: "High" | "Medium" | "Low";
  codeSnippet: string;
}

export interface UserStats {
  totalProblems: number;
  solvedCount: number;
  dueTodayCount: number;
  practiceStreakDays: number;
  easyTotal: number;
  easySolved: number;
  mediumTotal: number;
  mediumSolved: number;
  hardTotal: number;
  hardSolved: number;
}
