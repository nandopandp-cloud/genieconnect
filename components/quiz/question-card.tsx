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

  const isCorrectAnswer = selectedAnswer === question.correct;

  return (
    // key on parent ensures this whole card re-animates on each new question
    <div className="w-full max-w-2xl mx-auto px-4 animate-fade-up">
      {/* Status bar */}
      <div className="flex items-center justify-between mb-4 animate-fade-in delay-75">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-gray-200 shadow-sm text-sm text-gray-600">
          {/* Ping dot with ripple when value available */}
          <span className="relative flex items-center justify-center w-3 h-3">
            <span className={cn(
              "w-2 h-2 rounded-full block",
              pingMs != null && pingMs < 80 ? "bg-green-400" :
              pingMs != null && pingMs < 200 ? "bg-amber-400" :
              pingMs != null ? "bg-red-400" : "bg-gray-300"
            )} />
            {pingMs != null && (
              <span className={cn(
                "absolute inset-0 rounded-full animate-ping opacity-50",
                pingMs < 80 ? "bg-green-400" :
                pingMs < 200 ? "bg-amber-400" : "bg-red-400"
              )} />
            )}
          </span>
          <span className="font-medium">{pingMs != null ? `${Math.round(pingMs)}ms` : "—"}</span>
          <span className="text-gray-300">·</span>
          <span className="uppercase text-xs font-semibold text-gray-500">
            {effectiveType === "unknown" ? "Wi-Fi" : effectiveType.toUpperCase()}
          </span>
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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-scale-in delay-75">
        {/* Progress dots */}
        <div className="px-5 pt-5 pb-3">
          <div className="flex gap-1 flex-wrap">
            {dots.map((d, i) => (
              <div
                key={i}
                className={cn(
                  "w-4 h-4 rounded-full transition-all duration-300",
                  d === "correct" && "bg-sky-500 scale-110",
                  d === "wrong"   && "bg-red-400 scale-110",
                  d === "current" && "bg-sky-300 ring-2 ring-sky-200 scale-125",
                  d === "pending" && "bg-gray-200"
                )}
              />
            ))}
          </div>
        </div>

        {/* Question */}
        <div className="px-5 pb-3">
          <p className="text-sm text-gray-400 font-medium mb-3">
            Questão {questionNumber + 1} de {total}
          </p>
          <div className="bg-gray-50 rounded-xl px-5 py-4 text-center">
            <p className="text-gray-800 font-semibold text-base">{question.text}</p>
          </div>
        </div>

        {/* Options */}
        <div className="px-5 pb-5 space-y-2.5">
          {question.options.map((opt, i) => {
            const isSelected = selectedAnswer === i;
            const isCorrect  = i === question.correct;

            let style = "bg-gray-50 border-gray-200 text-gray-700";
            let labelStyle = "bg-gray-200 text-gray-600";
            let iconEl: React.ReactNode = null;

            if (showFeedback) {
              if (isSelected && !isCorrect) {
                style      = "bg-red-50 border-red-300 text-red-800";
                labelStyle = "bg-red-400 text-white";
                iconEl     = <X size={16} className="text-red-400 flex-shrink-0 animate-check-pop" />;
              } else if (isCorrect) {
                style      = "bg-green-50 border-green-300 text-green-800";
                labelStyle = "bg-green-500 text-white";
                iconEl     = <Check size={16} className="text-green-500 flex-shrink-0 animate-check-pop" />;
              }
            }

            return (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all duration-300",
                  style
                )}
              >
                <span className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all duration-300",
                  labelStyle
                )}>
                  {LABELS[i]}
                </span>
                <span className="text-sm font-medium flex-1">{opt}</span>
                {iconEl}
              </div>
            );
          })}
        </div>

        {/* Feedback bar */}
        {showFeedback && selectedAnswer !== null && (
          <div className={cn(
            "px-5 py-3 flex items-center justify-between border-t text-sm font-medium animate-fade-up",
            isCorrectAnswer
              ? "bg-green-50 border-green-100 text-green-700"
              : "bg-red-50 border-red-100 text-red-700"
          )}>
            <div className="flex items-center gap-2">
              {isCorrectAnswer
                ? <Check size={14} className="animate-check-pop" />
                : <X size={14} className="animate-check-pop" />}
              {isCorrectAnswer
                ? "Correto!"
                : `Errou — Resp. correta: ${question.options[question.correct]}`}
            </div>
            <span className="text-gray-400 text-xs tracking-wide">PRÓXIMA...</span>
          </div>
        )}
      </div>
    </div>
  );
}
