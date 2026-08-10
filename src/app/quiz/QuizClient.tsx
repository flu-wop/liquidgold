"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { quizQuestions, scoreQuiz, type Mood } from "@/lib/quiz";
import Button from "@/components/ui/Button";

export default function QuizClient() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Mood[]>([]);

  const question = quizQuestions[step];

  function handleAnswer(mood: Mood) {
    const next = [...answers, mood];
    if (step + 1 < quizQuestions.length) {
      setAnswers(next);
      setStep(step + 1);
    } else {
      const result = scoreQuiz(next);
      router.push(`/quiz/results?scent=${result.slug}`);
    }
  }

  return (
    <section className="mx-auto max-w-2xl px-6 py-24 text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-guava">
        Question {step + 1} of {quizQuestions.length}
      </p>
      <h1 className="mt-4 font-display text-3xl text-cocoa md:text-4xl">
        {question.prompt}
      </h1>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {question.options.map((opt) => (
          <button
            key={opt.label}
            onClick={() => handleAnswer(opt.mood)}
            className="rounded-2xl border border-cocoa/15 bg-cream px-6 py-5 text-left font-body text-cocoa transition-colors hover:border-guava hover:bg-guava/10"
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div className="mt-10 flex justify-center gap-2">
        {quizQuestions.map((q, i) => (
          <div
            key={q.id}
            className={`h-1.5 w-8 rounded-full ${i <= step ? "bg-gold" : "bg-cocoa/10"}`}
          />
        ))}
      </div>
    </section>
  );
}
