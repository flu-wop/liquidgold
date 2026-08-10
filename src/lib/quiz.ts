// FULLY FUNCTIONAL — no backend dependency, safe to build for real now.
// Each answer nudges a mood score; highest mood at the end maps to a scent
// via scents.ts. TODO(later): gate results behind email capture once
// Klaviyo/Resend signup is wired in — ungated for now per open question.

import { scents, type Scent } from "./scents";

export type Mood = Scent["mood"];

export type QuizQuestion = {
  id: string;
  prompt: string;
  options: { label: string; mood: Mood }[];
};

export const quizQuestions: QuizQuestion[] = [
  {
    id: "vacation",
    prompt: "Your ideal vacation day looks like...",
    options: [
      { label: "Beach club, cocktail in hand", mood: "Sexy" },
      { label: "Snorkeling until the sun goes down", mood: "Tropical" },
      { label: "Slow morning, good coffee, no plans", mood: "Cozy" },
      { label: "Market hopping through a coastal town", mood: "Fresh" },
    ],
  },
  {
    id: "night-or-day",
    prompt: "Day or night?",
    options: [
      { label: "Golden hour, always", mood: "Warm" },
      { label: "Midnight swim", mood: "Romantic" },
      { label: "Bright morning sun", mood: "Fresh" },
      { label: "Sunset that won't quit", mood: "Tropical" },
    ],
  },
  {
    id: "drink",
    prompt: "Pick a tropical drink",
    options: [
      { label: "Dark and stormy", mood: "Sexy" },
      { label: "Coconut water, straight up", mood: "Tropical" },
      { label: "Something with citrus and mint", mood: "Fresh" },
      { label: "Spiced rum, neat", mood: "Warm" },
    ],
  },
  {
    id: "personality",
    prompt: "Friends would describe you as...",
    options: [
      { label: "Magnetic", mood: "Sexy" },
      { label: "Easygoing", mood: "Cozy" },
      { label: "Bright and a little bold", mood: "Fresh" },
      { label: "Warm the second you meet them", mood: "Romantic" },
    ],
  },
];

export function scoreQuiz(answers: Mood[]): Scent {
  const counts = answers.reduce<Record<string, number>>((acc, mood) => {
    acc[mood] = (acc[mood] ?? 0) + 1;
    return acc;
  }, {});
  const topMood = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
  return scents.find((s) => s.mood === topMood) ?? scents[0];
}
