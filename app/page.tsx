"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { AppProvider } from "@/lib/filter-context";
import SplitPanel from "@/components/layout/SplitPanel";
import KPIScorecard from "@/components/dashboard/KPIScorecard";
import PillarTracker from "@/components/dashboard/PillarTracker";
import InvestmentChart from "@/components/dashboard/InvestmentChart";
import ProjectPipeline from "@/components/dashboard/ProjectPipeline";
import SectorMetrics from "@/components/dashboard/SectorMetrics";
import MilestoneTimeline from "@/components/dashboard/MilestoneTimeline";
import AboutCompact from "@/components/dashboard/AboutCompact";
import Resources from "@/components/dashboard/Resources";
import DistrictProjects from "@/components/dashboard/DistrictProjects";
import SaloneChat from "@/components/chatbot/SaloneChat";

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

type Tab = "overview" | "pillars" | "investments" | "projects" | "metrics" | "timeline" | "about" | "resources" | "districts";

const TABS: { key: Tab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "pillars", label: "Pillars" },
  { key: "investments", label: "Investment" },
  { key: "projects", label: "Projects" },
  { key: "districts", label: "Districts" },
  { key: "metrics", label: "Metrics" },
  { key: "timeline", label: "Timeline" },
  { key: "resources", label: "Resources" },
  { key: "about", label: "About" },
];

function DashboardPanel({ dashRef }: { dashRef: React.RefObject<HTMLDivElement | null> }) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

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
              <a
                href="/admin"
                className="text-white/70 hover:text-white text-xs px-2 py-1 rounded hover:bg-white/10 transition-colors"
              >
                Admin
              </a>
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
            <InvestmentChart data={investmentsData} />
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

        {activeTab === "districts" && (
          <DistrictProjects projects={projectsData.projects} />
        )}

        {activeTab === "metrics" && (
          <SectorMetrics metrics={metricsData.pillars} />
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

  return (
    <AppProvider>
      <div className="h-screen w-screen overflow-hidden">
        <SplitPanel
          left={<DashboardPanel dashRef={dashRef} />}
          right={<MapView />}
        />
        <SaloneChat />
      </div>
    </AppProvider>
  );
}
