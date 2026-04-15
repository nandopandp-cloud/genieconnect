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

// ─── Rubricas (fonte única, espelho do lib/score.ts) ────────────────────────
// Duplicadas aqui para evitar import de módulo server-only em contexto client.
const RUBRICS = [
  {
    label: "Excelente",
    range: "80 – 100",
    color: "#10B981",
    bgColor: "#ECFDF5",
    guidance: "Sua conexão está em ótimas condições. A infraestrutura de rede suporta uso simultâneo intenso, transmissão de vídeo em alta definição e ferramentas digitais interativas sem interrupções. Continue monitorando periodicamente para garantir a estabilidade.",
  },
  {
    label: "Boa",
    range: "65 – 79",
    color: "#3B82F6",
    bgColor: "#EFF6FF",
    guidance: "Sua conexão é adequada para a maioria das atividades educacionais. Pequenas melhorias no roteador ou no plano de internet podem elevar ainda mais a experiência dos estudantes, especialmente em atividades com vídeo em tempo real.",
  },
  {
    label: "Moderada",
    range: "45 – 64",
    color: "#F59E0B",
    bgColor: "#FFFBEB",
    guidance: "Sua conexão apresenta desempenho intermediário. É possível utilizar ferramentas digitais básicas, mas atividades com streaming de vídeo ou uso simultâneo por muitos estudantes podem sofrer travamentos. Avalie a atualização do plano ou a otimização do roteador.",
  },
  {
    label: "Fraca",
    range: "0 – 44",
    color: "#EF4444",
    bgColor: "#FEF2F2",
    guidance: "Atenção: sua conexão está abaixo do mínimo recomendado para uso educacional em massa. Realize ajustes urgentes na infraestrutura de rede. A velocidade e estabilidade atuais não são adequadas para suportar o uso simultâneo dos seus estudantes.",
  },
];

function getRubric(score: number | null) {
  const s = score != null ? Number(score) : -1;
  if (s >= 80) return RUBRICS[0];
  if (s >= 65) return RUBRICS[1];
  if (s >= 45) return RUBRICS[2];
  return RUBRICS[3];
}

// ─── HTML para a tabela de legenda (usada nos dois PDFs) ────────────────────
const LEGEND_HTML = `
<div style="margin-top:24px;margin-bottom:24px">
  <div style="font-size:13px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px">Legenda de Rubricas</div>
  <table style="width:100%;border-collapse:collapse;border-radius:12px;overflow:hidden;border:1px solid #E5E7EB">
    <thead>
      <tr style="background:#F9FAFB;border-bottom:1px solid #E5E7EB">
        <th style="padding:8px 14px;text-align:left;font-size:10px;color:#6B7280;text-transform:uppercase;letter-spacing:0.5px;font-weight:600">Rubrica</th>
        <th style="padding:8px 14px;text-align:left;font-size:10px;color:#6B7280;text-transform:uppercase;letter-spacing:0.5px;font-weight:600">Score</th>
        <th style="padding:8px 14px;text-align:left;font-size:10px;color:#6B7280;text-transform:uppercase;letter-spacing:0.5px;font-weight:600">O que significa para sua escola</th>
      </tr>
    </thead>
    <tbody>
      ${RUBRICS.map((r, i) => `
      <tr style="border-bottom:1px solid #F3F4F6;background:${i % 2 !== 0 ? "#F9FAFB" : "white"}">
        <td style="padding:9px 14px">
          <span style="background:${r.color};color:white;font-size:11px;font-weight:700;padding:2px 10px;border-radius:999px">${r.label}</span>
        </td>
        <td style="padding:9px 14px;font-size:12px;color:#6B7280;font-weight:600;white-space:nowrap">${r.range}</td>
        <td style="padding:9px 14px;font-size:12px;color:#374151;line-height:1.5">${r.guidance}</td>
      </tr>`).join("")}
    </tbody>
  </table>
</div>`;

// ─── CSV ─────────────────────────────────────────────────────────────────────
export function downloadCSV(tests: HistoryTest[]): void {
  const BOM = "\uFEFF";
  const headers = ["#", "Data", "Escola", "Conexão", "Score", "Rubrica", "Ping (ms)", "Jitter (ms)", "Download (Mbps)", "Upload (Mbps)", "Orientação"];
  const rows = tests.map((t, i) => {
    const rubric = getRubric(t.score);
    return [
      i + 1,
      formatDate(t.created_at),
      t.school_name ?? "—",
      connectionLabel(t.connection_type, t.effective_type),
      t.score != null ? Number(t.score).toFixed(1) : "—",
      rubric.label,
      Number(t.ping_ms).toFixed(1),
      Number(t.jitter_ms).toFixed(1),
      Number(t.download_mbps).toFixed(2),
      Number(t.upload_mbps).toFixed(2),
      `"${rubric.guidance.replace(/"/g, '""')}"`,
    ];
  });

  const legendSection = [
    [],
    ["LEGENDA DE RUBRICAS"],
    ["Rubrica", "Score", "Orientação"],
    ...RUBRICS.map((r) => [r.label, r.range, `"${r.guidance.replace(/"/g, '""')}"`]),
  ];

  const csv = BOM + [headers, ...rows, ...legendSection].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `genieconnect-relatorios-${formatDateFilename(new Date())}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── XLSX ────────────────────────────────────────────────────────────────────
export async function downloadXLSX(tests: HistoryTest[]): Promise<void> {
  const XLSX = await import("xlsx");
  const ws = XLSX.utils.aoa_to_sheet([
    ["#", "Data", "Conexão", "Score", "Rubrica", "Orientação", "Ping (ms)", "Jitter (ms)", "Download (Mbps)", "Upload (Mbps)"],
    ...tests.map((t, i) => {
      const rubric = getRubric(t.score);
      return [
        i + 1,
        formatDate(t.created_at),
        connectionLabel(t.connection_type, t.effective_type),
        t.score != null ? Number(t.score) : null,
        rubric.label,
        rubric.guidance,
        Number(t.ping_ms),
        Number(t.jitter_ms),
        Number(t.download_mbps),
        Number(t.upload_mbps),
      ];
    }),
    [],
    ["LEGENDA DE RUBRICAS"],
    ["Rubrica", "Score", "Orientação"],
    ...RUBRICS.map((r) => [r.label, r.range, r.guidance]),
  ]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Relatórios");
  XLSX.writeFile(wb, `genieconnect-relatorios-${formatDateFilename(new Date())}.xlsx`);
}

// ─── PDF — todos os relatórios ───────────────────────────────────────────────
export function triggerAllPDF(tests: HistoryTest[]): void {
  const now = new Date();
  const rows = tests.map((t, i) => {
    const score = t.score != null ? Number(t.score).toFixed(1) : "—";
    const ping = Number(t.ping_ms).toFixed(1);
    const jitter = Number(t.jitter_ms).toFixed(1);
    const dl = Number(t.download_mbps).toFixed(2);
    const ul = Number(t.upload_mbps ?? 0).toFixed(2);
    const conn = connectionLabel(t.connection_type, t.effective_type);
    const rubric = getRubric(t.score);
    return `<tr>
      <td>${i + 1}</td>
      <td>${formatDate(t.created_at)}</td>
      <td>${t.school_name ?? "—"}</td>
      <td>${conn}</td>
      <td style="color:${rubric.color};font-weight:700">${score}</td>
      <td><span style="background:${rubric.color};color:white;font-size:10px;font-weight:700;padding:2px 8px;border-radius:999px">${rubric.label}</span></td>
      <td>${ping}</td>
      <td>${jitter}</td>
      <td>${dl}</td>
      <td style="color:#7C3AED;font-weight:600">${ul}</td>
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
    <th>#</th><th>Data</th><th>Escola</th><th>Conexão</th><th>Score</th><th>Rubrica</th><th>Ping (ms)</th><th>Jitter (ms)</th><th>Download (Mbps)</th><th>Upload (Mbps)</th>
  </tr></thead>
  <tbody>${rows}</tbody>
</table>
${LEGEND_HTML}
<div class="footer">GenieConnect — Diagnóstico de Conexão Escolar</div>
</body></html>`;

  const win = window.open("", "_blank");
  if (win) { win.document.write(html); win.document.close(); win.focus(); setTimeout(() => win.print(), 600); }
}

// ─── PDF — relatório individual ───────────────────────────────────────────────
export function triggerPDF(test: HistoryTest): void {
  const date = formatDate(test.created_at);
  const scoreNum = test.score != null ? Number(test.score) : null;
  const score = scoreNum != null ? scoreNum.toFixed(1) : "—";
  const conn = connectionLabel(test.connection_type, test.effective_type);
  const pingMs = Number(test.ping_ms);
  const jitterMs = Number(test.jitter_ms);
  const dlMbps = Number(test.download_mbps);
  const ulMbps = Number(test.upload_mbps ?? 0);

  const rubric = getRubric(scoreNum);

  // Ping color/label
  const pingColor = pingMs <= 50 ? "#10B981" : pingMs <= 100 ? "#3B82F6" : pingMs <= 250 ? "#F59E0B" : "#EF4444";
  const pingLabel = pingMs <= 50 ? "Ótimo" : pingMs <= 100 ? "Bom" : pingMs <= 250 ? "Moderado" : "Alto";

  // Download label
  const dlLabel = dlMbps >= 100 ? "Velocidade alta" : dlMbps >= 25 ? "Velocidade boa" : dlMbps >= 5 ? "Velocidade moderada" : "Velocidade baixa";

  // Upload label
  const ulLabel = ulMbps >= 50 ? "Upload excelente" : ulMbps >= 10 ? "Upload bom" : ulMbps >= 2 ? "Upload moderado" : ulMbps > 0 ? "Upload baixo" : "Não medido";

  // Jitter label
  const jitterLabel = jitterMs < 10 ? "Estável" : jitterMs < 30 ? "Moderado" : "Instável";

  // Ping min/max
  const pingMin = test.min_ping_ms != null ? Number(test.min_ping_ms).toFixed(1) : "—";
  const pingMax = test.max_ping_ms != null ? Number(test.max_ping_ms).toFixed(1) : "—";

  // Header right side
  const headerRight = test.school_name
    ? `<div style="text-align:right">
        <div style="font-size:20px;font-weight:700;color:white">${test.school_name}</div>
        <div style="color:rgba(255,255,255,0.5);font-size:13px;margin-top:4px">${date}</div>
      </div>`
    : `<div style="color:rgba(255,255,255,0.5);font-size:13px;text-align:right">${date}</div>`;

  // Quiz answers table
  const quizAnswers = Array.isArray(test.quiz_results) ? test.quiz_results : [];
  const quizSection = quizAnswers.length > 0 ? `
<div style="margin-top:24px">
  <div style="font-weight:700;font-size:15px;color:#111827;margin-bottom:12px">Respostas Detalhadas <span style="font-size:13px;font-weight:400;color:#6B7280">(${quizAnswers.length} questões)</span></div>
  <table style="width:100%;border-collapse:collapse;background:white;border-radius:12px;overflow:hidden;border:1px solid #E5E7EB;font-size:12px">
    <thead>
      <tr style="background:#F9FAFB;border-bottom:1px solid #E5E7EB">
        <th style="padding:8px 12px;text-align:left;color:#6B7280;font-weight:600;text-transform:uppercase;font-size:10px;letter-spacing:0.5px">#</th>
        <th style="padding:8px 12px;text-align:left;color:#6B7280;font-weight:600;text-transform:uppercase;font-size:10px;letter-spacing:0.5px">Pergunta</th>
        <th style="padding:8px 12px;text-align:left;color:#6B7280;font-weight:600;text-transform:uppercase;font-size:10px;letter-spacing:0.5px">Resposta dada</th>
        <th style="padding:8px 12px;text-align:left;color:#6B7280;font-weight:600;text-transform:uppercase;font-size:10px;letter-spacing:0.5px">Correta</th>
        <th style="padding:8px 12px;text-align:left;color:#6B7280;font-weight:600;text-transform:uppercase;font-size:10px;letter-spacing:0.5px">Tempo</th>
      </tr>
    </thead>
    <tbody>
      ${quizAnswers.map((a, i) => `
      <tr style="border-bottom:1px solid #F3F4F6;${i % 2 !== 0 ? "background:#F9FAFB" : ""}">
        <td style="padding:7px 12px;color:#9CA3AF">${i + 1}</td>
        <td style="padding:7px 12px;color:#374151;max-width:200px">${a.questionText}</td>
        <td style="padding:7px 12px;color:${a.isCorrect ? "#374151" : "#EF4444"};font-weight:${a.isCorrect ? "400" : "600"}">${a.givenAnswer}</td>
        <td style="padding:7px 12px;color:#10B981;font-weight:600">${a.correctAnswer}</td>
        <td style="padding:7px 12px;color:#9CA3AF;font-family:monospace">${(a.responseTimeMs / 1000).toFixed(2)}s</td>
      </tr>`).join("")}
    </tbody>
  </table>
</div>` : "";

  const html = `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8">
<title>Relatório GenieConnect${test.school_name ? " — " + test.school_name : ""}</title>
<style>
@media print { * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #EEF2F7; color: #111827; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; padding: 40px; }
.header { background: linear-gradient(135deg, #0F172A, #0A2040); color: white; border-radius: 16px; padding: 28px 32px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
.brand { font-size: 24px; font-weight: 800; }
.brand span { color: #38BDF8; }
.subtitle { color: rgba(255,255,255,0.6); font-size: 13px; margin-top: 4px; }
.grid4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 14px; }
.grid2 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 24px; }
.card { background: white; border-radius: 12px; padding: 18px 20px; border: 1px solid #E5E7EB; }
.card-sm { background: #F9FAFB; border-radius: 10px; padding: 14px 16px; border: 1px solid #E5E7EB; }
.lbl { font-size: 10px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.8px; font-weight: 600; margin-bottom: 6px; }
.val { font-size: 32px; font-weight: 700; color: #111827; line-height: 1; }
.val-sm { font-size: 20px; font-weight: 700; color: #111827; line-height: 1; }
.unit { font-size: 13px; color: #9CA3AF; font-weight: 400; margin-left: 2px; }
.sub { font-size: 12px; margin-top: 4px; }
.guidance { font-size: 11px; color: #374151; margin-top: 8px; line-height: 1.5; padding-top: 8px; border-top: 1px solid #E5E7EB; }
.section-title { font-size: 13px; font-weight: 700; color: #374151; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
.footer { text-align: center; color: #9CA3AF; font-size: 12px; margin-top: 28px; }
</style></head>
<body>
<div class="header">
  <div>
    <div class="brand">Genie<span>Connect</span></div>
    <div class="subtitle">Diagnóstico de Conexão</div>
  </div>
  ${headerRight}
</div>

<div class="section-title">Métricas Principais</div>
<div class="grid4">
  <div class="card">
    <div class="lbl">Score de Qualidade</div>
    <div class="val" style="color:${rubric.color}">${score}</div>
    <div class="sub" style="color:${rubric.color};font-weight:700">${rubric.label}</div>
    <div class="guidance">${rubric.guidance}</div>
  </div>
  <div class="card">
    <div class="lbl">Ping médio</div>
    <div class="val" style="color:${pingColor}">${pingMs.toFixed(1)}<span class="unit">ms</span></div>
    <div class="sub" style="color:${pingColor};font-weight:600">${pingLabel}</div>
  </div>
  <div class="card">
    <div class="lbl">Download</div>
    <div class="val" style="color:#059669">${dlMbps.toFixed(2)}<span class="unit">Mbps</span></div>
    <div class="sub" style="color:#6B7280">${dlLabel}</div>
  </div>
  <div class="card">
    <div class="lbl">Upload</div>
    <div class="val" style="color:#7C3AED">${ulMbps.toFixed(2)}<span class="unit">Mbps</span></div>
    <div class="sub" style="color:#6B7280">${ulLabel}</div>
  </div>
</div>

<div class="section-title">Indicadores de Rede</div>
<div class="grid2">
  <div class="card-sm">
    <div class="lbl">Ping mín / máx</div>
    <div class="val-sm">${pingMin}<span class="unit">/</span>${pingMax}<span class="unit">ms</span></div>
    <div class="sub" style="color:#9CA3AF">Variação de latência</div>
  </div>
  <div class="card-sm">
    <div class="lbl">Jitter</div>
    <div class="val-sm">${jitterMs.toFixed(1)}<span class="unit">ms</span></div>
    <div class="sub" style="color:#9CA3AF">${jitterLabel}</div>
  </div>
  <div class="card-sm">
    <div class="lbl">Tipo de rede</div>
    <div class="val-sm" style="font-size:18px;text-transform:capitalize">${test.effective_type}</div>
    <div class="sub" style="color:#9CA3AF;text-transform:capitalize">${test.connection_type}</div>
  </div>
  <div class="card-sm">
    <div class="lbl">Conexão</div>
    <div class="val-sm" style="font-size:18px;text-transform:capitalize">${test.connection_type}</div>
    <div class="sub" style="color:#9CA3AF;text-transform:capitalize">${test.effective_type}</div>
  </div>
</div>

${LEGEND_HTML}
${quizSection}
<div class="footer">GenieConnect — Diagnóstico de Conexão Escolar</div>
</body></html>`;

  const win = window.open("", "_blank");
  if (win) { win.document.write(html); win.document.close(); win.focus(); setTimeout(() => win.print(), 600); }
}
