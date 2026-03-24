"use client";
import { useState } from "react";
import { FileText, FileSpreadsheet, Download, Trash2, Pencil, Check, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { triggerPDF, downloadCSV } from "@/lib/report";
import type { HistoryTest } from "@/lib/types";

interface Props { test: HistoryTest; schoolName: string; }

export function SessionActions({ test, schoolName }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(schoolName);
  const [saving, setSaving] = useState(false);

  async function saveSchool() {
    setSaving(true);
    await fetch(`/api/tests/${test.id}/school`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ schoolName: value.trim() || null }),
    });
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Excluir este diagnóstico permanentemente?")) return;
    await fetch(`/api/tests/${test.id}`, { method: "DELETE" });
    router.push("/relatorios");
  }

  return (
    <div className="flex flex-col gap-3">
      {/* School inline editor */}
      <div className="flex items-center gap-2">
        {editing ? (
          <>
            <input
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") saveSchool(); if (e.key === "Escape") setEditing(false); }}
              placeholder="Nome da escola"
              className="px-3 py-1.5 rounded-lg border border-sky-300 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-400 w-48"
            />
            <button onClick={saveSchool} disabled={saving} className="p-1.5 rounded-lg bg-sky-500 text-white hover:bg-sky-600 transition">
              <Check size={14} />
            </button>
            <button onClick={() => { setValue(schoolName); setEditing(false); }} className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition">
              <X size={14} />
            </button>
          </>
        ) : (
          <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-sky-500 transition">
            <Pencil size={13} /> Editar escola
          </button>
        )}
      </div>

      {/* Export + delete buttons */}
      <div className="flex gap-2 flex-wrap">
        {[
          { label: "CSV", icon: FileText, action: () => downloadCSV([test]) },
          { label: "XLSX", icon: FileSpreadsheet, action: async () => { const { downloadXLSX } = await import("@/lib/report"); downloadXLSX([test]); } },
          { label: "PDF", icon: Download, action: () => triggerPDF(test) },
        ].map(({ label, icon: Icon, action }) => (
          <button key={label} onClick={action}
            className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-xl border border-gray-200 text-sm text-gray-600 font-medium hover:bg-gray-50 transition-all shadow-sm">
            <Icon size={14} /> {label}
          </button>
        ))}
        <button onClick={handleDelete}
          className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-xl border border-red-200 text-sm text-red-500 font-medium hover:bg-red-50 transition-all shadow-sm">
          <Trash2 size={14} /> Excluir
        </button>
      </div>
    </div>
  );
}
