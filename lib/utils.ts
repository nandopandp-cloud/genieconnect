import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export function connectionLabel(type: string, effective: string): string {
  if (type === "wifi") return "Wi-Fi";
  if (type === "cellular") {
    const m: Record<string, string> = { "4g": "4G", "3g": "3G", "2g": "2G", "slow-2g": "2G", "5g": "5G", "unknown": "Celular" };
    return m[effective] ?? "Celular";
  }
  if (type === "ethernet") return "Ethernet";
  return "Desconhecido";
}

export function formatDate(d: string) {
  return new Date(d).toLocaleString("pt-BR", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export function formatDateShort(d: string) {
  return new Date(d).toLocaleString("pt-BR", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });
}
