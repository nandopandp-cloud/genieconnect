"use client";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Question } from "@/lib/quiz-data";

const LABELS = ["A", "B", "C", "D"];

interface Props {
  question: Question;
  questionNumber: number;
  total: number;
  answers: { isCorrect: boolean }[];
  selectedAnswer: number | null;
  showFeedback: boolean;
  pingMs: number | null;
  effectiveType: string;
  elapsed: number;
}

export function QuestionCard({ question, questionNumber, total, answers, selectedAnswer, showFeedback, pingMs, effectiveType, elapsed }: Props) {
  const dots = Array.from({ length: total }, (_, i) => {
    if (i < answers.length) return answers[i].isCorrect ? "correct" : "wrong";
    if (i === questionNumber && showFeedback) return selectedAnswer === question.correct ? "correct" : "wrong";
    if (i === questionNumber) return "current";
    return "pending";
  });

  const formatElapsed = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      {/* Status bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-gray-200 shadow-sm text-sm text-gray-600">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-sky-500">
            <path d="M1 6c0 0 4-4 11-4s11 4 11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M5 10c0 0 3-3 7-3s7 3 7 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M9 14c0 0 1-1 3-1s3 1 3 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="12" cy="18" r="1.5" fill="currentColor" />
          </svg>
          <span className="font-medium">{pingMs != null ? `${Math.round(pingMs)}ms` : "—"}</span>
          <span className="text-gray-400">·</span>
          <span className="uppercase text-xs font-semibold text-gray-500">{effectiveType === "unknown" ? "Wi-Fi" : effectiveType.toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          {formatElapsed(elapsed)}
        </div>
      </div>

      {/* Main card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Progress dots */}
        <div className="px-5 pt-5 pb-3">
          <div className="flex gap-1 flex-wrap">
            {dots.map((d, i) => (
              <div
                key={i}
                className={cn(
                  "w-4 h-4 rounded-full transition-all duration-200",
                  d === "correct" && "bg-sky-500",
                  d === "wrong" && "bg-red-400",
                  d === "current" && "bg-sky-300 ring-2 ring-sky-200",
                  d === "pending" && "bg-gray-200"
                )}
              />
            ))}
          </div>
        </div>

        {/* Question */}
        <div className="px-5 pb-3">
          <p className="text-sm text-gray-400 font-medium mb-3">Questão {questionNumber + 1} de {total}</p>
          <div className="bg-gray-50 rounded-xl px-5 py-4 text-center">
            <p className="text-gray-800 font-semibold text-base">{question.text}</p>
          </div>
        </div>

        {/* Options */}
        <div className="px-5 pb-5 space-y-2.5">
          {question.options.map((opt, i) => {
            const isSelected = selectedAnswer === i;
            const isCorrect = i === question.correct;
            let style = "bg-gray-50 border-gray-200 text-gray-700";
            if (showFeedback) {
              if (isSelected && !isCorrect) style = "bg-red-50 border-red-300 text-red-800";
              else if (isCorrect) style = "bg-green-50 border-green-300 text-green-800";
            }
            return (
              <div
                key={i}
                className={cn("flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all duration-300", style)}
              >
                <span className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0",
                  showFeedback && isSelected && !isCorrect ? "bg-red-400 text-white" :
                  showFeedback && isCorrect ? "bg-green-500 text-white" :
                  "bg-gray-200 text-gray-600"
                )}>
                  {LABELS[i]}
                </span>
                <span className="text-sm font-medium flex-1">{opt}</span>
                {showFeedback && isCorrect && <Check size={16} className="text-green-500 flex-shrink-0" />}
                {showFeedback && isSelected && !isCorrect && <X size={16} className="text-red-400 flex-shrink-0" />}
              </div>
            );
          })}
        </div>

        {/* Feedback bar */}
        {showFeedback && selectedAnswer !== null && (
          <div className={cn(
            "px-5 py-3 flex items-center justify-between border-t text-sm font-medium",
            selectedAnswer === question.correct ? "bg-green-50 border-green-100 text-green-700" : "bg-red-50 border-red-100 text-red-700"
          )}>
            <div className="flex items-center gap-2">
              {selectedAnswer === question.correct ? <Check size={14} /> : <X size={14} />}
              {selectedAnswer === question.correct ? "Correto!" : `Errou — Resp. correta: ${question.options[question.correct]}`}
            </div>
            <span className="text-gray-400 text-xs">PRÓXIMA...</span>
          </div>
        )}
      </div>
    </div>
  );
}
