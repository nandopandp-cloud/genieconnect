"use client";

const CX = 150;
const CY = 138;
const R = 105;
const TRACK_W = 14;
const START_DEG = 120; // 7 o'clock in SVG angles
const SWEEP = 300;     // total arc sweep

function degToRad(d: number) {
  return (d * Math.PI) / 180;
}

function polarToXY(deg: number, r: number) {
  const rad = degToRad(deg);
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

// Two-segment scale: 0–100 maps to first half, 100–1000 maps to second half
function mbpsToPct(mbps: number): number {
  if (mbps <= 0) return 0;
  if (mbps <= 100) return (mbps / 100) * 0.5;
  return 0.5 + ((mbps - 100) / 900) * 0.5;
}

function arcPath(startDeg: number, sweepDeg: number, r: number) {
  if (sweepDeg <= 0) return "";
  const s = polarToXY(startDeg, r);
  const e = polarToXY(startDeg + sweepDeg, r);
  const largeArc = sweepDeg > 180 ? 1 : 0;
  return `M ${s.x.toFixed(3)} ${s.y.toFixed(3)} A ${r} ${r} 0 ${largeArc} 1 ${e.x.toFixed(3)} ${e.y.toFixed(3)}`;
}

const SCALE_LABELS = [0, 5, 10, 50, 100, 250, 500, 750, 1000];

interface Props {
  mbps: number;
}

export function SpeedometerScreen({ mbps }: Props) {
  const clamped = Math.max(0, Math.min(mbps, 1000));
  const pct = mbpsToPct(clamped);
  const activeSweep = pct * SWEEP;
  const needleDeg = START_DEG + activeSweep;

  const tip = polarToXY(needleDeg, R - 24);
  const b1 = polarToXY(needleDeg + 90, 5);
  const b2 = polarToXY(needleDeg - 90, 5);

  // Gradient end-point follows the active arc midpoint
  const gradMid = polarToXY(START_DEG + activeSweep * 0.5, R);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <p className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase mb-5">
        Medindo velocidade de download...
      </p>

      <svg
        width="300"
        height="265"
        viewBox="0 0 300 265"
        style={{ filter: "drop-shadow(0 12px 40px rgba(6,182,212,0.18))" }}
      >
        <defs>
          <radialGradient id="spBg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0E2236" />
            <stop offset="100%" stopColor="#071422" />
          </radialGradient>
          <linearGradient
            id="spArc"
            gradientUnits="userSpaceOnUse"
            x1={polarToXY(START_DEG, R).x}
            y1={polarToXY(START_DEG, R).y}
            x2={gradMid.x}
            y2={gradMid.y}
          >
            <stop offset="0%" stopColor="#67E8F9" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>

        {/* Dark background circle */}
        <circle cx={CX} cy={CY} r="133" fill="url(#spBg)" />
        <circle cx={CX} cy={CY} r="131" fill="none" stroke="#0C1E30" strokeWidth="2" />

        {/* Track arc */}
        <path
          d={arcPath(START_DEG, SWEEP, R)}
          fill="none"
          stroke="#142436"
          strokeWidth={TRACK_W}
          strokeLinecap="round"
        />

        {/* Active colored arc */}
        {activeSweep > 1 && (
          <path
            d={arcPath(START_DEG, activeSweep, R)}
            fill="none"
            stroke="url(#spArc)"
            strokeWidth={TRACK_W}
            strokeLinecap="round"
          />
        )}

        {/* Scale labels */}
        {SCALE_LABELS.map((v) => {
          const p = mbpsToPct(v);
          const deg = START_DEG + p * SWEEP;
          const pos = polarToXY(deg, R + 24);
          const passed = p <= pct;
          return (
            <text
              key={v}
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="9"
              fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
              fill={passed ? "#67E8F9" : "#2E4A62"}
            >
              {v}
            </text>
          );
        })}

        {/* Needle */}
        <polygon
          points={`${tip.x.toFixed(2)},${tip.y.toFixed(2)} ${b1.x.toFixed(2)},${b1.y.toFixed(2)} ${b2.x.toFixed(2)},${b2.y.toFixed(2)}`}
          fill="rgba(255,255,255,0.88)"
        />
        {/* Hub */}
        <circle cx={CX} cy={CY} r="9" fill="#0C1E2E" />
        <circle cx={CX} cy={CY} r="5" fill="#22D3EE" opacity="0.7" />

        {/* Value */}
        <text
          x={CX}
          y={CY + 42}
          textAnchor="middle"
          fontSize="44"
          fontWeight="300"
          fill="white"
          fontFamily="-apple-system, 'Helvetica Neue', sans-serif"
          letterSpacing="-1"
        >
          {clamped.toFixed(2)}
        </text>

        {/* Unit */}
        <text
          x={CX}
          y={CY + 64}
          textAnchor="middle"
          fontSize="11"
          fill="#22D3EE"
          fontFamily="-apple-system, sans-serif"
          letterSpacing="1"
        >
          ↓ Mbps
        </text>
      </svg>
    </div>
  );
}
