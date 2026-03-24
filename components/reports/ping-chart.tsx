"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Props {
  tests: { id: number; ping_ms: number; jitter_ms: number }[];
}

export function PingChart({ tests }: Props) {
  // Show last 10 tests in chronological order (oldest first)
  const slice = [...tests].reverse().slice(-10);
  const data = slice.map((t) => ({
    name: `Teste ${t.id}`,
    ping: Number(Number(t.ping_ms).toFixed(1)),
    jitter: Number(Number(t.jitter_ms).toFixed(1)),
  }));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="font-bold text-gray-800 mb-0.5">Ping &amp; Jitter</h2>
      <p className="text-xs text-gray-400 mb-5">
        Latência e variação por teste (ms)
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
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
            formatter={(v, name) => [
              `${v} ms`,
              name === "ping" ? "Ping" : "Jitter",
            ]}
          />
          <Legend
            formatter={(value) => (value === "ping" ? "Ping" : "Jitter")}
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          />
          <Bar dataKey="ping" fill="#F87171" radius={[4, 4, 0, 0]} maxBarSize={20} />
          <Bar dataKey="jitter" fill="#C4B5FD" radius={[4, 4, 0, 0]} maxBarSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
