export function calculateScore(
  pingMs: number,
  jitterMs: number,
  downloadMbps: number,
  uploadMbps: number = 0
): number {
  const pingScore = Math.max(0, Math.min(100, (1 - pingMs / 1000) * 100));
  const jitterScore = Math.max(0, Math.min(100, (1 - jitterMs / 500) * 100));
  const dlScore = Math.max(0, Math.min(100, (downloadMbps / 200) * 100));
  const ulScore = Math.max(0, Math.min(100, (uploadMbps / 50) * 100));
  const raw =
    pingScore * 0.25 +
    jitterScore * 0.15 +
    dlScore * 0.4 +
    ulScore * 0.2;
  return Math.round(raw * 10) / 10;
}

export interface ScoreInfo {
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
  /** Range descritivo para a legenda */
  range: string;
  /** Orientação educativa exibida no relatório */
  guidance: string;
}

export function getScoreInfo(score: number): ScoreInfo {
  if (score >= 80) return {
    label: "Excelente",
    color: "#10B981",
    bgColor: "#ECFDF5",
    textColor: "#065F46",
    range: "80 – 100",
    guidance: "Sua conexão está em ótimas condições. A infraestrutura de rede suporta uso simultâneo intenso, transmissão de vídeo em alta definição e ferramentas digitais interativas sem interrupções. Continue monitorando periodicamente para garantir a estabilidade.",
  };
  if (score >= 65) return {
    label: "Boa",
    color: "#3B82F6",
    bgColor: "#EFF6FF",
    textColor: "#1E40AF",
    range: "65 – 79",
    guidance: "Sua conexão é adequada para a maioria das atividades educacionais. Pequenas melhorias no roteador ou no plano de internet podem elevar ainda mais a experiência dos estudantes, especialmente em atividades com vídeo em tempo real.",
  };
  if (score >= 45) return {
    label: "Moderada",
    color: "#F59E0B",
    bgColor: "#FFFBEB",
    textColor: "#92400E",
    range: "45 – 64",
    guidance: "Sua conexão apresenta desempenho intermediário. É possível utilizar ferramentas digitais básicas, mas atividades com streaming de vídeo ou uso simultâneo por muitos estudantes podem sofrer travamentos. Avalie a atualização do plano ou a otimização do roteador.",
  };
  return {
    label: "Fraca",
    color: "#EF4444",
    bgColor: "#FEF2F2",
    textColor: "#991B1B",
    range: "0 – 44",
    guidance: "Atenção: sua conexão está abaixo do mínimo recomendado para uso educacional em massa. Realize ajustes urgentes na infraestrutura de rede. A velocidade e estabilidade atuais não são adequadas para suportar o uso simultâneo dos seus estudantes.",
  };
}

/** Todas as rubricas em ordem decrescente — use para renderizar a legenda. */
export const SCORE_RUBRICS: ScoreInfo[] = [
  getScoreInfo(100),
  getScoreInfo(70),
  getScoreInfo(50),
  getScoreInfo(0),
];

export function getPingInfo(pingMs: number): { label: string; color: string } {
  if (pingMs <= 50) return { label: "Ótimo", color: "#10B981" };
  if (pingMs <= 100) return { label: "Bom", color: "#3B82F6" };
  if (pingMs <= 250) return { label: "Moderado", color: "#F59E0B" };
  return { label: "Alto", color: "#EF4444" };
}

export function getDownloadInfo(mbps: number): { label: string } {
  if (mbps >= 100) return { label: "Velocidade alta" };
  if (mbps >= 25) return { label: "Velocidade boa" };
  if (mbps >= 5) return { label: "Velocidade moderada" };
  return { label: "Velocidade baixa" };
}

export function getUploadInfo(mbps: number): { label: string } {
  if (mbps >= 50) return { label: "Upload excelente" };
  if (mbps >= 10) return { label: "Upload bom" };
  if (mbps >= 2)  return { label: "Upload moderado" };
  if (mbps > 0)   return { label: "Upload baixo" };
  return { label: "Não medido" };
}
