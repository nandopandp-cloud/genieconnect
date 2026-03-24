export type ConnectionType = "wifi" | "cellular" | "ethernet" | "bluetooth" | "none" | "unknown";
export type EffectiveType = "4g" | "3g" | "2g" | "slow-2g" | "unknown";

export type QuizPhase = "idle" | "measuring" | "question" | "answering" | "feedback" | "done" | "error";

export interface QuizAnswer {
  questionId: number;
  questionText: string;
  givenAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
  responseTimeMs: number;
}

export interface QuizTestResult {
  id?: number;
  createdAt?: string;
  connectionType: ConnectionType;
  effectiveType: EffectiveType;
  pingMs: number;
  jitterMs: number;
  downloadMbps: number;
  uploadMbps: number;
  score: number;
  answers: QuizAnswer[];
}

export interface HistoryTest {
  id: number;
  created_at: string;
  connection_type: string;
  effective_type: string;
  ping_ms: number;
  jitter_ms: number;
  download_mbps: number;
  upload_mbps: number;
  score: number | null;
  quiz_results: QuizAnswer[] | null;
  min_ping_ms: number | null;
  max_ping_ms: number | null;
  school_name?: string | null;
}
