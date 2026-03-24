"use client";

import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: string;
  unit: string;
  isActive: boolean;
  isDone: boolean;
  icon: React.ReactNode;
}

export function MetricCard({ label, value, unit, isActive, isDone, icon }: Props) {
  return (
    <div
      className={cn(
        "glass rounded-xl p-4 flex flex-col gap-1 transition-all duration-500",
        isActive && "glass-cyan glow-cyan scale-[1.02]",
        isDone && !isActive && "border-[rgba(0,212,255,0.15)]"
      )}
    >
      <div className="flex items-center gap-2 text-white/40 text-xs font-medium uppercase tracking-wider">
        <span
          className={cn(
            "transition-colors duration-300",
            isActive ? "text-[#00D4FF]" : "text-white/30"
          )}
        >
          {icon}
        </span>
        {label}
      </div>
      <div className="flex items-baseline gap-1 mt-1">
        <span
          className={cn(
            "text-3xl font-bold transition-colors duration-300",
            isActive ? "text-[#00D4FF]" : isDone ? "text-white" : "text-white/25"
          )}
        >
          {value}
        </span>
        {value !== "—" && (
          <span className="text-sm text-white/40 font-medium">{unit}</span>
        )}
      </div>
    </div>
  );
}
