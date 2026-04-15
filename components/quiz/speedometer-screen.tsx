"use client";

const CX = 150;
const CY = 142;
const R = 108;
const TRACK_W = 14;
const START_DEG = 120;
const SWEEP = 300;

function degToRad(d: number) {
  return (d * Math.PI) / 180;
}

function polarToXY(deg: number, r: number) {
  const rad = degToRad(deg);
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

// 0–100 → first 50% of arc, 100–1000 → second 50%
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
  direction?: "download" | "upload";
}

export function SpeedometerScreen({ mbps, direction = "download" }: Props) {
  const isUp = direction === "upload";
  const clamped = Math.max(0, Math.min(mbps, 1000));
  const pct = mbpsToPct(clamped);
  const activeSweep = pct * SWEEP;
  const needleDeg = START_DEG + activeSweep;

  const tip = polarToXY(needleDeg, R - 26);
  const b1 = polarToXY(needleDeg + 90, 5);
  const b2 = polarToXY(needleDeg - 90, 5);

  // Gradient follows the arc from start to current midpoint
  const gradStart = polarToXY(START_DEG, R);
  const gradEnd = polarToXY(START_DEG + Math.max(activeSweep, 60) * 0.6, R);

  // Color theme: cyan for download, violet for upload
  const arcColor = isUp ? "url(#spArcUp)" : "url(#spArc)";
  const hubColor  = isUp ? "#8B5CF6" : "#0EA5E9";
  const glowColor = isUp
    ? "0 0 24px rgba(139,92,246,0.35)"
    : "0 0 24px rgba(14,165,233,0.35)";

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <p className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase mb-6 animate-fade-down">
        {isUp ? "Medindo velocidade de upload..." : "Medindo velocidade de download..."}
      </p>

      <div
        className="bg-white rounded-3xl border border-gray-100 px-6 pt-6 pb-5 animate-scale-in"
        style={{ boxShadow: `0 4px 32px rgba(0,0,0,0.06), ${glowColor}` }}
      >
        <svg width="288" height="240" viewBox="0 0 300 252">
          <defs>
            {/* Download gradient: sky blue */}
            <linearGradient
              id="spArc"
              gradientUnits="userSpaceOnUse"
              x1={gradStart.x}
              y1={gradStart.y}
              x2={gradEnd.x}
              y2={gradEnd.y}
            >
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#0EA5E9" />
            </linearGradient>

            {/* Upload gradient: violet */}
            <linearGradient
              id="spArcUp"
              gradientUnits="userSpaceOnUse"
              x1={gradStart.x}
              y1={gradStart.y}
              x2={gradEnd.x}
              y2={gradEnd.y}
            >
              <stop offset="0%" stopColor="#A78BFA" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>
          </defs>

          {/* Track arc */}
          <path
            d={arcPath(START_DEG, SWEEP, R)}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={TRACK_W}
            strokeLinecap="round"
          />

          {/* Active arc */}
          {activeSweep > 1 && (
            <path
              d={arcPath(START_DEG, activeSweep, R)}
              fill="none"
              stroke={arcColor}
              strokeWidth={TRACK_W}
              strokeLinecap="round"
            />
          )}

          {/* Scale labels */}
          {SCALE_LABELS.map((v) => {
            const p = mbpsToPct(v);
            const deg = START_DEG + p * SWEEP;
            const pos = polarToXY(deg, R + 22);
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
                fill={passed ? hubColor : "#9CA3AF"}
              >
                {v}
              </text>
            );
          })}

          {/* Needle */}
          <polygon
            points={`${tip.x.toFixed(2)},${tip.y.toFixed(2)} ${b1.x.toFixed(2)},${b1.y.toFixed(2)} ${b2.x.toFixed(2)},${b2.y.toFixed(2)}`}
            fill={hubColor}
            opacity="0.9"
          />

          {/* Hub */}
          <circle cx={CX} cy={CY} r="9" fill="#F0F4F8" />
          <circle cx={CX} cy={CY} r="5" fill={hubColor} />

          {/* Value */}
          <text
            x={CX}
            y={CY + 44}
            textAnchor="middle"
            fontSize="44"
            fontWeight="700"
            fill="#111827"
            fontFamily="-apple-system, 'Helvetica Neue', sans-serif"
            letterSpacing="-1"
          >
            {clamped.toFixed(2)}
          </text>

          {/* Unit */}
          <text
            x={CX}
            y={CY + 66}
            textAnchor="middle"
            fontSize="11"
            fill={hubColor}
            fontFamily="-apple-system, sans-serif"
            letterSpacing="1"
            fontWeight="500"
          >
            {isUp ? "↑ Mbps" : "↓ Mbps"}
          </text>
        </svg>
      </div>
    </div>
  );
}
