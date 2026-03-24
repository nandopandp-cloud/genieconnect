"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Wifi, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Erro ao fazer login.");
        setLoading(false);
        return;
      }

      router.push("/inicio");
    } catch {
      setError("Erro de conexão. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — dark */}
      <div
        className="hidden md:flex w-[42%] flex-col items-center justify-center relative px-10 py-12"
        style={{ background: "linear-gradient(160deg, #0B1628 0%, #0E2040 50%, #0A1A35 100%)" }}
      >
        {/* Logo top-left */}
        <div className="absolute top-8 left-8 flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0EA5E9, #06B6D4)" }}>
            <Wifi size={18} className="text-white" />
          </div>
          <span className="font-bold text-lg text-white tracking-tight">
            GenieConnect
          </span>
        </div>

        {/* Mascot + text */}
        <div className="flex flex-col items-center text-center max-w-sm">
          <Image
            src="/geniebot.png"
            alt="GenieBot"
            width={260}
            height={260}
            className="mb-6"
            style={{ objectFit: "contain" }}
            priority
          />
          <h2 className="text-2xl md:text-3xl font-bold text-white leading-snug mb-4">
            Diagnóstico de<br />conexão para escolas
          </h2>
          <p className="text-sm text-white/40 leading-relaxed">
            Teste a qualidade do Wi-Fi com 50 questões automáticas e obtenha relatórios detalhados em segundos.
          </p>
        </div>
      </div>

      {/* Right panel — light */}
      <div
        className="flex-1 flex items-center justify-center px-6 py-12"
        style={{ background: "#F0F6FB" }}
      >
        <form onSubmit={handleSubmit} className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center justify-center gap-2 mb-8 md:hidden">
            <Image src="/geniebot.png" alt="GenieBot" width={44} height={44} />
            <span className="font-bold text-xl tracking-tight">
              <span className="text-gray-900">Genie</span>
              <span className="text-sky-500">Connect</span>
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Bem-vindo de volta!
          </h1>
          <p className="text-sm text-gray-400 mb-8">
            Entre para acessar seus relatórios de conexão.
          </p>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* E-mail */}
          <div className="mb-5">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all"
            />
          </div>

          {/* Senha */}
          <div className="mb-8">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
              Senha
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Entrar button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl text-white font-semibold text-sm transition-all disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #0EA5E9, #22D3EE)" }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
