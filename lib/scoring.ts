import type { Project } from "./types";

export interface ScoreDimension {
  key: string;
  label: string;
  weight: number;
  score: number;
  category: "core" | "impact" | "regional";
}

export function calcCDMUScore(p: Project): number {
  return getDimensions(p).reduce((sum, d) => sum + d.score * d.weight, 0);
}

export function getDimensions(p: Project): ScoreDimension[] {
  const readinessMap: Record<string, number> = {
    in_progress: 80, funded: 70, procurement: 60, development: 40, feasibility: 20,
  };

  const pop = p.population_served || 0;
  const tech = p.technology || "";
  const lead = p.lead || "";
  const mw = p.capacity_mw || 0;

  return [
    {
      key: "readiness", label: "Readiness", weight: 0.18, category: "core",
      score: readinessMap[p.status] || 30,
    },
    {
      key: "impact", label: "Scale of Impact", weight: 0.13, category: "core",
      score: pop > 1000000 ? 100 : pop > 500000 ? 80 : pop > 200000 ? 60 : pop > 100000 ? 40 : 20,
    },
    {
      key: "bankability", label: "Bankability", weight: 0.18, category: "core",
      score: (p.status === "funded" || p.status === "in_progress") ? 80 :
        (p.ppa_price && p.ppa_price > 0) ? 70 : 40,
    },
    {
      key: "enablement", label: "Country & Political Enablement", weight: 0.10, category: "core",
      score: (lead.includes("MCC") || lead.includes("World Bank")) ? 90 :
        (lead.includes("Government") || lead.includes("Ministry")) ? 80 : 50,
    },
    {
      key: "scalability", label: "Scalability / Replicability", weight: 0.03, category: "core",
      score: tech.includes("solar") || tech.includes("minigrid") ? 90 :
        tech.includes("hydro") ? 60 : 40,
    },
    {
      key: "climate", label: "Climate Impact", weight: 0.13, category: "impact",
      score: tech.includes("solar") || tech.includes("hydro") ? 90 :
        tech.includes("thermal") || tech.includes("gas") ? 30 : 50,
    },
    {
      key: "jobs", label: "Job Creation", weight: 0.10, category: "impact",
      score: Math.min(100, tech.includes("solar") ? mw * 2 : tech.includes("hydro") ? mw * 1 : mw * 0.8),
    },
    {
      key: "regional", label: "Regional Integration", weight: 0.08, category: "regional",
      score: p.type === "transmission" ? 90 : tech.includes("transmission") ? 80 : 40,
    },
    {
      key: "gender", label: "Gender & Inclusion", weight: 0.07, category: "regional",
      score: p.type === "off_grid" ? 80 : (pop > 200000 ? 70 : 50),
    },
  ];
}

export function scoreLabel(score: number): { text: string; color: string; bgColor: string } {
  if (score >= 70) return { text: "STRONG", color: "text-green-600", bgColor: "bg-green-500" };
  if (score >= 50) return { text: "MODERATE", color: "text-amber-600", bgColor: "bg-amber-500" };
  return { text: "WEAK", color: "text-red-500", bgColor: "bg-red-400" };
}

export function formatUSD(value: number): string {
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}B`;
  return `$${value}M`;
}
