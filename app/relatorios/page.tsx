import { Wifi, TrendingUp, Activity, Zap } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { DownloadChart } from "@/components/reports/download-chart";
import { PingChart } from "@/components/reports/ping-chart";
import { TestsTable } from "@/components/reports/tests-table";
import { ReportButtons } from "@/components/reports/report-buttons";
import sql from "@/lib/db";
import { getScoreInfo } from "@/lib/score";
import type { HistoryTest } from "@/lib/types";

async function getData() {
  try {
    const tests = (await sql`
      SELECT id, created_at, connection_type, effective_type, ping_ms, jitter_ms,
             download_mbps, upload_mbps, score, quiz_results, min_ping_ms, max_ping_ms
      FROM speed_tests ORDER BY created_at DESC LIMIT 50
    `) as HistoryTest[];
    const [stats] = await sql`
      SELECT
        COUNT(*)::int AS total,
        AVG(score)::float AS avg_score,
        AVG(ping_ms)::float AS avg_ping,
        MAX(download_mbps)::float AS best_download
      FROM speed_tests
    `;
    return { tests, stats };
  } catch {
    return {
      tests: [] as HistoryTest[],
      stats: { total: 0, avg_score: null, avg_ping: null, best_download: null },
    };
  }
}

export default async function RelatoriosPage() {
  const { tests, stats } = await getData();

  const avgScore = stats.avg_score != null ? Math.round(Number(stats.avg_score) * 10) / 10 : null;
  const avgPing = stats.avg_ping != null ? Math.round(Number(stats.avg_ping) * 10) / 10 : null;
  const bestDownload = stats.best_download != null ? Math.round(Number(stats.best_download) * 100) / 100 : null;
  const avgScoreInfo = avgScore != null ? getScoreInfo(avgScore) : null;

  return (
    <div className="min-h-screen" style={{ background: "#F0F4F8" }}>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Top header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-semibold tracking-widest text-cyan-500 uppercase mb-1">
              Painel de Monitoramento
            </p>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
              Relatórios de Conexão
            </h1>
            <p className="text-sm text-gray-500">
              Histórico completo de diagnósticos Wi-Fi da sua rede
            </p>
          </div>
          <ReportButtons tests={tests} />
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* Total de testes */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Wifi size={17} className="text-blue-500" />
              </div>
            </div>
            <p className="text-xs text-gray-400 font-medium mb-1">Total de testes</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-400 mt-0.5">{stats.total} concluídos</p>
          </div>

          {/* Qualidade média */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                <TrendingUp size={17} className="text-blue-500" />
              </div>
            </div>
            <p className="text-xs text-gray-400 font-medium mb-1">Qualidade média</p>
            <p className="text-2xl font-bold text-gray-900">
              {avgScore != null ? avgScore : "—"}
            </p>
            {avgScoreInfo && (
              <p className="text-xs font-medium mt-0.5 flex items-center gap-1" style={{ color: avgScoreInfo.color }}>
                {avgScoreInfo.label} ↑
              </p>
            )}
            {avgScore == null && <p className="text-xs text-gray-400 mt-0.5">sem dados</p>}
          </div>

          {/* Ping médio */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0">
                <Activity size={17} className="text-orange-400" />
              </div>
            </div>
            <p className="text-xs text-gray-400 font-medium mb-1">Ping médio</p>
            <p className="text-2xl font-bold text-gray-900">
              {avgPing != null ? `${avgPing} ms` : "—"}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Latência</p>
          </div>

          {/* Melhor download */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                <Zap size={17} className="text-green-500" />
              </div>
            </div>
            <p className="text-xs text-gray-400 font-medium mb-1">Melhor download</p>
            <p className="text-2xl font-bold text-gray-900">
              {bestDownload != null ? `${bestDownload} Mbps` : "—"}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Pico de velocidade</p>
          </div>
        </div>

        {/* Charts */}
        {tests.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <DownloadChart tests={tests} />
            <PingChart tests={tests} />
          </div>
        )}

        {/* History table */}
        <TestsTable tests={tests} />
      </main>
    </div>
  );
}
