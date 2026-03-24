"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowUpDown, ArrowRight } from "lucide-react";
import { connectionLabel, formatDateShort } from "@/lib/utils";
import { getScoreInfo } from "@/lib/score";
import type { HistoryTest } from "@/lib/types";

type SortKey = "created_at" | "score" | "ping_ms" | "jitter_ms" | "download_mbps";

export function TestsTable({ tests }: { tests: HistoryTest[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const sorted = [...tests].sort((a, b) => {
    const va = a[sortKey];
    const vb = b[sortKey];
    if (typeof va === "string" && typeof vb === "string") {
      return sortDir === "desc" ? vb.localeCompare(va) : va.localeCompare(vb);
    }
    const na = va == null ? -Infinity : Number(va);
    const nb = vb == null ? -Infinity : Number(vb);
    return sortDir === "desc" ? nb - na : na - nb;
  });

  const SortBtn = ({ k, label }: { k: SortKey; label: string }) => (
    <button
      onClick={() => toggleSort(k)}
      className="flex items-center gap-1 hover:text-gray-700 transition-colors"
    >
      {label}
      <ArrowUpDown
        size={11}
        className={sortKey === k ? "text-sky-500" : "text-gray-300"}
      />
    </button>
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="font-bold text-gray-800">Histórico de Testes</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-5 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wider">
                <SortBtn k="created_at" label="Data" />
              </th>
              <th className="text-left px-5 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wider">
                Escola
              </th>
              <th className="text-left px-5 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wider">
                <SortBtn k="score" label="Score" />
              </th>
              <th className="text-left px-5 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wider">
                <SortBtn k="ping_ms" label="Ping" />
              </th>
              <th className="text-left px-5 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wider">
                <SortBtn k="jitter_ms" label="Jitter" />
              </th>
              <th className="text-left px-5 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wider">
                <SortBtn k="download_mbps" label="Download" />
              </th>
              <th className="text-left px-5 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wider">
                Conexão
              </th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-gray-400 text-sm">
                  Nenhum teste realizado ainda.
                </td>
              </tr>
            ) : (
              sorted.map((t, i) => {
                const scoreInfo = t.score != null ? getScoreInfo(t.score) : null;
                return (
                  <tr
                    key={t.id}
                    className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                      i % 2 === 0 ? "" : "bg-gray-50/50"
                    }`}
                  >
                    <td className="px-5 py-3.5 text-gray-500 text-xs">
                      {formatDateShort(t.created_at)}
                    </td>
                    <td className="px-5 py-3.5 text-xs max-w-[140px]">
                      {t.school_name ? (
                        <span className="text-gray-700 font-medium truncate block">{t.school_name}</span>
                      ) : (
                        <span className="text-gray-300 italic">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      {scoreInfo ? (
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                          style={{ background: scoreInfo.bgColor, color: scoreInfo.textColor }}
                        >
                          {t.score != null ? Number(t.score).toFixed(1) : "—"}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-amber-500 text-xs font-medium">
                      {Number(t.ping_ms).toFixed(1)} ms
                    </td>
                    <td className="px-5 py-3.5 font-mono text-purple-400 text-xs font-medium">
                      {Number(t.jitter_ms).toFixed(1)} ms
                    </td>
                    <td className="px-5 py-3.5 font-mono text-emerald-600 text-xs font-semibold">
                      {Number(t.download_mbps).toFixed(2)} Mbps
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 text-xs">
                      {connectionLabel(t.connection_type, t.effective_type)}
                    </td>
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/relatorios/${t.id}`}
                        className="flex items-center gap-1 text-xs text-sky-500 hover:text-sky-700 font-medium transition-colors"
                      >
                        Ver
                        <ArrowRight size={12} />
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
