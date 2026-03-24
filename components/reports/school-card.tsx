"use client";
import { useState } from "react";
import { Building2, Check, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  testId: number;
  initialSchool: string | null;
}

export function SchoolCard({ testId, initialSchool }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initialSchool ?? "");
  const [displayed, setDisplayed] = useState(initialSchool);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/tests/${testId}/school`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schoolName: value.trim() || null }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data?.error ?? "Erro ao salvar. Verifique o banco de dados.");
      } else {
        setDisplayed(value.trim() || null);
        setEditing(false);
        router.refresh();
      }
    } catch {
      setError("Erro de conexão ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setValue(initialSchool ?? "");
    setEditing(false);
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Building2 size={15} className="text-gray-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase mb-1">
              Escola / Instituição
            </p>
            {error && <p className="text-xs text-red-500 mb-1">{error}</p>}
            {editing ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  autoFocus
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSave();
                    if (e.key === "Escape") handleCancel();
                  }}
                  placeholder="Nome da escola ou instituição"
                  className="flex-1 min-w-0 px-3 py-1.5 rounded-lg border border-sky-300 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="p-1.5 rounded-lg bg-sky-500 text-white hover:bg-sky-600 transition flex-shrink-0"
                >
                  <Check size={14} />
                </button>
                <button
                  onClick={handleCancel}
                  className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition flex-shrink-0"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <p
                className={`text-sm ${
                  displayed
                    ? "text-gray-800 font-medium"
                    : "text-gray-400 italic"
                }`}
              >
                {displayed || "Nenhuma escola informada"}
              </p>
            )}
          </div>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-sky-500 hover:text-sky-700 font-medium transition flex-shrink-0 mt-1"
          >
            ✎ Editar
          </button>
        )}
      </div>
    </div>
  );
}
