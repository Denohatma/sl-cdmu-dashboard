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

/* ---------- Formatting ---------- */

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

/* ---------- Results Framework ---------- */

type ResultLevel = "impact" | "outcome" | "output" | "activity";
type FrameworkStatus = "on_track" | "at_risk" | "off_track" | "not_started";

interface ResultsChainItem {
  level: ResultLevel;
  description: string;
  status: FrameworkStatus;
  count: number;
}

const RESULTS_CHAIN: ResultsChainItem[] = [
  { level: "impact", description: "78% electricity access for 6.6M Sierra Leoneans by 2030", status: "on_track", count: 1 },
  { level: "outcome", description: "Increased generation, expanded grid, off-grid deployment, sector viability", status: "on_track", count: 5 },
  { level: "output", description: "Infrastructure built, PPAs signed, mini-grids deployed, reforms enacted", status: "at_risk", count: 17 },
  { level: "activity", description: "Procurement, construction, policy drafting, capacity building, M&E", status: "on_track", count: 42 },
];

const LEVEL_CONFIG: Record<ResultLevel, { label: string; bg: string; border: string; text: string; icon: string }> = {
  impact: { label: "Impact", bg: "bg-cdmu-green/10", border: "border-cdmu-green", text: "text-cdmu-green", icon: "M5 3l14 9-14 9V3z" },
  outcome: { label: "Outcomes", bg: "bg-cdmu-blue/10", border: "border-cdmu-blue", text: "text-cdmu-blue", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
  output: { label: "Outputs", bg: "bg-cdmu-gold/10", border: "border-cdmu-gold", text: "text-cdmu-gold", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
  activity: { label: "Activities", bg: "bg-cdmu-teal/10", border: "border-cdmu-teal", text: "text-cdmu-teal", icon: "M4 6h16M4 10h16M4 14h16M4 18h16" },
};

const STATUS_LABEL: Record<FrameworkStatus, { label: string; dot: string }> = {
  on_track: { label: "On Track", dot: "bg-cdmu-green" },
  at_risk: { label: "At Risk", dot: "bg-cdmu-gold" },
  off_track: { label: "Off Track", dot: "bg-cdmu-red" },
  not_started: { label: "Not Started", dot: "bg-cdmu-gray-300" },
};

function ResultsFramework() {
  return (
    <div className="bg-white rounded-xl border border-cdmu-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-cdmu-gray-100 bg-cdmu-navy">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="text-sm font-bold text-white">Results Framework Summary</h3>
        </div>
        <p className="text-[10px] text-white/60 mt-0.5">Mission 300 National Energy Compact - Theory of Change</p>
      </div>

      <div className="p-4">
        <div className="relative">
          {RESULTS_CHAIN.map((item, i) => {
            const config = LEVEL_CONFIG[item.level];
            const statusCfg = STATUS_LABEL[item.status];
            return (
              <div key={item.level} className="relative">
                {i < RESULTS_CHAIN.length - 1 && (
                  <div className="absolute left-6 top-14 bottom-0 w-0.5 bg-cdmu-gray-200 z-0" />
                )}
                <div className={`relative z-10 flex items-start gap-3 p-3 rounded-lg border-l-4 ${config.bg} ${config.border} mb-3`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${config.bg} shrink-0 mt-0.5`}>
                    <svg className={`w-4 h-4 ${config.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={config.icon} />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${config.text} uppercase tracking-wider`}>{config.label}</span>
                        <span className="text-[10px] text-cdmu-gray-500 bg-cdmu-gray-100 px-1.5 py-0.5 rounded-full">{item.count} indicator{item.count !== 1 ? "s" : ""}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${statusCfg.dot}`} />
                        <span className="text-[10px] font-medium text-cdmu-gray-600">{statusCfg.label}</span>
                      </div>
                    </div>
                    <p className="text-xs text-cdmu-gray-700 mt-1">{item.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ---------- KPI Data Generation ---------- */

type RAGStatus = "green" | "amber" | "red";

interface KPIRow {
  pillarId: string;
  pillarName: string;
  indicator: string;
  baseline: number;
  current: number;
  target: number;
  unit: string;
  pctAchieved: number;
  rag: RAGStatus;
  dataSource: string;
  frequency: string;
  date: string;
}

const DATA_SOURCES: Record<string, string> = {
  MW: "EDSA / EGTC",
  MWh: "EDSA Generation Reports",
  "USc/kWh": "EWRC Tariff Orders",
  km: "EDSA / EGTC Network Registry",
  USD: "MoF / CDMU Financial Tracker",
  NLe: "MoF Budget Data",
  "%": "EDSA Performance Reports",
  ratio: "EDSA Collections Data",
  connections: "EDSA / REA Registry",
  systems: "REA / DARES",
  units: "MoEWR / REA",
  customers: "EDSA CIS",
};

const FREQUENCIES: Record<string, string> = {
  MW: "Quarterly",
  MWh: "Monthly",
  "USc/kWh": "Annual",
  km: "Semi-annual",
  USD: "Quarterly",
  NLe: "Quarterly",
  "%": "Quarterly",
  ratio: "Monthly",
  connections: "Monthly",
  systems: "Quarterly",
  units: "Semi-annual",
  customers: "Monthly",
};

function roundDerived(v: number, unit: string): number {
  if (unit === "ratio") return Math.round(v * 100) / 100;
  if (v >= 1000) return Math.round(v);
  return Math.round(v * 100) / 100;
}

function deriveTarget(value: number, unit: string): number {
  if (unit === "%") {
    if (value > 40) return roundDerived(Math.min(value * 0.6, value - 15), unit);
    return roundDerived(value * 1.5, unit);
  }
  if (unit === "ratio") return roundDerived(Math.min(value * 1.6, 0.95), unit);
  if (unit === "USc/kWh") return roundDerived(value * 0.85, unit);
  if (unit === "NLe") return roundDerived(value * 0.5, unit);
  return roundDerived(value * 1.35, unit);
}

function deriveBaseline(value: number, unit: string): number {
  if (unit === "%") {
    if (value > 40) return roundDerived(Math.min(value * 1.2, 65), unit);
    return roundDerived(value * 0.7, unit);
  }
  if (unit === "ratio") return roundDerived(value * 0.7, unit);
  return roundDerived(value * 0.75, unit);
}

function calcRAG(pct: number): RAGStatus {
  if (pct >= 65) return "green";
  if (pct >= 35) return "amber";
  return "red";
}

function buildKPIRows(metrics: Record<string, PillarMetrics>): KPIRow[] {
  const rows: KPIRow[] = [];
  for (const [pillarId, pillar] of Object.entries(metrics)) {
    for (const m of pillar.metrics) {
      const baseline = deriveBaseline(m.value, m.unit);
      const target = deriveTarget(m.value, m.unit);

      const isReductionMetric = m.unit === "%" && m.value > 40 || m.unit === "USc/kWh" || m.unit === "NLe";
      let pctAchieved: number;
      if (isReductionMetric) {
        pctAchieved = target === baseline ? 100 : ((baseline - m.value) / (baseline - target)) * 100;
      } else {
        pctAchieved = target === baseline ? 100 : ((m.value - baseline) / (target - baseline)) * 100;
      }
      pctAchieved = Math.max(0, Math.min(100, Math.round(pctAchieved)));

      rows.push({
        pillarId,
        pillarName: pillar.name,
        indicator: m.label,
        baseline,
        current: m.value,
        target,
        unit: m.unit,
        pctAchieved,
        rag: calcRAG(pctAchieved),
        dataSource: DATA_SOURCES[m.unit] || "CDMU Records",
        frequency: FREQUENCIES[m.unit] || "Quarterly",
        date: m.date,
      });
    }
  }
  return rows;
}

/* ---------- RAG Badge ---------- */

const RAG_CONFIG: Record<RAGStatus, { bg: string; text: string; label: string; barColor: string }> = {
  green: { bg: "bg-green-100", text: "text-green-800", label: "On Track", barColor: "bg-cdmu-green" },
  amber: { bg: "bg-amber-100", text: "text-amber-800", label: "At Risk", barColor: "bg-cdmu-gold" },
  red: { bg: "bg-red-100", text: "text-red-800", label: "Off Track", barColor: "bg-cdmu-red" },
};

function RAGBadge({ rag }: { rag: RAGStatus }) {
  const cfg = RAG_CONFIG[rag];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${rag === "green" ? "bg-green-600" : rag === "amber" ? "bg-amber-600" : "bg-red-600"}`} />
      {cfg.label}
    </span>
  );
}

/* ---------- Notes Edit Modal ---------- */

function NotesModal({
  indicator,
  note,
  onSave,
  onClose,
}: {
  indicator: string;
  note: string;
  onSave: (note: string) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(note);

  return (
    <div className="fixed inset-0 z-[9000] flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-cdmu-navy text-sm">Edit Notes</h3>
          <button onClick={onClose} className="text-cdmu-gray-400 hover:text-cdmu-gray-700">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-cdmu-gray-600 block mb-1">Indicator</label>
            <p className="text-sm text-cdmu-gray-800 bg-cdmu-gray-50 rounded-lg p-2">{indicator}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-cdmu-gray-600 block mb-1">M&E Notes</label>
            <textarea
              className="w-full text-sm border border-cdmu-gray-200 rounded-lg px-3 py-2 h-28 resize-none focus:outline-none focus:ring-2 focus:ring-cdmu-blue/40 focus:border-cdmu-blue"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Add monitoring notes, data quality observations, action items..."
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => { onSave(draft); onClose(); }}
              className="flex-1 bg-cdmu-blue text-white text-sm font-medium py-2 rounded-lg hover:opacity-90 transition-colors"
            >
              Save Notes
            </button>
            <button
              onClick={onClose}
              className="px-4 text-sm text-cdmu-gray-500 hover:text-cdmu-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- KPI Progress Table ---------- */

function KPIProgressTable({
  rows,
  notes,
  onEditNote,
}: {
  rows: KPIRow[];
  notes: Record<string, string>;
  onEditNote: (indicator: string) => void;
}) {
  const [activePillar, setActivePillar] = useState<string>("all");
  const pillarIds = [...new Set(rows.map((r) => r.pillarId))];
  const filtered = activePillar === "all" ? rows : rows.filter((r) => r.pillarId === activePillar);

  const greenCount = filtered.filter((r) => r.rag === "green").length;
  const amberCount = filtered.filter((r) => r.rag === "amber").length;
  const redCount = filtered.filter((r) => r.rag === "red").length;

  return (
    <div className="bg-white rounded-xl border border-cdmu-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-cdmu-gray-100 bg-cdmu-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-cdmu-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-sm font-bold text-cdmu-navy">KPI Progress Tracker</h3>
          </div>
          <div className="flex items-center gap-3 text-[10px]">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cdmu-green" />{greenCount} On Track</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cdmu-gold" />{amberCount} At Risk</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cdmu-red" />{redCount} Off Track</span>
          </div>
        </div>
      </div>

      <div className="px-4 py-2 border-b border-cdmu-gray-100 flex gap-1 overflow-x-auto">
        <button
          onClick={() => setActivePillar("all")}
          className={`px-3 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors ${
            activePillar === "all" ? "bg-cdmu-navy text-white" : "bg-cdmu-gray-100 text-cdmu-gray-700 hover:bg-cdmu-gray-200"
          }`}
        >
          All Pillars
        </button>
        {pillarIds.map((id) => (
          <button
            key={id}
            onClick={() => setActivePillar(id)}
            className={`px-3 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors ${
              activePillar === id ? "bg-cdmu-navy text-white" : "bg-cdmu-gray-100 text-cdmu-gray-700 hover:bg-cdmu-gray-200"
            }`}
          >
            Pillar {id}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-cdmu-gray-50 border-b border-cdmu-gray-200">
              <th className="text-left px-3 py-2 font-semibold text-cdmu-gray-600 whitespace-nowrap">Indicator</th>
              <th className="text-right px-3 py-2 font-semibold text-cdmu-gray-600 whitespace-nowrap">Baseline</th>
              <th className="text-right px-3 py-2 font-semibold text-cdmu-gray-600 whitespace-nowrap">Current</th>
              <th className="text-right px-3 py-2 font-semibold text-cdmu-gray-600 whitespace-nowrap">Target</th>
              <th className="text-center px-3 py-2 font-semibold text-cdmu-gray-600 whitespace-nowrap w-32">Progress</th>
              <th className="text-center px-3 py-2 font-semibold text-cdmu-gray-600 whitespace-nowrap">RAG</th>
              <th className="text-left px-3 py-2 font-semibold text-cdmu-gray-600 whitespace-nowrap">Source</th>
              <th className="text-center px-3 py-2 font-semibold text-cdmu-gray-600 whitespace-nowrap">Freq.</th>
              <th className="text-center px-3 py-2 font-semibold text-cdmu-gray-600 whitespace-nowrap w-8">Notes</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => {
              const ragCfg = RAG_CONFIG[row.rag];
              const showPillarHeader = i === 0 || filtered[i - 1].pillarId !== row.pillarId;
              return (
                <Fragment key={`${row.pillarId}-${row.indicator}`}>
                  {showPillarHeader && (
                    <tr className="bg-cdmu-navy/5">
                      <td colSpan={9} className="px-3 py-1.5">
                        <span className="text-[10px] font-bold text-cdmu-navy uppercase tracking-wider">
                          Pillar {row.pillarId}: {row.pillarName}
                        </span>
                      </td>
                    </tr>
                  )}
                  <tr className="border-t border-cdmu-gray-100 hover:bg-cdmu-gray-50/80 transition-colors">
                    <td className="px-3 py-2.5">
                      <span className="font-medium text-cdmu-gray-800">{row.indicator}</span>
                      {notes[row.indicator] && (
                        <p className="text-[10px] text-cdmu-gray-500 mt-0.5 truncate max-w-[180px]" title={notes[row.indicator]}>
                          {notes[row.indicator]}
                        </p>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right text-cdmu-gray-600 whitespace-nowrap">{formatMetricValue(row.baseline, row.unit)}</td>
                    <td className="px-3 py-2.5 text-right font-semibold text-cdmu-navy whitespace-nowrap">{formatMetricValue(row.current, row.unit)}</td>
                    <td className="px-3 py-2.5 text-right text-cdmu-gray-600 whitespace-nowrap">{formatMetricValue(row.target, row.unit)}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-cdmu-gray-100 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all duration-500 ${ragCfg.barColor}`}
                            style={{ width: `${row.pctAchieved}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-cdmu-gray-700 w-8 text-right">{row.pctAchieved}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-center"><RAGBadge rag={row.rag} /></td>
                    <td className="px-3 py-2.5 text-cdmu-gray-500 whitespace-nowrap">{row.dataSource}</td>
                    <td className="px-3 py-2.5 text-center text-cdmu-gray-500 whitespace-nowrap">{row.frequency}</td>
                    <td className="px-3 py-2.5 text-center">
                      <button
                        onClick={() => onEditNote(row.indicator)}
                        className="text-cdmu-gray-400 hover:text-cdmu-blue transition-colors"
                        title="Edit notes"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------- Data Quality Scorecard ---------- */

interface QualityDimension {
  dimension: string;
  score: number;
  description: string;
  issues: string;
}

const DATA_QUALITY: QualityDimension[] = [
  { dimension: "Timeliness", score: 78, description: "Data reported within scheduled deadlines", issues: "2 pillars reported 1 week late in Q2 2026" },
  { dimension: "Completeness", score: 85, description: "All required indicators with data entries", issues: "3 indicators missing disaggregated data" },
  { dimension: "Accuracy", score: 72, description: "Data verified through secondary sources", issues: "Mini-grid connection data awaiting REA reconciliation" },
  { dimension: "Consistency", score: 81, description: "Alignment across reporting periods", issues: "EDSA loss figures use different methodology vs. EWRC" },
  { dimension: "Availability", score: 90, description: "Indicators accessible in M&E system", issues: "All indicators entered; 2 pending verification" },
];

function qualityColor(score: number): string {
  if (score >= 80) return "bg-cdmu-green";
  if (score >= 60) return "bg-cdmu-gold";
  return "bg-cdmu-red";
}

function qualityTextColor(score: number): string {
  if (score >= 80) return "text-cdmu-green";
  if (score >= 60) return "text-cdmu-gold";
  return "text-cdmu-red";
}

function DataQualityScorecard() {
  const avgScore = Math.round(DATA_QUALITY.reduce((s, d) => s + d.score, 0) / DATA_QUALITY.length);

  return (
    <div className="bg-white rounded-xl border border-cdmu-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-cdmu-gray-100 bg-cdmu-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-cdmu-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <h3 className="text-sm font-bold text-cdmu-navy">Data Quality Scorecard</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-cdmu-gray-500">Overall Score</span>
            <span className={`text-sm font-bold ${qualityTextColor(avgScore)}`}>{avgScore}%</span>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-5 gap-3 mb-4">
          {DATA_QUALITY.map((d) => (
            <div key={d.dimension} className="text-center">
              <div className="relative w-14 h-14 mx-auto mb-2">
                <svg viewBox="0 0 36 36" className="w-14 h-14 transform -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#F1F5F9" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="15.9" fill="none"
                    stroke={d.score >= 80 ? "#1EB53A" : d.score >= 60 ? "#D4A017" : "#E74C3C"}
                    strokeWidth="3"
                    strokeDasharray={`${d.score} ${100 - d.score}`}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-xs font-bold ${qualityTextColor(d.score)}`}>{d.score}%</span>
                </div>
              </div>
              <p className="text-[10px] font-semibold text-cdmu-gray-700">{d.dimension}</p>
            </div>
          ))}
        </div>

        <div className="divide-y divide-cdmu-gray-100">
          {DATA_QUALITY.map((d) => (
            <div key={d.dimension} className="flex items-start gap-3 py-2">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-cdmu-gray-700">{d.dimension}</span>
                  <span className={`text-xs font-bold ${qualityTextColor(d.score)}`}>{d.score}%</span>
                </div>
                <div className="w-full bg-cdmu-gray-100 rounded-full h-1.5 mb-1">
                  <div className={`h-1.5 rounded-full transition-all duration-500 ${qualityColor(d.score)}`} style={{ width: `${d.score}%` }} />
                </div>
                <p className="text-[10px] text-cdmu-gray-500">{d.description}</p>
                {d.issues && (
                  <p className="text-[10px] text-cdmu-amber mt-0.5">
                    <span className="font-medium">Issue:</span> {d.issues}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Reporting Calendar ---------- */

interface ReportEvent {
  title: string;
  date: string;
  type: "quarterly" | "annual" | "special";
  status: "upcoming" | "due_soon" | "overdue";
  responsible: string;
}

const REPORT_EVENTS: ReportEvent[] = [
  { title: "Q2 2026 Quarterly Progress Report", date: "15 Jul 2026", type: "quarterly", status: "due_soon", responsible: "CDMU M&E Unit" },
  { title: "Mid-Year Performance Review", date: "31 Jul 2026", type: "special", status: "upcoming", responsible: "CDMU Director" },
  { title: "Q3 2026 Quarterly Progress Report", date: "15 Oct 2026", type: "quarterly", status: "upcoming", responsible: "CDMU M&E Unit" },
  { title: "Annual Compact Performance Report 2026", date: "31 Jan 2027", type: "annual", status: "upcoming", responsible: "CDMU / MoEWR" },
  { title: "Q4 2026 Quarterly Progress Report", date: "15 Jan 2027", type: "quarterly", status: "upcoming", responsible: "CDMU M&E Unit" },
  { title: "Independent Evaluation — Year 2", date: "Mar 2027", type: "special", status: "upcoming", responsible: "External Evaluator" },
];

const EVENT_TYPE_STYLES: Record<string, { bg: string; text: string }> = {
  quarterly: { bg: "bg-blue-100", text: "text-blue-800" },
  annual: { bg: "bg-purple-100", text: "text-purple-800" },
  special: { bg: "bg-cdmu-gold/20", text: "text-cdmu-gold" },
};

const EVENT_STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  upcoming: { bg: "bg-cdmu-gray-100", text: "text-cdmu-gray-600", dot: "bg-cdmu-gray-400" },
  due_soon: { bg: "bg-amber-100", text: "text-amber-800", dot: "bg-amber-500 animate-pulse" },
  overdue: { bg: "bg-red-100", text: "text-red-800", dot: "bg-red-500" },
};

function ReportingCalendar() {
  return (
    <div className="bg-white rounded-xl border border-cdmu-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-cdmu-gray-100 bg-cdmu-gray-50">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-cdmu-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="text-sm font-bold text-cdmu-navy">Reporting Calendar</h3>
        </div>
        <p className="text-[10px] text-cdmu-gray-500 mt-0.5">Upcoming M&E deliverables and reporting deadlines</p>
      </div>

      <div className="divide-y divide-cdmu-gray-100">
        {REPORT_EVENTS.map((evt, i) => {
          const typeCfg = EVENT_TYPE_STYLES[evt.type];
          const statusCfg = EVENT_STATUS_STYLES[evt.status];
          return (
            <div key={i} className="px-5 py-3 flex items-center gap-4 hover:bg-cdmu-gray-50/80 transition-colors">
              <div className="shrink-0 text-center w-14">
                <p className="text-sm font-bold text-cdmu-navy">{evt.date.split(" ")[0]}</p>
                <p className="text-[10px] text-cdmu-gray-500">{evt.date.split(" ").slice(1).join(" ")}</p>
              </div>
              <div className="w-px h-8 bg-cdmu-gray-200 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${statusCfg.dot}`} />
                  <p className="text-xs font-semibold text-cdmu-gray-800 truncate">{evt.title}</p>
                </div>
                <p className="text-[10px] text-cdmu-gray-500">{evt.responsible}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${typeCfg.bg} ${typeCfg.text}`}>
                  {evt.type === "quarterly" ? "Quarterly" : evt.type === "annual" ? "Annual" : "Special"}
                </span>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusCfg.bg} ${statusCfg.text}`}>
                  {evt.status === "due_soon" ? "Due Soon" : evt.status === "overdue" ? "Overdue" : "Upcoming"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Fragment import workaround ---------- */

import { Fragment } from "react";

/* ---------- Main Component ---------- */

export default function MonitoringEvaluation({
  metrics,
}: {
  metrics: Record<string, PillarMetrics>;
}) {
  const kpiRows = buildKPIRows(metrics);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [editingIndicator, setEditingIndicator] = useState<string | null>(null);

  const handleSaveNote = (indicator: string, note: string) => {
    setNotes((prev) => ({ ...prev, [indicator]: note }));
  };

  const greenTotal = kpiRows.filter((r) => r.rag === "green").length;
  const amberTotal = kpiRows.filter((r) => r.rag === "amber").length;
  const redTotal = kpiRows.filter((r) => r.rag === "red").length;
  const avgProgress = kpiRows.length > 0 ? Math.round(kpiRows.reduce((s, r) => s + r.pctAchieved, 0) / kpiRows.length) : 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cdmu-navy flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-cdmu-navy">Monitoring & Evaluation</h2>
            <p className="text-[10px] text-cdmu-gray-500">Mission 300 National Energy Compact - Performance Monitoring Framework</p>
          </div>
        </div>
      </div>

      {/* Summary Stats Row */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-cdmu-gray-200 p-3">
          <p className="text-[10px] text-cdmu-gray-500 uppercase tracking-wider font-medium">Total Indicators</p>
          <p className="text-xl font-bold text-cdmu-navy mt-0.5">{kpiRows.length}</p>
          <p className="text-[10px] text-cdmu-gray-400">across {Object.keys(metrics).length} pillars</p>
        </div>
        <div className="bg-white rounded-xl border border-cdmu-gray-200 p-3">
          <p className="text-[10px] text-cdmu-gray-500 uppercase tracking-wider font-medium">Avg. Progress</p>
          <p className={`text-xl font-bold mt-0.5 ${avgProgress >= 65 ? "text-cdmu-green" : avgProgress >= 35 ? "text-cdmu-gold" : "text-cdmu-red"}`}>{avgProgress}%</p>
          <div className="w-full bg-cdmu-gray-100 rounded-full h-1 mt-1">
            <div className={`h-1 rounded-full ${avgProgress >= 65 ? "bg-cdmu-green" : avgProgress >= 35 ? "bg-cdmu-gold" : "bg-cdmu-red"}`} style={{ width: `${avgProgress}%` }} />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-cdmu-gray-200 p-3">
          <p className="text-[10px] text-cdmu-gray-500 uppercase tracking-wider font-medium">RAG Summary</p>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="flex items-center gap-1 text-xs"><span className="w-2.5 h-2.5 rounded-full bg-cdmu-green" /><span className="font-bold text-cdmu-gray-700">{greenTotal}</span></span>
            <span className="flex items-center gap-1 text-xs"><span className="w-2.5 h-2.5 rounded-full bg-cdmu-gold" /><span className="font-bold text-cdmu-gray-700">{amberTotal}</span></span>
            <span className="flex items-center gap-1 text-xs"><span className="w-2.5 h-2.5 rounded-full bg-cdmu-red" /><span className="font-bold text-cdmu-gray-700">{redTotal}</span></span>
          </div>
          <p className="text-[10px] text-cdmu-gray-400 mt-1">{Math.round((greenTotal / kpiRows.length) * 100)}% on track</p>
        </div>
        <div className="bg-white rounded-xl border border-cdmu-gray-200 p-3">
          <p className="text-[10px] text-cdmu-gray-500 uppercase tracking-wider font-medium">Next Report Due</p>
          <p className="text-sm font-bold text-cdmu-navy mt-0.5">15 Jul 2026</p>
          <p className="text-[10px] text-amber-600 font-medium mt-0.5">Q2 Quarterly Report</p>
        </div>
      </div>

      {/* Results Framework */}
      <ResultsFramework />

      {/* KPI Progress Table */}
      <KPIProgressTable
        rows={kpiRows}
        notes={notes}
        onEditNote={(indicator) => setEditingIndicator(indicator)}
      />

      {/* Bottom Row: Data Quality + Reporting Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DataQualityScorecard />
        <ReportingCalendar />
      </div>

      {/* Notes Modal */}
      {editingIndicator && (
        <NotesModal
          indicator={editingIndicator}
          note={notes[editingIndicator] || ""}
          onSave={(note) => handleSaveNote(editingIndicator, note)}
          onClose={() => setEditingIndicator(null)}
        />
      )}
    </div>
  );
}
