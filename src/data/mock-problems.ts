import { Problem, PracticeHistoryItem, UserStats } from "@/types";

export const MOCK_USER_STATS: UserStats = {
  totalProblems: 82,
  solvedCount: 82,
  dueTodayCount: 4,
  practiceStreakDays: 14,
  easyTotal: 50,
  easySolved: 42,
  mediumTotal: 45,
  mediumSolved: 32,
  hardTotal: 15,
  hardSolved: 8,
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
      language: "typescript",
      code: `function singleNumber(nums: number[]): number {
  // XOR property: A ^ A = 0, A ^ 0 = A
  // Order does not matter, duplicate pairs cancel out!
  let unique = 0;
  for (const num of nums) {
    unique ^= num;
  }
  return unique;
}`,
      timeComplexity: "O(n)",
      spaceComplexity: "O(1)",
      notes: "Using XOR bitwise operation eliminates the need for hash map memory. Self-inverse property cancels duplicate numbers cleanly.",
    },
  },
  {
    id: "p-1",
    slug: "two-sum",
    number: 1,
    title: "Two Sum",
    difficulty: "Easy",
    topics: ["Array", "Hash Table"],
    status: "Due",
    lastPracticed: "5 days ago",
    nextReview: "Today",
    isDue: true,
    leetcodeUrl: "https://leetcode.com/problems/two-sum/",
    acceptanceRate: "52.8%",
    description: `Given an array of integers \`nums\` and an integer \`target\`, return *indices of the two numbers such that they add up to \`target\`*.

You may assume that each input would have ***exactly one solution***, and you may not use the same element twice.

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
    starterCode: {
      typescript: `function twoSum(nums: number[], target: number): number[] {
  // Write your revision solution here
  
}`,
      python: `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        # Write your revision solution here
        pass`,
      cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your revision solution here
        
    }
};`,
    },
    originalSolution: {
      language: "typescript",
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
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)",
      notes: "Single pass Hash Map. Check if complement exists before storing the current index to prevent using the same index twice.",
    },
  },
  {
    id: "p-704",
    slug: "binary-search",
    number: 704,
    title: "Binary Search",
    difficulty: "Easy",
    topics: ["Array", "Binary Search"],
    status: "Due",
    lastPracticed: "7 days ago",
    nextReview: "Today",
    isDue: true,
    leetcodeUrl: "https://leetcode.com/problems/binary-search/",
    acceptanceRate: "57.3%",
    description: `Given an array of integers \`nums\` which is sorted in ascending order, and an integer \`target\`, write a function to search \`target\` in \`nums\`. If \`target\` exists, then return its index. Otherwise, return \`-1\`.

You must write an algorithm with \`O(log n)\` runtime complexity.`,
    examples: [
      {
        input: "nums = [-1,0,3,5,9,12], target = 9",
        output: "4",
        explanation: "9 exists in nums and its index is 4",
      },
      {
        input: "nums = [-1,0,3,5,9,12], target = 2",
        output: "-1",
        explanation: "2 does not exist in nums so return -1",
      },
    ],
    constraints: [
      "1 <= nums.length <= 10^4",
      "-10^4 < nums[i], target < 10^4",
      "All the integers in nums are unique.",
      "nums is sorted in ascending order.",
    ],
    starterCode: {
      typescript: `function search(nums: number[], target: number): number {
  // Practice standard 2-pointer binary search template
  
}`,
      python: `class Solution:
    def search(self, nums: List[int], target: int) -> int:
        pass`,
      cpp: `class Solution {
public:
    int search(vector<int>& nums, int target) {
        
    }
};`,
    },
    originalSolution: {
      language: "typescript",
      code: `function search(nums: number[], target: number): number {
  let left = 0;
  let right = nums.length - 1;

  while (left <= right) {
    const mid = Math.floor(left + (right - left) / 2);
    if (nums[mid] === target) {
      return mid;
    } else if (nums[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return -1;
}`,
      timeComplexity: "O(log n)",
      spaceComplexity: "O(1)",
      notes: "Watch out for integer overflow: calculate mid as left + Math.floor((right - left) / 2). Include equality in while condition: left <= right.",
    },
  },
  {
    id: "p-20",
    slug: "valid-parentheses",
    number: 20,
    title: "Valid Parentheses",
    difficulty: "Easy",
    topics: ["String", "Stack"],
    status: "Due",
    lastPracticed: "4 days ago",
    nextReview: "Today",
    isDue: true,
    leetcodeUrl: "https://leetcode.com/problems/valid-parentheses/",
    acceptanceRate: "41.1%",
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    examples: [
      {
        input: 's = "()"',
        output: "true",
      },
      {
        input: 's = "()[]{}"',
        output: "true",
      },
      {
        input: 's = "(]"',
        output: "false",
      },
      {
        input: 's = "([])"',
        output: "true",
      },
    ],
    constraints: [
      "1 <= s.length <= 10^4",
      "s consists of parentheses only '()[]{}'.",
    ],
    starterCode: {
      typescript: `function isValid(s: string): boolean {
  // Practice stack implementation
  
}`,
      python: `class Solution:
    def isValid(self, s: str) -> bool:
        pass`,
      cpp: `class Solution {
public:
    bool isValid(string s) {
        
    }
};`,
    },
    originalSolution: {
      language: "typescript",
      code: `function isValid(s: string): boolean {
  const stack: string[] = [];
  const map: Record<string, string> = {
    ')': '(',
    '}': '{',
    ']': '['
  };

  for (const char of s) {
    if (char in map) {
      const top = stack.pop();
      if (top !== map[char]) {
        return false;
      }
    } else {
      stack.push(char);
    }
  }

  return stack.length === 0;
}`,
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)",
      notes: "Store opening brackets on stack when encountering openers. For closers, pop top and ensure it matches the map value.",
    },
  },
  {
    id: "p-3",
    slug: "longest-substring-without-repeating-characters",
    number: 3,
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    topics: ["Hash Table", "String", "Sliding Window"],
    status: "Solved",
    lastPracticed: "1 day ago",
    nextReview: "In 6 days",
    isDue: false,
    leetcodeUrl: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
    acceptanceRate: "35.1%",
    description: `Given a string \`s\`, find the length of the **longest substring** without duplicate characters.`,
    examples: [
      {
        input: 's = "abcabcbb"',
        output: "3",
        explanation: 'The answer is "abc", with the length of 3.',
      },
      {
        input: 's = "bbbbb"',
        output: "1",
        explanation: 'The answer is "b", with the length of 1.',
      },
      {
        input: 's = "pwwkew"',
        output: "3",
        explanation: 'The answer is "wke", with the length of 3.',
      },
    ],
    constraints: [
      "0 <= s.length <= 5 * 10^4",
      "s consists of English letters, digits, symbols and spaces.",
    ],
    starterCode: {
      typescript: `function lengthOfLongestSubstring(s: string): number {
  // Practice dynamic sliding window
  
}`,
      python: `class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        pass`,
      cpp: `class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        
    }
};`,
    },
    originalSolution: {
      language: "typescript",
      code: `function lengthOfLongestSubstring(s: string): number {
  const seen = new Map<string, number>();
  let maxLength = 0;
  let left = 0;

  for (let right = 0; right < s.length; right++) {
    const char = s[right];
    if (seen.has(char) && seen.get(char)! >= left) {
      left = seen.get(char)! + 1;
    }
    seen.set(char, right);
    maxLength = Math.max(maxLength, right - left + 1);
  }

  return maxLength;
}`,
      timeComplexity: "O(n)",
      spaceComplexity: "O(min(m, n))",
      notes: "Sliding window with map storing character's last seen index. Jump left pointer directly past previous occurrence.",
    },
  },
  {
    id: "p-146",
    slug: "lru-cache",
    number: 146,
    title: "LRU Cache",
    difficulty: "Medium",
    topics: ["Hash Table", "Linked List", "Design"],
    status: "Solved",
    lastPracticed: "2 days ago",
    nextReview: "In 5 days",
    isDue: false,
    leetcodeUrl: "https://leetcode.com/problems/lru-cache/",
    acceptanceRate: "42.9%",
    description: `Design a data structure that follows the constraints of a **Least Recently Used (LRU) cache**.

Implement the \`LRUCache\` class:
- \`LRUCache(int capacity)\` Initialize the LRU cache with positive size \`capacity\`.
- \`int get(int key)\` Return the value of the \`key\` if the key exists, otherwise return \`-1\`.
- \`void put(int key, int value)\` Update the value of the \`key\` if the \`key\` exists. Otherwise, add the \`key-value\` pair to the cache. If the number of keys exceeds the \`capacity\` from this operation, **evict** the least recently used key.

The functions \`get\` and \`put\` must each run in \`O(1)\` average time complexity.`,
    examples: [
      {
        input: '["LRUCache", "put", "put", "get", "put", "get", "put", "get", "get", "get"]\n[[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]]',
        output: "[null, null, null, 1, null, -1, null, -1, 3, 4]",
      },
    ],
    constraints: [
      "1 <= capacity <= 3000",
      "0 <= key <= 10^4",
      "0 <= value <= 10^5",
      "At most 2 * 10^5 calls will be made to get and put.",
    ],
    starterCode: {
      typescript: `class LRUCache {
  constructor(capacity: number) {
    // Initialize structures
  }

  get(key: number): number {
    return -1;
  }

  put(key: number, value: number): void {
    
  }
}`,
      python: `class LRUCache:
    def __init__(self, capacity: int):
        pass

    def get(self, key: int) -> int:
        pass

    def put(self, key: int, value: int) -> None:
        pass`,
      cpp: `class LRUCache {
public:
    LRUCache(int capacity) {
        
    }
    
    int get(int key) {
        
    }
    
    void put(int key, int value) {
        
    }
};`,
    },
    originalSolution: {
      language: "typescript",
      code: `class DNode {
  key: number;
  val: number;
  prev: DNode | null = null;
  next: DNode | null = null;
  constructor(key = 0, val = 0) {
    this.key = key;
    this.val = val;
  }
}

class LRUCache {
  private capacity: number;
  private cache = new Map<number, DNode>();
  private head = new DNode();
  private tail = new DNode();

  constructor(capacity: number) {
    this.capacity = capacity;
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  private addNode(node: DNode) {
    node.prev = this.head;
    node.next = this.head.next;
    this.head.next!.prev = node;
    this.head.next = node;
  }

  private removeNode(node: DNode) {
    const prev = node.prev!;
    const next = node.next!;
    prev.next = next;
    next.prev = prev;
  }

  private moveToHead(node: DNode) {
    this.removeNode(node);
    this.addNode(node);
  }

  get(key: number): number {
    const node = this.cache.get(key);
    if (!node) return -1;
    this.moveToHead(node);
    return node.val;
  }

  put(key: number, value: number): void {
    const node = this.cache.get(key);
    if (!node) {
      const newNode = new DNode(key, value);
      this.cache.set(key, newNode);
      this.addNode(newNode);
      if (this.cache.size > this.capacity) {
        const lru = this.tail.prev!;
        this.cache.delete(lru.key);
        this.removeNode(lru);
      }
    } else {
      node.val = value;
      this.moveToHead(node);
    }
  }
}`,
      timeComplexity: "O(1) for both get and put",
      spaceComplexity: "O(capacity)",
      notes: "Doubly Linked List + Hash Map. Pseudo head and tail dummy nodes simplify edge case removal.",
    },
  },
  {
    id: "p-42",
    slug: "trapping-rain-water",
    number: 42,
    title: "Trapping Rain Water",
    difficulty: "Hard",
    topics: ["Array", "Two Pointers", "Dynamic Programming", "Stack"],
    status: "Reviewing",
    lastPracticed: "6 days ago",
    nextReview: "Tomorrow",
    isDue: false,
    leetcodeUrl: "https://leetcode.com/problems/trapping-rain-water/",
    acceptanceRate: "61.7%",
    description: `Given \`n\` non-negative integers representing an elevation map where the width of each bar is \`1\`, compute how much water it can trap after raining.`,
    examples: [
      {
        input: "height = [0,1,0,2,1,0,1,3,2,1,2,1]",
        output: "6",
        explanation: "The above elevation map is represented by array [0,1,0,2,1,0,1,3,2,1,2,1]. In this case, 6 units of rain water are being trapped.",
      },
      {
        input: "height = [4,2,0,3,2,5]",
        output: "9",
      },
    ],
    constraints: [
      "n == height.length",
      "1 <= n <= 2 * 10^4",
      "0 <= height[i] <= 10^5",
    ],
    starterCode: {
      typescript: `function trap(height: number[]): number {
  // Practice 2 pointers approach
  
}`,
      python: `class Solution:
    def trap(self, height: List[int]) -> int:
        pass`,
      cpp: `class Solution {
public:
    int trap(vector<int>& height) {
        
    }
};`,
    },
    originalSolution: {
      language: "typescript",
      code: `function trap(height: number[]): number {
  let left = 0;
  let right = height.length - 1;
  let leftMax = 0;
  let rightMax = 0;
  let water = 0;

  while (left < right) {
    if (height[left] < height[right]) {
      if (height[left] >= leftMax) {
        leftMax = height[left];
      } else {
        water += leftMax - height[left];
      }
      left++;
    } else {
      if (height[right] >= rightMax) {
        rightMax = height[right];
      } else {
        water += rightMax - height[right];
      }
      right--;
    }
  }

  return water;
}`,
      timeComplexity: "O(n)",
      spaceComplexity: "O(1)",
      notes: "Two pointer technique. The water trapped is bounded by the minimum of the maximum height seen from the left and right.",
    },
  },
  {
    id: "p-21",
    slug: "merge-two-sorted-lists",
    number: 21,
    title: "Merge Two Sorted Lists",
    difficulty: "Easy",
    topics: ["Linked List", "Recursion"],
    status: "Solved",
    lastPracticed: "8 days ago",
    nextReview: "In 3 days",
    isDue: false,
    leetcodeUrl: "https://leetcode.com/problems/merge-two-sorted-lists/",
    acceptanceRate: "64.2%",
    description: `You are given the heads of two sorted linked lists \`list1\` and \`list2\`.

Merge the two lists into one **sorted** list. The list should be made by splicing together the nodes of the first two lists.

Return *the head of the merged linked list*.`,
    examples: [
      {
        input: "list1 = [1,2,4], list2 = [1,3,4]",
        output: "[1,1,2,3,4,4]",
      },
      {
        input: "list1 = [], list2 = []",
        output: "[]",
      },
    ],
    constraints: [
      "The number of nodes in both lists is in the range [0, 50].",
      "-100 <= Node.val <= 100",
      "Both list1 and list2 are sorted in non-decreasing order.",
    ],
    starterCode: {
      typescript: `function mergeTwoLists(list1: ListNode | null, list2: ListNode | null): ListNode | null {
  // Practice iterative dummy node technique
  
}`,
      python: `class Solution:
    def mergeTwoLists(self, list1: Optional[ListNode], list2: Optional[ListNode]) -> Optional[ListNode]:
        pass`,
      cpp: `class Solution {
public:
    ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {
        
    }
};`,
    },
    originalSolution: {
      language: "typescript",
      code: `function mergeTwoLists(list1: ListNode | null, list2: ListNode | null): ListNode | null {
  const dummy = new ListNode(0);
  let current = dummy;

  while (list1 !== null && list2 !== null) {
    if (list1.val <= list2.val) {
      current.next = list1;
      list1 = list1.next;
    } else {
      current.next = list2;
      list2 = list2.next;
    }
    current = current.next;
  }

  current.next = list1 !== null ? list1 : list2;
  return dummy.next;
}`,
      timeComplexity: "O(n + m)",
      spaceComplexity: "O(1)",
      notes: "Dummy node head simplifies initial pointer assignment. Attach remaining list at the end in O(1).",
    },
  },
  {
    id: "p-70",
    slug: "climbing-stairs",
    number: 70,
    title: "Climbing Stairs",
    difficulty: "Easy",
    topics: ["Dynamic Programming", "Math", "Memoization"],
    status: "Solved",
    lastPracticed: "10 days ago",
    nextReview: "In 4 days",
    isDue: false,
    leetcodeUrl: "https://leetcode.com/problems/climbing-stairs/",
    acceptanceRate: "53.2%",
    description: `You are climbing a staircase. It takes \`n\` steps to reach the top.

Each time you can either climb \`1\` or \`2\` steps. In how many distinct ways can you climb to the top?`,
    examples: [
      {
        input: "n = 2",
        output: "2",
        explanation: "There are two ways to climb to the top: 1. 1 step + 1 step, 2. 2 steps",
      },
      {
        input: "n = 3",
        output: "3",
        explanation: "There are three ways: 1. 1 + 1 + 1, 2. 1 + 2, 3. 2 + 1",
      },
    ],
    constraints: ["1 <= n <= 45"],
    starterCode: {
      typescript: `function climbStairs(n: number): number {
  // Practice DP space-optimized Fibonacci
  
}`,
      python: `class Solution:
    def climbStairs(self, n: int) -> int:
        pass`,
      cpp: `class Solution {
public:
    int climbStairs(int n) {
        
    }
};`,
    },
    originalSolution: {
      language: "typescript",
      code: `function climbStairs(n: number): number {
  if (n <= 2) return n;
  let prev2 = 1;
  let prev1 = 2;

  for (let i = 3; i <= n; i++) {
    const current = prev1 + prev2;
    prev2 = prev1;
    prev1 = current;
  }

  return prev1;
}`,
      timeComplexity: "O(n)",
      spaceComplexity: "O(1)",
      notes: "Classic Fibonacci progression. Space can be optimized down to O(1) keeping track of only the previous two step counts.",
    },
  },
  {
    id: "p-207",
    slug: "course-schedule",
    number: 207,
    title: "Course Schedule",
    difficulty: "Medium",
    topics: ["Graph", "Topological Sort", "BFS", "DFS"],
    status: "Solved",
    lastPracticed: "12 days ago",
    nextReview: "In 5 days",
    isDue: false,
    leetcodeUrl: "https://leetcode.com/problems/course-schedule/",
    acceptanceRate: "47.8%",
    description: `There are a total of \`numCourses\` courses you have to take, labeled from \`0\` to \`numCourses - 1\`. You are given an array \`prerequisites\` where \`prerequisites[i] = [a_i, b_i]\` indicates that you **must** take course \`b_i\` first if you want to take course \`a_i\`.

Return \`true\` if you can finish all courses. Otherwise, return \`false\`.`,
    examples: [
      {
        input: "numCourses = 2, prerequisites = [[1,0]]",
        output: "true",
        explanation: "There are 2 courses to take. To take course 1 you should have finished course 0. So it is possible.",
      },
      {
        input: "numCourses = 2, prerequisites = [[1,0],[0,1]]",
        output: "false",
        explanation: "There are 2 courses to take. To take course 1 you should have finished course 0, and to take course 0 you should also have finished course 1. So it is impossible.",
      },
    ],
    constraints: [
      "1 <= numCourses <= 2000",
      "0 <= prerequisites.length <= 5000",
      "prerequisites[i].length == 2",
      "0 <= a_i, b_i < numCourses",
      "All the pairs prerequisites[i] are unique.",
    ],
    starterCode: {
      typescript: `function canFinish(numCourses: number, prerequisites: number[][]): boolean {
  // Practice Kahn's algorithm (indegree BFS)
  
}`,
      python: `class Solution:
    def canFinish(self, numCourses: int, prerequisites: List[List[int]]) -> bool:
        pass`,
      cpp: `class Solution {
public:
    bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {
        
    }
};`,
    },
    originalSolution: {
      language: "typescript",
      code: `function canFinish(numCourses: number, prerequisites: number[][]): boolean {
  const inDegree = new Array(numCourses).fill(0);
  const adj = Array.from({ length: numCourses }, () => [] as number[]);

  for (const [course, pre] of prerequisites) {
    adj[pre].push(course);
    inDegree[course]++;
  }

  const queue: number[] = [];
  for (let i = 0; i < numCourses; i++) {
    if (inDegree[i] === 0) queue.push(i);
  }

  let count = 0;
  while (queue.length > 0) {
    const node = queue.shift()!;
    count++;
    for (const neighbor of adj[node]) {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) {
        queue.push(neighbor);
      }
    }
  }

  return count === numCourses;
}`,
      timeComplexity: "O(V + E)",
      spaceComplexity: "O(V + E)",
      notes: "Kahn's Algorithm using BFS. Compute in-degrees; vertices with 0 in-degree can be taken immediately. If processed count matches total courses, no cycle exists.",
    },
  },
];

export const MOCK_RECENT_PRACTICE: PracticeHistoryItem[] = [
  {
    id: "hist-1",
    problemId: "p-3",
    problemNumber: 3,
    problemTitle: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    practicedAt: "Yesterday, 4:20 PM",
    duration: "11m 45s",
    result: "Passed",
    confidence: "High",
    codeSnippet: "function lengthOfLongestSubstring(s: string) { ... }",
  },
  {
    id: "hist-2",
    problemId: "p-146",
    problemNumber: 146,
    problemTitle: "LRU Cache",
    difficulty: "Medium",
    practicedAt: "2 days ago",
    duration: "24m 10s",
    result: "Passed",
    confidence: "High",
    codeSnippet: "class LRUCache { ... }",
  },
  {
    id: "hist-3",
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
  {
    id: "hist-4",
    problemId: "p-42",
    problemNumber: 42,
    problemTitle: "Trapping Rain Water",
    difficulty: "Hard",
    practicedAt: "6 days ago",
    duration: "31m 00s",
    result: "Needs Review",
    confidence: "Medium",
    codeSnippet: "function trap(height: number[]) { ... }",
  },
  {
    id: "hist-5",
    problemId: "p-704",
    problemNumber: 704,
    problemTitle: "Binary Search",
    difficulty: "Easy",
    practicedAt: "7 days ago",
    duration: "5m 20s",
    result: "Passed",
    confidence: "High",
    codeSnippet: "function search(nums: number[]) { ... }",
  },
];
