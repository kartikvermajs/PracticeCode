/**
 * Clean starter templates for supported languages in CodeRev practice sessions.
 * Never includes accepted solutions.
 */

export type SupportedLanguage =
  | "cpp"
  | "c"
  | "java"
  | "python"
  | "javascript"
  | "typescript";

export interface LanguageOption {
  id: SupportedLanguage;
  name: string;
  monacoLang: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { id: "cpp", name: "C++", monacoLang: "cpp" },
  { id: "c", name: "C", monacoLang: "c" },
  { id: "java", name: "Java", monacoLang: "java" },
  { id: "python", name: "Python", monacoLang: "python" },
  { id: "javascript", name: "JavaScript", monacoLang: "javascript" },
  { id: "typescript", name: "TypeScript", monacoLang: "typescript" },
];

const PROBLEM_STARTER_MAP: Record<string, Record<SupportedLanguage, string>> = {
  "single-number": {
    cpp: `class Solution {
public:
    int singleNumber(vector<int>& nums) {
        
    }
};`,
    c: `int singleNumber(int* nums, int numsSize) {
    
}`,
    java: `class Solution {
    public int singleNumber(int[] nums) {
        
    }
}`,
    python: `class Solution:
    def singleNumber(self, nums: List[int]) -> int:
        pass`,
    javascript: `/**
 * @param {number[]} nums
 * @return {number}
 */
var singleNumber = function(nums) {
    
};`,
    typescript: `function singleNumber(nums: number[]): number {
    
}`,
  },
  "two-sum": {
    cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        
    }
};`,
    c: `/**
 * Note: The returned array must be malloced, assume caller calls free().
 */
int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    
}`,
    java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        
    }
}`,
    python: `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        pass`,
    javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    
};`,
    typescript: `function twoSum(nums: number[], target: number): number[] {
    
}`,
  },
  "valid-parentheses": {
    cpp: `class Solution {
public:
    bool isValid(string s) {
        
    }
};`,
    c: `bool isValid(char* s) {
    
}`,
    java: `class Solution {
    public boolean isValid(String s) {
        
    }
}`,
    python: `class Solution:
    def isValid(self, s: str) -> bool:
        pass`,
    javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
var isValid = function(s) {
    
};`,
    typescript: `function isValid(s: string): boolean {
    
}`,
  },
  "binary-search": {
    cpp: `class Solution {
public:
    int search(vector<int>& nums, int target) {
        
    }
};`,
    c: `int search(int* nums, int numsSize, int target) {
    
}`,
    java: `class Solution {
    public int search(int[] nums, int target) {
        
    }
}`,
    python: `class Solution:
    def search(self, nums: List[int], target: int) -> int:
        pass`,
    javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
var search = function(nums, target) {
    
};`,
    typescript: `function search(nums: number[], target: number): number {
    
}`,
  },
};

/**
 * Returns a clean starter template for a given problem slug and language.
 * Never returns the accepted solution.
 */
export function getStarterTemplate(
  slug: string,
  language: SupportedLanguage
): string {
  const problemTemplates = PROBLEM_STARTER_MAP[slug];
  if (problemTemplates && problemTemplates[language]) {
    return problemTemplates[language];
  }

  // Generic fallback starter templates
  switch (language) {
    case "cpp":
      return `class Solution {
public:
    
};`;
    case "c":
      return `// Write your C solution here
`;
    case "java":
      return `class Solution {
    
}`;
    case "python":
      return `class Solution:
    `;
    case "javascript":
      return `/**
 * @return {any}
 */
var solution = function() {
    
};`;
    case "typescript":
      return `function solution(): void {
    
}`;
    default:
      return `// Write your practice solution here
`;
  }
}
