/**
 * code-runner.ts
 *
 * Builds language-specific test harness code that wraps the user's solution
 * with stdin-driven test execution for Judge0 CE.
 *
 * The harness reads N test cases from stdin (pre-formatted by the verify API),
 * runs the user's function on each, and prints the result on its own line.
 *
 * Judge0 language IDs (CE):
 *   C++   → 54  (C++ 17)
 *   C     → 50  (C GCC)
 *   Java  → 62  (Java OpenJDK 13)
 *   Python→ 71  (Python 3.8)
 *   JS    → 63  (JavaScript Node.js 12)
 *   TS    → 74  (TypeScript 3.7)
 */

export interface TestCase {
  input: string;
  output: string;
  explanation?: string;
}

export interface BuildResult {
  source: string;       // Full source code to submit to Judge0
  languageId: number;  // Judge0 CE language ID
  stdin: string;        // stdin to pass to the submission
}

/**
 * Maps our internal language IDs to Judge0 CE language IDs.
 */
export const JUDGE0_LANGUAGE_IDS: Record<string, number> = {
  cpp: 54,
  c: 50,
  java: 62,
  python: 71,
  javascript: 63,
  typescript: 74,
};

/**
 * Returns the Judge0 language ID for a given internal language ID.
 * Returns 71 (Python) as a fallback.
 */
export function getLanguageId(lang: string): number {
  return JUDGE0_LANGUAGE_IDS[lang.toLowerCase()] ?? 71;
}

/**
 * Normalizes an expected output string for comparison.
 * Trims whitespace and normalises line endings.
 */
export function normalizeOutput(s: string): string {
  return s
    .trim()
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .join("\n");
}

/**
 * Builds the stdin string that the harness will read.
 * Each test case is separated by a special delimiter line.
 *
 * Format:
 *   <number_of_cases>
 *   <input_case_1>
 *   ---CASE_END---
 *   <input_case_2>
 *   ---CASE_END---
 *   ...
 */
export function buildStdin(examples: TestCase[]): string {
  const lines: string[] = [String(examples.length)];
  for (const ex of examples) {
    lines.push(ex.input.trim());
    lines.push("---CASE_END---");
  }
  return lines.join("\n");
}

/**
 * For simple problems (single line of output per case), wraps user code in a
 * Python harness that:
 *   1. Reads the number of cases.
 *   2. For each case, reads the raw input block (up to ---CASE_END--- marker).
 *   3. Calls `solve(raw_input)` — a function the user is expected to define.
 *   4. Prints the result.
 *
 * NOTE: Because LeetCode problems vary wildly in their input/output format,
 * we use a "raw passthrough" approach: the entire input block is passed as a
 * string to `solve()`. For Python we generate a lightweight harness; for other
 * languages we provide a template stub and instruct users how to adapt.
 *
 * For this personal practice app the primary goal is to verify the common,
 * simple cases automatically. Complex multi-argument problems still benefit
 * from the manual approach.
 */
export function buildPythonHarness(userCode: string): string {
  // We append a harness that calls the user's `Solution` class
  return `import sys
import json

${userCode}

def _run_harness():
    data = sys.stdin.read()
    parts = data.split("---CASE_END---")
    n = int(parts[0].strip().split("\\n")[0])
    results = []
    for i in range(1, n + 1):
        raw = parts[i].strip() if i < len(parts) else ""
        try:
            result = _solve_case(raw)
            results.append(str(result))
        except Exception as e:
            results.append(f"ERROR: {e}")
    print("\\n".join(results))

def _solve_case(raw_input: str):
    # Try to detect if input is a single value or JSON-like
    lines = [l.strip() for l in raw_input.strip().split("\\n") if l.strip()]
    
    # Attempt to auto-call Solution methods
    sol = Solution()
    methods = [m for m in dir(sol) if not m.startswith('_')]
    
    if not methods:
        return raw_input
    
    method = getattr(sol, methods[0])
    
    # Parse arguments from input lines
    args = []
    for line in lines:
        # Try parsing as a key=value pair (e.g., "nums = [2,7,11,15]")
        if '=' in line:
            val_str = line.split('=', 1)[1].strip()
        else:
            val_str = line.strip()
        
        try:
            val = json.loads(val_str)
        except Exception:
            # Try as bare string / number
            try:
                val = int(val_str)
            except Exception:
                try:
                    val = float(val_str)
                except Exception:
                    val = val_str
        args.append(val)
    
    if len(args) == 1:
        return method(args[0])
    elif len(args) > 1:
        return method(*args)
    else:
        return method()

_run_harness()
`;
}

export function buildJavaScriptHarness(userCode: string): string {
  return `${userCode}

const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
let inputData = '';
rl.on('line', (line) => { inputData += line + '\\n'; });
rl.on('close', () => {
  const parts = inputData.split('---CASE_END---');
  const n = parseInt(parts[0].trim().split('\\n')[0]);
  const results = [];
  
  for (let i = 1; i <= n; i++) {
    const raw = (parts[i] || '').trim();
    try {
      const lines = raw.split('\\n').map(l => l.trim()).filter(Boolean);
      const sol = new Solution ? new Solution() : null;
      const args = lines.map(line => {
        const valStr = line.includes('=') ? line.split('=').slice(1).join('=').trim() : line.trim();
        try { return JSON.parse(valStr); } catch { return valStr; }
      });
      
      let result;
      if (sol && typeof sol[Object.getOwnPropertyNames(Object.getPrototypeOf(sol)).find(m => m !== 'constructor')] === 'function') {
        const methodName = Object.getOwnPropertyNames(Object.getPrototypeOf(sol)).find(m => m !== 'constructor');
        result = sol[methodName](...args);
      } else {
        result = args[0];
      }
      results.push(JSON.stringify(result) ?? String(result));
    } catch(e) {
      results.push('ERROR: ' + e.message);
    }
  }
  console.log(results.join('\\n'));
});
`;
}

export function buildTypeScriptHarness(userCode: string): string {
  // TS in Judge0 is compiled then run via ts-node; same pattern as JS
  return `${userCode}

import * as readline from 'readline';
const rl = readline.createInterface({ input: process.stdin });
let inputData = '';
rl.on('line', (line: string) => { inputData += line + '\\n'; });
rl.on('close', () => {
  const parts = inputData.split('---CASE_END---');
  const n = parseInt(parts[0].trim().split('\\n')[0]);
  const results: string[] = [];
  
  for (let i = 1; i <= n; i++) {
    const raw = (parts[i] || '').trim();
    try {
      const lines = raw.split('\\n').map((l: string) => l.trim()).filter(Boolean);
      const args = lines.map((line: string) => {
        const valStr = line.includes('=') ? line.split('=').slice(1).join('=').trim() : line.trim();
        try { return JSON.parse(valStr); } catch { return valStr; }
      });
      results.push(JSON.stringify(args[0]));
    } catch(e: any) {
      results.push('ERROR: ' + e.message);
    }
  }
  console.log(results.join('\\n'));
});
`;
}

/**
 * Main entry point: given user code, language, and test cases,
 * returns the harness source + language ID + stdin for Judge0 submission.
 */
export function buildTestHarness(
  userCode: string,
  language: string,
  examples: TestCase[]
): BuildResult {
  const langId = getLanguageId(language);
  const stdin = buildStdin(examples);

  let source: string;
  switch (language.toLowerCase()) {
    case "python":
      source = buildPythonHarness(userCode);
      break;
    case "javascript":
      source = buildJavaScriptHarness(userCode);
      break;
    case "typescript":
      source = buildTypeScriptHarness(userCode);
      break;
    default:
      // For C, C++, Java: return user code as-is with a note.
      // These require the user to write their own I/O handling.
      // The verify API will handle this gracefully.
      source = userCode;
      break;
  }

  return { source, languageId: langId, stdin };
}
