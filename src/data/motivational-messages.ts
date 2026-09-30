/**
 * Motivational messages shown randomly throughout CodeRev.
 * Grouped by context so each touch-point gets the most relevant tone.
 */

export interface MotivationalMessage {
  text: string;
  emoji: string;
}

// ─────────────────────────────────────────────────────────────
// AFTER SAVING AN ATTEMPT (positive reinforcement)
// ─────────────────────────────────────────────────────────────
export const AFTER_SAVE_MESSAGES: MotivationalMessage[] = [
  { emoji: "🏆", text: "Another rep done. Consistency is everything." },
  { emoji: "🧠", text: "Your future self will thank you for this." },
  { emoji: "💡", text: "Every attempt teaches your brain something new." },
  { emoji: "🚀", text: "Progress made. Keep the momentum going." },
  { emoji: "✅", text: "Done is better than perfect. Ship the practice." },
  { emoji: "🔥", text: "One more session down. You're building a habit." },
  { emoji: "💪", text: "The best coders practice even when they don't feel like it." },
  { emoji: "🎯", text: "Recall > re-reading. You just did the hard thing." },
  { emoji: "⚡", text: "Spaced repetition is silent compound interest for your brain." },
  { emoji: "🌱", text: "Small sessions, massive growth over time." },
  { emoji: "🏋️", text: "Mental muscle memory just got stronger." },
  { emoji: "🎖️", text: "Discipline over motivation — you showed up today." },
  { emoji: "🔑", text: "Recall practice is the key to interviews. You get it." },
  { emoji: "🌟", text: "Not all heroes wear capes. Some just open their editor daily." },
  { emoji: "📈", text: "One session can change the trajectory of an interview." },
];

// ─────────────────────────────────────────────────────────────
// GENERAL / PAGE LOAD (ambient encouragement)
// ─────────────────────────────────────────────────────────────
export const AMBIENT_MESSAGES: MotivationalMessage[] = [
  { emoji: "🧩", text: "Every problem you master is a brick in your foundation." },
  { emoji: "📅", text: "Show up today. Future-you is counting on it." },
  { emoji: "🎓", text: "The best investment is in your own skills." },
  { emoji: "🔄", text: "Repetition is the mother of mastery." },
  { emoji: "🌍", text: "Somewhere, someone is preparing for the same role as you." },
  { emoji: "⏱️", text: "15 minutes of focused recall beats 2 hours of passive reading." },
  { emoji: "🛠️", text: "Good engineers build. Great engineers understand." },
  { emoji: "🎯", text: "Interview prep isn't a sprint. It's a daily practice." },
  { emoji: "🧗", text: "Hard problems get easier the more times you face them." },
  { emoji: "💭", text: "Think first, code second. Always." },
  { emoji: "🌅", text: "New day, new chance to sharpen your edge." },
  { emoji: "🤓", text: "The best coders are just great problem-solvers." },
  { emoji: "🏄", text: "Ride the difficulty curve — don't avoid it." },
  { emoji: "📚", text: "Knowledge compounds. Keep depositing." },
  { emoji: "🎸", text: "Even Hendrix practiced scales every day." },
  { emoji: "🧪", text: "Failure is just debugging in disguise." },
  { emoji: "🦾", text: "Hard today. Easy tomorrow. Expert next year." },
  { emoji: "🪄", text: "There's no magic — just thousands of reps." },
  { emoji: "🏡", text: "Your dream role is on the other side of consistent practice." },
  { emoji: "⚙️", text: "Systems beat willpower. Your streak is your system." },
];

// ─────────────────────────────────────────────────────────────
// STREAK / CONSISTENCY (shown near streak counter)
// ─────────────────────────────────────────────────────────────
export const STREAK_MESSAGES: MotivationalMessage[] = [
  { emoji: "🔥", text: "Streak alive! Don't break the chain." },
  { emoji: "⛓️", text: "Each day adds a link to your chain of mastery." },
  { emoji: "📆", text: "Daily practice beats weekly cramming, every time." },
  { emoji: "🏃", text: "Consistency is the cheat code nobody talks about." },
  { emoji: "🌊", text: "Waves are made by sustained effort, not one big splash." },
  { emoji: "🐢", text: "Slow and steady doesn't just win races — it wins careers." },
  { emoji: "📡", text: "Your brain is tuning into algorithms. Don't lose the signal." },
  { emoji: "🎯", text: "Every day you show up, the habit gets stronger." },
  { emoji: "🌙", text: "Showing up when you don't feel like it — that's the real practice." },
  { emoji: "🏅", text: "Champions are built in the sessions nobody sees." },
];

// ─────────────────────────────────────────────────────────────
// HARD PROBLEM / STRUGGLE (when user is on a Hard problem)
// ─────────────────────────────────────────────────────────────
export const HARD_PROBLEM_MESSAGES: MotivationalMessage[] = [
  { emoji: "💎", text: "Hard problems create unbeatable engineers. Lean in." },
  { emoji: "🧱", text: "If it were easy, everyone would do it." },
  { emoji: "🦅", text: "Struggle is just growth in disguise." },
  { emoji: "🔬", text: "Break it down. Every hard problem is just small problems stacked." },
  { emoji: "🌋", text: "The hardest reps are the ones that change you the most." },
  { emoji: "🐉", text: "Hard → Understood → Easy. You're in the middle part." },
  { emoji: "🎮", text: "This is the boss level. You've cleared everything before it." },
  { emoji: "🧲", text: "Stay curious. The click-moment is closer than you think." },
  { emoji: "⛰️", text: "The view from the top is worth the climb." },
  { emoji: "🔭", text: "When you see the pattern, you own it forever." },
];

// ─────────────────────────────────────────────────────────────
// DUE TODAY / REVISION (shown on revision/due page)
// ─────────────────────────────────────────────────────────────
export const DUE_TODAY_MESSAGES: MotivationalMessage[] = [
  { emoji: "📬", text: "Your reviews are ready. Time to recall." },
  { emoji: "🕰️", text: "Spaced repetition is working. Trust the algorithm." },
  { emoji: "🧠", text: "Each review cements the concept deeper into long-term memory." },
  { emoji: "📝", text: "Clear your queue. Leave nothing for tomorrow." },
  { emoji: "🎯", text: "Review mode: the most underrated study technique in CS." },
  { emoji: "💡", text: "10 minutes of review now = instant recall in your interview." },
  { emoji: "🚦", text: "Green queue = confident engineer. Let's get there." },
  { emoji: "🏁", text: "Finish your reviews and you're done for the day. Let's go." },
];

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

/** Returns a random message from a given list. */
export function getRandomMessage(messages: MotivationalMessage[]): MotivationalMessage {
  return messages[Math.floor(Math.random() * messages.length)];
}

/** Returns a random message from ALL categories combined. */
export function getAnyRandomMessage(): MotivationalMessage {
  const all: MotivationalMessage[] = [
    ...AFTER_SAVE_MESSAGES,
    ...AMBIENT_MESSAGES,
    ...STREAK_MESSAGES,
    ...HARD_PROBLEM_MESSAGES,
    ...DUE_TODAY_MESSAGES,
  ];
  return all[Math.floor(Math.random() * all.length)];
}
