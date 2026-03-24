import type { HistoryTest } from "./types";
import { connectionLabel } from "./utils";

function formatDate(d: string) {
  return new Date(d).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function formatDateFilename(d: Date) {
  return d.toISOString().slice(0, 19).replace(/[T:]/g, "-");
}

export function downloadCSV(tests: HistoryTest[]): void {
  const BOM = "\uFEFF";
  const headers = ["#", "Data", "Escola", "Conexão", "Score", "Ping (ms)", "Jitter (ms)", "Download (Mbps)", "Upload (Mbps)"];
  const rows = tests.map((t, i) => [
    i + 1,
    formatDate(t.created_at),
    t.school_name ?? "—",
    connectionLabel(t.connection_type, t.effective_type),
    t.score != null ? Number(t.score).toFixed(1) : "—",
    Number(t.ping_ms).toFixed(1),
    Number(t.jitter_ms).toFixed(1),
    Number(t.download_mbps).toFixed(2),
    Number(t.upload_mbps).toFixed(2),
  ]);
  const csv = BOM + [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `genieconnect-relatorios-${formatDateFilename(new Date())}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function downloadXLSX(tests: HistoryTest[]): Promise<void> {
  const XLSX = await import("xlsx");
  const ws = XLSX.utils.aoa_to_sheet([
    ["#", "Data", "Conexão", "Score", "Ping (ms)", "Jitter (ms)", "Download (Mbps)", "Upload (Mbps)"],
    ...tests.map((t, i) => [
      i + 1,
      formatDate(t.created_at),
      connectionLabel(t.connection_type, t.effective_type),
      t.score != null ? Number(t.score) : null,
      Number(t.ping_ms),
      Number(t.jitter_ms),
      Number(t.download_mbps),
      Number(t.upload_mbps),
    ]),
  ]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Relatórios");
  XLSX.writeFile(wb, `genieconnect-relatorios-${formatDateFilename(new Date())}.xlsx`);
}

export function triggerAllPDF(tests: HistoryTest[]): void {
  const now = new Date();
  const rows = tests.map((t, i) => {
    const score = t.score != null ? Number(t.score).toFixed(1) : "—";
    const ping = Number(t.ping_ms).toFixed(1);
    const jitter = Number(t.jitter_ms).toFixed(1);
    const dl = Number(t.download_mbps).toFixed(2);
    const conn = connectionLabel(t.connection_type, t.effective_type);
    return `<tr>
      <td>${i + 1}</td>
      <td>${formatDate(t.created_at)}</td>
      <td>${t.school_name ?? "—"}</td>
      <td>${conn}</td>
      <td class="score">${score}</td>
      <td>${ping}</td>
      <td>${jitter}</td>
      <td>${dl}</td>
    </tr>`;
  }).join("");

  const html = `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8">
<title>Relatórios GenieConnect</title>
<style>
@media print { * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #EEF2F7; color: #111827; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; padding: 40px; }
.header { background: linear-gradient(135deg, #0F172A, #0A2040); color: white; border-radius: 16px; padding: 28px 32px; margin-bottom: 28px; display: flex; justify-content: space-between; align-items: center; }
.brand { font-size: 24px; font-weight: 800; }
.brand span { color: #38BDF8; }
.subtitle { color: rgba(255,255,255,0.6); font-size: 13px; margin-top: 4px; }
.date { color: rgba(255,255,255,0.5); font-size: 13px; }
table { width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden; border: 1px solid #E5E7EB; }
th { background: #F9FAFB; text-align: left; padding: 10px 14px; font-size: 11px; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #E5E7EB; }
td { padding: 10px 14px; font-size: 13px; color: #374151; border-bottom: 1px solid #F3F4F6; }
tr:last-child td { border-bottom: none; }
.score { color: #3B82F6; font-weight: 700; }
.footer { text-align: center; color: #9CA3AF; font-size: 12px; margin-top: 24px; }
</style></head>
<body>
<div class="header">
  <div>
    <div class="brand">Genie<span>Connect</span></div>
    <div class="subtitle">Painel de Monitoramento — ${tests.length} registros</div>
  </div>
  <div class="date">Exportado em ${formatDate(now.toISOString())}</div>
</div>
<table>
  <thead><tr>
    <th>#</th><th>Data</th><th>Escola</th><th>Conexão</th><th>Score</th><th>Ping (ms)</th><th>Jitter (ms)</th><th>Download (Mbps)</th>
  </tr></thead>
  <tbody>${rows}</tbody>
</table>
<div class="footer">GenieConnect — Diagnóstico de Conexão Escolar</div>
</body></html>`;

  const win = window.open("", "_blank");
  if (win) { win.document.write(html); win.document.close(); win.focus(); setTimeout(() => win.print(), 600); }
}

export function triggerPDF(test: HistoryTest): void {
  const date = formatDate(test.created_at);
  const score = test.score != null ? Number(test.score).toFixed(1) : "—";
  const conn = connectionLabel(test.connection_type, test.effective_type);

  const html = `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8">
<title>Relatório GenieConnect — Sessão #${test.id}</title>
<style>
@media print { * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #EEF2F7; color: #111827; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; padding: 40px; }
.header { background: linear-gradient(135deg, #0F172A, #0A2040); color: white; border-radius: 16px; padding: 28px 32px; margin-bottom: 28px; display: flex; justify-content: space-between; align-items: center; }
.brand { font-size: 24px; font-weight: 800; }
.brand span { color: #38BDF8; }
.subtitle { color: rgba(255,255,255,0.6); font-size: 13px; margin-top: 4px; }
.date { color: rgba(255,255,255,0.5); font-size: 13px; text-align: right; }
.session { font-size: 22px; font-weight: 700; color: white; }
.grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px; }
.card { background: white; border-radius: 12px; padding: 20px 24px; border: 1px solid #E5E7EB; }
.label { font-size: 12px; color: #6B7280; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 6px; }
.value { font-size: 36px; font-weight: 700; color: #111827; line-height: 1; }
.unit { font-size: 14px; color: #9CA3AF; font-weight: 400; margin-left: 3px; }
.score-val { color: #3B82F6; }
.ping-val { color: #EF4444; }
.footer { text-align: center; color: #9CA3AF; font-size: 12px; margin-top: 28px; }
.badge { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 13px; font-weight: 600; background: #EFF6FF; color: #1E40AF; border: 1px solid #BFDBFE; margin-bottom: 8px; }
</style></head>
<body>
<div class="header">
  <div>
    <div class="brand">Genie<span>Connect</span></div>
    <div class="subtitle">Diagnóstico de Conexão</div>
  </div>
  <div>
    <div class="session">Sessão #${test.id}</div>
    <div class="date">${date}</div>
  </div>
</div>
<div class="grid">
  <div class="card"><div class="label">Score de Qualidade</div><div class="value score-val">${score}</div><div style="font-size:13px;color:#3B82F6;margin-top:4px;">${conn}</div></div>
  <div class="card"><div class="label">Ping médio</div><div class="value ping-val">${Number(test.ping_ms).toFixed(1)}<span class="unit">ms</span></div></div>
  <div class="card"><div class="label">Download</div><div class="value">${Number(test.download_mbps).toFixed(1)}<span class="unit">Mbps</span></div></div>
  <div class="card"><div class="label">Jitter</div><div class="value">${Number(test.jitter_ms).toFixed(1)}<span class="unit">ms</span></div></div>
</div>
<div class="footer">GenieConnect — Diagnóstico de Conexão Escolar</div>
</body></html>`;

  const win = window.open("", "_blank");
  if (win) { win.document.write(html); win.document.close(); win.focus(); setTimeout(() => win.print(), 600); }
}
