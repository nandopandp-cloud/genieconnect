import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GenieConnect — Diagnóstico de Conexão",
  description: "Diagnóstico inteligente da sua conexão de internet para escolas.",
  icons: {
    icon: "/geniebot.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
