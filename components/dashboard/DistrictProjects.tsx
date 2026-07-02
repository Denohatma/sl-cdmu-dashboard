"use client";

import { useState } from "react";
import Link from "next/link";
import type { Project } from "@/lib/types";

const DISTRICTS: Record<string, { region: string; districts: string[] }> = {
  "Western Area": { region: "Western Area", districts: ["Western Area Urban", "Western Area Rural"] },
  Northern: { region: "Northern", districts: ["Bombali", "Falaba", "Koinadugu", "Tonkolili", "Karene", "Port Loko", "Kambia"] },
  Southern: { region: "Southern", districts: ["Bo", "Bonthe", "Moyamba", "Pujehun"] },
  Eastern: { region: "Eastern", districts: ["Kailahun", "Kenema", "Kono"] },
  "North West": { region: "North West", districts: ["Port Loko", "Kambia", "Karene"] },
};

const DISTRICT_PROJECT_MAP: Record<string, { projects: string[]; settlements: number; population: number; electrification: number }> = {
  "Western Area Urban": { projects: ["dispatch-center", "nant", "scatec-solar", "mcc-compact"], settlements: 245, population: 1168000, electrification: 72 },
  "Western Area Rural": { projects: ["newton-solar-bess", "respite", "solar-standalone"], settlements: 580, population: 442000, electrification: 28 },
  Bombali: { projects: ["northern-corridor", "solar-standalone", "mini-grids", "seven-district-hq"], settlements: 1420, population: 423000, electrification: 12 },
  Tonkolili: { projects: ["bumbuna-upgrade", "bumbuna-ii", "connecting-mines", "solar-standalone", "mini-grids"], settlements: 1650, population: 531000, electrification: 8 },
  Koinadugu: { projects: ["bekongor-dam", "solar-standalone", "mini-grids", "seven-district-hq"], settlements: 890, population: 265000, electrification: 5 },
  Falaba: { projects: ["solar-standalone", "mini-grids", "seven-district-hq"], settlements: 620, population: 210000, electrification: 3 },
  Karene: { projects: ["solar-standalone", "mini-grids", "seven-district-hq"], settlements: 780, population: 295000, electrification: 6 },
  "Port Loko": { projects: ["northern-corridor", "lungi-solar", "solar-standalone", "mini-grids"], settlements: 1100, population: 615000, electrification: 14 },
  Kambia: { projects: ["solar-standalone", "mini-grids", "sogrea"], settlements: 720, population: 345000, electrification: 9 },
  Bo: { projects: ["southern-corridor", "baoma-solar", "esleap", "solar-standalone", "mini-grids"], settlements: 1350, population: 575000, electrification: 18 },
  Bonthe: { projects: ["solar-standalone", "mini-grids", "sogrea"], settlements: 480, population: 200000, electrification: 7 },
  Moyamba: { projects: ["southern-corridor", "moyamba-singimi", "solar-standalone", "mini-grids"], settlements: 950, population: 318000, electrification: 10 },
  Pujehun: { projects: ["solar-standalone", "mini-grids", "seven-district-hq"], settlements: 540, population: 346000, electrification: 6 },
  Kailahun: { projects: ["solar-standalone", "mini-grids", "seven-district-hq"], settlements: 870, population: 526000, electrification: 5 },
  Kenema: { projects: ["southern-corridor", "dodo-dam", "betmai-hydro", "esleap", "solar-standalone", "mini-grids"], settlements: 1150, population: 609000, electrification: 15 },
  Kono: { projects: ["connecting-mines", "africa50-kono-solar", "solar-standalone", "mini-grids"], settlements: 750, population: 506000, electrification: 11 },
};

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  funded: { bg: "bg-green-100", text: "text-green-800" },
  in_progress: { bg: "bg-blue-100", text: "text-blue-800" },
  procurement: { bg: "bg-amber-100", text: "text-amber-800" },
  feasibility: { bg: "bg-purple-100", text: "text-purple-800" },
  development: { bg: "bg-orange-100", text: "text-orange-800" },
};

export default function DistrictProjects({ projects }: { projects: Project[] }) {
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);

  const allDistricts = Object.entries(DISTRICTS).flatMap(([, r]) =>
    r.districts.map((d) => ({ name: d, region: r.region }))
  );
  const uniqueDistricts = allDistricts.filter((d, i, arr) => arr.findIndex((x) => x.name === d.name) === i);

  const districtData = selectedDistrict ? DISTRICT_PROJECT_MAP[selectedDistrict] : null;
  const districtProjects = districtData
    ? districtData.projects.map((pid) => projects.find((p) => p.id === pid)).filter(Boolean) as Project[]
    : [];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-cdmu-green-dark flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Portfolio Development by District
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-cdmu-gray-200 p-3 max-h-[500px] overflow-y-auto scrollbar-thin">
            <p className="text-xs font-medium text-cdmu-gray-500 uppercase tracking-wider mb-2 px-1">Select a District</p>
            {Object.entries(DISTRICTS).map(([regionName, regionData]) => (
              <div key={regionName} className="mb-3">
                <p className="text-[10px] font-bold text-cdmu-navy uppercase tracking-wider px-2 py-1 bg-cdmu-gray-50 rounded">
                  {regionName} Region
                </p>
                <div className="space-y-0.5 mt-1">
                  {regionData.districts.map((district) => {
                    const data = DISTRICT_PROJECT_MAP[district];
                    return (
                      <button
                        key={district}
                        onClick={() => setSelectedDistrict(district)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                          selectedDistrict === district
                            ? "bg-cdmu-blue text-white"
                            : "text-cdmu-gray-700 hover:bg-cdmu-gray-50"
                        }`}
                      >
                        <span className="font-medium">{district}</span>
                        {data && (
                          <span className={`text-[10px] ${selectedDistrict === district ? "text-white/70" : "text-cdmu-gray-400"}`}>
                            {data.projects.length} projects
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          {!selectedDistrict ? (
            <div className="bg-white rounded-xl border border-cdmu-gray-200 p-8 text-center">
              <svg className="w-12 h-12 mx-auto text-cdmu-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <p className="text-sm text-cdmu-gray-500">Select a district to view its M300 energy projects</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-cdmu-gray-200 p-4">
                <h3 className="font-bold text-cdmu-navy text-base mb-3">{selectedDistrict} District</h3>
                {districtData && (
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-cdmu-gray-50 rounded-lg p-3 text-center">
                      <p className="text-lg font-bold text-cdmu-navy">{districtData.settlements.toLocaleString()}</p>
                      <p className="text-[10px] text-cdmu-gray-500">Settlements</p>
                    </div>
                    <div className="bg-cdmu-gray-50 rounded-lg p-3 text-center">
                      <p className="text-lg font-bold text-cdmu-navy">{(districtData.population / 1000).toFixed(0)}K</p>
                      <p className="text-[10px] text-cdmu-gray-500">Population</p>
                    </div>
                    <div className="bg-cdmu-gray-50 rounded-lg p-3 text-center">
                      <p className={`text-lg font-bold ${districtData.electrification >= 30 ? "text-cdmu-green" : districtData.electrification >= 15 ? "text-cdmu-amber" : "text-cdmu-red"}`}>
                        {districtData.electrification}%
                      </p>
                      <p className="text-[10px] text-cdmu-gray-500">Electrified</p>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {districtProjects.map((project) => {
                    const style = STATUS_STYLES[project.status] || STATUS_STYLES.feasibility;
                    return (
                      <div key={project.id} className="border border-cdmu-gray-100 rounded-lg p-3 hover:border-cdmu-blue/30 transition-colors">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="text-sm font-semibold text-cdmu-gray-900">{project.name}</h4>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}>
                            {project.stage || project.status}
                          </span>
                        </div>
                        <p className="text-xs text-cdmu-gray-600 mb-2">{project.description?.slice(0, 120)}...</p>
                        <div className="flex items-center gap-4 text-xs text-cdmu-gray-500">
                          <span>Cost: <strong className="text-cdmu-navy">${project.cost_usd_million}M</strong></span>
                          {project.capacity_mw ? <span>Capacity: <strong>{project.capacity_mw} MW</strong></span> : null}
                          {project.population_served ? <span>Impact: <strong>{(project.population_served / 1000).toFixed(0)}K people</strong></span> : null}
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-[10px] text-cdmu-gray-400">
                            {project.lead || "GoSL"} · Target: {project.target_date || "TBD"}
                          </span>
                          <Link
                            href={`/pfs/${project.id}`}
                            target="_blank"
                            className="text-xs font-medium text-cdmu-blue hover:underline"
                          >
                            View PFS →
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
