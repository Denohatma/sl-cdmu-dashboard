"use client";

import { useAppState } from "@/lib/filter-context";

const REGIONS = ["Eastern", "Northern", "North West", "Southern", "Western Area"];

const DISTRICTS: Record<string, string[]> = {
  Eastern: ["Kailahun", "Kenema", "Kono"],
  Northern: ["Bombali", "Koinadugu", "Tonkolili"],
  "North West": ["Kambia", "Port Loko"],
  Southern: ["Bo", "Bonthe", "Moyamba", "Pujehun"],
  "Western Area": ["Western Area Rural", "Western Area Urban"],
};

export default function FilterPanel() {
  const { state, dispatch } = useAppState();
  const { filters } = state;
  const availableDistricts = filters.region
    ? DISTRICTS[filters.region] || []
    : Object.values(DISTRICTS).flat();

  return (
    <div className="absolute bottom-14 left-3 z-[1000] bg-white rounded-lg shadow-lg p-4 w-72 max-h-[60vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-cdmu-navy">Filter Settlements</h3>
        <button
          onClick={() => dispatch({ type: "RESET_FILTERS" })}
          className="text-xs text-cdmu-teal hover:underline"
        >
          Reset
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-cdmu-gray-700 block mb-1">Region</label>
          <select
            value={filters.region || ""}
            onChange={(e) =>
              dispatch({
                type: "SET_FILTER",
                payload: { region: e.target.value || null },
              })
            }
            className="w-full text-sm border border-cdmu-gray-200 rounded px-2 py-1.5 bg-white"
          >
            <option value="">All Regions</option>
            {REGIONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-cdmu-gray-700 block mb-1">District</label>
          <select
            value={filters.district || ""}
            onChange={(e) =>
              dispatch({
                type: "SET_FILTER",
                payload: { district: e.target.value || null },
              })
            }
            className="w-full text-sm border border-cdmu-gray-200 rounded px-2 py-1.5 bg-white"
          >
            <option value="">All Districts</option>
            {availableDistricts.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-cdmu-gray-700 block mb-1">
            Electrification
          </label>
          <select
            value={filters.electrification}
            onChange={(e) =>
              dispatch({
                type: "SET_FILTER",
                payload: { electrification: e.target.value as "all" | "electrified" | "unelectrified" },
              })
            }
            className="w-full text-sm border border-cdmu-gray-200 rounded px-2 py-1.5 bg-white"
          >
            <option value="all">All</option>
            <option value="electrified">Electrified (Nightlight)</option>
            <option value="unelectrified">Unelectrified</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-cdmu-gray-700 block mb-1">
            Security Risk
          </label>
          <div className="flex gap-2">
            {["low", "medium", "high"].map((risk) => (
              <label key={risk} className="flex items-center gap-1 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.securityRisk.includes(risk)}
                  onChange={(e) => {
                    const newRisks = e.target.checked
                      ? [...filters.securityRisk, risk]
                      : filters.securityRisk.filter((r) => r !== risk);
                    dispatch({
                      type: "SET_FILTER",
                      payload: { securityRisk: newRisks },
                    });
                  }}
                  className="w-3.5 h-3.5 rounded"
                />
                <span className="capitalize text-cdmu-gray-700">{risk}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <label className="flex items-center gap-1.5 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={filters.hasEducation === true}
              onChange={(e) =>
                dispatch({
                  type: "SET_FILTER",
                  payload: { hasEducation: e.target.checked ? true : null },
                })
              }
              className="w-3.5 h-3.5 rounded"
            />
            <span className="text-cdmu-gray-700">Has Education</span>
          </label>
          <label className="flex items-center gap-1.5 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={filters.hasHealth === true}
              onChange={(e) =>
                dispatch({
                  type: "SET_FILTER",
                  payload: { hasHealth: e.target.checked ? true : null },
                })
              }
              className="w-3.5 h-3.5 rounded"
            />
            <span className="text-cdmu-gray-700">Has Health</span>
          </label>
        </div>
      </div>
    </div>
  );
}
