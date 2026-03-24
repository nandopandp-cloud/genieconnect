"use client";

interface Props {
  mbps: number;
  maxMbps?: number;
}

export function SpeedometerScreen({ mbps, maxMbps = 100 }: Props) {
  const SIZE = 260;
  const CX = SIZE / 2;
  const CY = SIZE / 2 + 20;
  const R = 100;

  // Arc goes from 210° to -30° (240° sweep), clockwise
  const START_DEG = 210;
  const SWEEP = 240;

  function degToRad(d: number) {
    return (d * Math.PI) / 180;
  }

  function polarToXY(deg: number, r: number) {
    const rad = degToRad(deg);
    return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
  }

  function arcPath(startDeg: number, endDeg: number, r: number) {
    const s = polarToXY(startDeg, r);
    const e = polarToXY(endDeg, r);
    const largeArc = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y}`;
  }

  const pct = Math.min(mbps / maxMbps, 1);
  const needleDeg = START_DEG + pct * SWEEP;

  // Needle tip and base
  const tip = polarToXY(needleDeg, R - 18);
  const base1 = polarToXY(needleDeg + 90, 8);
  const base2 = polarToXY(needleDeg - 90, 8);

  // Ticks
  const ticks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center max-w-xs w-full">
        <p className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase mb-4">
          Medindo velocidade de download...
        </p>

        <svg width={SIZE} height={SIZE * 0.7} viewBox={`0 0 ${SIZE} ${SIZE * 0.7}`}>
          {/* Background arc */}
          <path
            d={arcPath(START_DEG, START_DEG + SWEEP, R)}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="16"
            strokeLinecap="round"
          />

          {/* Colored progress arc */}
          {pct > 0 && (
            <path
              d={arcPath(START_DEG, START_DEG + pct * SWEEP, R)}
              fill="none"
              stroke={mbps < 10 ? "#EF4444" : mbps < 30 ? "#F59E0B" : "#10B981"}
              strokeWidth="16"
              strokeLinecap="round"
            />
          )}

          {/* Tick marks */}
          {ticks.map((t) => {
            const deg = START_DEG + t * SWEEP;
            const inner = polarToXY(deg, R - 28);
            const outer = polarToXY(deg, R - 10);
            return (
              <line
                key={t}
                x1={inner.x} y1={inner.y}
                x2={outer.x} y2={outer.y}
                stroke="#9CA3AF"
                strokeWidth="2"
                strokeLinecap="round"
              />
            );
          })}

          {/* Needle */}
          <polygon
            points={`${tip.x},${tip.y} ${base1.x},${base1.y} ${base2.x},${base2.y}`}
            fill="#0EA5E9"
          />

          {/* Center cap */}
          <circle cx={CX} cy={CY} r="7" fill="#0EA5E9" />
          <circle cx={CX} cy={CY} r="3" fill="white" />
        </svg>

        {/* Value */}
        <div className="mt-2 text-center">
          <span className="text-4xl font-bold text-gray-900">
            {mbps.toFixed(1)}
          </span>
          <span className="text-sm text-gray-400 ml-1">Mbps</span>
        </div>
      </div>
    </div>
  );
}
