"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import projectsRaw from "@/data/projects.json";
import type { Project } from "@/lib/types";
import {
  calculatePFS,
  runSensitivity,
  getRiskRegister,
  getComparables,
  formatUSD,
  formatPct,
} from "@/lib/pfs-calculations";

const projects = projectsRaw as { last_updated: string; projects: Project[] };

function Section({ num, title, children }: { num: number; title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8 break-inside-avoid">
      <h2 className="text-lg font-bold text-cdmu-navy border-b-2 border-cdmu-gold pb-1 mb-3">
        {num}. {title}
      </h2>
      <div className="text-sm text-gray-800 leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: (string | number)[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-cdmu-navy text-white">
            {headers.map((h) => (
              <th key={h} className="px-3 py-2 text-left font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2 border-b border-gray-200">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PFSPage() {
  const params = useParams();
  const id = params.id as string;
  const project = projects.projects.find((p) => p.id === id);

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-cdmu-navy mb-2">Project Not Found</h1>
          <Link href="/" className="text-cdmu-teal hover:underline">← Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const fin = calculatePFS(project);
  const sensitivity = runSensitivity(project);
  const risks = getRiskRegister(project);
  const comparables = getComparables(project.technology || "solar_utility");
  const isGeneration = !!fin;
  const tech = project.technology || "solar_utility";
  const isHydro = tech === "hydro";
  const isMinigrid = tech.includes("minigrid");
  const isSHS = tech.includes("shs");
  const isTransmission = tech.includes("transmission");

  const techLabel: Record<string, string> = {
    hydro: "Run-of-River / Storage Hydropower",
    solar_utility: "Utility-Scale Solar PV",
    minigrid_solar: "Solar-Hybrid Mini-Grid",
    solar_shs: "Solar Home Systems (SHS)",
    transmission_132kv: "132 kV Overhead Transmission Line",
    transmission_66kv: "66 kV Overhead Transmission Line",
    scada_ems: "SCADA / Energy Management System",
  };

  const pillarNames: Record<number, string> = {
    1: "Pillar 1 — Generation Capacity",
    2: "Pillar 2 — Transmission & Distribution",
    3: "Pillar 3 — On-Grid Distribution & Access",
    4: "Pillar 4 — Off-Grid & Last-Mile Access",
    5: "Pillar 5 — Clean Cooking",
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-8 py-10 print:px-4 print:py-2">
        <div className="flex items-center justify-between mb-6 print:hidden">
          <Link href="/" className="text-cdmu-teal hover:underline text-sm">← Back to Dashboard</Link>
          <button
            onClick={() => window.print()}
            className="bg-cdmu-navy text-white px-4 py-2 rounded-lg text-sm hover:bg-cdmu-navy-light"
          >
            Export PDF
          </button>
        </div>

        {/* Section 1: Cover */}
        <Section num={1} title="Cover & Document Control">
          <div className="bg-gradient-to-r from-cdmu-green-dark to-cdmu-blue-dark text-white rounded-lg p-6 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <img src="/logos/coat-of-arms.webp" alt="Coat of Arms" className="w-12 h-12 object-contain print:w-10 print:h-10" />
              <img src="/logos/flag.png" alt="Sierra Leone" className="w-10 h-7 object-cover rounded-sm border border-white/30" />
            </div>
            <p className="text-xs text-cdmu-gold font-semibold mb-1">SIERRA LEONE M300 — COMPACT DELIVERY & MONITORING UNIT</p>
            <h1 className="text-2xl font-bold mb-2">Pre-Feasibility Study</h1>
            <p className="text-lg text-white/90">{project.name}</p>
          </div>
          <Table
            headers={["Field", "Value"]}
            rows={[
              ["Document ID", `CDMU-PFS-${project.id.toUpperCase()}-001`],
              ["Version", "1.0 — Draft"],
              ["Classification", "Official — For DFI Circulation"],
              ["Prepared by", "Compact Delivery & Monitoring Unit (CDMU)"],
              ["Date", projects.last_updated],
              ["Project", project.name],
              ["Technology", techLabel[tech] || tech],
            ]}
          />
        </Section>

        {/* Section 2: Executive Summary */}
        <Section num={2} title="Executive Summary">
          <p>
            This Pre-Feasibility Study evaluates the <strong>{project.name}</strong> project,
            a {techLabel[tech]?.toLowerCase() || tech} investment in the {project.region} region of Sierra Leone.
            The project is a priority intervention under the <strong>Mission 300 National Energy Compact</strong>,
            which targets increasing electricity access from 36% to 78% by 2030, requiring USD 2.245 billion in
            total investment across five strategic pillars.
          </p>
          <p>
            {project.description}
          </p>
          {isGeneration && fin && (
            <>
              <p className="font-semibold mt-2">Key Financial Metrics:</p>
              <Table
                headers={["Metric", "Value"]}
                rows={[
                  ["Capacity", `${project.capacity_mw} MW`],
                  ["Total Cost", `$${project.cost_usd_million}M`],
                  ["Cost per MW", formatUSD((project.cost_usd_million * 1e6) / (project.capacity_mw || 1)) + "/MW"],
                  ["LCOE", `$${fin.lcoe.toFixed(4)}/kWh`],
                  ["Project IRR", formatPct(fin.projectIrr)],
                  ["Equity IRR", formatPct(fin.equityIrr)],
                  ["Min DSCR", `${fin.minDscr.toFixed(2)}×`],
                  ["Connections", (project.connections || 0).toLocaleString()],
                  ["People Served", (project.population_served || 0).toLocaleString()],
                ]}
              />
            </>
          )}
        </Section>

        {/* Section 3: Country & Regulatory Context */}
        <Section num={3} title="Country & Regulatory Context">
          <p>
            Sierra Leone&apos;s electricity sector serves approximately 36% of the population (2024 baseline),
            with significant urban-rural disparity. The Mission 300 National Energy Compact, signed in 2025,
            targets 78% access by 2030 through USD 2.245B in planned investment. The Compact is structured
            around five pillars: generation, transmission, on-grid distribution, off-grid access, and clean cooking.
          </p>
          <p>
            The sector is regulated by the <strong>Electricity and Water Regulatory Commission (EWRC)</strong>,
            which approves tariffs, licenses, and quality standards. The Electricity Generation and Transmission
            Company (EGTC) operates generation and high-voltage transmission, while the Electricity Distribution
            and Supply Authority (EDSA) handles distribution and retail. The Directorate of Alternative and
            Renewable Energy Sources (DARES) oversees off-grid and mini-grid regulation.
          </p>
          <p>
            <strong>M300 Alignment:</strong> This project falls under{" "}
            <strong>{pillarNames[project.pillar || 1]}</strong> of the Compact.
            {isHydro && " It supports the generation expansion target of 487 MW installed capacity by 2030."}
            {tech === "solar_utility" && " It contributes to the renewable energy share target of 52% by 2030."}
            {isMinigrid && " It directly supports the off-grid target of 50% off-grid access by 2030 (from 15% baseline)."}
          </p>
          <p>
            <strong>Applicable Tariff:</strong>{" "}
            {isMinigrid || isSHS
              ? "Off-grid tariff under EWRC Mini-Grid Regulatory Framework (2023), allowing cost-reflective pricing with cross-subsidy from RBF instruments."
              : "EWRC Bulk Supply Tariff for IPPs, currently negotiated via bilateral PPA with EDSA/EGTC. Average approved tariff: $0.08–0.14/kWh depending on technology and risk profile."}
          </p>
        </Section>

        {/* Section 4: Project Identification */}
        <Section num={4} title="Project Identification">
          <Table
            headers={["Field", "Value"]}
            rows={[
              ["Project ID", project.id],
              ["M300 Pillar", pillarNames[project.pillar || 1]],
              ["Type", techLabel[tech] || tech],
              ["Location", project.location || project.region],
              ["GPS Estimate", project.gps ? `${project.gps.lat}°N, ${Math.abs(project.gps.lng)}°W` : "TBD"],
              ["Lead Entity", project.lead || "Ministry of Energy"],
              ["Target Date", project.target_date || "TBD"],
              ["Stage", project.stage || project.status],
              ["Cost Estimate", `USD ${project.cost_usd_million}M`],
              ["Capacity", project.capacity_mw ? `${project.capacity_mw} MW` : "N/A"],
            ]}
          />
        </Section>

        {/* Section 5: Site & Resource Assessment */}
        <Section num={5} title="Site & Resource Assessment">
          {isHydro && (
            <>
              <p>
                <strong>Hydrology:</strong> Sierra Leone has significant hydropower potential, with mean annual
                rainfall of 2,500–3,500 mm and multiple river basins (Rokel/Seli, Moa, Sewa, Jong). The project
                site at <strong>{project.location}</strong> benefits from a catchment area with reliable year-round
                flow, though seasonal variation (June–October wet season) requires careful storage/run-of-river design.
              </p>
              <p>
                <strong>Resource data:</strong> Hydrological records from SLRA gauging stations and satellite-derived
                precipitation data (CHIRPS, ERA5) indicate mean annual flow sufficient for a capacity factor of{" "}
                {formatPct(project.capacity_factor || 0.35)} (P50 estimate). P75 and P90 scenarios should be modeled
                during full feasibility.
              </p>
            </>
          )}
          {(tech === "solar_utility" || isMinigrid || isSHS) && (
            <>
              <p>
                <strong>Solar Resource:</strong> Sierra Leone receives Global Horizontal Irradiance (GHI) of
                1,300–1,600 kWh/m²/yr across the country (source: Global Solar Atlas / ENERGYDATA.INFO).
                The {project.region} region averages approximately 1,450 kWh/m²/yr GHI, suitable for
                solar PV deployment with expected capacity factor of {formatPct(project.capacity_factor || 0.21)}.
              </p>
              <p>
                <strong>Seasonality:</strong> Peak irradiance occurs December–April (dry season / harmattan);
                lowest irradiance July–August (rainy season). Battery storage sizing should account for 4–6 hours
                of autonomy during low-irradiance periods.
              </p>
            </>
          )}
          {isTransmission && (
            <p>
              <strong>Route Assessment:</strong> The proposed {project.location} corridor traverses mixed terrain
              including savanna, secondary forest, and river crossings. Preliminary routing avoids protected areas
              and minimizes resettlement. Detailed LIDAR survey and route optimization required during full feasibility.
            </p>
          )}
          <p>
            <strong>Land Tenure:</strong> Land in Sierra Leone is predominantly governed by customary tenure,
            with the Provinces Land Act and National Land Commission overseeing formal registration. Land
            acquisition requires community consultation and compensation in accordance with the 2022 Customary
            Land Rights Act. Status: {project.status === "funded" ? "Land acquisition process initiated" : "To be confirmed during feasibility"}.
          </p>
        </Section>

        {/* Section 6: Technical Description */}
        <Section num={6} title="Technical Description">
          <p>
            <strong>Technology:</strong> {techLabel[tech] || tech}
          </p>
          <p>
            <strong>System Design:</strong> {project.description}
          </p>
          {isGeneration && fin && (
            <>
              <p>
                <strong>Annual Energy Yield Calculation:</strong>
              </p>
              <div className="bg-gray-50 p-3 rounded font-mono text-xs">
                AEY = Capacity × Capacity Factor × 8,760 hours<br />
                AEY = {project.capacity_mw} MW × {(project.capacity_factor || 0.21).toFixed(2)} × 8,760<br />
                AEY = <strong>{(fin.annualEnergyYield / 1000).toFixed(1)} MWh/yr</strong> ({(fin.annualEnergyYield).toLocaleString()} kWh/yr)
              </div>
            </>
          )}
        </Section>

        {/* Section 7: Demand & Market Analysis */}
        <Section num={7} title="Demand & Market Analysis">
          <Table
            headers={["Metric", "Value"]}
            rows={[
              ["Population Served", (project.population_served || 0).toLocaleString()],
              ["Households", (project.households || 0).toLocaleString()],
              ["Target Connections", (project.connections || 0).toLocaleString()],
              ["Avg HH Size", "5–6 persons"],
              ["HH Demand (Tier)", isMinigrid || isSHS ? "Tier 2–3 (50–200 Wh/day)" : "Tier 3–4 (200–800 Wh/day)"],
            ]}
          />
          <p>
            <strong>Anchor Load:</strong>{" "}
            {isMinigrid
              ? "Identified anchor loads include mobile tower operators, agricultural processing (rice mills, cassava graters), cold storage, and public institutions (health centers, schools)."
              : isTransmission
              ? "Mining operations along the corridor provide critical anchor load for cost recovery and cross-subsidization of residential connections."
              : "EDSA grid serves as primary offtaker via Power Purchase Agreement. Industrial and commercial loads in " + project.region + " provide baseload demand."}
          </p>
          <p>
            <strong>Productive Use:</strong> Electrification supports local economic activity including
            agricultural processing, welding/carpentry, cold chain for fisheries, ICT services, and improved
            education/health service delivery.
          </p>
        </Section>

        {/* Sections 8-9: Financial Model */}
        {isGeneration && fin && (
          <>
            <Section num={8} title="Financial Model — Inputs">
              <p className="italic text-xs text-gray-500 mb-2">
                All assumptions are flagged with [A]. Values may change during full feasibility.
              </p>
              <Table
                headers={["Parameter", "Value", "Source/Basis"]}
                rows={[
                  ["CAPEX", formatUSD(fin.capex), `$${(fin.capex / (project.capacity_mw! * 1e6)).toFixed(2)}M/MW [A]`],
                  ["OPEX (annual)", formatUSD(fin.annualOpex), `${formatPct(project.opex_pct || 0.025)} of CAPEX/yr [A]`],
                  ["Capacity Factor", formatPct(fin.capacityFactor), `${isHydro ? "Weighted hydrology P50" : "Global Solar Atlas"} [A]`],
                  ["PPA Price", `$${(project.ppa_price || 0.10).toFixed(2)}/kWh`, "EWRC benchmark / comparable projects [A]"],
                  ["Project Life", `${project.project_life || 25} years`, "Industry standard [A]"],
                  ["Debt : Equity", `${((project.debt_ratio || 0.7) * 100).toFixed(0)} : ${((1 - (project.debt_ratio || 0.7)) * 100).toFixed(0)}`, "DFI standard [A]"],
                  ["Interest Rate", formatPct(project.interest_rate || 0.08), "Concessional blended rate [A]"],
                  ["Loan Tenure", `${project.loan_tenure || 15} years`, "DFI standard [A]"],
                  ["WACC", "12.0%", "Sierra Leone country risk premium [A]"],
                  ["Discount Rate (NPV)", "10.0%", "Social opportunity cost [A]"],
                ]}
              />
            </Section>

            <Section num={9} title="Financial Model — Outputs">
              <Table
                headers={["Metric", "Value", "Benchmark"]}
                rows={[
                  ["LCOE", `$${fin.lcoe.toFixed(4)}/kWh`, `IRENA 2024: ${isHydro ? "$0.04–0.08" : "$0.03–0.06"}/kWh`],
                  ["Project IRR", formatPct(fin.projectIrr), "Target: ≥ 8–10%"],
                  ["Equity IRR", formatPct(fin.equityIrr), "DFI target: 12–18%"],
                  ["NPV @10%", formatUSD(fin.npv10), fin.npv10 > 0 ? "Positive — viable" : "Negative — review assumptions"],
                  ["Min DSCR", `${fin.minDscr.toFixed(2)}×`, fin.minDscr >= 1.25 ? "≥ 1.25× — bankable" : "< 1.25× — FLAG"],
                  ["Simple Payback", `${fin.paybackYears} years`, `Of ${project.project_life || 25}yr life`],
                  ["Annual Revenue", formatUSD(fin.annualRevenue), ""],
                  ["Annual Debt Service", formatUSD(fin.annualDebtService), ""],
                ]}
              />
              <div className="bg-gray-50 p-3 rounded font-mono text-xs mt-2">
                <strong>LCOE Calculation:</strong><br />
                CRF = [WACC × (1+WACC)^n] / [(1+WACC)^n − 1]<br />
                CRF = [0.12 × (1.12)^{project.project_life || 25}] / [(1.12)^{project.project_life || 25} − 1] = {fin.crf.toFixed(4)}<br />
                LCOE = [CAPEX × CRF + Annual OPEX] / Annual Energy Yield<br />
                LCOE = [{formatUSD(fin.capex)} × {fin.crf.toFixed(4)} + {formatUSD(fin.annualOpex)}] / {fin.annualEnergyYield.toLocaleString()} kWh<br />
                LCOE = <strong>${fin.lcoe.toFixed(4)}/kWh</strong>
              </div>
              {fin.minDscr < 1.25 && (
                <div className="bg-red-50 border border-red-200 p-3 rounded mt-2">
                  <p className="text-red-800 font-semibold text-xs">
                    ⚠ FLAG: Min DSCR of {fin.minDscr.toFixed(2)}× is below the 1.25× threshold required by most DFIs.
                    Consider adjusting PPA price, extending loan tenure, or blending with grant/concessional finance.
                  </p>
                </div>
              )}
            </Section>
          </>
        )}

        {/* Section 10: Sensitivity Analysis */}
        {isGeneration && sensitivity.length > 0 && (
          <Section num={10} title="Sensitivity Analysis">
            <Table
              headers={["Scenario", "Project IRR", "LCOE ($/kWh)", "Min DSCR", "Bankable?"]}
              rows={sensitivity.map((s) => [
                s.scenario,
                formatPct(s.irr),
                `$${s.lcoe.toFixed(4)}`,
                `${s.dscr.toFixed(2)}×`,
                s.bankable ? "✅ Yes" : "⚠ Review",
              ])}
            />
            <p className="mt-2">
              <strong>Bankability Assessment:</strong>{" "}
              {sensitivity.filter((s) => s.bankable).length >= 5
                ? "The project maintains bankability across most stress scenarios. It is considered commercially viable for DFI financing."
                : sensitivity.filter((s) => s.bankable).length >= 3
                ? "The project is marginally bankable. Under adverse conditions (CAPEX overrun + low capacity factor), returns fall below DFI thresholds. Risk mitigation instruments (guarantees, RBF) recommended."
                : "The project faces significant bankability challenges under stress. Grant blending, viability gap funding, or concessional terms required to achieve financial close."}
            </p>
          </Section>
        )}

        {/* Section 11: Financing Structure */}
        <Section num={11} title="Financing Structure & Gap">
          {isGeneration && fin && (
            <Table
              headers={["Source", "Amount", "% of CAPEX", "Status"]}
              rows={[
                ["Senior Debt (DFI)", formatUSD(fin.debtAmount), formatPct(project.debt_ratio || 0.7), "Pipeline"],
                ["Equity (Developer/GoSL)", formatUSD(fin.equityAmount), formatPct(1 - (project.debt_ratio || 0.7)), "Pipeline"],
                ["Total", formatUSD(fin.capex), "100%", ""],
              ]}
            />
          )}
          <p>
            <strong>Risk Instruments Available:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>ATIDI / MIGA Political Risk Insurance — covers expropriation, currency transfer, political violence</li>
            <li>GCF Concessional Finance — available for renewable energy, up to 50% concessional blend</li>
            <li>RBF / Output-Based Aid — World Bank ESMAP / EnDev results-based financing for connections</li>
            <li>PIDG / InfraCo — project development capital for early-stage preparation</li>
          </ul>
          <p>
            <strong>Financing Gap:</strong> {project.status === "funded"
              ? "Project is fully funded. No financing gap identified."
              : `Estimated gap of ${formatUSD((project.cost_usd_million * 1e6) * 0.4)} pending confirmed DFI commitments. Active engagement with AfDB, IFC, and bilateral DFIs.`}
          </p>
        </Section>

        {/* Section 12: ESIA */}
        <Section num={12} title="ESIA Checklist">
          <Table
            headers={["Standard", "Screening Result"]}
            rows={[
              ["IFC PS1 — Assessment & Management", "Required — Social & environmental assessment needed"],
              ["IFC PS2 — Labor & Working Conditions", "Required — Construction workforce management plan"],
              ["IFC PS3 — Resource Efficiency & Pollution", isHydro ? "Required — Downstream flow regime, sediment" : "Low risk — Minimal pollution footprint"],
              ["IFC PS4 — Community Health & Safety", "Required — Community safety plan during construction"],
              ["IFC PS5 — Land Acquisition & Resettlement", isHydro ? "FLAG — Reservoir may trigger involuntary resettlement" : "Low risk — Minimal land footprint"],
              ["IFC PS6 — Biodiversity", isHydro ? "FLAG — Aquatic biodiversity impact assessment required" : "Low risk — Screening needed"],
              ["IFC PS7 — Indigenous Peoples", "Screening required — Consult with relevant communities"],
              ["IFC PS8 — Cultural Heritage", "Screening required — Chance find procedure"],
              ["World Bank ESF Category", isHydro ? "Category A — Full EIA required" : "Category B — Limited EIA"],
            ]}
          />
        </Section>

        {/* Section 13: Procurement Readiness */}
        <Section num={13} title="Procurement Readiness">
          <Table
            headers={["Gate", "Status", "Target Date"]}
            rows={[
              ["TOR Drafted", project.status === "funded" || project.status === "procurement" ? "✅ Complete" : "⏳ Pending", ""],
              ["Procurement Committee Formed", project.status === "funded" ? "✅ Yes" : "⏳ Pending", ""],
              ["NPPA Compliance", "✅ Required — National Public Procurement Authority", ""],
              ["EPC Shortlist", project.status === "procurement" ? "✅ In Progress" : "⏳ Not Started", ""],
              ["RFP Issued", project.status === "procurement" ? "⏳ In Progress" : "⏳ Pending", ""],
              ["Financial Close Target", "", project.target_date || "TBD"],
            ]}
          />
        </Section>

        {/* Section 14: Risk Register */}
        <Section num={14} title="Risk Register">
          <Table
            headers={["#", "Risk", "Likelihood", "Impact", "RAG", "Mitigation"]}
            rows={risks.map((r) => [
              r.id,
              r.risk,
              r.likelihood,
              r.impact,
              r.rag === "Red" ? "🔴 Red" : r.rag === "Amber" ? "🟡 Amber" : "🟢 Green",
              r.mitigation,
            ])}
          />
        </Section>

        {/* Section 15: Lifecycle Cost */}
        {isGeneration && fin && (
          <Section num={15} title="Lifecycle Cost Analysis">
            <Table
              headers={["Component", "Nominal Value", "Notes"]}
              rows={[
                ["CAPEX", formatUSD(fin.capex), "Initial investment"],
                ["Cumulative OPEX", formatUSD(fin.annualOpex * (project.project_life || 25)), `${project.project_life || 25} years × ${formatUSD(fin.annualOpex)}/yr`],
                ["Major Maintenance Reserve", formatUSD(fin.capex * 0.05 * Math.floor((project.project_life || 25) / 10)), "5% CAPEX every 10 years"],
                ["End-of-Life / Decommissioning", formatUSD(fin.capex * 0.03), "3% of CAPEX [A]"],
                ["Total Lifecycle Cost (Nominal)", formatUSD(fin.totalLifecycleCost), ""],
                ["Total Lifecycle Cost (NPV @12%)", formatUSD(fin.totalLifecycleCostNpv), "Discounted at WACC"],
              ]}
            />
          </Section>
        )}

        {/* Section 16: Gender & Inclusion */}
        <Section num={16} title="Gender & Inclusion Assessment">
          <p>
            <strong>Female-Headed Households:</strong> Approximately 28–32% of households in the beneficiary zone
            are female-headed (Sierra Leone DHS 2019). Targeted outreach and subsidy design must address barriers
            to access for women.
          </p>
          <p><strong>Gender Action Plan:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>30% female employment target during construction (unskilled labor, community liaison)</li>
            <li>Gender-responsive tariff design — lifeline tariff for female-headed households</li>
            <li>Women-focused productive use training (agricultural processing, tailoring, phone charging)</li>
            <li>Female representation on community energy committees (minimum 40%)</li>
          </ul>
          <p>
            <strong>Pro-Poor Subsidy:</strong> Connection subsidies targeted at bottom 40% income quintile,
            verified through community-based targeting (CBT) with local chieftaincy validation.
          </p>
        </Section>

        {/* Section 17: Comparable Projects */}
        <Section num={17} title="Comparable Project Benchmarks">
          <Table
            headers={["Project", "Country", "MW", "$/MW (M)", "Tariff ($/kWh)", "DFIs"]}
            rows={comparables.map((c) => [
              c.name,
              c.country,
              c.mw,
              `$${c.costPerMw.toFixed(1)}M`,
              `$${c.tariff.toFixed(3)}`,
              c.dfis,
            ])}
          />
          <p className="mt-2">
            <strong>Benchmark Assessment:</strong> The {project.name} at{" "}
            ${((project.cost_usd_million) / (project.capacity_mw || 1)).toFixed(1)}M/MW{" "}
            {((project.cost_usd_million) / (project.capacity_mw || 1)) <= comparables.reduce((sum, c) => sum + c.costPerMw, 0) / comparables.length
              ? "is within or below the range of comparable projects, indicating competitive pricing."
              : "is above the average of comparable projects. Cost optimization during detailed design is recommended."}
          </p>
        </Section>

        {/* Section 18: Climate & Carbon */}
        <Section num={18} title="Climate & Carbon Assessment">
          {isGeneration && fin && (
            <Table
              headers={["Metric", "Value"]}
              rows={[
                ["Renewable Content", "100%"],
                ["Grid Emission Factor", "0.52 tCO₂/MWh (Sierra Leone, UNFCCC)"],
                ["Annual CO₂ Abatement", `${fin.carbonAbatement.toLocaleString(undefined, { maximumFractionDigits: 0 })} tCO₂/yr`],
                ["Carbon Revenue (@$10/tCO₂)", `${formatUSD(fin.carbonRevenue)}/yr`],
                ["NDC Alignment", "Yes — Sierra Leone Updated NDC (2021) targets 26% emissions reduction by 2030"],
              ]}
            />
          )}
          <p>
            <strong>Carbon Revenue Calculation:</strong>
          </p>
          {isGeneration && fin && (
            <div className="bg-gray-50 p-3 rounded font-mono text-xs">
              CO₂ Abatement = AEY (MWh) × Grid EF (tCO₂/MWh)<br />
              = {(fin.annualEnergyYield / 1000).toFixed(0)} MWh × 0.52 = <strong>{fin.carbonAbatement.toFixed(0)} tCO₂/yr</strong><br />
              Carbon Revenue = {fin.carbonAbatement.toFixed(0)} × $10 = <strong>{formatUSD(fin.carbonRevenue)}/yr</strong>
            </div>
          )}
        </Section>

        {/* Section 19: Next Steps */}
        <Section num={19} title="Next Steps & Recommended Actions">
          <Table
            headers={["#", "Action", "Responsible", "Target Date"]}
            rows={[
              [1, "Complete full feasibility study including bankable financial model", project.lead || "CDMU / Consultant", "Q3 2026"],
              [2, "Secure environmental and social impact assessment (ESIA)", "EPA-SL / ESIA Consultant", "Q4 2026"],
              [3, "Engage DFIs for term sheet negotiations", "CDMU / Ministry of Finance", "Q1 2027"],
              [4, "Initiate NPPA-compliant procurement process", "NPPA / Procurement Committee", "Q2 2027"],
              [5, "Achieve financial close and commence construction", project.lead || "Developer / EPC", project.target_date || "TBD"],
            ]}
          />
        </Section>

        {/* Section 20: Annexes */}
        <Section num={20} title="Annexes & Data Sources">
          <p><strong>Key Assumptions:</strong></p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>[A] WACC of 12% reflects Sierra Leone country risk premium (Damodaran 2024)</li>
            <li>[A] Capacity factors based on Global Solar Atlas (solar) / SLRA hydrology records (hydro)</li>
            <li>[A] OPEX percentages from IRENA Renewable Power Generation Costs 2024</li>
            <li>[A] PPA prices benchmarked against EWRC approved tariffs and regional comparables</li>
            <li>[A] Debt/equity ratio and terms based on standard DFI infrastructure financing terms</li>
            <li>[A] Population and household estimates from Statistics Sierra Leone (Census 2015, projected)</li>
          </ul>
          <p className="mt-2"><strong>Benchmark Sources:</strong></p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>IRENA — Renewable Power Generation Costs in 2024</li>
            <li>AMDA — Africa Mini-Grid Developers Association Benchmarking Report 2024</li>
            <li>World Bank — DRE Atlas Settlement Data for Sierra Leone</li>
            <li>Global Solar Atlas — Solar resource assessment</li>
            <li>ENERGYDATA.INFO — Transmission and infrastructure data</li>
            <li>IFC Performance Standards (2012) — Environmental and social safeguards</li>
            <li>Sierra Leone Updated NDC (2021)</li>
          </ul>
          <p className="mt-2 text-xs text-gray-500">
            <strong>Data Confidence:</strong> This pre-feasibility study uses publicly available data and industry
            benchmarks. Financial projections are indicative and subject to refinement during full feasibility.
            All flagged assumptions [A] require validation with site-specific data.
          </p>
        </Section>

        {/* Footer */}
        <div className="border-t-2 border-cdmu-navy pt-4 mt-8 text-center text-xs text-gray-500">
          <p className="font-semibold text-cdmu-navy">Sierra Leone Compact Delivery & Monitoring Unit</p>
          <p>Mission 300 — National Energy Compact</p>
          <p className="mt-1">Document generated {projects.last_updated} · Pre-Feasibility Level · Not for Investment Decision</p>
        </div>
      </div>
    </div>
  );
}
