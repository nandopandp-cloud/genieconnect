"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useQuizTest } from "@/hooks/use-quiz-test";
import { QuestionCard } from "./question-card";
import { MeasuringScreen } from "./measuring-screen";
import { SpeedometerScreen } from "./speedometer-screen";
import { Mascot } from "@/components/mascot";
import { QUESTIONS } from "@/lib/quiz-data";
import { getScoreInfo } from "@/lib/score";

export function QuizShell() {
  const { state, start } = useQuizTest();
  const router = useRouter();
  const startedRef = useRef(false);

  // Call start() exactly once on mount — using a ref guard prevents
  // a re-run if the parent re-renders or start reference changes
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    start();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (state.phase === "done" && state.savedId) {
      const timer = setTimeout(() => router.push(`/relatorios/${state.savedId}`), 1000);
      return () => clearTimeout(timer);
    }
  }, [state.phase, state.savedId, router]);

  if (state.phase === "idle" || state.phase === "measuring") {
    const isDl = state.phase === "measuring" && state.answers.length === QUESTIONS.length;
    if (isDl) {
      return <SpeedometerScreen mbps={state.liveDownload} />;
    }
    return (
      <MeasuringScreen
        message="Medindo sua conexão..."
        subMessage="O Genie está coletando ping, jitter e velocidade.\nIsso leva apenas alguns segundos."
        pills={["Ping...", "Jitter...", "Download...", "Tipo de rede..."]}
      />
    );
  }

  if (state.phase === "error") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <p className="text-red-500 text-lg font-semibold mb-2">Erro durante o diagnóstico</p>
        <p className="text-gray-500 text-sm">{state.error}</p>
      </div>
    );
  }

  if (state.phase === "done") {
    const scoreInfo = state.score != null ? getScoreInfo(state.score) : null;
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <Mascot size={120} className="mb-5 animate-genie-pulse" />
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-sm w-full">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-1">Diagnóstico concluído!</h2>
          {scoreInfo && state.score != null && (
            <div className="mt-3 mb-4">
              <span
                className="inline-block px-4 py-1.5 rounded-full text-sm font-bold"
                style={{ background: scoreInfo.bgColor, color: scoreInfo.textColor }}
              >
                Score {state.score.toFixed(1)} — {scoreInfo.label}
              </span>
            </div>
          )}
          <p className="text-sm text-gray-400">Redirecionando para o relatório...</p>
        </div>
      </div>
    );
  }

  const q = QUESTIONS[state.currentQuestion];
  return (
    <QuestionCard
      question={q}
      questionNumber={state.currentQuestion}
      total={QUESTIONS.length}
      answers={state.answers}
      selectedAnswer={state.selectedAnswer}
      showFeedback={state.showFeedback}
      pingMs={state.pingMs}
      effectiveType={state.effectiveType}
      elapsed={state.elapsed}
    />
  );
}
