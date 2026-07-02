"use client";

import { useRef, useState, Suspense } from "react";
import dynamic from "next/dynamic";
import { AppProvider } from "@/lib/filter-context";
import { RoleProvider, useRole, type UserRole } from "@/lib/role-context";
import SplitPanel from "@/components/layout/SplitPanel";
import KPIScorecard from "@/components/dashboard/KPIScorecard";
import InvestmentChart from "@/components/dashboard/InvestmentChart";

const PillarTracker = dynamic(() => import("@/components/dashboard/PillarTracker"));
const ProjectPipeline = dynamic(() => import("@/components/dashboard/ProjectPipeline"));
const MonitoringEvaluation = dynamic(() => import("@/components/dashboard/SectorMetrics"));
const MilestoneTimeline = dynamic(() => import("@/components/dashboard/MilestoneTimeline"));
const AboutCompact = dynamic(() => import("@/components/dashboard/AboutCompact"));
const Resources = dynamic(() => import("@/components/dashboard/Resources"));
const DistrictProjects = dynamic(() => import("@/components/dashboard/DistrictProjects"));
const SaloneChat = dynamic(() => import("@/components/chatbot/SaloneChat"), { ssr: false });

import kpisRaw from "@/data/kpis.json";
import pillarsRaw from "@/data/pillars.json";
import investmentsData from "@/data/investments.json";
import projectsRaw from "@/data/projects.json";
import metricsRaw from "@/data/metrics.json";
import type { KPI, Pillar, Project } from "@/lib/types";

const kpisData = kpisRaw as { last_updated: string; targets: KPI[] };
const pillarsData = pillarsRaw as { pillars: Pillar[] };
const projectsData = projectsRaw as { last_updated: string; projects: Project[] };
const metricsData = metricsRaw as { last_updated: string; pillars: Record<string, { name: string; metrics: { label: string; value: number; unit: string; date: string }[] }> };

const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-cdmu-gray-50">
      <div className="text-center">
        <div className="w-8 h-8 border-3 border-cdmu-teal border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-sm text-cdmu-gray-500">Loading map...</p>
      </div>
    </div>
  ),
});

type Tab = "overview" | "pillars" | "investments" | "projects" | "me" | "timeline" | "about" | "resources" | "portfolio";

const TABS: { key: Tab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "pillars", label: "Pillars" },
  { key: "investments", label: "Investment" },
  { key: "projects", label: "Projects" },
  { key: "portfolio", label: "Portfolio Dev" },
  { key: "me", label: "M&E" },
  { key: "timeline", label: "Timeline" },
  { key: "resources", label: "Resources" },
  { key: "about", label: "About" },
];

function RoleSelector() {
  const { role, setRole, permissions } = useRole();

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex bg-white/10 rounded-lg p-0.5">
        <button
          onClick={() => setRole("cdmu_staff")}
          className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all ${
            role === "cdmu_staff"
              ? "bg-white text-cdmu-green-dark shadow-sm"
              : "text-white/70 hover:text-white"
          }`}
        >
          CDMU Staff
        </button>
        <button
          onClick={() => setRole("external")}
          className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all ${
            role === "external"
              ? "bg-white text-cdmu-blue-dark shadow-sm"
              : "text-white/70 hover:text-white"
          }`}
        >
          External
        </button>
      </div>
      <span className="text-[9px] text-white/50 hidden sm:inline">
        {role === "cdmu_staff" ? "Full access" : "View only"}
      </span>
    </div>
  );
}

function DashboardPanel({ dashRef, activeTab, setActiveTab }: { dashRef: React.RefObject<HTMLDivElement | null>; activeTab: Tab; setActiveTab: (tab: Tab) => void }) {
  const { permissions } = useRole();

  return (
    <div className="h-full flex flex-col bg-cdmu-gray-50">
      <header className="flex-shrink-0">
        <div className="h-1 flex">
          <div className="flex-1 bg-cdmu-green" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-cdmu-blue" />
        </div>
        <div className="bg-gradient-to-r from-cdmu-green-dark to-cdmu-blue-dark px-5 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logos/coat-of-arms.webp" alt="Coat of Arms" className="w-10 h-10 object-contain" />
              <img src="/logos/flag.png" alt="Sierra Leone Flag" className="w-8 h-6 object-cover rounded-sm border border-white/30" />
              <div>
                <h1 className="text-white font-bold text-lg leading-tight">
                  Sierra Leone CDMU
                </h1>
                <p className="text-white/70 text-xs">
                  Mission 300 · National Energy Compact
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <RoleSelector />
              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    const { exportDashboardPDF } = await import("@/lib/export");
                    if (dashRef.current) {
                      exportDashboardPDF(dashRef.current, null);
                    }
                  }}
                  className="text-white/70 hover:text-white text-xs px-2 py-1 rounded hover:bg-white/10 transition-colors"
                  title="Export PDF"
                >
                  PDF
                </button>
                {permissions.canAccessAdmin && (
                  <a
                    href="/admin"
                    className="text-white/70 hover:text-white text-xs px-2 py-1 rounded hover:bg-white/10 transition-colors"
                  >
                    Admin
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <nav className="flex gap-0.5 px-3 py-2 bg-white border-b border-cdmu-gray-200 flex-shrink-0 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? "bg-cdmu-navy text-white"
                : "text-cdmu-gray-600 hover:bg-cdmu-gray-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div ref={dashRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {activeTab === "overview" && (
          <>
            <div className="bg-gradient-to-r from-cdmu-green-dark via-cdmu-blue-dark to-cdmu-blue rounded-xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-[10px] uppercase tracking-wider font-medium">National Energy Compact</p>
                  <p className="text-xl font-bold mt-0.5">Sierra Leone Mission 300</p>
                  <p className="text-white/80 text-xs mt-1">Targeting 78% electricity access by 2030 · $2.245B investment programme</p>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-white/10 rounded-lg px-3 py-2">
                    <p className="text-lg font-bold">36%</p>
                    <p className="text-[9px] text-white/60">Baseline</p>
                  </div>
                  <div className="bg-white/10 rounded-lg px-3 py-2">
                    <p className="text-lg font-bold text-cdmu-gold">42%</p>
                    <p className="text-[9px] text-white/60">Current</p>
                  </div>
                  <div className="bg-white/10 rounded-lg px-3 py-2">
                    <p className="text-lg font-bold">78%</p>
                    <p className="text-[9px] text-white/60">Target 2030</p>
                  </div>
                </div>
              </div>
            </div>
            <KPIScorecard kpis={kpisData.targets} />
            <InvestmentChart data={investmentsData} showPipeline={false} />

            <div className="bg-white rounded-xl border border-cdmu-gray-200 p-5">
              <h3 className="font-semibold text-cdmu-navy mb-3">Five Strategic Pillars</h3>
              <div className="space-y-2.5">
                {[
                  { num: 1, title: "Generation Capacity", desc: "200 MW to 450+ MW through hydro, solar, and thermal", color: "bg-blue-500" },
                  { num: 2, title: "Transmission & Distribution", desc: "132/66 kV backbone — Northern, Southern & Eastern corridors", color: "bg-indigo-500" },
                  { num: 3, title: "On-Grid Distribution", desc: "EDSA connections from 300K to 800K+ metered customers", color: "bg-green-500" },
                  { num: 4, title: "Off-Grid & Last-Mile", desc: "200+ mini-grids and 400K solar home systems", color: "bg-amber-500" },
                  { num: 5, title: "Clean Cooking", desc: "500K+ households to LPG, ICS, and electric cooking", color: "bg-red-500" },
                ].map((p) => (
                  <div key={p.num} className="flex gap-3 items-center">
                    <div className={`w-7 h-7 rounded-lg ${p.color} text-white flex items-center justify-center font-bold text-xs flex-shrink-0`}>{p.num}</div>
                    <div>
                      <span className="text-sm font-semibold text-cdmu-gray-900">{p.title}</span>
                      <span className="text-xs text-cdmu-gray-500 ml-2">{p.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-cdmu-gray-200 p-4">
                <h3 className="font-semibold text-cdmu-navy text-sm mb-3">Key Partners</h3>
                <div className="space-y-2">
                  {[
                    { logo: "/logos/world-bank.jpg", name: "World Bank", role: "IDA / MCC Compact" },
                    { logo: "/logos/afdb.jpeg", name: "AfDB", role: "M300 co-anchor" },
                    { logo: "/logos/rockefeller.png", name: "Rockefeller", role: "Technical assistance" },
                    { logo: "/logos/geapp.webp", name: "GEAPP", role: "Off-grid access" },
                    { logo: "/logos/seforall.png", name: "SEforALL", role: "Compact secretariat" },
                  ].map((p) => (
                    <div key={p.name} className="flex items-center gap-2">
                      <img src={p.logo} alt={p.name} className="w-7 h-7 object-contain flex-shrink-0" />
                      <div>
                        <span className="text-xs font-medium text-cdmu-gray-900">{p.name}</span>
                        <span className="text-[10px] text-cdmu-gray-500 ml-1.5">{p.role}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-cdmu-gray-200 p-4">
                <h3 className="font-semibold text-cdmu-navy text-sm mb-3">Key Milestones</h3>
                <div className="space-y-2">
                  {[
                    { date: "Sep 2024", event: "Compact signed at UNGA 79" },
                    { date: "Jan 2025", event: "CDMU established" },
                    { date: "Apr 2025", event: "MCC Compact — $480M" },
                    { date: "2026", event: "Bumbuna I & Northern Corridor" },
                    { date: "2028", event: "Southern Corridor operational" },
                    { date: "2030", event: "78% access target" },
                  ].map((m) => (
                    <div key={m.date} className="flex gap-2 items-start">
                      <span className="text-[10px] font-bold text-cdmu-blue bg-cdmu-blue/10 px-1.5 py-0.5 rounded whitespace-nowrap">{m.date}</span>
                      <span className="text-xs text-cdmu-gray-700">{m.event}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "pillars" && (
          <PillarTracker pillars={pillarsData.pillars} />
        )}

        {activeTab === "investments" && (
          <InvestmentChart data={investmentsData} />
        )}

        {activeTab === "projects" && (
          <ProjectPipeline projects={projectsData.projects} />
        )}

        {activeTab === "portfolio" && (
          <DistrictProjects projects={projectsData.projects} />
        )}

        {activeTab === "me" && (
          <MonitoringEvaluation metrics={metricsData.pillars} />
        )}

        {activeTab === "timeline" && <MilestoneTimeline />}

        {activeTab === "resources" && <Resources />}

        {activeTab === "about" && <AboutCompact />}

        <footer className="text-center text-xs text-cdmu-gray-400 py-4 border-t border-cdmu-gray-200 space-y-3">
          <div className="flex items-center justify-center gap-5 opacity-80">
            <img src="/logos/world-bank.jpg" alt="World Bank" className="h-8 object-contain" />
            <img src="/logos/afdb.jpeg" alt="AfDB" className="h-8 object-contain" />
            <img src="/logos/rockefeller.png" alt="Rockefeller Foundation" className="h-7 object-contain" />
            <img src="/logos/geapp.webp" alt="GEAPP" className="h-8 object-contain" />
            <img src="/logos/seforall.png" alt="SEforALL" className="h-8 object-contain" />
          </div>
          <p>
            Sierra Leone Compact Delivery & Monitoring Unit · Last updated:{" "}
            {kpisData.last_updated}
          </p>
          <p>
            Data: World Bank DRE Atlas · geoBoundaries · ENERGYDATA.INFO
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function Home() {
  const dashRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  return (
    <RoleProvider>
      <AppProvider>
        <div className="h-screen w-screen overflow-hidden">
          <SplitPanel
            left={<DashboardPanel dashRef={dashRef} activeTab={activeTab} setActiveTab={setActiveTab} />}
            right={<MapView />}
          />
          <SaloneChat onNavigateTab={(tab) => setActiveTab(tab as Tab)} />
        </div>
      </AppProvider>
    </RoleProvider>
  );
}
