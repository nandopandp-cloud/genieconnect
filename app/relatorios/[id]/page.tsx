import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Wifi, Activity, Zap, Upload, CheckCircle2, XCircle } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { ResponseChart } from "@/components/reports/response-chart";
import { SessionHeader } from "@/components/reports/session-header";
import { SchoolCard } from "@/components/reports/school-card";
import { ConnectionBadge } from "@/components/speed-test/connection-badge";
import { getSession } from "@/lib/auth";
import sql from "@/lib/db";
import { getScoreInfo, getPingInfo, getDownloadInfo, getUploadInfo, SCORE_RUBRICS } from "@/lib/score";
import { formatDate } from "@/lib/utils";
import { QUESTIONS } from "@/lib/quiz-data";
import type { HistoryTest, QuizAnswer, ConnectionType, EffectiveType } from "@/lib/types";

async function getTest(id: string, userId: number) {
  const numId = parseInt(id, 10);
  if (isNaN(numId)) return null;
  const rows = await sql`SELECT * FROM speed_tests WHERE id = ${numId} AND user_id = ${userId}`;
  const test = (rows[0] ?? null) as (HistoryTest & { school_name: string | null; school_rank: number | null }) | null;
  if (!test) return null;

  test.school_rank = null;
  if (test.school_name) {
    try {
      const [{ rank }] = await sql`
        SELECT COUNT(*)::int AS rank FROM speed_tests
        WHERE school_name = ${test.school_name} AND id <= ${numId}
      `;
      test.school_rank = rank as number;
    } catch {
      // school_name column may not exist, ignore
    }
  }

  return test;
}

export default async function RelatorioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  const test = await getTest(id, session?.userId ?? 0);
  if (!test) notFound();

  const scoreInfo = getScoreInfo(test.score ?? 0);
  const pingInfo = getPingInfo(Number(test.ping_ms));
  const dlInfo = getDownloadInfo(Number(test.download_mbps));
  const ulMbps = Number(test.upload_mbps ?? 0);
  const ulInfo = getUploadInfo(ulMbps);
  const quizAnswers: QuizAnswer[] = Array.isArray(test.quiz_results) ? test.quiz_results as QuizAnswer[] : [];
  const pageTitle = test.school_name
    ? `${test.school_name} — Teste ${test.school_rank ?? test.id}`
    : `Teste #${test.id}`;
  const connectionLabel = (
    <ConnectionBadge
      connectionType={test.connection_type as ConnectionType}
      effectiveType={test.effective_type as EffectiveType}
    />
  );

  return (
    <div className="min-h-screen" style={{ background: "#F0F4F8" }}>
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        {/* Top row: back + actions */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <Link
            href="/relatorios"
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft size={14} />
            Voltar aos relatórios
          </Link>
          <SessionHeader test={test} />
        </div>

        {/* Title row */}
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
            <span
              className="px-3 py-1 rounded-full text-sm font-semibold"
              style={{ background: scoreInfo.bgColor, color: scoreInfo.textColor }}
            >
              {scoreInfo.label}
            </span>
          </div>
          <p className="text-sm text-gray-400">{formatDate(test.created_at)}</p>
        </div>

        {/* School card */}
        <SchoolCard testId={test.id} initialSchool={test.school_name} />

        {/* 4 main metric cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* Qualidade da Rede */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <Wifi size={15} className="text-gray-500" />
              </div>
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                Qualidade da Rede
              </span>
            </div>
            <p
              className="text-3xl font-bold mb-1"
              style={{ color: scoreInfo.color }}
            >
              {test.score != null ? Number(test.score).toFixed(1) : "—"}
            </p>
            <p className="text-sm font-semibold mb-2" style={{ color: scoreInfo.color }}>
              {scoreInfo.label}
            </p>
            <p className="text-xs text-gray-500 leading-relaxed">
              {scoreInfo.guidance}
            </p>
          </div>

          {/* Ping médio */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <Activity size={15} className="text-gray-500" />
              </div>
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                Ping médio
              </span>
            </div>
            <p
              className="text-3xl font-bold mb-1"
              style={{ color: pingInfo.color }}
            >
              {Number(test.ping_ms).toFixed(1)}
              <span className="text-sm font-normal text-gray-400 ml-1">ms</span>
            </p>
            <p className="text-sm font-medium" style={{ color: pingInfo.color }}>
              {pingInfo.label}
            </p>
          </div>

          {/* Download */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <Zap size={15} className="text-gray-500" />
              </div>
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                Download
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {Number(test.download_mbps).toFixed(2)}
              <span className="text-sm font-normal text-gray-400 ml-1">Mbps</span>
            </p>
            <p className="text-sm text-gray-500">{dlInfo.label}</p>
          </div>

          {/* Upload */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                <Upload size={15} className="text-violet-500" />
              </div>
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                Upload
              </span>
            </div>
            <p className="text-3xl font-bold text-violet-600 mb-1">
              {ulMbps.toFixed(2)}
              <span className="text-sm font-normal text-gray-400 ml-1">Mbps</span>
            </p>
            <p className="text-sm text-gray-500">{ulInfo.label}</p>
          </div>
        </div>

        {/* Wi-Fi indicators card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-800">Indicadores de Rede Wi-Fi</h2>
            <div>{connectionLabel}</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Ping médio */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
                Ping médio
              </p>
              <p className="text-xl font-bold" style={{ color: pingInfo.color }}>
                {Number(test.ping_ms).toFixed(1)}
                <span className="text-xs font-normal text-gray-400 ml-1">ms</span>
              </p>
              <p className="text-xs mt-0.5" style={{ color: pingInfo.color }}>
                {pingInfo.label}
              </p>
            </div>

            {/* Ping mín/máx */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
                Ping mín/máx
              </p>
              <p className="text-xl font-bold text-gray-800">
                {test.min_ping_ms != null ? Number(test.min_ping_ms).toFixed(1) : "—"}
                <span className="text-xs font-normal text-gray-400 mx-1">/</span>
                {test.max_ping_ms != null ? Number(test.max_ping_ms).toFixed(1) : "—"}
                <span className="text-xs font-normal text-gray-400 ml-1">ms</span>
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Variação de latência</p>
            </div>

            {/* Jitter */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
                Jitter
              </p>
              <p className="text-xl font-bold text-gray-800">
                {Number(test.jitter_ms).toFixed(1)}
                <span className="text-xs font-normal text-gray-400 ml-1">ms</span>
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {Number(test.jitter_ms) < 10 ? "Estável" : Number(test.jitter_ms) < 30 ? "Moderado" : "Instável"}
              </p>
            </div>

            {/* Download */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
                Download
              </p>
              <p className="text-xl font-bold text-emerald-600">
                {Number(test.download_mbps).toFixed(2)}
                <span className="text-xs font-normal text-gray-400 ml-1">Mbps</span>
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{dlInfo.label}</p>
            </div>

            {/* Upload */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
                Upload
              </p>
              <p className="text-xl font-bold text-violet-600">
                {ulMbps.toFixed(2)}
                <span className="text-xs font-normal text-gray-400 ml-1">Mbps</span>
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{ulInfo.label}</p>
            </div>

            {/* Tipo de rede */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
                Tipo de rede
              </p>
              <p className="text-xl font-bold text-gray-800 capitalize">
                {test.effective_type}
              </p>
              <p className="text-xs text-gray-400 mt-0.5 capitalize">{test.connection_type}</p>
            </div>

            {/* Qualidade geral */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
                Qualidade geral
              </p>
              <p className="text-xl font-bold" style={{ color: scoreInfo.color }}>
                {test.score != null ? Number(test.score).toFixed(1) : "—"}
              </p>
              <p className="text-xs font-medium mt-0.5" style={{ color: scoreInfo.color }}>
                {scoreInfo.label}
              </p>
            </div>
          </div>
        </div>

        {/* Rubric legend */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="mb-4">
            <h2 className="font-bold text-gray-800">Legenda de Rubricas</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Entenda o que cada classificação de qualidade significa para sua rede escolar.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {SCORE_RUBRICS.map((r) => (
              <div
                key={r.label}
                className="rounded-xl p-4 border"
                style={{ background: r.bgColor, borderColor: r.color + "33" }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: r.color, color: "#fff" }}>
                    {r.label}
                  </span>
                  <span className="text-[10px] font-semibold text-gray-400 tabular-nums">{r.range}</span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: r.textColor }}>
                  {r.guidance}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Response chart */}
        {quizAnswers.length > 0 && (
          <div className="mb-6">
            <ResponseChart answers={quizAnswers} />
          </div>
        )}

        {/* Detailed answers table */}
        {quizAnswers.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-800">Respostas Detalhadas</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {quizAnswers.length} questões respondidas automaticamente
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-5 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wider w-10">
                      #
                    </th>
                    <th className="text-left px-5 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wider">
                      Pergunta
                    </th>
                    <th className="text-left px-5 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wider">
                      Resposta dada
                    </th>
                    <th className="text-left px-5 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wider">
                      Resposta correta
                    </th>
                    <th className="text-left px-5 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wider">
                      Tempo
                    </th>
                    <th className="px-5 py-3 w-10" />
                  </tr>
                </thead>
                <tbody>
                  {quizAnswers.map((answer, i) => {
                    const question = QUESTIONS.find((q) => q.id === answer.questionId);
                    const givenText = question?.options[answer.givenAnswer] ?? `Opção ${answer.givenAnswer + 1}`;
                    const correctText = question?.options[answer.correctAnswer] ?? `Opção ${answer.correctAnswer + 1}`;

                    return (
                      <tr
                        key={i}
                        className={`border-b border-gray-50 ${
                          i % 2 === 0 ? "" : "bg-gray-50/50"
                        }`}
                      >
                        <td className="px-5 py-3 text-xs text-gray-400">{i + 1}</td>
                        <td className="px-5 py-3 text-xs text-gray-700 max-w-[180px] md:max-w-[220px]">
                          <span className="line-clamp-2">{answer.questionText}</span>
                        </td>
                        <td className="px-5 py-3 text-xs">
                          <span className={answer.isCorrect ? "text-gray-700" : "text-red-500 font-medium"}>
                            {givenText}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-xs text-emerald-600 font-medium">
                          {correctText}
                        </td>
                        <td className="px-5 py-3 text-xs text-gray-400 font-mono">
                          {(answer.responseTimeMs / 1000).toFixed(2)}s
                        </td>
                        <td className="px-5 py-3">
                          {answer.isCorrect ? (
                            <CheckCircle2 size={15} className="text-emerald-500" />
                          ) : (
                            <XCircle size={15} className="text-red-400" />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
