"use client";
import { useState, type ReactNode } from "react";
import { Activity, Wifi, Clock, Play, Upload } from "lucide-react";
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
    <div className="min-h-screen" style={{ background: "#F0F4F8" }}>
      {navbar}
      <main className="max-w-2xl mx-auto px-4 py-16 flex flex-col items-center text-center">
        {/* Mascot with float animation */}
        <div className="animate-fade-in mb-2">
          <Mascot size={100} className="mx-auto md:hidden animate-genie-float" />
          <Mascot size={160} className="mx-auto hidden md:block animate-genie-float" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3 animate-fade-up delay-100">
          Diagnóstico de Conexão
        </h1>
        <p className="text-gray-500 mb-8 max-w-md leading-relaxed animate-fade-up delay-150">
          O Genie responderá <strong className="text-gray-700">50 questões</strong> automaticamente
          enquanto mede a{" "}
          <strong className="text-gray-700">qualidade da sua rede Wi-Fi</strong> em tempo real.
        </p>

        {/* Feature badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10 w-full max-w-sm">
          {[
            { icon: Activity, label: "Ping, jitter e latência" },
            { icon: Wifi,     label: "Velocidade de download" },
            { icon: Upload,   label: "Velocidade de upload" },
            { icon: Clock,    label: "Duração: menos de 5 min" },
          ].map(({ icon: Icon, label }, i) => (
            <div
              key={label}
              className="flex items-center gap-2.5 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm hover-lift animate-fade-up"
              style={{ animationDelay: `${200 + i * 70}ms` }}
            >
              <Icon size={15} className="text-sky-500 flex-shrink-0" />
              <span className="text-sm text-gray-600 font-medium text-left">{label}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => setStarted(true)}
          className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl font-bold text-white text-base transition-all hover:opacity-90 hover:scale-105 active:scale-95 shadow-lg shadow-sky-200 animate-fade-up delay-500"
          style={{ background: "linear-gradient(135deg, #0EA5E9, #38BDF8)" }}
        >
          <Play size={18} fill="white" />
          Iniciar Diagnóstico
        </button>
      </main>
    </div>
  );
}
