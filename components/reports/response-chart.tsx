"use client";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from "recharts";

interface Answer { isCorrect: boolean; responseTimeMs: number; }

export function ResponseChart({ answers }: { answers: Answer[] }) {
  const data = answers.map((a, i) => ({
    name: `Q${i + 1}`,
    time: Number((a.responseTimeMs / 1000).toFixed(2)),
    correct: a.isCorrect ? 1 : null,
    wrong: !a.isCorrect ? 1 : null,
  }));

  const avg = data.reduce((s, d) => s + d.time, 0) / data.length;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="font-bold text-gray-800 mb-1">Tempo de Resposta por Questão</h2>
      <p className="text-xs text-gray-400 mb-5">
        <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500 mr-1" />Pontos verdes = acerto &nbsp;
        <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-400 mr-1" />Pontos vermelhos = erro
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#9CA3AF" }} interval={4} />
          <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 12 }}
            formatter={(v) => [`${v}s`, "Tempo"]}
          />
          <ReferenceLine y={avg} stroke="#94A3B8" strokeDasharray="4 2" label={{ value: "Média", position: "right", fontSize: 10, fill: "#94A3B8" }} />
          <Area type="monotone" dataKey="time" stroke="#94A3B8" fill="#F1F5F9" strokeWidth={1.5} dot={(props) => {
            const { cx, cy, index } = props;
            const isCorrect = answers[index]?.isCorrect;
            return <circle key={index} cx={cx} cy={cy} r={4} fill={isCorrect ? "#10B981" : "#F87171"} stroke="white" strokeWidth={1} />;
          }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
