"use client";

import { useState } from "react";

interface Metric {
  label: string;
  value: number;
  unit: string;
  date: string;
}

interface PillarMetrics {
  name: string;
  metrics: Metric[];
}

function formatMetricValue(value: number, unit: string): string {
  if (unit === "USD") {
    if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    return `$${value.toLocaleString()}`;
  }
  if (unit === "NLe") return `NLe ${value.toLocaleString()}`;
  if (unit === "MWh") return `${value.toLocaleString()} MWh`;
  if (unit === "%") return `${value}%`;
  if (unit === "ratio") return value.toFixed(2);
  if (unit === "USc/kWh") return `${value} USc/kWh`;
  if (unit === "km") return `${value.toLocaleString()} km`;
  if (unit === "MW") return `${value} MW`;
  return value.toLocaleString() + (unit ? ` ${unit}` : "");
}

export default function SectorMetrics({
  metrics,
}: {
  metrics: Record<string, PillarMetrics>;
}) {
  const pillarIds = Object.keys(metrics);
  const [activeTab, setActiveTab] = useState(pillarIds[0]);
  const activePillar = metrics[activeTab];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-cdmu-navy">Sector Metrics</h2>

      <div className="flex gap-1 overflow-x-auto pb-1">
        {pillarIds.map((id) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === id
                ? "bg-cdmu-navy text-white"
                : "bg-cdmu-gray-100 text-cdmu-gray-700 hover:bg-cdmu-gray-200"
            }`}
          >
            Pillar {id}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-cdmu-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-cdmu-gray-100 bg-cdmu-gray-50">
          <h3 className="text-sm font-semibold text-cdmu-gray-700">
            {activePillar.name}
          </h3>
        </div>
        <div className="divide-y divide-cdmu-gray-100">
          {activePillar.metrics.map((metric, i) => (
            <div key={i} className="px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-cdmu-gray-700">{metric.label}</span>
              <div className="text-right">
                <span className="text-sm font-semibold text-cdmu-navy">
                  {formatMetricValue(metric.value, metric.unit)}
                </span>
                <span className="text-xs text-cdmu-gray-500 ml-2">({metric.date})</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
