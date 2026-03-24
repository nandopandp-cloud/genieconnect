import { TrendingDown, TrendingUp, Zap, BarChart2 } from "lucide-react";

interface Stats {
  total: number;
  avg_ping: number | null;
  avg_download: number | null;
  avg_upload: number | null;
  best_ping: number | null;
  best_download: number | null;
}

export function HistoryKpis({ stats }: { stats: Stats }) {
  function fmt(v: number | null, decimals = 1) {
    if (v === null || isNaN(v)) return "—";
    return Number(v).toFixed(decimals);
  }

  const kpis = [
    {
      label: "Testes realizados",
      value: stats.total.toString(),
      unit: "",
      icon: <BarChart2 size={18} />,
      color: "#00D4FF",
    },
    {
      label: "Ping médio",
      value: fmt(stats.avg_ping),
      unit: "ms",
      icon: <Zap size={18} />,
      color: "#f59e0b",
    },
    {
      label: "Download médio",
      value: fmt(stats.avg_download, 2),
      unit: "Mbps",
      icon: <TrendingDown size={18} />,
      color: "#22c55e",
    },
    {
      label: "Upload médio",
      value: fmt(stats.avg_upload, 2),
      unit: "Mbps",
      icon: <TrendingUp size={18} />,
      color: "#a78bfa",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {kpis.map((k) => (
        <div key={k.label} className="glass rounded-xl p-5">
          <div
            className="flex items-center gap-2 mb-3"
            style={{ color: k.color }}
          >
            {k.icon}
            <span className="text-xs uppercase tracking-wider text-white/40 font-medium">
              {k.label}
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-white">{k.value}</span>
            {k.unit && (
              <span className="text-sm text-white/40 font-medium">{k.unit}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
