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

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    start();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (state.phase === "done" && state.savedId) {
      const timer = setTimeout(() => router.push(`/relatorios/${state.savedId}`), 2200);
      return () => clearTimeout(timer);
    }
  }, [state.phase, state.savedId, router]);

  if (state.phase === "idle" || state.phase === "measuring") {
    const isSpeedPhase = state.phase === "measuring" && state.answers.length === QUESTIONS.length;
    if (isSpeedPhase) {
      const isUploadPhase = state.downloadMbps != null || state.liveUpload > 0;
      const mbps = isUploadPhase ? state.liveUpload : state.liveDownload;
      return (
        <SpeedometerScreen
          mbps={mbps}
          direction={isUploadPhase ? "upload" : "download"}
        />
      );
    }
    return (
      <MeasuringScreen
        message="Medindo sua conexão..."
        subMessage="O Genie está coletando ping, jitter e velocidade. Isso leva apenas alguns segundos."
        pills={["Ping...", "Jitter...", "Download...", "Upload...", "Tipo de rede..."]}
      />
    );
  }

  if (state.phase === "error") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-fade-up">
        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-4 animate-scale-in">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M12 8v4m0 4h.01" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="12" cy="12" r="10" stroke="#EF4444" strokeWidth="2" />
          </svg>
        </div>
        <p className="text-red-500 text-lg font-semibold mb-2">Erro durante o diagnóstico</p>
        <p className="text-gray-500 text-sm max-w-sm">{state.error}</p>
      </div>
    );
  }

  if (state.phase === "done") {
    const scoreInfo = state.score != null ? getScoreInfo(state.score) : null;
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        {/* Mascot celebration */}
        <div className="animate-scale-in mb-5">
          <Mascot size={120} className="animate-genie-float" />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-sm w-full animate-fade-up delay-150">
          {/* Checkmark */}
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4 animate-scale-in delay-200">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 13l4 4L19 7"
                stroke="#10B981"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-check-pop"
              />
            </svg>
          </div>

          <h2 className="text-xl font-bold text-gray-800 mb-1 animate-fade-up delay-250">
            Diagnóstico concluído!
          </h2>

          {scoreInfo && state.score != null && (
            <div className="mt-3 mb-4 animate-scale-in delay-300">
              <span
                className="inline-block px-4 py-1.5 rounded-full text-sm font-bold"
                style={{ background: scoreInfo.bgColor, color: scoreInfo.textColor }}
              >
                Score {state.score.toFixed(1)} — {scoreInfo.label}
              </span>
            </div>
          )}

          {/* Mini metrics row */}
          {state.downloadMbps != null && (
            <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-4 animate-fade-up delay-350">
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-0.5">Ping</p>
                <p className="text-sm font-bold text-gray-700">
                  {state.pingMs != null ? `${Math.round(state.pingMs)}ms` : "—"}
                </p>
              </div>
              <div className="w-px bg-gray-100" />
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-0.5">Download</p>
                <p className="text-sm font-bold text-sky-600">
                  {state.downloadMbps.toFixed(1)} Mbps
                </p>
              </div>
              {state.uploadMbps != null && state.uploadMbps > 0 && (
                <>
                  <div className="w-px bg-gray-100" />
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-0.5">Upload</p>
                    <p className="text-sm font-bold text-violet-600">
                      {state.uploadMbps.toFixed(1)} Mbps
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          <p className="text-sm text-gray-400 animate-fade-in delay-400">
            Redirecionando para o relatório...
          </p>

          {/* Progress bar */}
          <div className="mt-3 h-0.5 bg-gray-100 rounded-full overflow-hidden animate-fade-in delay-500">
            <div
              className="h-full rounded-full"
              style={{
                background: "linear-gradient(90deg, #0EA5E9, #38BDF8)",
                animation: "progress-bar 2.2s linear forwards",
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  const q = QUESTIONS[state.currentQuestion];
  return (
    // key forces re-mount (and re-animation) on every new question
    <QuestionCard
      key={state.currentQuestion}
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
