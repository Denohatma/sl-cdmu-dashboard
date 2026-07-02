"use client";

import type { KPI } from "@/lib/types";

function formatValue(value: number, unit: string): string {
  if (unit === "USD") {
    if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(0)}M`;
    return `$${value.toLocaleString()}`;
  }
  if (unit === "%") return `${value}%`;
  return value.toLocaleString();
}

function Speedometer({ current, baseline, target, unit }: { current: number; baseline: number; target: number; unit: string }) {
  const progress = target === baseline ? 100 : ((current - baseline) / (target - baseline)) * 100;
  const clamped = Math.max(0, Math.min(100, progress));

  const startAngle = -225;
  const endAngle = 45;
  const totalSweep = endAngle - startAngle;
  const needleAngle = startAngle + (totalSweep * clamped) / 100;

  const r = 40;
  const cx = 50;
  const cy = 52;

  function polarToXY(angleDeg: number, radius: number) {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  }

  const arcStart = polarToXY(startAngle, r);
  const arcEnd = polarToXY(endAngle, r);
  const filledEnd = polarToXY(startAngle + (totalSweep * clamped) / 100, r);
  const largeArc = totalSweep > 180 ? 1 : 0;
  const filledSweep = totalSweep * clamped / 100;
  const filledLarge = filledSweep > 180 ? 1 : 0;

  const needleTip = polarToXY(needleAngle, r - 4);
  const needleBase1 = polarToXY(needleAngle + 90, 3);
  const needleBase2 = polarToXY(needleAngle - 90, 3);

  const zones = [
    { from: 0, to: 25, color: "#E74C3C" },
    { from: 25, to: 50, color: "#F39C12" },
    { from: 50, to: 75, color: "#F7C948" },
    { from: 75, to: 100, color: "#1EB53A" },
  ];

  const ticks = [0, 25, 50, 75, 100];

  return (
    <div className="relative w-32 h-28 mx-auto">
      <svg viewBox="0 0 100 70" className="w-full h-full">
        {zones.map((zone) => {
          const zoneStart = polarToXY(startAngle + (totalSweep * zone.from) / 100, r);
          const zoneEnd = polarToXY(startAngle + (totalSweep * zone.to) / 100, r);
          const sweep = (totalSweep * (zone.to - zone.from)) / 100;
          return (
            <path
              key={zone.from}
              d={`M ${zoneStart.x} ${zoneStart.y} A ${r} ${r} 0 ${sweep > 180 ? 1 : 0} 1 ${zoneEnd.x} ${zoneEnd.y}`}
              fill="none"
              stroke={zone.color}
              strokeWidth="6"
              opacity={0.25}
            />
          );
        })}

        <path
          d={`M ${arcStart.x} ${arcStart.y} A ${r} ${r} 0 ${filledLarge} 1 ${filledEnd.x} ${filledEnd.y}`}
          fill="none"
          stroke={clamped >= 75 ? "#1EB53A" : clamped >= 50 ? "#F7C948" : clamped >= 25 ? "#F39C12" : "#E74C3C"}
          strokeWidth="6"
          strokeLinecap="round"
          className="transition-all duration-700"
        />

        {ticks.map((t) => {
          const angle = startAngle + (totalSweep * t) / 100;
          const outer = polarToXY(angle, r + 2);
          const inner = polarToXY(angle, r - 2);
          const label = polarToXY(angle, r + 8);
          return (
            <g key={t}>
              <line x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke="#94A3B8" strokeWidth="1" />
              <text x={label.x} y={label.y} textAnchor="middle" dominantBaseline="middle" className="fill-gray-400" fontSize="5">
                {t}
              </text>
            </g>
          );
        })}

        <polygon
          points={`${needleTip.x},${needleTip.y} ${needleBase1.x},${needleBase1.y} ${needleBase2.x},${needleBase2.y}`}
          fill="#334155"
          className="transition-all duration-700"
        />
        <circle cx={cx} cy={cy} r="3.5" fill="#334155" />
        <circle cx={cx} cy={cy} r="2" fill="white" />
      </svg>
      <div className="absolute bottom-0 left-0 right-0 text-center">
        <span className="text-lg font-bold text-cdmu-gray-900">
          {formatValue(current, unit)}
        </span>
        <span className="text-[10px] text-cdmu-gray-500 ml-1">({clamped.toFixed(0)}%)</span>
      </div>
    </div>
  );
}

function KPICard({ kpi }: { kpi: KPI }) {
  return (
    <div className="bg-white rounded-xl border border-cdmu-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-xs font-semibold text-cdmu-gray-700">{kpi.label}</h3>
        <span className="text-[9px] text-white bg-cdmu-blue px-1.5 py-0.5 rounded-full font-medium">
          {kpi.target_year}
        </span>
      </div>

      <Speedometer current={kpi.current} baseline={kpi.baseline} target={kpi.target} unit={kpi.unit} />

      <div className="flex items-center justify-between mt-2 px-2">
        <div className="text-center">
          <div className="text-[10px] text-cdmu-gray-500 uppercase tracking-wider">Baseline</div>
          <div className="text-sm font-bold text-cdmu-red">
            {formatValue(kpi.baseline, kpi.unit)}
          </div>
          <div className="text-[10px] text-cdmu-gray-400">{kpi.baseline_year}</div>
        </div>
        <div className="flex-1 mx-3 flex items-center">
          <div className="flex-1 h-px bg-cdmu-gray-300" />
          <svg className="w-4 h-4 text-cdmu-green mx-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          <div className="flex-1 h-px bg-cdmu-gray-300" />
        </div>
        <div className="text-center">
          <div className="text-[10px] text-cdmu-gray-500 uppercase tracking-wider">Target</div>
          <div className="text-sm font-bold text-cdmu-green">
            {formatValue(kpi.target, kpi.unit)}
          </div>
          <div className="text-[10px] text-cdmu-gray-400">{kpi.target_year}</div>
        </div>
      </div>

      {kpi.breakdown && (
        <div className="mt-3 pt-3 border-t border-cdmu-gray-100">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {Object.entries(kpi.breakdown).map(([key, val]) => (
              <div key={key} className="flex items-center justify-between text-xs">
                <span className="text-cdmu-gray-500 capitalize truncate mr-1">
                  {key.replace(/_/g, " ")}
                </span>
                <span className="font-medium text-cdmu-gray-700 whitespace-nowrap">
                  <span className="text-cdmu-red">{val.baseline}{kpi.unit === "%" ? "%" : ""}</span>
                  {" "}→{" "}
                  <span className="text-cdmu-green">{val.target}{kpi.unit === "%" ? "%" : ""}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function KPIScorecard({ kpis }: { kpis: KPI[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <img src="/logos/flag.png" alt="" className="w-6 h-4 rounded-sm" />
        <h2 className="text-lg font-semibold text-cdmu-green-dark">
          Compact Targets
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {kpis.map((kpi) => (
          <KPICard key={kpi.id} kpi={kpi} />
        ))}
      </div>
    </div>
  );
}
