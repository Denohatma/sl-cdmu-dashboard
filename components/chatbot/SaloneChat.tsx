"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
  tab?: string;
}

interface KnowledgeEntry {
  keywords: string[];
  answer: string;
  tab?: string;
}

const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  // --- Greetings ---
  {
    keywords: ["hello", "hi", "hey", "good morning", "good afternoon", "good evening", "yo", "greetings"],
    answer: "Kusheh! Aw di bodi? (Hello! How are you?)\n\nA na **Salone**, yu gayd to di Sierra Leone Mission 300 Energy Compact dashboard. (I'm **Salone**, your guide to the Sierra Leone Mission 300 Energy Compact dashboard.)\n\nAsk me about projects, targets, investments, districts, or anything on the platform — I'll point you to the right place!",
  },
  {
    keywords: ["help", "what can you do", "how to use", "guide"],
    answer: "A de yah fo ep yu! (I'm here to help you!)\n\nI can assist with:\n\n- **Overview** — Compact targets, KPI progress, strategic pillars\n- **Pillars** — The 5 strategic pillars and their progress\n- **Investment** — Funding sources, partner pipeline, disbursement\n- **Projects** — All 24 priority MoE projects, PFS reports\n- **Portfolio Dev** — District-level project analysis\n- **M&E** — KPI tracking, results framework, data quality\n- **Timeline** — Key milestones and deadlines\n- **Resources** — Documents and reference materials\n\nJust ask a question and I'll guide you to the right tab!",
  },

  // --- Mission 300 & Compact ---
  {
    keywords: ["mission 300", "m300", "what is mission", "about mission"],
    answer: "**Mission 300** is a joint AfDB-World Bank initiative to connect 300 million Africans to electricity by 2030.\n\nSierra Leone's **National Energy Compact** signed at UNGA 79 (Sep 2024) targets:\n- **36% → 78%** electricity access by 2030\n- **$3.99B** total project pipeline (24 MoE projects)\n- **5 strategic pillars** spanning generation, transmission, distribution, off-grid, and clean cooking\n\n👉 Check the **Overview** tab for the full compact summary and KPI speedometers.",
    tab: "overview",
  },
  {
    keywords: ["cdmu", "compact delivery", "monitoring unit"],
    answer: "The **Compact Delivery & Monitoring Unit (CDMU)** is established under the Ministry of Energy to:\n\n- Coordinate all M300 implementation across sectors\n- Track KPIs against targets (currently 42% access vs 78% target)\n- Facilitate project preparation and investor engagement\n- Manage this GIS-based monitoring dashboard\n\n👉 The **M&E** tab shows the full results framework and KPI tracking.",
    tab: "me",
  },

  // --- Pillars ---
  {
    keywords: ["pillar", "five pillars", "strategic pillar", "pillars"],
    answer: "The **5 Strategic Pillars** of the National Energy Compact:\n\n1. **Generation Capacity** — 200 MW → 450+ MW (hydro, solar, thermal)\n2. **Transmission & Distribution** — 132/66 kV backbone corridors (Northern, Southern, Eastern)\n3. **On-Grid Distribution** — EDSA connections 300K → 800K+ metered customers\n4. **Off-Grid & Last-Mile** — 200+ mini-grids + 400K solar home systems\n5. **Clean Cooking** — 500K+ households to LPG, ICS, and electric cooking\n\n👉 See detailed progress on the **Pillars** tab.",
    tab: "pillars",
  },

  // --- KPIs & Targets ---
  {
    keywords: ["kpi", "target", "progress", "access rate", "electrification rate", "speedometer", "current"],
    answer: "**Current KPI Progress** (as of July 2026):\n\n| KPI | Baseline | Current | Target 2030 | Progress |\n|-----|----------|---------|-------------|----------|\n| Electricity Access | 36% | **42%** | 78% | 14% |\n| Clean Cooking | 1.5% | **3.8%** | 25% | 10% |\n| Renewable Share | 46% | **48%** | 52% | 33% |\n| Private Capital | $615M | **$872M** | $1.4B | 33% |\n\n👉 View the speedometers on the **Overview** tab, full framework on **M&E** tab.",
    tab: "overview",
  },
  {
    keywords: ["electricity access", "access", "78 percent", "78%"],
    answer: "Sierra Leone's electricity access rate is currently **42%** (up from 36% baseline in 2025), targeting **78% by 2030**.\n\nThis requires connecting ~5.2 million additional people through:\n- On-grid EDSA expansion (300K → 800K+ meters)\n- 400,000 solar home systems (Tier 1 & 2)\n- 200+ mini-grids in rural market towns\n- Off-grid: 15% → 50% | On-grid: 21% → 28%\n\n👉 Check the **Overview** tab for the access rate speedometer.",
    tab: "overview",
  },
  {
    keywords: ["clean cooking", "cookstove", "lpg", "cooking"],
    answer: "**Clean Cooking Access** stands at 3.8% (baseline 1.5%), targeting 25% by 2030.\n\nBreakdown targets:\n- LPG: 0.9% → 10%\n- Charcoal improved: 0% → 10%\n- Fire improved: 0% → 25%\n- Bioethanol: 0% → 2%\n- Electric cooking: 0% → 0.5%\n\nThe **ECOWAS 20/20 Clean Cooking** project ($0.3M) provides subsidized cookstoves. Pillar 5 addresses this.\n\n👉 See **Pillars** tab for clean cooking progress.",
    tab: "pillars",
  },

  // --- Investment & Funding ---
  {
    keywords: ["investment", "funding", "cost", "money", "billion", "finance", "capital"],
    answer: "**Investment Summary:**\n\n- Total pipeline: **$3,989.9M** across 24 MoE projects\n- Total compact requirement: **$2.245B**\n- Private capital mobilized: **$872M** of $1.4B target\n\nTop funders: MCC ($494M), World Bank/RESPITE ($75M), DFC/EBID ($412M for NANT), Joule Africa ($1.2B for Bumbuna II)\n\n👉 See full breakdown on the **Investment** tab, including partner pipeline & prospects.",
    tab: "investments",
  },
  {
    keywords: ["mcc", "millennium challenge"],
    answer: "The **MCC Compact** is the largest single energy investment at **$494M**, signed April 2025:\n\n- Southern Transmission Corridor (Freetown–Bo–Kenema)\n- Distribution rehabilitation (EDSA)\n- National Dispatch Center (SCADA/EMS)\n- Governance reform & institutional strengthening\n\nStatus: **In Progress** — grant + counterpart funding, investment ready.\n\n👉 View on the **Projects** tab.",
    tab: "projects",
  },
  {
    keywords: ["partner", "pipeline", "prospect", "investor", "dfi"],
    answer: "**Partner Pipeline & Prospects** (13 tracked):\n\n**Active (5):** IFC ($50M), KfW ($30M), EU/EIB ($50M), JICA ($15M), IsDB ($40M)\n**Pipeline (4):** AFC ($80M), PIDG/InfraCo ($25M), Afreximbank ($60M), BADEA ($35M)\n**Prospect (4):** GCF ($100M), USAID Power Africa ($20M), SIDA ($15M), China Exim ($200M)\n\n👉 See the full editable pipeline on the **Investment** tab.",
    tab: "investments",
  },

  // --- Generation Projects ---
  {
    keywords: ["bumbuna", "bumbuna ii", "bumbuna 2"],
    answer: "**Bumbuna Hydropower Projects:**\n\n- **Bumbuna II** — 143 MW new-build, $1.2B, Joule Africa. Pending financial close. Seli River downstream.\n- **Bumbuna I Upgrade** — 50 → 100 MW, $70M, OFID/BADEA. Pending funding approval. Turbine overhaul + new units.\n\nBoth in Tonkolili District, Northern Region. Combined 243 MW clean baseload.\n\n👉 Details on the **Projects** tab.",
    tab: "projects",
  },
  {
    keywords: ["respite", "solar storage", "world bank solar"],
    answer: "**RESPITE Solar + Storage** — $75M, 50 MW\n\nRegional Emergency Solar Power Intervention Project:\n- Status: **In Progress** — feasibility completed, approved, land secured\n- Lead: World Bank / Ministry of Energy\n- Technology: Solar PV + battery storage\n- Target: 600,000 people, 60,000 connections\n- Grant-funded (0% debt)\n\n👉 View on the **Projects** tab.",
    tab: "projects",
  },
  {
    keywords: ["nant", "dfc", "108 mw"],
    answer: "**NANT Generation** — 108.4 MW, $412M\n\n- Status: **In Progress** — PPA in place, DFC/EBID-backed\n- Technology: Thermal/gas generation\n- Location: Western Area\n- 70% debt at 7% over 15 years\n- Serves 1.2M people, 120,000 connections\n\n👉 View on the **Projects** tab.",
    tab: "projects",
  },
  {
    keywords: ["bekongor", "150 mw", "odhav"],
    answer: "**Bekongor Dam** — 150 MW, $400M\n\n- Status: **Development** — Pending Cabinet Approval\n- Developer: ODHAV\n- Location: Koinadugu District, Northern Region\n- Zero-emission baseload, 40-year project life\n- Serves 1.5M people\n\n👉 View on the **Projects** tab.",
    tab: "projects",
  },
  {
    keywords: ["betmai", "sewa", "27 mw"],
    answer: "**Betmai Hydro** — 27 MW, $110M\n\n- Status: **Development** — Pending financial close\n- Developer: Sewa Energy Resource Limited\n- Location: Sewa River, Eastern Region\n- Run-of-river hydropower, 30-year life\n- 200,000 people served\n\n👉 View on the **Projects** tab.",
    tab: "projects",
  },
  {
    keywords: ["scatec", "40 mw"],
    answer: "**Scatec Solar** — 40 MW, $60M\n\n- Status: **Development** — Pending Cabinet Approval\n- Developer: Release / Scatec\n- Location: Western Area\n- Solar equipment rental model\n- 75% debt at 7% over 15 years\n\n👉 View on the **Projects** tab.",
    tab: "projects",
  },
  {
    keywords: ["africa50", "kono solar", "50 mw solar"],
    answer: "**Africa50 Solar Kono** — 50 MW, $80M\n\n- Status: **Feasibility Ongoing**\n- Developer: Africa50 / HGR\n- Location: Kono District (post-mining land)\n- ESG-compliant, private sector ready\n- Serves 350,000 people\n\n👉 View on the **Projects** tab.",
    tab: "projects",
  },
  {
    keywords: ["lungi", "65 mw", "solar pv park"],
    answer: "**Lungi Solar PV Park** — 65 MW, $150M\n\n- Status: **Feasibility Completed**\n- Developer: LPD\n- Location: Lungi, Port Loko District (near airport)\n- PPA revenue model, 75% debt\n- Serves 400,000 people\n\n👉 View on the **Projects** tab.",
    tab: "projects",
  },
  {
    keywords: ["newton", "bess", "battery", "15 mw solar"],
    answer: "**Newton SPP with BESS** — 15 MW, $45M\n\n- Status: **Development** — Pending financial close\n- Developer: Taranis\n- Location: Newton, Western Area Rural\n- Solar + battery for grid resilience\n- Serves 150,000 people\n\n👉 View on the **Projects** tab.",
    tab: "projects",
  },
  {
    keywords: ["baoma", "serengeti", "norfund", "25 mw"],
    answer: "**Serengeti Baoma 1 Solar** — 25 MW, $7M\n\n- Status: **In Progress** — project ongoing\n- Consortium: Norfund, Swedfund, Proparco, KfW\n- Location: Baoma, Bo District\n- PPA in place, GHG emission reduction\n- Serves 200,000 people in Southern Region\n\n👉 View on the **Projects** tab.",
    tab: "projects",
  },
  {
    keywords: ["dodo", "dodo dam", "goma"],
    answer: "**Dodo Dam Rehabilitation** — 6 → 12 MW, $30M\n\n- Status: **Feasibility** — Bankable, sourcing sponsor\n- Location: Kenema District, Eastern Region\n- Restoration + capacity expansion\n- Ministry of Energy seeking project sponsor\n\n👉 View on the **Projects** tab.",
    tab: "projects",
  },
  {
    keywords: ["moyamba", "singimi"],
    answer: "**Moyamba Singimi** — 15.4 MW, $104.2M\n\n- Status: **Feasibility — Early Stage**\n- Location: Singimi, Moyamba District\n- Hydropower, project report developed\n- Requires full ESIA & community impact assessment\n\n👉 View on the **Projects** tab.",
    tab: "projects",
  },
  {
    keywords: ["seven district", "7 district", "district hq", "headquarter"],
    answer: "**Electrification of 7 District HQ Towns** — $30.7M, 14 MW\n\n- Status: **In Progress** — Government-funded\n- Solar hybrid technology\n- 350,000 people served, 35,000 connections\n- Energy access expansion to underserved capitals\n\n👉 View on the **Projects** tab.",
    tab: "projects",
  },

  // --- Transmission ---
  {
    keywords: ["transmission", "corridor", "grid backbone"],
    answer: "**Transmission Corridors:**\n\n- **Northern Corridor** — $100M, 132 kV Bumbuna → Makeni → Port Loko. AfDB preparation. Feasibility updating.\n- **Southern Corridor** — $250M, 132 kV Freetown → Bo → Kenema. MCC-funded, 300 km.\n- **Connecting the Mines** — $60M, 66 kV spurs to Tonkolili/Koidu mining. Bankable, sourcing sponsor.\n\n👉 View on the **Projects** tab or **Portfolio Dev** tab for district impact.",
    tab: "projects",
  },

  // --- Off-grid ---
  {
    keywords: ["mini-grid", "minigrid", "off-grid", "off grid", "sogrea"],
    answer: "**Off-Grid & Mini-Grid Projects:**\n\n- **200+ Mini Grids** — $80M, 20 MW. 104 existing + 100 pipeline.\n- **SOGREA** — $39.2M, EU/Danish-funded. Procuring contractors.\n- **Solar Standalone** — $100M, 400K households (Tier 1 & 2 SHS).\n\nTargeting rural market towns, health centres, and schools nationwide.\n\n👉 View on the **Projects** tab.",
    tab: "projects",
  },

  // --- Infrastructure ---
  {
    keywords: ["esleap", "distribution", "last mile"],
    answer: "**ESLEAP** — $67.5M, World Bank grant\n\nEnhancing Sierra Leone Energy Access Project:\n- Status: **In Progress** — implementation stage\n- Distribution infrastructure + last-mile access\n- Nationwide coverage across distribution zones\n\n👉 View on the **Projects** tab.",
    tab: "projects",
  },
  {
    keywords: ["dispatch", "scada", "ems", "grid management"],
    answer: "**National Dispatch Center** — $25M, MCC-funded\n\nModern SCADA/EMS-based load dispatch in Freetown:\n- Real-time grid monitoring & load management\n- Fault detection & renewable energy integration\n- Essential for managing variable solar/hydro inputs\n\n👉 View on the **Projects** tab.",
    tab: "projects",
  },

  // --- Districts ---
  {
    keywords: ["district", "region", "province", "western area", "bo", "kenema", "kono", "tonkolili", "bombali", "koinadugu", "port loko"],
    answer: "**Sierra Leone — 16 Districts mapped with 16,522 settlements:**\n\n| Region | Districts | Top Projects |\n|--------|-----------|-------------|\n| Western Area | Urban (72%), Rural (28%) | NANT, Scatec, Dispatch Center |\n| Northern | Bombali, Tonkolili, Koinadugu, Port Loko | Bumbuna I & II, Northern Corridor, Lungi Solar |\n| Southern | Bo, Moyamba, Bonthe, Pujehun | Southern Corridor, Baoma Solar, Moyamba Singimi |\n| Eastern | Kenema, Kono, Kailahun | Dodo Dam, Betmai, Africa50 Solar, Connecting Mines |\n\n👉 See district-by-district analysis on the **Portfolio Dev** tab.",
    tab: "portfolio",
  },

  // --- M&E ---
  {
    keywords: ["monitoring", "evaluation", "m&e", "results framework", "reporting", "data quality"],
    answer: "The **M&E** tab provides:\n\n- **Results Framework** — Impact, Outcomes, Outputs, Activities hierarchy\n- **KPI Progress Table** — All indicators with RAG status (Red/Amber/Green)\n- **Data Quality Scorecard** — Timeliness, completeness, accuracy ratings\n- **Reporting Calendar** — Monthly, quarterly, annual reporting schedule\n\n👉 Go to the **M&E** tab for the full monitoring dashboard.",
    tab: "me",
  },

  // --- Timeline ---
  {
    keywords: ["timeline", "milestone", "deadline", "schedule", "when"],
    answer: "**Key Milestones:**\n\n- **Sep 2024** — Compact signed at UNGA 79\n- **Jan 2025** — CDMU established\n- **Apr 2025** — MCC Compact $494M signed\n- **2026** — Bumbuna I Upgrade & Northern Corridor\n- **2027** — 7 District HQ towns + Baoma Solar operational\n- **2028** — Southern Corridor operational, NANT online\n- **2030** — 78% access target\n\n👉 View the full timeline on the **Timeline** tab.",
    tab: "timeline",
  },

  // --- Hydropower ---
  {
    keywords: ["hydropower", "hydro", "dam"],
    answer: "**Hydropower Portfolio** — 347.4 MW total:\n\n| Project | Capacity | Cost | Status |\n|---------|----------|------|--------|\n| Bumbuna II | 143 MW | $1.2B | Pending financial close |\n| Bekongor Dam | 150 MW | $400M | Pending Cabinet |\n| Bumbuna I Upgrade | 50→100 MW | $70M | Pending funding |\n| Betmai | 27 MW | $110M | Pending financial close |\n| Moyamba Singimi | 15.4 MW | $104.2M | Early feasibility |\n| Dodo Dam | 6→12 MW | $30M | Sourcing sponsor |\n\n👉 View on the **Projects** tab.",
    tab: "projects",
  },

  // --- Solar ---
  {
    keywords: ["solar", "photovoltaic", "pv", "renewable"],
    answer: "**Solar Portfolio** — 245 MW total:\n\n| Project | Capacity | Cost | Status |\n|---------|----------|------|--------|\n| Lungi Solar PV | 65 MW | $150M | Feasibility done |\n| RESPITE | 50 MW | $75M | In Progress |\n| Africa50 Kono | 50 MW | $80M | Feasibility ongoing |\n| Scatec | 40 MW | $60M | Pending Cabinet |\n| Baoma 1 | 25 MW | $7M | In Progress |\n| Newton SPP+BESS | 15 MW | $45M | Pending close |\n\nPlus 400K Solar Home Systems ($100M) and 200+ mini-grids.\n\n👉 View on the **Projects** tab.",
    tab: "projects",
  },

  // --- PFS ---
  {
    keywords: ["pfs", "pre-feasibility", "feasibility study", "report"],
    answer: "Each priority project has a **20-section Pre-Feasibility Study (PFS)** including:\n\n- Financial analysis (LCOE, IRR, DSCR, NPV)\n- Risk register & sensitivity analysis\n- ESIA checklist & gender assessment\n- DFI-standard documentation\n\nClick **'View PFS'** on any project row in the **Projects** tab, or click a project marker on the map.\n\n👉 Go to the **Projects** tab.",
    tab: "projects",
  },

  // --- Complementary sectors ---
  {
    keywords: ["feed salone", "agriculture", "farming", "food"],
    answer: "**Feed Salone** is Sierra Leone's $800M+ agriculture flagship programme with pledges from BADEA ($250M), OPEC ($230M), AfDB ($100M).\n\nEnergy-agriculture nexus:\n- Rice milling, cold chain, irrigation need reliable power\n- M300 mini-grids serve Feed Salone zones\n- Productive use of energy increases income by 30%+\n\n👉 See the **Portfolio Dev** tab for integrated district analysis.",
    tab: "portfolio",
  },
  {
    keywords: ["mining", "baomahun", "gold", "iron ore", "rutile", "mines"],
    answer: "**Mining — Major Energy Demand Driver:**\n\n- **Connecting the Mines** ($60M) — 66 kV transmission to Tonkolili & Koidu\n- Anchor loads improve transmission corridor viability\n- Mining shifts from diesel ($0.15-$0.50/kWh) to grid power\n- Creates cross-subsidy for rural electrification\n\nMining districts: Kono (diamonds), Tonkolili (iron ore), Bo (rutile)\n\n👉 See the **Portfolio Dev** tab for mining-energy integration.",
    tab: "portfolio",
  },
  {
    keywords: ["digital", "technology", "internet", "broadband", "5g"],
    answer: "**Digital Infrastructure:**\n\n- **SLDTP** ($50M, World Bank) — connects 50 government MDAs\n- **WARDIP2** ($137M, March 2026) — 5.2M broadband connections\n- 5G launched in Freetown (June 2025)\n- Reliable power essential for base stations & data centres\n\nMobile sector contributes $240B (7.8% Africa GDP) per GSMA 2026.\n\n👉 See the **Portfolio Dev** tab for energy-digital integration.",
    tab: "portfolio",
  },

  // --- Portfolio Dev / Integrated ---
  {
    keywords: ["portfolio", "integrated", "cross-sector", "productive use", "impact"],
    answer: "The **Portfolio Dev** tab shows how energy projects create **cross-sector impact** at the district level:\n\n- **Agriculture** — Cold chain, irrigation, processing powered by mini-grids\n- **Mining** — Grid power replaces diesel (40% cost reduction)\n- **Digital** — ICT hubs, data centres, mobile money\n- **Education** — Evening classes, e-learning enabled by solar\n- **Commerce** — Markets, cold storage, mobile money\n\nEvery MW of solar PV creates ~35 jobs (IRENA).\n\n👉 Go to the **Portfolio Dev** tab.",
    tab: "portfolio",
  },

  // --- ECOWAS cooking ---
  {
    keywords: ["ecowas", "ecowas cooking", "20/20"],
    answer: "**ECOWAS 20/20 Clean Cooking** — $0.3M\n\n- Status: **Funded** — Awaiting fund disbursement\n- Subsidized improved cookstoves + LPG distribution\n- Targets indoor air quality improvement & deforestation reduction\n- Nationwide coverage with existing distributor licenses\n\n👉 View on the **Projects** tab.",
    tab: "projects",
  },

  // --- About ---
  {
    keywords: ["about", "who built", "platform", "dashboard"],
    answer: "This dashboard is built by the **Sierra Leone CDMU** to track Mission 300 National Energy Compact implementation.\n\nFeatures:\n- 16,522 settlements mapped with electrification status\n- 24 MoE priority projects with PFS reports\n- Real-time KPI tracking with speedometers\n- District-level portfolio analysis\n- Investment tracking & partner pipeline\n\n👉 See the **About** tab for full details.",
    tab: "about",
  },

  // --- Resources ---
  {
    keywords: ["resource", "document", "download", "reference"],
    answer: "The **Resources** tab contains downloadable documents:\n\n- National Energy Compact (full document)\n- MoE Priority Projects list\n- PFS template and guidelines\n- GIS data sources (World Bank DRE Atlas, ENERGYDATA.INFO)\n\n👉 Go to the **Resources** tab.",
    tab: "resources",
  },

  // --- Capacity ---
  {
    keywords: ["capacity", "megawatt", "mw", "generation total", "how much power"],
    answer: "**Total Generation Pipeline: ~885 MW**\n\n- Hydro: 347.4 MW (Bumbuna I&II, Bekongor, Betmai, Dodo, Moyamba)\n- Solar: 245 MW (RESPITE, Scatec, Lungi, Africa50, Baoma, Newton)\n- Thermal: 108.4 MW (NANT)\n- Mini-grids: 30 MW (200+ sites + SOGREA)\n- SHS: 40 MW equivalent\n\nCurrent installed: ~200 MW → Target: 450+ MW by 2030.\n\n👉 View all on the **Projects** tab.",
    tab: "projects",
  },

  // --- Specific amounts ---
  {
    keywords: ["how much", "total cost", "total investment", "pipeline value"],
    answer: "**Financial Summary:**\n\n- Total project pipeline: **$3,989.9M** (24 MoE projects)\n- Compact investment target: **$2.245B**\n- Largest project: Bumbuna II ($1.2B)\n- MCC Compact: $494M\n- NANT: $412M\n- Bekongor Dam: $400M\n- Southern Corridor: $250M\n- Private capital mobilized: $872M of $1.4B target\n\n👉 See the **Investment** tab for full breakdown.",
    tab: "investments",
  },

  // --- Status queries ---
  {
    keywords: ["in progress", "ongoing", "active project", "what is happening"],
    answer: "**Projects Currently In Progress:**\n\n1. RESPITE Solar + Storage ($75M, 50 MW)\n2. MCC Compact ($494M, governance & grid)\n3. NANT Generation ($412M, 108.4 MW)\n4. 7 District HQ Towns ($30.7M, 14 MW)\n5. Baoma Solar ($7M, 25 MW)\n6. ESLEAP ($67.5M, distribution)\n7. Solar Standalone ($100M, 400K households)\n8. 200+ Mini Grids ($80M, 20 MW)\n\n👉 View all statuses on the **Projects** tab.",
    tab: "projects",
  },
];

function findAnswer(query: string): { answer: string; tab?: string } {
  const lower = query.toLowerCase();
  let bestMatch: { answer: string; tab?: string; score: number } = { answer: "", score: 0 };

  for (const entry of KNOWLEDGE_BASE) {
    let score = 0;
    for (const keyword of entry.keywords) {
      if (lower.includes(keyword)) {
        score += keyword.length * 2;
        if (lower.startsWith(keyword) || lower.endsWith(keyword)) {
          score += keyword.length;
        }
      }
    }
    if (score > bestMatch.score) {
      bestMatch = { answer: entry.answer, tab: entry.tab, score };
    }
  }

  if (bestMatch.score > 0) return { answer: bestMatch.answer, tab: bestMatch.tab };

  return {
    answer: "I don't have specific information about that yet, but I'm learning more every day!\n\nTry asking about:\n- Mission 300 targets or KPIs\n- Specific projects (Bumbuna, RESPITE, MCC, NANT...)\n- Investment and funding sources\n- District electrification\n- Sectors (mining, agriculture, digital)\n\nOr type **help** to see everything I can do!",
  };
}

const TAB_LABELS: Record<string, string> = {
  overview: "Overview",
  pillars: "Pillars",
  investments: "Investment",
  projects: "Projects",
  portfolio: "Portfolio Dev",
  me: "M&E",
  timeline: "Timeline",
  resources: "Resources",
  about: "About",
};

export default function SaloneChat({ onNavigateTab }: { onNavigateTab?: (tab: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Kusheh! Aw di bodi? (Hello! How are you?)\n\nA na **Salone**, yu gayd to di Mission 300 dashboard. (I'm **Salone**, your guide to the Mission 300 dashboard.)\n\nAsk me about projects, targets, investments, or districts — A go show yu weh fo look! (I'll show you where to look!)",
    },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleNavigate = useCallback((tab: string) => {
    if (onNavigateTab) {
      onNavigateTab(tab);
    }
  }, [onNavigateTab]);

  function handleSend() {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    const result = findAnswer(input.trim());
    const assistantMsg: Message = { role: "assistant", content: result.answer, tab: result.tab };
    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput("");
  }

  function renderContent(text: string) {
    return text.split("\n").map((line, i) => {
      const formatted = line
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>');
      return <p key={i} className={line === "" ? "h-2" : ""} dangerouslySetInnerHTML={{ __html: formatted }} />;
    });
  }

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full bg-gradient-to-r from-cdmu-green to-cdmu-blue shadow-lg hover:shadow-xl transition-all flex items-center justify-center group"
          title="Chat with Salone"
        >
          <svg className="w-7 h-7 text-white group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-cdmu-gold rounded-full animate-pulse" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 z-[9999] w-96 h-[520px] bg-white rounded-2xl shadow-2xl border border-cdmu-gray-200 flex flex-col overflow-hidden">
          <div className="bg-gradient-to-r from-cdmu-green-dark to-cdmu-blue-dark px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <img src="/logos/flag.png" alt="" className="w-5 h-3 rounded-sm" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">Salone</h3>
                <p className="text-white/60 text-[10px]">M300 Energy Compact Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/60 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-cdmu-gray-50">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[85%] ${msg.role === "user" ? "" : "space-y-2"}`}>
                  <div
                    className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-cdmu-blue text-white rounded-br-md"
                        : "bg-white text-cdmu-gray-800 border border-cdmu-gray-200 rounded-bl-md shadow-sm"
                    }`}
                  >
                    {renderContent(msg.content)}
                  </div>
                  {msg.role === "assistant" && msg.tab && onNavigateTab && (
                    <button
                      onClick={() => handleNavigate(msg.tab!)}
                      className="flex items-center gap-1.5 text-[11px] font-semibold text-cdmu-blue hover:text-cdmu-blue-dark transition-colors ml-1 mt-1"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      Go to {TAB_LABELS[msg.tab] || msg.tab}
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t border-cdmu-gray-200 bg-white flex-shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask about M300 projects..."
                className="flex-1 text-sm border border-cdmu-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-cdmu-blue"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="bg-cdmu-blue text-white px-3 py-2 rounded-xl hover:bg-cdmu-blue-dark transition-colors disabled:opacity-40"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
