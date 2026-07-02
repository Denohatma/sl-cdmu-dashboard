"use client";

import type { SettlementDetail } from "@/lib/types";

function StatRow({ label, value }: { label: string; value: string | number | undefined | null }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="flex justify-between py-1.5 text-sm">
      <span className="text-cdmu-gray-500">{label}</span>
      <span className="font-medium text-cdmu-gray-900">{String(value)}</span>
    </div>
  );
}

export default function SettlementPanel({
  detail,
  onClose,
}: {
  detail: SettlementDetail;
  onClose: () => void;
}) {
  return (
    <div className="absolute top-0 right-0 w-80 h-full bg-white shadow-2xl z-[1001] overflow-y-auto border-l border-cdmu-gray-200">
      <div className="sticky top-0 bg-white border-b border-cdmu-gray-200 px-4 py-3 flex items-center justify-between z-10">
        <div>
          <h3 className="font-semibold text-cdmu-navy text-sm">
            {detail.village_name || "Unknown Settlement"}
          </h3>
          <p className="text-xs text-cdmu-gray-500">
            {detail.district}, {detail.region}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-cdmu-gray-100 rounded transition-colors"
        >
          <svg className="w-5 h-5 text-cdmu-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="px-4 py-3 space-y-4">
        <div className="flex gap-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              detail.has_nightlight
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {detail.has_nightlight ? "Electrified" : "Unelectrified"}
          </span>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              detail.security_risk === "low"
                ? "bg-green-100 text-green-800"
                : detail.security_risk === "medium"
                ? "bg-amber-100 text-amber-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {detail.security_risk} risk
          </span>
        </div>

        <Section title="Demographics">
          <StatRow label="Population" value={detail.population?.toLocaleString()} />
          <StatRow label="Buildings" value={detail.num_buildings?.toLocaleString()} />
          <StatRow label="Connections" value={detail.num_connections?.toLocaleString()} />
          <StatRow label="RWI" value={detail.mean_rwi?.toFixed(2)} />
        </Section>

        <Section title="Infrastructure">
          <StatRow label="Education Facilities" value={detail.num_education_facilities} />
          <StatRow label="Health Facilities" value={detail.num_health_facilities} />
          <StatRow label="Road Access" value={detail.main_road_access ? "Yes" : "No"} />
          <StatRow
            label="Dist. to Transmission"
            value={detail.distance_to_existing_transmission_lines != null ? `${detail.distance_to_existing_transmission_lines.toFixed(1)} km` : undefined}
          />
          <StatRow
            label="Dist. to Planned Tx"
            value={detail.distance_to_planned_transmission_lines != null ? `${detail.distance_to_planned_transmission_lines.toFixed(1)} km` : undefined}
          />
          <StatRow
            label="Dist. to Water"
            value={detail.closest_distance_water != null ? `${detail.closest_distance_water.toFixed(1)} km` : undefined}
          />
          <StatRow
            label="Dist. to Road"
            value={detail.dist_main_road_km != null ? `${detail.dist_main_road_km.toFixed(1)} km` : undefined}
          />
          <StatRow label="Nearest Hub" value={detail.nearest_hub_name} />
          <StatRow
            label="Dist. to Hub"
            value={detail.dist_nearest_hub_km != null ? `${detail.dist_nearest_hub_km.toFixed(1)} km` : undefined}
          />
        </Section>

        <Section title="Energy">
          <StatRow label="Demand" value={detail.demand != null ? `${detail.demand.toFixed(1)} kW` : undefined} />
          <StatRow label="PV Potential" value={detail.pv_value != null ? `${detail.pv_value.toFixed(0)} kWh/kWp` : undefined} />
        </Section>

        <Section title="Buildings Breakdown">
          <StatRow label="Large" value={detail.large_buildings?.toLocaleString()} />
          <StatRow label="Medium" value={detail.medium_buildings?.toLocaleString()} />
          <StatRow label="Small" value={detail.small_buildings?.toLocaleString()} />
          <StatRow label="Very Small" value={detail.very_small_structures?.toLocaleString()} />
          <StatRow label="Density" value={detail.building_density?.toFixed(2)} />
        </Section>

        {detail.crop_types && (
          <Section title="Agriculture">
            <p className="text-sm text-cdmu-gray-700">{detail.crop_types}</p>
          </Section>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs font-semibold text-cdmu-gray-500 uppercase tracking-wider mb-1">
        {title}
      </h4>
      <div className="divide-y divide-cdmu-gray-100">{children}</div>
    </div>
  );
}
