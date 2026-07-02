"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const KNOWLEDGE_BASE: { keywords: string[]; answer: string }[] = [
  {
    keywords: ["mission 300", "m300", "what is mission"],
    answer: "Mission 300 is a joint initiative by the African Development Bank (AfDB) and the World Bank to connect 300 million people in Africa to electricity by 2030. Sierra Leone's National Energy Compact under Mission 300 targets increasing electricity access from 36% to 78% by 2030, requiring USD 2.245 billion in total investment across five strategic pillars.",
  },
  {
    keywords: ["cdmu", "compact delivery", "monitoring unit"],
    answer: "The Compact Delivery & Monitoring Unit (CDMU) is the institutional mechanism established by the Government of Sierra Leone under the Ministry of Energy to coordinate, monitor, and report on the implementation of the National Energy Compact. It tracks progress against targets, facilitates project preparation, and manages this GIS-based monitoring dashboard.",
  },
  {
    keywords: ["pillar", "five pillars", "strategic pillar"],
    answer: "The five strategic pillars are:\n\n1. **Generation Capacity** — Increase from 200 MW to 450+ MW (hydro, solar, thermal)\n2. **Transmission & Distribution** — Build 132/66 kV backbone corridors\n3. **On-Grid Distribution** — Expand EDSA connections from 300K to 800K+\n4. **Off-Grid & Last-Mile** — 200+ mini-grids and 400K solar home systems\n5. **Clean Cooking** — Transition 500K+ households from biomass to LPG/ICS",
  },
  {
    keywords: ["bumbuna", "hydropower", "hydro"],
    answer: "The **50 MW Bumbuna I Upgrade** ($65M, funded) is rehabilitating the existing hydropower facility in Tonkolili District. The **120 MW Bekongor Dam** ($550M, development stage) is a new-build storage hydropower dam on the Seli River. The **12 MW Dodo Dam** ($25M, feasibility) will rehabilitate the plant in Kenema District. Together these represent 182 MW of hydropower capacity.",
  },
  {
    keywords: ["solar", "decentralized", "photovoltaic"],
    answer: "The **100 MW Decentralized Power Supply** programme ($60M, procurement) deploys solar PV plants across Bo, Kenema, Makeni, and Port Loko with battery storage. Additionally, **Solar Standalone Systems** ($100M, in progress) target 400,000 households with Tier 1 and Tier 2 solar home systems nationwide.",
  },
  {
    keywords: ["transmission", "corridor", "grid"],
    answer: "Two major transmission corridors are under development:\n\n- **Northern Corridor** ($100M, funded) — 132 kV from Bumbuna through Makeni to Port Loko (220 km)\n- **Southern Corridor** ($250M, funded, MCC Compact) — 132 kV from Freetown through Bo to Kenema (300 km)\n\nThe **National Dispatch Center** ($25M, funded) in Freetown provides SCADA/EMS grid management.",
  },
  {
    keywords: ["mini-grid", "minigrid", "off-grid", "off grid"],
    answer: "The **200+ Mini Grids** programme ($80M, in progress) deploys solar-hybrid mini-grids across rural Sierra Leone. Each site averages 50-200 kW with battery storage, targeting market towns, health centres, and schools. 104 existing sites are operational with 100 more in the pipeline, supported by DARES and development partners.",
  },
  {
    keywords: ["investment", "funding", "cost", "money", "billion"],
    answer: "The total M300 investment requirement is **USD 2.245 billion**. Key funders include:\n\n- **MCC Compact** — $480M (Southern Corridor, distribution)\n- **World Bank/IDA** — Multiple projects including ESLEAP ($130M), DARES ($60M)\n- **AfDB** — $120M for generation\n- **GEAPP** — $25M for off-grid\n- **Rockefeller Foundation** — Technical assistance\n\nThe funding gap is approximately $800M requiring additional DFI and private sector mobilisation.",
  },
  {
    keywords: ["access", "electricity access", "electrification", "target"],
    answer: "Sierra Leone's electricity access stands at approximately **36%** (2023 baseline). The M300 compact targets **78% access by 2030**, requiring 5.2 million additional people to be connected. This includes both on-grid connections (EDSA expansion to 800K+ meters) and off-grid solutions (400K solar home systems, 200+ mini-grids).",
  },
  {
    keywords: ["mcc", "millennium challenge"],
    answer: "The **Millennium Challenge Corporation (MCC) Compact** is the largest single energy investment in Sierra Leone's history at **$480 million**, signed in April 2025. It funds the Southern Transmission Corridor (Freetown-Bo-Kenema), distribution rehabilitation, and the EDSA OM&M concession to reduce losses from 54% to sustainable levels.",
  },
  {
    keywords: ["district", "region", "province"],
    answer: "Sierra Leone has 16 districts across 5 regions:\n\n- **Western Area** (2 districts) — Highest electrification (72% urban)\n- **Northern** (7 districts) — Bumbuna, Northern Corridor\n- **Southern** (4 districts) — Southern Corridor, Bo hub\n- **Eastern** (3 districts) — Kenema, Kono mining corridor\n- **North West** (3 districts) — Port Loko, Kambia\n\nAll 16,522 settlements are mapped on the dashboard.",
  },
  {
    keywords: ["pfs", "pre-feasibility", "feasibility study"],
    answer: "Each M300 priority project has a **20-section Pre-Feasibility Study (PFS)** available on the dashboard. PFS reports include financial analysis (LCOE, IRR, DSCR, NPV), risk register, sensitivity analysis, ESIA checklist, gender assessment, and DFI-standard documentation. Click 'View PFS' on any project in the Projects tab or on the map.",
  },
  {
    keywords: ["dares", "distributed access", "renewable energy scale"],
    answer: "**Regional DARES** ($60M, World Bank IDA, approved July 2026) is Sierra Leone's primary off-grid delivery mechanism. It funds solar home systems, mini-grids, and productive use enterprises. Part of an $853M regional programme, DARES targets $54M in private investment and 1.2M people connected across participating countries.",
  },
  {
    keywords: ["feed salone", "agriculture", "farming"],
    answer: "**Feed Salone** is Sierra Leone's $800M+ flagship agriculture programme with pledges from BADEA ($250M), OPEC ($230M), AfDB ($100M), and others. It creates the largest energy demand driver in rural areas — rice milling, cold chain, irrigation, and agro-processing all require reliable electricity. M300 mini-grids serve Feed Salone zones.",
  },
  {
    keywords: ["mining", "baomahun", "gold", "iron ore", "rutile"],
    answer: "Mining creates major electricity demand:\n\n- **Baomahun Gold** ($430M, AFC/Afreximbank) — 21 MW thermal + 23.8 MW solar hybrid\n- **Marampa Iron Ore** (Kingho) — Pellet plant needs 15-30 MW, on Northern Corridor route\n- **Tonkolili Iron Ore** (CRSG) — 30-50 MW demand, adjacent to Bumbuna\n- **Sierra Rutile** — World's largest rutile producer, Southern Corridor enables alumina refinery\n\nMining anchor loads improve transmission corridor IRR.",
  },
  {
    keywords: ["digital", "sldtp", "wardip", "technology"],
    answer: "The **Sierra Leone Digital Transformation Project** ($50M, World Bank) connects 50 government MDAs. **WARDIP2** ($137M, approved March 2026) targets 5.2M broadband connections. Both depend on reliable M300 grid power for base stations, data centres, and digital services. 5G launched in Freetown in June 2025.",
  },
  {
    keywords: ["clean cooking", "cookstove", "lpg"],
    answer: "**Pillar 5: Clean Cooking** targets transitioning 500,000+ households from traditional biomass to improved cookstoves (ICS), LPG, and electric cooking. This reduces deforestation, indoor air pollution (a leading cause of respiratory illness), and time burden on women and girls who collect firewood.",
  },
  {
    keywords: ["hello", "hi", "hey", "good morning", "good afternoon"],
    answer: "Hello! I'm **Salone**, your guide to Sierra Leone's Mission 300 Energy Compact dashboard. I can help you understand the compact targets, projects, investment plans, and more. What would you like to know?",
  },
  {
    keywords: ["help", "what can you do", "how to use"],
    answer: "I can help you with:\n\n- **Compact overview** — targets, pillars, investment needs\n- **Projects** — Bumbuna, solar, transmission corridors, mini-grids\n- **Financial details** — costs, funding sources, PFS reports\n- **Districts** — electrification status, projects per district\n- **Partners** — World Bank, AfDB, MCC, GEAPP, Rockefeller\n- **Complementary programmes** — Feed Salone, DARES, mining\n\nJust ask any question about Sierra Leone's energy sector!",
  },
];

function findAnswer(query: string): string {
  const lower = query.toLowerCase();
  let bestMatch: { answer: string; score: number } = { answer: "", score: 0 };

  for (const entry of KNOWLEDGE_BASE) {
    let score = 0;
    for (const keyword of entry.keywords) {
      if (lower.includes(keyword)) {
        score += keyword.length;
      }
    }
    if (score > bestMatch.score) {
      bestMatch = { answer: entry.answer, score };
    }
  }

  if (bestMatch.score > 0) return bestMatch.answer;

  return "I don't have specific information about that yet, but I'm learning more about Sierra Leone's energy sector every day! Try asking about:\n\n- Mission 300 compact targets\n- Specific projects (Bumbuna, solar, transmission)\n- Investment and funding\n- District electrification\n- Complementary programmes (Feed Salone, DARES, mining)";
}

export default function SaloneChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm **Salone**, your guide to Sierra Leone's Mission 300 Energy Compact. Ask me about compact targets, projects, funding, or districts!",
    },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    const answer = findAnswer(input.trim());
    const assistantMsg: Message = { role: "assistant", content: answer };
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
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-cdmu-blue text-white rounded-br-md"
                      : "bg-white text-cdmu-gray-800 border border-cdmu-gray-200 rounded-bl-md shadow-sm"
                  }`}
                >
                  {renderContent(msg.content)}
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
