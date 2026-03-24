"use client";
import { useState } from "react";
import { X } from "lucide-react";

interface Props {
  testId: number;
  currentSchool: string | null;
  onSave: (school: string) => void;
}

export function EditSchoolModal({ testId, currentSchool, onSave }: Props) {
  const [open, setOpen] = useState(false);
  const [school, setSchool] = useState(currentSchool || "");
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    try {
      await fetch(`/api/tests/${testId}/school`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ school: school || null }),
      });
      onSave(school);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors">
        <span>✎</span> Editar
      </button>
      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">Editar Escola/Instituição</h2>
              <button onClick={() => setOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg transition-all">
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <input
              type="text"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              placeholder="Nome da escola ou instituição"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 mb-5 bg-gray-50"
            />
            <div className="flex gap-3">
              <button onClick={() => setOpen(false)} className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-all">
                Cancelar
              </button>
              <button onClick={handleSave} disabled={loading} className="flex-1 px-4 py-2.5 rounded-lg text-white font-medium bg-gradient-to-r from-sky-500 to-cyan-500 hover:scale-[1.02] active:scale-95 disabled:opacity-50">
                {loading ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
