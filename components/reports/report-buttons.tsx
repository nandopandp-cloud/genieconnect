"use client";
import { FileText, Download } from "lucide-react";
import { downloadCSV, triggerAllPDF } from "@/lib/report";
import type { HistoryTest } from "@/lib/types";

interface Props {
  tests: HistoryTest[];
}

export function ReportButtons({ tests }: Props) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={() => downloadCSV(tests)}
        className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-xl border border-gray-200 text-sm text-gray-600 font-medium hover:bg-gray-50 transition-all shadow-sm"
      >
        <FileText size={14} />
        CSV
      </button>
      <button
        onClick={() => triggerAllPDF(tests)}
        className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-xl border border-gray-200 text-sm text-gray-600 font-medium hover:bg-gray-50 transition-all shadow-sm"
      >
        <Download size={14} />
        PDF
      </button>
    </div>
  );
}
