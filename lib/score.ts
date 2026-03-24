export function calculateScore(pingMs: number, jitterMs: number, downloadMbps: number): number {
  const pingScore = Math.max(0, Math.min(100, (1 - pingMs / 1000) * 100));
  const jitterScore = Math.max(0, Math.min(100, (1 - jitterMs / 500) * 100));
  const dlScore = Math.max(0, Math.min(100, (downloadMbps / 200) * 100));
  const raw = pingScore * 0.3 + jitterScore * 0.2 + dlScore * 0.5;
  return Math.round(raw * 10) / 10;
}

export interface ScoreInfo {
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
}

export function getScoreInfo(score: number): ScoreInfo {
  if (score >= 80) return { label: "Excelente", color: "#10B981", bgColor: "#ECFDF5", textColor: "#065F46" };
  if (score >= 65) return { label: "Boa", color: "#3B82F6", bgColor: "#EFF6FF", textColor: "#1E40AF" };
  if (score >= 45) return { label: "Moderada", color: "#F59E0B", bgColor: "#FFFBEB", textColor: "#92400E" };
  return { label: "Fraca", color: "#EF4444", bgColor: "#FEF2F2", textColor: "#991B1B" };
}

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
