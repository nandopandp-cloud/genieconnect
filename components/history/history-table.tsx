"use client";

import { useState } from "react";
import { Download, ArrowUpDown } from "lucide-react";
import { connectionLabel } from "@/lib/utils";
import { downloadCSV } from "@/lib/report";
import type { HistoryTest } from "@/lib/types";

type SortKey = "created_at" | "ping_ms" | "download_mbps" | "upload_mbps";

export function HistoryTable({ tests }: { tests: HistoryTest[] }) {
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
      return sortDir === "desc"
        ? vb.localeCompare(va)
        : va.localeCompare(vb);
    }
    return sortDir === "desc"
      ? (vb as number) - (va as number)
      : (va as number) - (vb as number);
  });

  function formatDate(d: string) {
    return new Date(d).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const SortIcon = ({ k }: { k: SortKey }) => (
    <ArrowUpDown
      size={12}
      className={sortKey === k ? "text-[#00D4FF]" : "text-white/20"}
    />
  );

  return (
    <div className="glass rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
        <h2 className="font-semibold text-white">Histórico de Testes</h2>
        <button
          onClick={() => downloadCSV(tests)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg glass-cyan text-[#00D4FF] text-sm font-medium hover:bg-[rgba(0,212,255,0.1)] transition-all"
        >
          <Download size={14} />
          Exportar CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.05]">
              {[
                { label: "Data", key: "created_at" as SortKey },
                { label: "Conexão", key: null },
                { label: "Ping (ms)", key: "ping_ms" as SortKey },
                { label: "Jitter (ms)", key: null },
                { label: "Download", key: "download_mbps" as SortKey },
                { label: "Upload", key: "upload_mbps" as SortKey },
              ].map((col) => (
                <th
                  key={col.label}
                  className="text-left px-5 py-3 text-white/40 font-medium text-xs uppercase tracking-wider"
                >
                  {col.key ? (
                    <button
                      className="flex items-center gap-1 hover:text-white/60 transition-colors"
                      onClick={() => toggleSort(col.key!)}
                    >
                      {col.label} <SortIcon k={col.key} />
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-white/30">
                  Nenhum teste realizado ainda.
                </td>
              </tr>
            ) : (
              sorted.map((t, i) => (
                <tr
                  key={t.id}
                  className={`border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors ${
                    i % 2 === 0 ? "" : "bg-white/[0.01]"
                  }`}
                >
                  <td className="px-5 py-3.5 text-white/60">
                    {formatDate(t.created_at)}
                  </td>
                  <td className="px-5 py-3.5 text-white/70">
                    {connectionLabel(t.connection_type, t.effective_type)}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-amber-400">
                    {Number(t.ping_ms).toFixed(1)}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-white/60">
                    {Number(t.jitter_ms).toFixed(1)}
                  </td>
                  <td className="px-5 py-3.5 font-mono font-semibold text-[#00D4FF]">
                    {Number(t.download_mbps).toFixed(2)} Mbps
                  </td>
                  <td className="px-5 py-3.5 font-mono font-semibold text-purple-400">
                    {Number(t.upload_mbps).toFixed(2)} Mbps
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
