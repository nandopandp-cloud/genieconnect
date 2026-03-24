"use client";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Props {
  tests: { id: number; download_mbps: number }[];
}

export function DownloadChart({ tests }: Props) {
  // Show last 10 tests in chronological order (oldest first)
  const slice = [...tests].reverse().slice(-10);
  const data = slice.map((t) => ({
    name: `Teste ${t.id}`,
    download: Number(Number(t.download_mbps).toFixed(2)),
  }));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="font-bold text-gray-800 mb-0.5">Velocidade de Download</h2>
      <p className="text-xs text-gray-400 mb-5">
        Evolução dos últimos {slice.length} testes (Mbps)
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="dlGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: "#9CA3AF" }}
            interval={0}
            angle={-30}
            textAnchor="end"
            height={40}
          />
          <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 12 }}
            formatter={(v) => [`${v} Mbps`, "Download"]}
          />
          <Area
            type="monotone"
            dataKey="download"
            stroke="#10B981"
            strokeWidth={2}
            fill="url(#dlGradient)"
            dot={{ r: 3, fill: "#10B981", strokeWidth: 0 }}
            activeDot={{ r: 5, fill: "#10B981" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
