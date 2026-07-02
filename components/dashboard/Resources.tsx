"use client";

import { useState } from "react";

const DOCUMENTS = [
  { title: "National Energy Compact Document", type: "PDF", url: "#", category: "compact" },
  { title: "M300 Investment Plan Summary", type: "PDF", url: "#", category: "compact" },
  { title: "Sierra Leone Integrated Resource Plan (IRP)", type: "PDF", url: "#", category: "program" },
  { title: "CDMU Terms of Reference", type: "PDF", url: "#", category: "compact" },
  { title: "Electricity Sector Reform Roadmap", type: "PDF", url: "#", category: "program" },
  { title: "MCC Compact Agreement", type: "PDF", url: "#", category: "program" },
  { title: "Off-Grid Electrification Master Plan", type: "PDF", url: "#", category: "program" },
  { title: "Mini-Grid Regulatory Framework", type: "PDF", url: "#", category: "program" },
];

const PROGRAM_LINKS = [
  { title: "Mission 300 — AfDB", url: "https://www.afdb.org/en/topics-and-sectors/initiatives-partnerships/mission-300", desc: "AfDB flagship initiative to connect 300M people" },
  { title: "SEforALL Energy Compacts", url: "https://www.seforall.org/energy-compacts", desc: "UN Energy Compact framework and registry" },
  { title: "World Bank — Sierra Leone Energy", url: "https://www.worldbank.org/en/country/sierraleone", desc: "World Bank country page and energy projects" },
  { title: "MCC — Sierra Leone", url: "https://www.mcc.gov/where-we-work/country/sierra-leone", desc: "Millennium Challenge Corporation compact" },
  { title: "GEAPP — Global Energy Alliance", url: "https://www.energyalliance.org", desc: "Global Energy Alliance for People and Planet" },
  { title: "EWRC Sierra Leone", url: "#", desc: "Electricity and Water Regulatory Commission" },
  { title: "EDSA Sierra Leone", url: "#", desc: "Electricity Distribution and Supply Authority" },
  { title: "EGTC Sierra Leone", url: "#", desc: "Electricity Generation and Transmission Company" },
];

const REPORTS = [
  { title: "Quarterly Progress Report — Q2 2026", date: "Jul 2026", url: "#" },
  { title: "Quarterly Progress Report — Q1 2026", date: "Apr 2026", url: "#" },
  { title: "Annual Compact Report 2025", date: "Jan 2026", url: "#" },
  { title: "Sierra Leone Energy Sector Diagnostics", date: "Nov 2025", url: "#" },
  { title: "Least-Cost Electrification Study", date: "Sep 2025", url: "#" },
  { title: "Grid Master Plan Update", date: "Jun 2025", url: "#" },
];

const NEWS = [
  {
    title: "President Bio Commissions 50 MW Bumbuna Upgrade",
    date: "Jun 2026",
    category: "project",
    summary: "His Excellency President Julius Maada Bio commissioned the start of rehabilitation works at the Bumbuna I hydropower facility, marking a major milestone in the M300 compact.",
  },
  {
    title: "$480M MCC Compact Signed for Transmission Backbone",
    date: "Apr 2025",
    category: "funding",
    summary: "Sierra Leone signed the largest single energy investment in its history — a $480M MCC Compact focused on building the Southern and Northern transmission corridors.",
  },
  {
    title: "AfDB Approves $120M for Generation Capacity",
    date: "Mar 2026",
    category: "funding",
    summary: "The African Development Bank approved concessional finance for the 100 MW decentralized solar program and the Dodo Dam rehabilitation project.",
  },
  {
    title: "100th Mini-Grid Connected in Rural Sierra Leone",
    date: "Feb 2026",
    category: "project",
    summary: "The 100th solar-hybrid mini-grid was connected in Kailahun District, providing electricity to over 5,000 households in previously unserved communities.",
  },
  {
    title: "Sierra Leone Energy Week 2026",
    date: "Jan 2026",
    category: "event",
    summary: "The inaugural Sierra Leone Energy Week brought together government, DFIs, private sector, and civil society to review compact progress and announce new commitments.",
  },
  {
    title: "GEAPP Commits $25M to Off-Grid Access Programme",
    date: "Dec 2025",
    category: "funding",
    summary: "The Global Energy Alliance for People and Planet committed $25 million to support Sierra Leone's off-grid electrification programme, targeting 200 mini-grid sites.",
  },
  {
    title: "President Bio Visits Bekongor Dam Site",
    date: "Nov 2025",
    category: "project",
    summary: "President Bio visited the proposed site for the 120 MW Bekongor Dam, reaffirming government commitment to the flagship hydropower project.",
  },
  {
    title: "CDMU Launches Real-Time Monitoring Dashboard",
    date: "Oct 2025",
    category: "event",
    summary: "The Compact Delivery & Monitoring Unit launched its GIS-based monitoring dashboard, providing real-time visibility into compact implementation progress.",
  },
];

const CATEGORY_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  project: { bg: "bg-green-100", text: "text-green-800", label: "Project" },
  funding: { bg: "bg-blue-100", text: "text-blue-800", label: "Funding" },
  event: { bg: "bg-purple-100", text: "text-purple-800", label: "Event" },
  energy: { bg: "bg-amber-100", text: "text-amber-800", label: "Energy" },
};

export default function Resources() {
  const [newsFilter, setNewsFilter] = useState<string>("all");

  const filteredNews = newsFilter === "all" ? NEWS : NEWS.filter((n) => n.category === newsFilter);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-cdmu-green-dark flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        Resources & News
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-4">
            <h3 className="text-sm font-semibold text-cdmu-navy mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Compact Documents
            </h3>
            <div className="space-y-2">
              {DOCUMENTS.filter((d) => d.category === "compact").map((doc) => (
                <a key={doc.title} href={doc.url} className="flex items-center gap-2 text-sm text-cdmu-gray-700 hover:text-cdmu-blue p-1.5 rounded hover:bg-cdmu-gray-50 transition-colors">
                  <span className="text-[10px] font-bold text-cdmu-red bg-red-50 px-1.5 py-0.5 rounded">{doc.type}</span>
                  {doc.title}
                </a>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4">
            <h3 className="text-sm font-semibold text-cdmu-navy mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Programme Documents
            </h3>
            <div className="space-y-2">
              {DOCUMENTS.filter((d) => d.category === "program").map((doc) => (
                <a key={doc.title} href={doc.url} className="flex items-center gap-2 text-sm text-cdmu-gray-700 hover:text-cdmu-blue p-1.5 rounded hover:bg-cdmu-gray-50 transition-colors">
                  <span className="text-[10px] font-bold text-cdmu-red bg-red-50 px-1.5 py-0.5 rounded">{doc.type}</span>
                  {doc.title}
                </a>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4">
            <h3 className="text-sm font-semibold text-cdmu-navy mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Programme Links
            </h3>
            <div className="space-y-2">
              {PROGRAM_LINKS.map((link) => (
                <a key={link.title} href={link.url} target="_blank" rel="noreferrer" className="block p-2 rounded hover:bg-cdmu-gray-50 transition-colors">
                  <p className="text-sm font-medium text-cdmu-blue hover:underline">{link.title}</p>
                  <p className="text-xs text-cdmu-gray-500">{link.desc}</p>
                </a>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4">
            <h3 className="text-sm font-semibold text-cdmu-navy mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Reports
            </h3>
            <div className="space-y-2">
              {REPORTS.map((report) => (
                <a key={report.title} href={report.url} className="flex items-center justify-between text-sm p-1.5 rounded hover:bg-cdmu-gray-50 transition-colors">
                  <span className="text-cdmu-gray-700 hover:text-cdmu-blue">{report.title}</span>
                  <span className="text-[10px] text-cdmu-gray-400 whitespace-nowrap ml-2">{report.date}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-cdmu-navy flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                News & Updates
              </h3>
              <select
                value={newsFilter}
                onChange={(e) => setNewsFilter(e.target.value)}
                className="text-xs border border-cdmu-gray-200 rounded px-2 py-1 bg-white"
              >
                <option value="all">All</option>
                <option value="project">Projects</option>
                <option value="funding">Funding</option>
                <option value="event">Events</option>
              </select>
            </div>
            <div className="space-y-3">
              {filteredNews.map((item) => {
                const style = CATEGORY_STYLES[item.category] || CATEGORY_STYLES.energy;
                return (
                  <div key={item.title} className="border-b border-cdmu-gray-100 last:border-0 pb-3 last:pb-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${style.bg} ${style.text}`}>
                        {style.label}
                      </span>
                      <span className="text-[10px] text-cdmu-gray-400">{item.date}</span>
                    </div>
                    <h4 className="text-sm font-medium text-cdmu-gray-900 mb-1">{item.title}</h4>
                    <p className="text-xs text-cdmu-gray-600 leading-relaxed">{item.summary}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
