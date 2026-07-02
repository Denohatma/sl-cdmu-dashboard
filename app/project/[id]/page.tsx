"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import projectsRaw from "@/data/projects.json";
import type { Project } from "@/lib/types";
import {
  calculatePFS,
  getRiskRegister,
  formatUSD,
  formatPct,
} from "@/lib/pfs-calculations";

const projects = projectsRaw as { last_updated: string; projects: Project[] };

/* ------------------------------------------------------------------ */
/*  Pillar metadata                                                   */
/* ------------------------------------------------------------------ */
const PILLAR_NAMES: Record<number, string> = {
  1: "Generation Capacity",
  2: "Transmission & Distribution",
  3: "On-Grid Distribution & Access",
  4: "Off-Grid & Last-Mile Access",
  5: "Clean Cooking",
};

const PILLAR_COLORS: Record<number, string> = {
  1: "bg-blue-500",
  2: "bg-indigo-500",
  3: "bg-green-500",
  4: "bg-amber-500",
  5: "bg-red-500",
};

/* ------------------------------------------------------------------ */
/*  Technology labels                                                 */
/* ------------------------------------------------------------------ */
const TECH_LABELS: Record<string, string> = {
  hydro: "Hydropower",
  solar_utility: "Utility-Scale Solar PV",
  solar_storage: "Solar + Battery Storage",
  solar_hybrid: "Solar Hybrid",
  solar_shs: "Solar Home Systems",
  minigrid_solar: "Solar Mini-Grid",
  thermal_gas: "Thermal / Gas",
  transmission_132kv: "132 kV Transmission",
  transmission_66kv: "66 kV Transmission",
  distribution: "Distribution Infrastructure",
  grid_reform: "Grid Reform & Governance",
  scada_ems: "SCADA / EMS",
  clean_cooking: "Clean Cooking",
};

/* ------------------------------------------------------------------ */
/*  Stage pipeline                                                    */
/* ------------------------------------------------------------------ */
const STAGES = [
  "Draft",
  "Feasibility",
  "Approved",
  "Procurement",
  "Financial Close",
  "Construction",
  "Operational",
] as const;

function mapStatusToStageIndex(status: string): number {
  switch (status) {
    case "feasibility":
      return 1;
    case "development":
      return 2;
    case "procurement":
      return 3;
    case "funded":
      return 4;
    case "in_progress":
      return 5;
    default:
      return 0;
  }
}

/* ------------------------------------------------------------------ */
/*  CDMU scoring                                                      */
/* ------------------------------------------------------------------ */
interface ScoreCriterion {
  label: string;
  weight: number;
  score: number;
}

function computeCDMUScore(p: Project): { criteria: ScoreCriterion[]; overall: number } {
  const tech = p.technology || "";
  const lead = p.lead || "";
  const pop = p.population_served || 0;
  const mw = p.capacity_mw || 0;

  // Readiness (18%)
  const readinessMap: Record<string, number> = {
    operational: 100,
    in_progress: 80,
    funded: 70,
    procurement: 60,
    development: 40,
    feasibility: 20,
  };
  const readiness = readinessMap[p.status] ?? 10;

  // Scale of Impact (13%)
  let scaleOfImpact = 20;
  if (pop > 1_000_000) scaleOfImpact = 100;
  else if (pop > 500_000) scaleOfImpact = 80;
  else if (pop > 200_000) scaleOfImpact = 60;
  else if (pop > 100_000) scaleOfImpact = 40;

  // Bankability (18%)
  let bankability = 40;
  if (
    (p.status === "funded" || p.status === "in_progress") &&
    (p.ppa_price && p.ppa_price > 0)
  ) {
    bankability = 80;
  } else if (p.ppa_price && p.ppa_price > 0) {
    bankability = 70;
  }

  // Country Enablement (10%)
  let countryEnablement = 50;
  if (/mcc|world bank/i.test(lead)) countryEnablement = 90;
  else if (/government|ministry/i.test(lead)) countryEnablement = 80;

  // Scalability (3%)
  let scalability = 40;
  if (/solar|minigrid/i.test(tech)) scalability = 90;
  else if (/hydro/i.test(tech)) scalability = 60;

  // Climate Impact (13%)
  let climateImpact = 50;
  if (/solar|hydro/i.test(tech)) climateImpact = 90;
  else if (/thermal|gas/i.test(tech)) climateImpact = 30;

  // Job Creation (10%)
  let jobCreation = 30;
  if (mw > 0) {
    if (/solar/i.test(tech)) jobCreation = Math.min(mw * 35, 100);
    else if (/hydro/i.test(tech)) jobCreation = Math.min(mw * 15, 100);
    else jobCreation = Math.min(mw * 10, 100);
  }

  // Regional Integration (8%)
  let regionalIntegration = 40;
  if (/transmission/i.test(tech)) regionalIntegration = 90;
  else if (/wapp|clsg/i.test(p.description || "") || /wapp|clsg/i.test(p.notes || ""))
    regionalIntegration = 80;

  // Gender & Inclusion (7%)
  let genderInclusion = 50;
  if (p.type === "off_grid" || /minigrid/i.test(tech)) genderInclusion = 80;
  else if (pop > 200_000) genderInclusion = 70;

  const criteria: ScoreCriterion[] = [
    { label: "Readiness", weight: 0.18, score: readiness },
    { label: "Scale of Impact", weight: 0.13, score: scaleOfImpact },
    { label: "Bankability", weight: 0.18, score: bankability },
    { label: "Country Enablement", weight: 0.10, score: countryEnablement },
    { label: "Scalability", weight: 0.03, score: scalability },
    { label: "Climate Impact", weight: 0.13, score: climateImpact },
    { label: "Job Creation", weight: 0.10, score: jobCreation },
    { label: "Regional Integration", weight: 0.08, score: regionalIntegration },
    { label: "Gender & Inclusion", weight: 0.07, score: genderInclusion },
  ];

  const overall = criteria.reduce((sum, c) => sum + c.score * c.weight, 0);

  return { criteria, overall };
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */
function statusBadge(status: string) {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    feasibility: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Feasibility" },
    development: { bg: "bg-blue-100", text: "text-blue-800", label: "Development" },
    procurement: { bg: "bg-purple-100", text: "text-purple-800", label: "Procurement" },
    funded: { bg: "bg-green-100", text: "text-green-800", label: "Funded" },
    in_progress: { bg: "bg-cdmu-green/10", text: "text-cdmu-green-dark", label: "In Progress" },
  };
  const s = map[status] || { bg: "bg-gray-100", text: "text-gray-800", label: status };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}

function scoreColor(score: number): string {
  if (score >= 70) return "bg-cdmu-green";
  if (score >= 40) return "bg-cdmu-amber";
  return "bg-cdmu-red";
}

function scoreTextColor(score: number): string {
  if (score >= 70) return "text-cdmu-green";
  if (score >= 40) return "text-cdmu-amber";
  return "text-cdmu-red";
}

function generateInsight(p: Project, overall: number): string {
  const tech = TECH_LABELS[p.technology || ""] || p.technology || "energy";
  if (overall >= 75) {
    return `${p.name} is a high-priority project scoring ${overall.toFixed(0)}/100 on the CDMU index. With strong readiness and scale metrics, this ${tech.toLowerCase()} investment is well-positioned for accelerated development and DFI engagement.`;
  }
  if (overall >= 55) {
    return `${p.name} scores ${overall.toFixed(0)}/100 — a solid mid-pipeline project. Key areas for improvement include advancing procurement readiness and securing financing commitments to move toward financial close.`;
  }
  return `${p.name} scores ${overall.toFixed(0)}/100, indicating early-stage maturity. Focus on completing feasibility studies, strengthening the bankability case, and building the project development team to advance through the pipeline.`;
}

function generateNextSteps(p: Project): string[] {
  const steps: string[] = [];
  switch (p.status) {
    case "feasibility":
      steps.push("Complete bankable feasibility study with financial model");
      steps.push("Initiate ESIA screening and scoping");
      steps.push("Engage DFIs for project preparation support");
      steps.push("Identify and shortlist potential project sponsors");
      break;
    case "development":
      steps.push("Secure Cabinet/regulatory approval for project advancement");
      steps.push("Finalize PPA terms and tariff negotiation with EWRC");
      steps.push("Advance financial close with lead DFI arranger");
      steps.push("Complete land acquisition and community consultation");
      break;
    case "procurement":
      steps.push("Issue RFP and evaluate EPC contractor bids");
      steps.push("Finalize procurement through NPPA compliance process");
      steps.push("Negotiate and sign EPC contract");
      steps.push("Prepare construction management and supervision plan");
      break;
    case "funded":
      steps.push("Finalize grant disbursement and fund flow arrangements");
      steps.push("Commence detailed engineering design");
      steps.push("Mobilize project implementation unit");
      steps.push("Establish M&E framework and baseline indicators");
      break;
    case "in_progress":
      steps.push("Monitor construction progress against milestones");
      steps.push("Track expenditure against approved budget");
      steps.push("Prepare for commissioning and grid integration testing");
      steps.push("Develop operations and maintenance handover plan");
      break;
    default:
      steps.push("Define project scope and prepare concept note");
      steps.push("Conduct preliminary resource assessment");
      break;
  }
  return steps;
}

function generateRisks(p: Project): { risk: string; severity: string; color: string }[] {
  const risks: { risk: string; severity: string; color: string }[] = [];
  const tech = p.technology || "";

  // Status-based risks
  if (p.status === "feasibility") {
    risks.push({ risk: "Feasibility studies may reveal unfavorable economics or site conditions", severity: "Medium", color: "bg-cdmu-amber" });
    risks.push({ risk: "Difficulty securing project sponsor or lead developer", severity: "High", color: "bg-cdmu-red" });
  }
  if (p.status === "development") {
    risks.push({ risk: "Delayed Cabinet or regulatory approval", severity: "High", color: "bg-cdmu-red" });
    risks.push({ risk: "Financial close timeline slippage due to DFI due diligence", severity: "Medium", color: "bg-cdmu-amber" });
  }
  if (p.status === "in_progress") {
    risks.push({ risk: "Construction cost overruns or supply chain delays", severity: "Medium", color: "bg-cdmu-amber" });
    risks.push({ risk: "Grid integration and commissioning delays", severity: "Low", color: "bg-cdmu-green" });
  }

  // Technology risks
  if (/hydro/i.test(tech)) {
    risks.push({ risk: "Hydrological variability — low rainfall seasons may reduce output", severity: "Medium", color: "bg-cdmu-amber" });
    risks.push({ risk: "Environmental and resettlement compliance requirements", severity: "High", color: "bg-cdmu-red" });
  }
  if (/solar/i.test(tech)) {
    risks.push({ risk: "Land acquisition challenges in densely populated areas", severity: "Low", color: "bg-cdmu-green" });
    risks.push({ risk: "Panel degradation and inverter replacement costs over project life", severity: "Low", color: "bg-cdmu-green" });
  }
  if (/transmission/i.test(tech)) {
    risks.push({ risk: "Right-of-way acquisition and community compensation", severity: "High", color: "bg-cdmu-red" });
    risks.push({ risk: "Cross-border coordination with WAPP member states", severity: "Medium", color: "bg-cdmu-amber" });
  }

  // Common risks
  risks.push({ risk: "Currency depreciation (Leone vs USD) affecting project costs", severity: "Medium", color: "bg-cdmu-amber" });
  risks.push({ risk: "Offtaker creditworthiness — EDSA payment reliability", severity: "High", color: "bg-cdmu-red" });

  return risks;
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                    */
/* ------------------------------------------------------------------ */

function StagePipeline({ currentIndex }: { currentIndex: number }) {
  return (
    <div className="bg-white rounded-xl border border-cdmu-gray-200 p-5 overflow-x-auto">
      <h3 className="text-xs font-semibold text-cdmu-gray-500 uppercase tracking-wider mb-4">
        Project Stage Pipeline
      </h3>
      <div className="flex items-center justify-between min-w-[600px]">
        {STAGES.map((stage, i) => {
          const isCompleted = i < currentIndex;
          const isCurrent = i === currentIndex;
          const isFuture = i > currentIndex;

          return (
            <div key={stage} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                    isCompleted
                      ? "bg-cdmu-green border-cdmu-green text-white"
                      : isCurrent
                      ? "bg-cdmu-navy border-cdmu-navy text-white ring-4 ring-cdmu-navy/20"
                      : "bg-white border-cdmu-gray-300 text-cdmu-gray-400"
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <span
                  className={`mt-2 text-[10px] font-medium text-center whitespace-nowrap ${
                    isCompleted
                      ? "text-cdmu-green-dark"
                      : isCurrent
                      ? "text-cdmu-navy font-bold"
                      : "text-cdmu-gray-400"
                  }`}
                >
                  {stage}
                </span>
              </div>
              {i < STAGES.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 mt-[-18px] ${
                    isCompleted ? "bg-cdmu-green" : isFuture ? "bg-cdmu-gray-200" : "bg-cdmu-navy/30"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ScoreBreakdown({ criteria }: { criteria: ScoreCriterion[] }) {
  return (
    <div className="space-y-3">
      {criteria.map((c) => (
        <div key={c.label} className="flex items-center gap-3">
          <div className="w-36 flex-shrink-0">
            <span className="text-xs font-medium text-cdmu-gray-700">{c.label}</span>
          </div>
          <div className="flex-1 h-5 bg-cdmu-gray-100 rounded-full overflow-hidden relative">
            <div
              className={`h-full rounded-full transition-all duration-500 ${scoreColor(c.score)}`}
              style={{ width: `${c.score}%` }}
            />
          </div>
          <div className="w-10 text-right">
            <span className={`text-xs font-bold ${scoreTextColor(c.score)}`}>{c.score}</span>
          </div>
          <div className="w-12 text-right">
            <span className="text-[10px] text-cdmu-gray-500">{(c.weight * 100).toFixed(0)}%</span>
          </div>
        </div>
      ))}
    </div>
  );
}

type TabKey = "overview" | "financials" | "documents" | "risk";

/* ------------------------------------------------------------------ */
/*  Main page                                                         */
/* ------------------------------------------------------------------ */
export default function ProjectDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const project = projects.projects.find((p) => p.id === id);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cdmu-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-cdmu-navy mb-2">Project Not Found</h1>
          <p className="text-cdmu-gray-500 mb-4">No project found with ID &quot;{id}&quot;</p>
          <Link href="/" className="text-cdmu-navy hover:underline text-sm font-medium">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const tech = project.technology || "";
  const techLabel = TECH_LABELS[tech] || tech;
  const pillar = project.pillar || 1;
  const pillarName = PILLAR_NAMES[pillar];
  const pillarColor = PILLAR_COLORS[pillar];
  const stageIndex = mapStatusToStageIndex(project.status);
  const { criteria, overall } = computeCDMUScore(project);
  const fin = calculatePFS(project);
  const risks = generateRisks(project);
  const nextSteps = generateNextSteps(project);
  const insight = generateInsight(project, overall);

  const TABS: { key: TabKey; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "financials", label: "Financials" },
    { key: "documents", label: "Documents" },
    { key: "risk", label: "Risk" },
  ];

  return (
    <div className="min-h-screen bg-cdmu-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-cdmu-green-dark to-cdmu-blue-dark">
        <div className="h-1 flex">
          <div className="flex-1 bg-cdmu-green" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-cdmu-blue" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-white/60 mb-3">
            <Link href="/" className="hover:text-white transition-colors">Dashboard</Link>
            <span>/</span>
            <span>Projects</span>
            <span>/</span>
            <span className="text-white font-medium">{project.name}</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                {project.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-white/80 text-sm">{techLabel}</span>
                <span className="text-white/40">|</span>
                <span className="text-white/80 text-sm">{project.location || project.region}</span>
                <span className="text-white/40">|</span>
                <span className="text-white/80 text-sm">{project.lead || "Ministry of Energy"}</span>
                <span className="text-white/40">|</span>
                {statusBadge(project.status)}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Pipeline
              </Link>
              <Link
                href={`/pfs/${project.id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cdmu-gold text-cdmu-gray-900 text-sm font-semibold hover:bg-cdmu-gold-light transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                View PFS
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stage Pipeline */}
        <StagePipeline currentIndex={stageIndex} />

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
          {/* Investment */}
          <div className="bg-white rounded-xl border border-cdmu-gray-200 p-5">
            <p className="text-xs font-semibold text-cdmu-gray-500 uppercase tracking-wider">
              Investment
            </p>
            <p className="text-3xl font-bold text-cdmu-navy mt-1">
              ${project.cost_usd_million >= 1000
                ? `${(project.cost_usd_million / 1000).toFixed(1)}B`
                : `${project.cost_usd_million}M`}
            </p>
            <p className="text-xs text-cdmu-gray-500 mt-1">Total project cost (USD)</p>
          </div>

          {/* CDMU Score */}
          <div className="bg-white rounded-xl border border-cdmu-gray-200 p-5">
            <p className="text-xs font-semibold text-cdmu-gray-500 uppercase tracking-wider">
              CDMU Score
            </p>
            <div className="flex items-end gap-2 mt-1">
              <p className={`text-3xl font-bold ${scoreTextColor(overall)}`}>
                {overall.toFixed(0)}
              </p>
              <p className="text-sm text-cdmu-gray-400 mb-0.5">/ 100</p>
            </div>
            <div className="w-full h-2 bg-cdmu-gray-100 rounded-full mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full ${scoreColor(overall)}`}
                style={{ width: `${overall}%` }}
              />
            </div>
          </div>

          {/* Pillar */}
          <div className="bg-white rounded-xl border border-cdmu-gray-200 p-5">
            <p className="text-xs font-semibold text-cdmu-gray-500 uppercase tracking-wider">
              Pillar
            </p>
            <div className="flex items-center gap-2 mt-1">
              <div className={`w-8 h-8 rounded-lg ${pillarColor} text-white flex items-center justify-center font-bold text-sm flex-shrink-0`}>
                {pillar}
              </div>
              <p className="text-lg font-bold text-cdmu-gray-900">{pillarName}</p>
            </div>
            <p className="text-xs text-cdmu-gray-500 mt-1">M300 Strategic Pillar</p>
          </div>
        </div>

        {/* Main Layout: Content + Sidebar */}
        <div className="flex flex-col lg:flex-row gap-5 mt-5">
          {/* Main content area */}
          <div className="flex-1 min-w-0">
            {/* Tabs */}
            <div className="flex gap-0.5 bg-white rounded-xl border border-cdmu-gray-200 p-1.5 mb-5">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-1 ${
                    activeTab === tab.key
                      ? "bg-cdmu-navy text-white"
                      : "text-cdmu-gray-600 hover:bg-cdmu-gray-100"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ============ Overview Tab ============ */}
            {activeTab === "overview" && (
              <div className="space-y-5">
                {/* Executive Summary */}
                <div className="bg-white rounded-xl border border-cdmu-gray-200 p-5">
                  <h3 className="font-semibold text-cdmu-navy mb-3">Executive Summary</h3>
                  <div className="border-l-4 border-cdmu-gold bg-cdmu-gold/5 rounded-r-lg p-4">
                    <p className="text-sm text-cdmu-gray-700 leading-relaxed italic">
                      {project.description || project.notes}
                    </p>
                  </div>
                </div>

                {/* Project Particulars */}
                <div className="bg-cdmu-gray-900 rounded-xl p-5 text-white">
                  <h3 className="font-semibold text-white mb-4">Project Particulars</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[
                      { label: "Technology", value: techLabel },
                      { label: "Location", value: project.location || project.region },
                      { label: "Region", value: project.region },
                      { label: "Lead / Sponsor", value: project.lead || "Ministry of Energy" },
                      { label: "Target Date", value: project.target_date || "TBD" },
                      { label: "Capacity", value: project.capacity_mw ? `${project.capacity_mw} MW` : "N/A" },
                      { label: "Population Served", value: project.population_served ? project.population_served.toLocaleString() : "N/A" },
                      { label: "Connections", value: project.connections ? project.connections.toLocaleString() : "N/A" },
                      { label: "Project Life", value: project.project_life ? `${project.project_life} years` : "N/A" },
                      { label: "Capacity Factor", value: project.capacity_factor ? formatPct(project.capacity_factor) : "N/A" },
                      { label: "Households", value: project.households ? project.households.toLocaleString() : "N/A" },
                      { label: "Stage", value: project.stage || project.status },
                    ].map((item) => (
                      <div key={item.label}>
                        <p className="text-[10px] uppercase tracking-wider text-white/50 font-medium">
                          {item.label}
                        </p>
                        <p className="text-sm font-semibold text-white mt-0.5">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CDMU Score Breakdown */}
                <div className="bg-white rounded-xl border border-cdmu-gray-200 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-cdmu-navy">CDMU Score Breakdown</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-cdmu-gray-500">Overall:</span>
                      <span className={`text-lg font-bold ${scoreTextColor(overall)}`}>
                        {overall.toFixed(0)}/100
                      </span>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex items-center gap-4 mb-4 text-[10px] text-cdmu-gray-500">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-cdmu-green" />
                      <span>Good (&gt;70)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-cdmu-amber" />
                      <span>Moderate (40-70)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-cdmu-red" />
                      <span>Needs Attention (&lt;40)</span>
                    </div>
                  </div>

                  <ScoreBreakdown criteria={criteria} />
                </div>
              </div>
            )}

            {/* ============ Financials Tab ============ */}
            {activeTab === "financials" && (
              <div className="space-y-5">
                {fin ? (
                  <>
                    {/* Key Metrics */}
                    <div className="bg-white rounded-xl border border-cdmu-gray-200 p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-cdmu-navy">Key Financial Metrics</h3>
                        <Link
                          href={`/pfs/${project.id}`}
                          className="text-xs text-cdmu-navy hover:underline font-medium"
                        >
                          View Full PFS Report &rarr;
                        </Link>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-cdmu-gray-50 rounded-lg p-4 text-center">
                          <p className="text-xs text-cdmu-gray-500 font-medium">LCOE</p>
                          <p className="text-xl font-bold text-cdmu-navy mt-1">
                            ${fin.lcoe.toFixed(3)}
                          </p>
                          <p className="text-[10px] text-cdmu-gray-400">$/kWh</p>
                        </div>
                        <div className="bg-cdmu-gray-50 rounded-lg p-4 text-center">
                          <p className="text-xs text-cdmu-gray-500 font-medium">Project IRR</p>
                          <p className="text-xl font-bold text-cdmu-navy mt-1">
                            {formatPct(fin.projectIrr)}
                          </p>
                          <p className="text-[10px] text-cdmu-gray-400">Internal Rate of Return</p>
                        </div>
                        <div className="bg-cdmu-gray-50 rounded-lg p-4 text-center">
                          <p className="text-xs text-cdmu-gray-500 font-medium">NPV @10%</p>
                          <p className={`text-xl font-bold mt-1 ${fin.npv10 >= 0 ? "text-cdmu-green-dark" : "text-cdmu-red"}`}>
                            {formatUSD(fin.npv10)}
                          </p>
                          <p className="text-[10px] text-cdmu-gray-400">Net Present Value</p>
                        </div>
                        <div className="bg-cdmu-gray-50 rounded-lg p-4 text-center">
                          <p className="text-xs text-cdmu-gray-500 font-medium">Min DSCR</p>
                          <p className={`text-xl font-bold mt-1 ${!isFinite(fin.minDscr) ? "text-cdmu-gray-400" : fin.minDscr >= 1.25 ? "text-cdmu-green-dark" : "text-cdmu-red"}`}>
                            {!isFinite(fin.minDscr) ? "N/A" : `${fin.minDscr.toFixed(2)}x`}
                          </p>
                          <p className="text-[10px] text-cdmu-gray-400">{!isFinite(fin.minDscr) ? "Grant-funded (no debt)" : "Debt Service Coverage"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Capital Structure */}
                    <div className="bg-white rounded-xl border border-cdmu-gray-200 p-5">
                      <h3 className="font-semibold text-cdmu-navy mb-4">Capital Structure</h3>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex-1">
                          <div className="flex h-6 rounded-full overflow-hidden">
                            <div
                              className="bg-cdmu-navy flex items-center justify-center text-[10px] text-white font-bold"
                              style={{ width: `${(project.debt_ratio ?? 0.7) * 100}%` }}
                            >
                              Debt {((project.debt_ratio ?? 0.7) * 100).toFixed(0)}%
                            </div>
                            <div
                              className="bg-cdmu-gold flex items-center justify-center text-[10px] text-cdmu-gray-900 font-bold"
                              style={{ width: `${(1 - (project.debt_ratio ?? 0.7)) * 100}%` }}
                            >
                              Equity {((1 - (project.debt_ratio ?? 0.7)) * 100).toFixed(0)}%
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-cdmu-gray-50 rounded-lg p-3">
                          <p className="text-xs text-cdmu-gray-500">Senior Debt</p>
                          <p className="text-lg font-bold text-cdmu-navy">{formatUSD(fin.debtAmount)}</p>
                          <p className="text-[10px] text-cdmu-gray-400">
                            {project.interest_rate ? `${(project.interest_rate * 100).toFixed(1)}% over ${project.loan_tenure || 15}yr` : "Terms TBD"}
                          </p>
                        </div>
                        <div className="bg-cdmu-gray-50 rounded-lg p-3">
                          <p className="text-xs text-cdmu-gray-500">Equity</p>
                          <p className="text-lg font-bold text-cdmu-gold">{formatUSD(fin.equityAmount)}</p>
                          <p className="text-[10px] text-cdmu-gray-400">Developer / DFI equity</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-4">
                        <div>
                          <p className="text-xs text-cdmu-gray-500">Annual Revenue</p>
                          <p className="text-sm font-bold text-cdmu-gray-900">{formatUSD(fin.annualRevenue)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-cdmu-gray-500">Annual Debt Service</p>
                          <p className="text-sm font-bold text-cdmu-gray-900">{isFinite(fin.annualDebtService) ? formatUSD(fin.annualDebtService) : "$0 (grant)"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-cdmu-gray-500">Payback Period</p>
                          <p className="text-sm font-bold text-cdmu-gray-900">{fin.paybackYears} years</p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-white rounded-xl border border-cdmu-gray-200 p-8 text-center">
                    <svg className="w-12 h-12 text-cdmu-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <h3 className="font-semibold text-cdmu-gray-700 mb-1">Financial Model Not Available</h3>
                    <p className="text-sm text-cdmu-gray-500 mb-3">
                      This project type does not have generation-based financial modeling.
                    </p>
                    <Link
                      href={`/pfs/${project.id}`}
                      className="text-sm text-cdmu-navy hover:underline font-medium"
                    >
                      View PFS Report for qualitative analysis &rarr;
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* ============ Documents Tab ============ */}
            {activeTab === "documents" && (
              <div className="space-y-5">
                <div className="bg-white rounded-xl border border-cdmu-gray-200 p-5">
                  <h3 className="font-semibold text-cdmu-navy mb-4">Project Documents</h3>
                  <div className="space-y-3">
                    {[
                      { name: `CDMU-PFS-${project.id.toUpperCase()}-001`, type: "Pre-Feasibility Study", status: "Available", link: `/pfs/${project.id}` },
                      { name: `CDMU-FC-${project.id.toUpperCase()}-001`, type: "Fact Sheet", status: "Draft", link: null },
                      { name: `CDMU-ESIA-${project.id.toUpperCase()}-001`, type: "ESIA Screening", status: project.status === "in_progress" || project.status === "funded" ? "Complete" : "Pending", link: null },
                      { name: `CDMU-FIN-${project.id.toUpperCase()}-001`, type: "Financial Model", status: fin ? "Available" : "Pending", link: fin ? `/pfs/${project.id}` : null },
                    ].map((doc) => (
                      <div key={doc.name} className="flex items-center justify-between py-3 border-b border-cdmu-gray-100 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-cdmu-navy/10 flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-cdmu-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-cdmu-gray-900">{doc.name}</p>
                            <p className="text-xs text-cdmu-gray-500">{doc.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            doc.status === "Available" || doc.status === "Complete"
                              ? "bg-cdmu-green/10 text-cdmu-green-dark"
                              : doc.status === "Draft"
                              ? "bg-cdmu-amber/10 text-cdmu-amber"
                              : "bg-cdmu-gray-100 text-cdmu-gray-500"
                          }`}>
                            {doc.status}
                          </span>
                          {doc.link && (
                            <Link
                              href={doc.link}
                              className="text-xs text-cdmu-navy hover:underline font-medium"
                            >
                              View
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ============ Risk Tab ============ */}
            {activeTab === "risk" && (
              <div className="space-y-5">
                <div className="bg-white rounded-xl border border-cdmu-gray-200 p-5">
                  <h3 className="font-semibold text-cdmu-navy mb-4">Risk Assessment</h3>
                  <div className="space-y-3">
                    {risks.map((r, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 py-3 border-b border-cdmu-gray-100 last:border-0"
                      >
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${r.color}`} />
                        <div className="flex-1">
                          <p className="text-sm text-cdmu-gray-800">{r.risk}</p>
                        </div>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                            r.severity === "High"
                              ? "bg-red-50 text-red-700"
                              : r.severity === "Medium"
                              ? "bg-yellow-50 text-yellow-700"
                              : "bg-green-50 text-green-700"
                          }`}
                        >
                          {r.severity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* PFS-based risk register link */}
                <div className="bg-white rounded-xl border border-cdmu-gray-200 p-5">
                  <h3 className="font-semibold text-cdmu-navy mb-2">Detailed Risk Register</h3>
                  <p className="text-sm text-cdmu-gray-500 mb-3">
                    A comprehensive risk register with likelihood, impact, RAG rating, and mitigation measures is available in the Pre-Feasibility Study.
                  </p>
                  <Link
                    href={`/pfs/${project.id}`}
                    className="inline-flex items-center gap-1.5 text-sm text-cdmu-navy hover:underline font-medium"
                  >
                    View Full Risk Register in PFS &rarr;
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="w-full lg:w-80 flex-shrink-0 space-y-5">
            {/* CDMU Analysis */}
            <div className="bg-white rounded-xl border border-cdmu-gray-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-cdmu-navy flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-cdmu-navy text-sm">CDMU Analysis</h3>
              </div>
              <p className="text-xs text-cdmu-gray-600 leading-relaxed">{insight}</p>
            </div>

            {/* Recommended Next Steps */}
            <div className="bg-white rounded-xl border border-cdmu-gray-200 p-5">
              <h3 className="font-semibold text-cdmu-navy text-sm mb-3">Recommended Next Steps</h3>
              <div className="space-y-2.5">
                {nextSteps.map((step, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-cdmu-navy/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[10px] font-bold text-cdmu-navy">{i + 1}</span>
                    </div>
                    <p className="text-xs text-cdmu-gray-600 leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Facts */}
            <div className="bg-white rounded-xl border border-cdmu-gray-200 p-5">
              <h3 className="font-semibold text-cdmu-navy text-sm mb-3">Quick Facts</h3>
              <div className="space-y-2.5">
                {project.capacity_mw ? (
                  <div className="flex justify-between text-xs">
                    <span className="text-cdmu-gray-500">Capacity</span>
                    <span className="font-semibold text-cdmu-gray-900">{project.capacity_mw} MW</span>
                  </div>
                ) : null}
                {project.ppa_price ? (
                  <div className="flex justify-between text-xs">
                    <span className="text-cdmu-gray-500">PPA Price</span>
                    <span className="font-semibold text-cdmu-gray-900">${project.ppa_price.toFixed(2)}/kWh</span>
                  </div>
                ) : null}
                {project.population_served ? (
                  <div className="flex justify-between text-xs">
                    <span className="text-cdmu-gray-500">People Served</span>
                    <span className="font-semibold text-cdmu-gray-900">{project.population_served.toLocaleString()}</span>
                  </div>
                ) : null}
                {project.connections ? (
                  <div className="flex justify-between text-xs">
                    <span className="text-cdmu-gray-500">Connections</span>
                    <span className="font-semibold text-cdmu-gray-900">{project.connections.toLocaleString()}</span>
                  </div>
                ) : null}
                {project.target_date ? (
                  <div className="flex justify-between text-xs">
                    <span className="text-cdmu-gray-500">Target Date</span>
                    <span className="font-semibold text-cdmu-gray-900">{project.target_date}</span>
                  </div>
                ) : null}
                <div className="flex justify-between text-xs">
                  <span className="text-cdmu-gray-500">Region</span>
                  <span className="font-semibold text-cdmu-gray-900">{project.region}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-xs text-cdmu-gray-400 py-6 mt-8 border-t border-cdmu-gray-200">
          <p>Sierra Leone Compact Delivery & Monitoring Unit -- Mission 300</p>
          <p className="mt-1">Last updated: {projects.last_updated}</p>
        </footer>
      </div>
    </div>
  );
}
