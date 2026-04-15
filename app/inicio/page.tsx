import Link from "next/link";
import { Wifi, TrendingUp, Zap, Play, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Mascot } from "@/components/mascot";
import { getSession } from "@/lib/auth";
import sql from "@/lib/db";
import { getScoreInfo } from "@/lib/score";
import { formatDateShort } from "@/lib/utils";

async function getData(userId: number) {
  try {
    const tests = await sql`
      SELECT id, created_at, score, school_name
      FROM speed_tests
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 5
    `;
    const [stats] = await sql`
      SELECT
        COUNT(*)::int AS total,
        AVG(score)::float AS avg_score,
        MAX(score)::float AS best_score
      FROM speed_tests
      WHERE user_id = ${userId}
    `;
    return { tests, stats };
  } catch {
    return {
      tests: [],
      stats: { total: 0, avg_score: null, best_score: null },
    };
  }
}

export default async function InicioPage() {
  const session = await getSession();
  const { tests, stats } = await getData(session?.userId ?? 0);

  const avgScore = stats.avg_score != null ? Math.round(Number(stats.avg_score) * 10) / 10 : null;
  const bestScore = stats.best_score != null ? Math.round(Number(stats.best_score) * 10) / 10 : null;
  const avgScoreInfo = avgScore != null ? getScoreInfo(avgScore) : null;
  const bestScoreInfo = bestScore != null ? getScoreInfo(bestScore) : null;

  return (
    <div className="min-h-screen" style={{ background: "#F0F4F8" }}>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Hero card */}
        <div
          className="rounded-2xl p-8 mb-6 flex flex-col md:flex-row items-center justify-between gap-6 animate-fade-up"
          style={{ background: "linear-gradient(135deg, #0F172A 0%, #0A2040 100%)" }}
        >
          <div className="flex-1 animate-slide-right delay-100">
            <p className="text-white/50 text-sm mb-1">Bem-vindo de volta,</p>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              {session?.name ?? "Usuário"}!
            </h1>
            <p className="text-white/50 text-sm mb-6 max-w-md leading-relaxed">
              Pronto para diagnosticar a conexão da sua escola? O teste leva menos de 5 minutos.
            </p>
            <Link
              href="/diagnostico"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white text-sm transition-all hover:opacity-90 hover:scale-105 active:scale-95 shadow-lg"
              style={{ background: "linear-gradient(135deg, #0EA5E9, #38BDF8)" }}
            >
              <Play size={16} fill="white" />
              Iniciar Novo Teste
            </Link>
          </div>
          <div className="flex-shrink-0 animate-slide-left delay-200">
            <Mascot size={180} className="animate-genie-float" />
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover-lift animate-fade-up delay-150">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-cyan-50 flex items-center justify-center flex-shrink-0">
                <Wifi size={18} className="text-cyan-500" />
              </div>
              <p className="text-sm font-medium text-gray-500">Testes realizados</p>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{stats.total}</p>
            <p className="text-xs text-gray-400">diagnósticos concluídos</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover-lift animate-fade-up delay-250">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-cyan-50 flex items-center justify-center flex-shrink-0">
                <TrendingUp size={18} className="text-cyan-500" />
              </div>
              <p className="text-sm font-medium text-gray-500">Score médio</p>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {avgScore != null ? avgScore : "—"}
            </p>
            {avgScoreInfo && (
              <p className="text-xs font-medium" style={{ color: avgScoreInfo.color }}>
                {avgScoreInfo.label}
              </p>
            )}
            {avgScore == null && <p className="text-xs text-gray-400">sem dados</p>}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover-lift animate-fade-up delay-350">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                <Zap size={18} className="text-green-500" />
              </div>
              <p className="text-sm font-medium text-gray-500">Melhor score</p>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {bestScore != null ? bestScore : "—"}
            </p>
            {bestScoreInfo ? (
              <p className="text-xs font-medium" style={{ color: bestScoreInfo.color }}>
                {bestScoreInfo.label}
              </p>
            ) : (
              <p className="text-xs text-gray-400">pico de qualidade</p>
            )}
          </div>
        </div>

        {/* Recent tests */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm animate-fade-up delay-400">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div>
              <h2 className="font-bold text-gray-800">Testes Recentes</h2>
              <p className="text-xs text-gray-400 mt-0.5">Seus últimos diagnósticos</p>
            </div>
            <Link
              href="/relatorios"
              className="flex items-center gap-1 text-sm text-sky-500 hover:text-sky-700 font-medium transition-colors"
            >
              Ver todos
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="divide-y divide-gray-50">
            {(tests as { id: number; created_at: string; score: number | null }[]).length === 0 ? (
              <div className="px-6 py-10 text-center text-gray-400 text-sm animate-fade-in">
                Nenhum teste realizado ainda.{" "}
                <Link href="/diagnostico" className="text-sky-500 hover:underline">
                  Iniciar diagnóstico
                </Link>
              </div>
            ) : (
              (tests as { id: number; created_at: string; score: number | null; school_name?: string | null }[]).map((t, idx) => {
                const scoreInfo = t.score != null ? getScoreInfo(t.score) : null;
                return (
                  <div
                    key={t.id}
                    className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50 transition-colors animate-slide-right"
                    style={{ animationDelay: `${450 + idx * 60}ms` }}
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-gray-800">
                          {t.school_name ?? `Teste #${t.id}`}
                        </span>
                        {scoreInfo && (
                          <span
                            className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                            style={{
                              background: scoreInfo.bgColor,
                              color: scoreInfo.textColor,
                            }}
                          >
                            {scoreInfo.label}
                          </span>
                        )}
                      </div>
                      {t.school_name && (
                        <p className="text-xs text-gray-400 mt-0.5">Teste #{t.id}</p>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      {formatDateShort(t.created_at)}
                    </span>
                    <Link
                      href={`/relatorios/${t.id}`}
                      className="flex-shrink-0 text-gray-400 hover:text-sky-500 transition-colors hover:scale-110"
                    >
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
