"use client";

export default function AboutCompact() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <img src="/logos/coat-of-arms.webp" alt="Coat of Arms" className="w-10 h-10 object-contain" />
        <div>
          <h2 className="text-lg font-bold text-cdmu-green-dark">About the National Energy Compact</h2>
          <p className="text-xs text-cdmu-gray-500">Sierra Leone Mission 300 — Compact Delivery & Monitoring Unit</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-cdmu-green-dark to-cdmu-blue-dark text-white rounded-xl p-5">
        <h3 className="font-bold text-lg mb-2">Mission 300</h3>
        <p className="text-sm text-white/90 leading-relaxed">
          Mission 300 is a joint initiative by the African Development Bank (AfDB) and the World Bank
          to connect 300 million people in Africa to electricity by 2030. Sierra Leone&apos;s National Energy
          Compact is the country&apos;s commitment under this initiative, setting an ambitious target to
          increase electricity access from <strong>36%</strong> (2023 baseline) to <strong>78%</strong> by 2030.
        </p>
      </div>

      <div className="glass-card rounded-2xl p-5">
        <h3 className="font-semibold text-cdmu-navy mb-3">The Compact Delivery & Monitoring Unit (CDMU)</h3>
        <p className="text-sm text-cdmu-gray-700 leading-relaxed mb-3">
          The CDMU is the institutional mechanism established by the Government of Sierra Leone to coordinate,
          monitor, and report on the implementation of the National Energy Compact. It operates under the
          Ministry of Energy and is responsible for:
        </p>
        <ul className="text-sm text-cdmu-gray-700 space-y-2">
          <li className="flex gap-2">
            <span className="text-cdmu-green font-bold">1.</span>
            Coordinating all M300 energy investments and stakeholders
          </li>
          <li className="flex gap-2">
            <span className="text-cdmu-green font-bold">2.</span>
            Tracking progress against compact targets and milestones
          </li>
          <li className="flex gap-2">
            <span className="text-cdmu-green font-bold">3.</span>
            Reporting to the AfDB, World Bank, SEforALL, and development partners
          </li>
          <li className="flex gap-2">
            <span className="text-cdmu-green font-bold">4.</span>
            Facilitating project preparation and pipeline development
          </li>
          <li className="flex gap-2">
            <span className="text-cdmu-green font-bold">5.</span>
            Managing the GIS-based monitoring dashboard for transparency
          </li>
        </ul>
      </div>

      <div className="glass-card rounded-2xl p-5">
        <h3 className="font-semibold text-cdmu-navy mb-3">Five Strategic Pillars</h3>
        <div className="space-y-3">
          {[
            { num: 1, title: "Generation Capacity", desc: "Increase installed capacity from 200 MW to 450+ MW through hydro, solar, and thermal investments.", color: "bg-blue-500" },
            { num: 2, title: "Transmission & Distribution", desc: "Build 132 kV and 66 kV backbone connecting Northern, Southern, and Eastern corridors to Freetown.", color: "bg-indigo-500" },
            { num: 3, title: "On-Grid Distribution & Access", desc: "Expand EDSA distribution network and increase metered connections from 300,000 to 800,000+.", color: "bg-green-500" },
            { num: 4, title: "Off-Grid & Last-Mile Access", desc: "Deploy 200+ mini-grids and 400,000 solar home systems for rural and peri-urban communities.", color: "bg-amber-500" },
            { num: 5, title: "Clean Cooking", desc: "Transition 500,000+ households from traditional biomass to LPG, improved cookstoves, and electric cooking.", color: "bg-red-500" },
          ].map((pillar) => (
            <div key={pillar.num} className="flex gap-3 items-start">
              <div className={`w-8 h-8 rounded-lg ${pillar.color} text-white flex items-center justify-center font-bold text-sm flex-shrink-0`}>
                {pillar.num}
              </div>
              <div>
                <p className="text-sm font-semibold text-cdmu-gray-900">{pillar.title}</p>
                <p className="text-xs text-cdmu-gray-600">{pillar.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-2xl p-5">
        <h3 className="font-semibold text-cdmu-navy mb-3">Investment Requirements</h3>
        <p className="text-sm text-cdmu-gray-700 leading-relaxed mb-3">
          The compact requires a total investment of <strong>USD 2.245 billion</strong> across all five pillars,
          mobilized through a combination of public finance, DFI concessional lending, private sector investment,
          and carbon finance.
        </p>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="bg-cdmu-gray-50 rounded-lg p-3 text-center">
            <p className="text-xl font-bold text-cdmu-navy">$2.245B</p>
            <p className="text-xs text-cdmu-gray-500">Total Required</p>
          </div>
          <div className="bg-cdmu-gray-50 rounded-lg p-3 text-center">
            <p className="text-xl font-bold text-cdmu-green">78%</p>
            <p className="text-xs text-cdmu-gray-500">Access Target (2030)</p>
          </div>
          <div className="bg-cdmu-gray-50 rounded-lg p-3 text-center">
            <p className="text-xl font-bold text-cdmu-navy">5.2M</p>
            <p className="text-xs text-cdmu-gray-500">People to Connect</p>
          </div>
          <div className="bg-cdmu-gray-50 rounded-lg p-3 text-center">
            <p className="text-xl font-bold text-cdmu-gold">16,522</p>
            <p className="text-xs text-cdmu-gray-500">Settlements Mapped</p>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-5">
        <h3 className="font-semibold text-cdmu-navy mb-3">Key Partners</h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            { logo: "/logos/world-bank.jpg", name: "World Bank", role: "Lead DFI co-anchor; IDA concessional finance; MCC Compact" },
            { logo: "/logos/afdb.jpeg", name: "African Development Bank", role: "M300 co-anchor; generation and transmission investments" },
            { logo: "/logos/rockefeller.png", name: "Rockefeller Foundation", role: "Technical assistance; CDMU institutional support" },
            { logo: "/logos/geapp.webp", name: "GEAPP", role: "Off-grid energy access; mini-grid and SHS pipeline" },
            { logo: "/logos/seforall.png", name: "SEforALL", role: "Compact secretariat; monitoring & reporting framework" },
          ].map((partner) => (
            <div key={partner.name} className="flex items-start gap-3 p-2 rounded-lg hover:bg-cdmu-gray-50">
              <img src={partner.logo} alt={partner.name} className="w-10 h-10 object-contain flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-cdmu-gray-900">{partner.name}</p>
                <p className="text-xs text-cdmu-gray-500">{partner.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-2xl p-5">
        <h3 className="font-semibold text-cdmu-navy mb-3">Key Dates & Milestones</h3>
        <div className="space-y-2">
          {[
            { date: "Sep 2024", event: "National Energy Compact signed at UNGA 79" },
            { date: "Jan 2025", event: "CDMU established under Ministry of Energy" },
            { date: "Apr 2025", event: "MCC Compact signed — $480M for transmission & distribution" },
            { date: "2026", event: "Bumbuna I rehabilitation and Northern Corridor construction begin" },
            { date: "2028", event: "Southern Corridor operational; National Dispatch Center live" },
            { date: "2030", event: "Target: 78% electricity access achieved" },
          ].map((m) => (
            <div key={m.date} className="flex gap-3 items-start">
              <span className="text-xs font-bold text-cdmu-blue bg-cdmu-blue/10 px-2 py-1 rounded whitespace-nowrap">{m.date}</span>
              <span className="text-sm text-cdmu-gray-700">{m.event}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
