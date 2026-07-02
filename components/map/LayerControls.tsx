"use client";

import { useAppState } from "@/lib/filter-context";

const LAYERS = [
  { key: "projects" as const, label: "Projects", color: "#1EB53A" },
  { key: "settlements" as const, label: "Settlements (16K)", color: "#F59E0B" },
  { key: "districts" as const, label: "District Boundaries", color: "#0072C6" },
  { key: "transmission" as const, label: "Transmission Lines", color: "#E74C3C" },
  { key: "minigrids" as const, label: "Mini-grid Sites", color: "#F4A300" },
];

export default function LayerControls() {
  const { state, dispatch } = useAppState();

  return (
    <div className="absolute top-3 right-14 z-[1000] bg-white rounded-lg shadow-lg px-3 py-2">
      <p className="text-xs font-medium text-cdmu-gray-700 mb-1.5">Layers</p>
      <div className="space-y-1.5">
        {LAYERS.map((layer) => (
          <label
            key={layer.key}
            className="flex items-center gap-2 cursor-pointer text-xs"
          >
            <input
              type="checkbox"
              checked={state.visibleLayers[layer.key]}
              onChange={() =>
                dispatch({ type: "TOGGLE_LAYER", payload: layer.key })
              }
              className="w-3.5 h-3.5 rounded border-cdmu-gray-300"
            />
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: layer.color }}
            />
            <span className="text-cdmu-gray-700">{layer.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
