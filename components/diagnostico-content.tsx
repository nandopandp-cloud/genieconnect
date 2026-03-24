"use client";
import { useState, type ReactNode } from "react";
import { Activity, Wifi, Clock, Play } from "lucide-react";
import { Mascot } from "@/components/mascot";
import { QuizShell } from "@/components/quiz/quiz-shell";

interface Props {
  navbar: ReactNode;
}

export function DiagnosticoContent({ navbar }: Props) {
  const [started, setStarted] = useState(false);

  if (started) {
    return (
      <div className="min-h-screen" style={{ background: "#F0F4F8" }}>
        {navbar}
        <main className="max-w-3xl mx-auto px-4 py-10">
          <QuizShell />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ background: "#F0F4F8" }}>
      {navbar}
      <main className="max-w-2xl mx-auto px-4 py-16 flex flex-col items-center text-center">
        <Mascot size={160} className="mx-auto mb-4 animate-genie-pulse" />

        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Diagnóstico de Conexão
        </h1>
        <p className="text-gray-500 mb-8 max-w-md leading-relaxed">
          O Genie responderá <strong className="text-gray-700">50 questões</strong> automaticamente
          enquanto mede a{" "}
          <strong className="text-gray-700">qualidade da sua rede Wi-Fi</strong> em tempo real.
        </p>

        {/* Feature badges */}
        <div className="grid grid-cols-2 gap-3 mb-10 w-full max-w-sm">
          {[
            { icon: Activity, label: "Ping, jitter e latência" },
            { icon: Wifi, label: "Velocidade de download" },
            { icon: Clock, label: "Duração: menos de 5 min" },
            { icon: Activity, label: "Relatório automático" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2.5 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm"
            >
              <Icon size={15} className="text-sky-500 flex-shrink-0" />
              <span className="text-sm text-gray-600 font-medium text-left">{label}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => setStarted(true)}
          className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl font-bold text-white text-base transition-all hover:opacity-90 shadow-lg shadow-sky-200"
          style={{ background: "linear-gradient(135deg, #0EA5E9, #38BDF8)" }}
        >
          <Play size={18} fill="white" />
          Iniciar Diagnóstico
        </button>
      </main>
    </div>
  );
}
