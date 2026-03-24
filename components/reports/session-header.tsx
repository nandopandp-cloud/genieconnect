"use client";
import { FileText, Download, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { downloadCSV, triggerPDF } from "@/lib/report";
import type { HistoryTest } from "@/lib/types";

interface Props {
  test: HistoryTest;
}

export function SessionHeader({ test }: Props) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Excluir este diagnóstico permanentemente? Esta ação não pode ser desfeita.")) return;
    await fetch(`/api/tests/${test.id}`, { method: "DELETE" });
    router.push("/relatorios");
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={() => downloadCSV([test])}
        className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-xl border border-gray-200 text-sm text-gray-600 font-medium hover:bg-gray-50 transition-all shadow-sm"
      >
        <FileText size={14} />
        CSV
      </button>
      <button
        onClick={() => triggerPDF(test)}
        className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-xl border border-gray-200 text-sm text-gray-600 font-medium hover:bg-gray-50 transition-all shadow-sm"
      >
        <Download size={14} />
        PDF
      </button>
      <button
        onClick={handleDelete}
        className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-xl border border-red-200 text-sm text-red-500 font-medium hover:bg-red-50 transition-all shadow-sm"
      >
        <Trash2 size={14} />
        Excluir
      </button>
    </div>
  );
}
