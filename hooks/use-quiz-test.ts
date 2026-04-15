"use client";
import { useState, useCallback, useRef } from "react";
import { useNetworkInfo } from "./use-network-info";
import { QUESTIONS } from "@/lib/quiz-data";
import { measureDownload, measurePing, measureUpload } from "@/lib/speed-test";
import { calculateScore } from "@/lib/score";
import type { QuizAnswer, QuizPhase } from "@/lib/types";

export interface QuizState {
  phase: QuizPhase;
  currentQuestion: number;
  answers: QuizAnswer[];
  liveDownload: number;
  liveUpload: number;
  pingMs: number | null;
  jitterMs: number | null;
  downloadMbps: number | null;
  uploadMbps: number | null;
  score: number | null;
  selectedAnswer: number | null;
  showFeedback: boolean;
  elapsed: number;
  savedId: number | null;
  error: string | null;
  effectiveType: string;
}

const INITIAL: QuizState = {
  phase: "idle",
  currentQuestion: 0,
  answers: [],
  liveDownload: 0,
  liveUpload: 0,
  pingMs: null,
  jitterMs: null,
  downloadMbps: null,
  uploadMbps: null,
  score: null,
  selectedAnswer: null,
  showFeedback: false,
  elapsed: 0,
  savedId: null,
  error: null,
  effectiveType: "unknown",
};

// Time (ms) to display the question before auto-answering
const QUESTION_DISPLAY_MS = 700;
// Time (ms) to show answer feedback before advancing
const FEEDBACK_MS = 500;

function delay(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

export function useQuizTest() {
  const [state, setState] = useState<QuizState>(INITIAL);
  const networkInfo = useNetworkInfo();
  // Keep a ref so start() can always read the latest network info
  // without being listed as a dependency (which would cause rerenders)
  const networkInfoRef = useRef(networkInfo);
  networkInfoRef.current = networkInfo;

  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const patch = useCallback(
    (p: Partial<QuizState>) => setState((prev) => ({ ...prev, ...p })),
    []
  );

  const start = useCallback(async () => {
    // Cancel any previous run
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    // Clear any leftover interval before creating a new one
    if (timerRef.current) clearInterval(timerRef.current);

    // Elapsed timer — lives in a ref so the interval closure always
    // reads the latest value, even if start() is called again
    let elapsedSecs = 0;
    timerRef.current = setInterval(() => {
      elapsedSecs += 1;
      patch({ elapsed: elapsedSecs });
    }, 1000);

    setState({ ...INITIAL, phase: "measuring" });

    try {
      // ── Dedicated ping/jitter measurement (real latency, before UI noise)
      const pingResult = await measurePing().catch(() => null);
      if (ac.signal.aborted) return;
      if (pingResult) {
        patch({
          pingMs: pingResult.pingMs,
          jitterMs: pingResult.jitterMs,
        });
      }

      patch({ phase: "question", currentQuestion: 0 });
      await delay(200);

      // ── Quiz loop ────────────────────────────────────────────────────
      const answers: QuizAnswer[] = [];
      const questionPings: number[] = [];

      for (let i = 0; i < QUESTIONS.length; i++) {
        if (ac.signal.aborted) break;
        const q = QUESTIONS[i];

        // Show question
        patch({
          currentQuestion: i,
          selectedAnswer: null,
          showFeedback: false,
          phase: "question",
        });
        await delay(QUESTION_DISPLAY_MS);
        if (ac.signal.aborted) break;

        // Measure network latency for this "answer submission"
        const t0 = performance.now();
        await fetch(`/api/speed/ping?q=${i}&t=${Date.now()}`, {
          cache: "no-store",
          signal: ac.signal,
        }).catch(() => {});
        const responseMs = Math.round(performance.now() - t0);
        if (ac.signal.aborted) break;
        questionPings.push(responseMs);

        // 70 % correct answers, 30 % wrong (realistic simulation)
        let givenAnswer: number;
        if (Math.random() < 0.7) {
          givenAnswer = q.correct;
        } else {
          const wrongs = [0, 1, 2, 3].filter((x) => x !== q.correct);
          givenAnswer = wrongs[Math.floor(Math.random() * wrongs.length)];
        }

        answers.push({
          questionId: q.id,
          questionText: q.text,
          givenAnswer,
          correctAnswer: q.correct,
          isCorrect: givenAnswer === q.correct,
          responseTimeMs: responseMs,
        });

        patch({
          selectedAnswer: givenAnswer,
          showFeedback: true,
          answers: [...answers],
          phase: "feedback",
          // Update live ping display as we accumulate samples
          pingMs:
            questionPings.reduce((a, b) => a + b, 0) / questionPings.length,
        });
        await delay(FEEDBACK_MS);
      }

      if (ac.signal.aborted) return;

      // ── Download test ────────────────────────────────────────────────
      patch({ phase: "measuring", liveDownload: 0 });
      const downloadMbps = await measureDownload(
        (mbps) => patch({ liveDownload: mbps }),
        ac.signal
      );
      if (ac.signal.aborted) return;

      // ── Upload test ──────────────────────────────────────────────────
      patch({ liveUpload: 0 });
      const uploadMbps = await measureUpload(
        (mbps) => patch({ liveUpload: mbps }),
        ac.signal
      ).catch(() => 0);
      if (ac.signal.aborted) return;

      // ── Aggregate metrics ────────────────────────────────────────────
      // Prefer dedicated ping measurement; fall back to quiz response-time
      // samples only if the dedicated run failed.
      let finalPing: number;
      let finalJitter: number;
      let minPing: number;
      let maxPing: number;
      if (pingResult) {
        finalPing = pingResult.pingMs;
        finalJitter = pingResult.jitterMs;
        minPing = pingResult.minPingMs;
        maxPing = pingResult.maxPingMs;
      } else {
        const avgPing =
          questionPings.reduce((a, b) => a + b, 0) / questionPings.length;
        const diffs = questionPings
          .slice(1)
          .map((v, i) => Math.abs(v - questionPings[i]));
        const avgJitter =
          diffs.length > 0
            ? diffs.reduce((a, b) => a + b, 0) / diffs.length
            : 0;
        finalPing = Math.round(avgPing * 10) / 10;
        finalJitter = Math.round(avgJitter * 10) / 10;
        minPing = Math.min(...questionPings);
        maxPing = Math.max(...questionPings);
      }

      const score = calculateScore(finalPing, finalJitter, downloadMbps, uploadMbps);

      // ── Save to DB ───────────────────────────────────────────────────
      const ni = networkInfoRef.current;
      const res = await fetch("/api/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          connectionType: ni.connectionType,
          effectiveType: ni.effectiveType,
          pingMs: finalPing,
          jitterMs: finalJitter,
          downloadMbps,
          uploadMbps,
          score,
          quizResults: answers,
          minPingMs: minPing,
          maxPingMs: maxPing,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error ?? `Erro ao salvar resultado (HTTP ${res.status}). Verifique se DATABASE_URL está configurado no .env.local.`);
      }
      const { id } = data;

      if (timerRef.current) clearInterval(timerRef.current);
      patch({
        phase: "done",
        pingMs: finalPing,
        jitterMs: finalJitter,
        downloadMbps,
        uploadMbps,
        score,
        savedId: id,
        effectiveType: ni.effectiveType,
      });
    } catch (err) {
      if (timerRef.current) clearInterval(timerRef.current);
      if ((err as Error).name === "AbortError") return;
      patch({ phase: "error", error: String(err) });
    }
  }, []); // No deps — reads latest values via refs

  const reset = useCallback(() => {
    abortRef.current?.abort();
    if (timerRef.current) clearInterval(timerRef.current);
    setState(INITIAL);
  }, []);

  return { state, start, reset };
}
