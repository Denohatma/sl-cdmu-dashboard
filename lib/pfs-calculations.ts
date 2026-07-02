import type { Project } from "./types";

export interface PFSFinancials {
  capex: number;
  annualOpex: number;
  annualEnergyYield: number;
  capacityFactor: number;
  crf: number;
  lcoe: number;
  projectIrr: number;
  equityIrr: number;
  npv10: number;
  minDscr: number;
  paybackYears: number;
  annualRevenue: number;
  debtAmount: number;
  equityAmount: number;
  annualDebtService: number;
  carbonAbatement: number;
  carbonRevenue: number;
  totalLifecycleCost: number;
  totalLifecycleCostNpv: number;
}

export interface SensitivityResult {
  scenario: string;
  irr: number;
  lcoe: number;
  dscr: number;
  bankable: boolean;
}

const WACC = 0.12;
const CO2_FACTOR = 0.52;
const CO2_PRICE = 10;

const DEFAULTS: Record<string, { cf: number; opex: number; ppa: number; life: number }> = {
  solar_utility: { cf: 0.21, opex: 0.025, ppa: 0.10, life: 25 },
  hydro: { cf: 0.35, opex: 0.03, ppa: 0.12, life: 30 },
  minigrid_solar: { cf: 0.22, opex: 0.04, ppa: 0.45, life: 20 },
  solar_shs: { cf: 0.22, opex: 0.05, ppa: 0.45, life: 5 },
  transmission_132kv: { cf: 0, opex: 0.02, ppa: 0, life: 40 },
  transmission_66kv: { cf: 0, opex: 0.02, ppa: 0, life: 30 },
  scada_ems: { cf: 0, opex: 0.05, ppa: 0, life: 15 },
};

function calcCRF(wacc: number, n: number): number {
  const factor = Math.pow(1 + wacc, n);
  return (wacc * factor) / (factor - 1);
}

function calcAnnuity(principal: number, rate: number, years: number): number {
  if (rate === 0) return principal / years;
  const factor = Math.pow(1 + rate, years);
  return (principal * rate * factor) / (factor - 1);
}

function estimateIRR(cashflows: number[], guess: number = 0.1): number {
  let rate = guess;
  for (let iter = 0; iter < 100; iter++) {
    let npv = 0;
    let dnpv = 0;
    for (let t = 0; t < cashflows.length; t++) {
      const factor = Math.pow(1 + rate, t);
      npv += cashflows[t] / factor;
      dnpv -= (t * cashflows[t]) / (factor * (1 + rate));
    }
    if (Math.abs(npv) < 0.01) break;
    rate = rate - npv / dnpv;
    if (rate < -0.5 || rate > 2 || isNaN(rate)) return -1;
  }
  return rate;
}

function calcNPV(cashflows: number[], rate: number): number {
  return cashflows.reduce((sum, cf, t) => sum + cf / Math.pow(1 + rate, t), 0);
}

export function calculatePFS(project: Project): PFSFinancials | null {
  if (!project.capacity_mw || project.capacity_mw <= 0) return null;

  const tech = project.technology || "solar_utility";
  const defaults = DEFAULTS[tech] || DEFAULTS.solar_utility;

  const capex = project.cost_usd_million * 1_000_000;
  const cf = project.capacity_factor ?? defaults.cf;
  const opexPct = project.opex_pct ?? defaults.opex;
  const ppaPrice = project.ppa_price ?? defaults.ppa;
  const life = project.project_life ?? defaults.life;
  const debtRatio = project.debt_ratio ?? 0.7;
  const interestRate = project.interest_rate ?? 0.08;
  const loanTenure = project.loan_tenure ?? 15;

  const annualEnergyYield = project.capacity_mw * cf * 8760 * 1000;
  const annualOpex = capex * opexPct;
  const crf = calcCRF(WACC, life);
  const lcoe = (capex * crf + annualOpex) / annualEnergyYield;
  const annualRevenue = annualEnergyYield * ppaPrice;

  const debtAmount = capex * debtRatio;
  const equityAmount = capex * (1 - debtRatio);
  const annualDebtService = calcAnnuity(debtAmount, interestRate, loanTenure);
  const minDscr = annualRevenue / annualDebtService;

  const projectCashflows = [-capex];
  const equityCashflows = [-equityAmount];
  for (let y = 1; y <= life; y++) {
    const netCf = annualRevenue - annualOpex;
    projectCashflows.push(netCf);
    const debtSvc = y <= loanTenure ? annualDebtService : 0;
    equityCashflows.push(netCf - debtSvc);
  }

  const projectIrr = estimateIRR(projectCashflows);
  const equityIrr = estimateIRR(equityCashflows);
  const npv10 = calcNPV(projectCashflows, 0.10);

  let cumulative = -capex;
  let paybackYears = life;
  for (let y = 1; y <= life; y++) {
    cumulative += annualRevenue - annualOpex;
    if (cumulative >= 0) {
      paybackYears = y;
      break;
    }
  }

  const carbonAbatement = (annualEnergyYield / 1000) * CO2_FACTOR;
  const carbonRevenue = carbonAbatement * CO2_PRICE;

  let totalLifecycleCost = capex;
  for (let y = 1; y <= life; y++) {
    totalLifecycleCost += annualOpex;
    if (y % 10 === 0) totalLifecycleCost += capex * 0.05;
  }
  const totalLifecycleCostNpv = capex + annualOpex * ((1 - Math.pow(1 + WACC, -life)) / WACC);

  return {
    capex,
    annualOpex,
    annualEnergyYield,
    capacityFactor: cf,
    crf,
    lcoe,
    projectIrr,
    equityIrr,
    npv10,
    minDscr,
    paybackYears,
    annualRevenue,
    debtAmount,
    equityAmount,
    annualDebtService,
    carbonAbatement,
    carbonRevenue,
    totalLifecycleCost,
    totalLifecycleCostNpv,
  };
}

export function runSensitivity(project: Project): SensitivityResult[] {
  const results: SensitivityResult[] = [];
  const scenarios: { label: string; mod: Partial<Project> }[] = [
    { label: "Base Case", mod: {} },
    { label: "CAPEX +20%", mod: { cost_usd_million: project.cost_usd_million * 1.2 } },
    { label: "CAPEX −20%", mod: { cost_usd_million: project.cost_usd_million * 0.8 } },
    { label: "Capacity Factor +15%", mod: { capacity_factor: (project.capacity_factor ?? 0.25) * 1.15 } },
    { label: "Capacity Factor −15%", mod: { capacity_factor: (project.capacity_factor ?? 0.25) * 0.85 } },
    { label: "PPA Price +20%", mod: { ppa_price: (project.ppa_price ?? 0.10) * 1.2 } },
    { label: "PPA Price −20%", mod: { ppa_price: (project.ppa_price ?? 0.10) * 0.8 } },
  ];

  for (const s of scenarios) {
    const modded = { ...project, ...s.mod };
    const fin = calculatePFS(modded);
    if (fin) {
      results.push({
        scenario: s.label,
        irr: fin.projectIrr,
        lcoe: fin.lcoe,
        dscr: fin.minDscr,
        bankable: fin.minDscr >= 1.25 && fin.projectIrr >= 0.08,
      });
    }
  }
  return results;
}

export function getRiskRegister(project: Project) {
  const tech = project.technology || "solar_utility";
  const isHydro = tech === "hydro";
  const isMinigrid = tech.includes("minigrid") || tech.includes("shs");

  return [
    {
      id: 1, risk: "Financing Delay",
      description: "Failure to reach financial close within planned timeline",
      likelihood: project.status === "funded" ? "Low" : "High",
      impact: "High",
      rag: project.status === "funded" ? "Amber" : "Red",
      mitigation: "Engage DFIs early; prepare bankable documentation; secure GoSL sovereign guarantee if needed",
    },
    {
      id: 2, risk: "Procurement Delay",
      description: "NPPA procurement timelines exceed expectations",
      likelihood: "Medium",
      impact: "Medium",
      rag: "Amber",
      mitigation: "Early TOR preparation; pre-qualify EPC contractors; engage NPPA Secretariat for fast-track",
    },
    {
      id: 3, risk: "FX / Macro Risk",
      description: "Leone depreciation increases local-currency cost of imported equipment",
      likelihood: "High",
      impact: "Medium",
      rag: "Amber",
      mitigation: "USD-denominated PPA; FX hedging instruments; local content strategy to reduce import exposure",
    },
    {
      id: 4, risk: "Offtake / Payment Risk",
      description: "EDSA payment delays or inability to honor PPA obligations",
      likelihood: "High",
      impact: "High",
      rag: "Red",
      mitigation: "Escrow account for tariff collections; partial risk guarantee (MIGA/ATIDI); GoSL payment guarantee",
    },
    {
      id: 5, risk: "Construction Overrun",
      description: "Cost or schedule overruns during construction phase",
      likelihood: isHydro ? "High" : "Medium",
      impact: "High",
      rag: isHydro ? "Red" : "Amber",
      mitigation: "Fixed-price EPC contract; independent engineer; contingency budget (10–15% of CAPEX)",
    },
    {
      id: 6, risk: isHydro ? "Hydrological Variability" : "Seasonal Resource Risk",
      description: isHydro ? "Below-average rainfall reduces generation output" : "Seasonal cloud cover or harmattan dust reduces solar yield",
      likelihood: "Medium",
      impact: isHydro ? "High" : "Medium",
      rag: isHydro ? "Amber" : "Green",
      mitigation: isHydro ? "Use P75/P90 hydrology scenarios; reservoir storage buffer; diversify generation portfolio" : "Conservative P75 yield estimate; panel cleaning protocol; battery sizing for seasonal variation",
    },
    {
      id: 7, risk: "Regulatory Change",
      description: "EWRC tariff adjustments or license conditions change project economics",
      likelihood: "Low",
      impact: "High",
      rag: "Amber",
      mitigation: "Long-term PPA with stabilization clause; engagement with EWRC regulatory roadmap; tariff indexation formula",
    },
    {
      id: 8, risk: "Community / Social Risk",
      description: isHydro ? "Community opposition to dam/reservoir or resettlement requirements" : (isMinigrid ? "Low willingness to pay or tariff resistance in target communities" : "Land acquisition challenges or community opposition"),
      likelihood: isHydro ? "Medium" : "Low",
      impact: isHydro ? "High" : "Medium",
      rag: isHydro ? "Amber" : "Green",
      mitigation: "Early community engagement; benefit-sharing mechanism; grievance redress mechanism; FPIC compliance",
    },
  ];
}

export function getComparables(technology: string) {
  const comparables: Record<string, { name: string; country: string; mw: number; costPerMw: number; tariff: number; dfis: string }[]> = {
    hydro: [
      { name: "Ruzizi III", country: "DRC/Rwanda/Burundi", mw: 147, costPerMw: 3.1, tariff: 0.065, dfis: "AfDB, World Bank, KfW" },
      { name: "Nachtigal", country: "Cameroon", mw: 420, costPerMw: 2.8, tariff: 0.07, dfis: "IFC, AfDB, PIDG, EIB" },
      { name: "Bumbuna II (Phase 1)", country: "Sierra Leone", mw: 55, costPerMw: 3.3, tariff: 0.09, dfis: "Government of China EXIM" },
    ],
    solar_utility: [
      { name: "Kigali Solar", country: "Rwanda", mw: 30, costPerMw: 1.05, tariff: 0.085, dfis: "IFC, FinnFund" },
      { name: "Soroti Solar", country: "Uganda", mw: 10, costPerMw: 1.2, tariff: 0.11, dfis: "KfW, GET FiT" },
      { name: "Boundiali Solar", country: "Côte d'Ivoire", mw: 37.5, costPerMw: 0.95, tariff: 0.069, dfis: "IFC, PIDG" },
    ],
    minigrid_solar: [
      { name: "PowerGen Tanzania Portfolio", country: "Tanzania", mw: 5, costPerMw: 6.5, tariff: 0.42, dfis: "PIDG, Shell Foundation" },
      { name: "Winch Energy Uganda", country: "Uganda", mw: 3, costPerMw: 7.2, tariff: 0.50, dfis: "EAIF, PIDG, REPP" },
      { name: "BBOXX Togo", country: "Togo", mw: 2, costPerMw: 5.8, tariff: 0.38, dfis: "EIB, BOAD, GCF" },
    ],
  };

  return comparables[technology] || comparables.solar_utility;
}

export function formatUSD(value: number): string {
  if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (Math.abs(value) >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
  return `$${value.toFixed(2)}`;
}

export function formatPct(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}
