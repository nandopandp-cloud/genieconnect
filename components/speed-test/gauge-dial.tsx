"use client";

import { useEffect, useRef } from "react";

interface Props {
  value: number; // in Mbps (or ms for ping)
  max?: number;
  label: string;
  unit: string;
  isActive: boolean;
  color?: string;
}

export function GaugeDial({
  value,
  max = 1000,
  label,
  unit,
  isActive,
  color = "#00D4FF",
}: Props) {
  const size = 280;
  const strokeWidth = 14;
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;

  // Arc: 225° start → -45° end (270° sweep, bottom-left to bottom-right)
  const startAngle = 225;
  const endAngle = -45;
  const sweepAngle = 270;

  function polarToCartesian(angle: number) {
    const rad = ((angle - 90) * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    };
  }

  function describeArc(start: number, sweep: number) {
    const s = polarToCartesian(start);
    const e = polarToCartesian(start - sweep);
    const largeArc = sweep > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 0 ${e.x} ${e.y}`;
  }

  const circumference = (sweepAngle / 360) * (2 * Math.PI * r);
  const clampedValue = Math.min(Math.max(value, 0), max);
  const progress = clampedValue / max;
  const offset = circumference * (1 - progress);

  const displayValue =
    value >= 100 ? value.toFixed(0) : value > 0 ? value.toFixed(1) : "0";

  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="drop-shadow-lg"
      >
        {/* Background arc track */}
        <path
          d={describeArc(startAngle, sweepAngle)}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Progress arc */}
        <path
          d={describeArc(startAngle, sweepAngle)}
          fill="none"
          stroke={isActive ? color : "rgba(255,255,255,0.15)"}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 0.4s ease, stroke 0.5s ease",
            filter: isActive ? `drop-shadow(0 0 8px ${color}88)` : "none",
          }}
        />
        {/* Glow dot at progress end (only when active) */}
        {isActive && progress > 0 && (
          <circle
            cx={
              cx +
              r *
                Math.cos(
                  ((startAngle - progress * sweepAngle - 90) * Math.PI) / 180
                )
            }
            cy={
              cy +
              r *
                Math.sin(
                  ((startAngle - progress * sweepAngle - 90) * Math.PI) / 180
                )
            }
            r={strokeWidth / 2 + 2}
            fill={color}
            style={{ filter: `drop-shadow(0 0 6px ${color})` }}
          />
        )}
        {/* Center value */}
        <text
          x={cx}
          y={cy - 12}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={isActive ? color : "rgba(255,255,255,0.5)"}
          fontSize="48"
          fontWeight="700"
          fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          style={{ transition: "fill 0.5s ease" }}
        >
          {displayValue}
        </text>
        <text
          x={cx}
          y={cy + 32}
          textAnchor="middle"
          fill="rgba(255,255,255,0.4)"
          fontSize="14"
          fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        >
          {unit}
        </text>
        {/* Min/Max labels */}
        <text
          x={polarToCartesian(startAngle).x}
          y={polarToCartesian(startAngle).y + 18}
          textAnchor="middle"
          fill="rgba(255,255,255,0.25)"
          fontSize="11"
          fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        >
          0
        </text>
        <text
          x={polarToCartesian(endAngle).x}
          y={polarToCartesian(endAngle).y + 18}
          textAnchor="middle"
          fill="rgba(255,255,255,0.25)"
          fontSize="11"
          fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        >
          {max >= 1000 ? `${max / 1000}k` : max}
        </text>
      </svg>
      <span className="text-sm font-medium tracking-wide uppercase text-white/40">
        {label}
      </span>
    </div>
  );
}
