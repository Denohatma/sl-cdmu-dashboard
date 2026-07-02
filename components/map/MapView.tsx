"use client";

import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  CircleMarker,
  Marker,
  Popup,
  Tooltip,
  useMap,
  ZoomControl,
} from "react-leaflet";
import L from "leaflet";
import { useAppState } from "@/lib/filter-context";
import SettlementPanel from "./SettlementPanel";
import LayerControls from "./LayerControls";
import FilterPanel from "./FilterPanel";
import type { SettlementDetail, Project } from "@/lib/types";
import projectsRaw from "@/data/projects.json";

const projects = (projectsRaw as { projects: Project[] }).projects;

const SL_BOUNDS: L.LatLngBoundsExpression = [
  [6.85, -13.5],
  [10.0, -10.2],
];

function getColor(attribute: string, props: Record<string, unknown>): string {
  switch (attribute) {
    case "nightlight":
      return props.has_nightlight ? "#1EB53A" : "#E74C3C";
    case "population": {
      const pop = Number(props.population) || 0;
      if (pop > 2000) return "#DC2626";
      if (pop > 500) return "#F59E0B";
      return "#FEF3C7";
    }
    case "dist_transmission": {
      const dist = Number(props.dist_transmission) || 0;
      if (dist > 200) return "#E74C3C";
      if (dist > 50) return "#F59E0B";
      return "#1EB53A";
    }
    case "demand": {
      const dem = Number(props.demand) || 0;
      if (dem > 100) return "#005A9E";
      if (dem > 20) return "#0072C6";
      return "#DBEAFE";
    }
    case "pv_value": {
      const pv = Number(props.pv_value) || 0;
      if (pv > 1600) return "#DC2626";
      if (pv > 1450) return "#F97316";
      return "#FDE68A";
    }
    case "security_risk":
      if (props.security_risk === "high") return "#E74C3C";
      if (props.security_risk === "medium") return "#F59E0B";
      return "#1EB53A";
    default:
      return "#94A3B8";
  }
}

const COLOR_LABELS: Record<string, { label: string; items: { color: string; label: string }[] }> = {
  nightlight: {
    label: "Electrification Status",
    items: [
      { color: "#1EB53A", label: "Has nightlight" },
      { color: "#E74C3C", label: "No nightlight" },
    ],
  },
  population: {
    label: "Population",
    items: [
      { color: "#FEF3C7", label: "< 100" },
      { color: "#F59E0B", label: "~500" },
      { color: "#DC2626", label: "> 2,000" },
    ],
  },
  dist_transmission: {
    label: "Distance to Grid (km)",
    items: [
      { color: "#1EB53A", label: "Near (< 10 km)" },
      { color: "#F59E0B", label: "Medium (~50 km)" },
      { color: "#E74C3C", label: "Far (> 200 km)" },
    ],
  },
  demand: {
    label: "Demand (kW)",
    items: [
      { color: "#DBEAFE", label: "Low" },
      { color: "#0072C6", label: "Medium" },
      { color: "#005A9E", label: "High" },
    ],
  },
  pv_value: {
    label: "Solar PV Potential",
    items: [
      { color: "#FDE68A", label: "Lower" },
      { color: "#F97316", label: "Medium" },
      { color: "#DC2626", label: "Higher" },
    ],
  },
  security_risk: {
    label: "Security Risk",
    items: [
      { color: "#1EB53A", label: "Low" },
      { color: "#F59E0B", label: "Medium" },
      { color: "#E74C3C", label: "High" },
    ],
  },
};

interface SettlementFeature {
  type: "Feature";
  geometry: { type: "Point"; coordinates: [number, number] };
  properties: Record<string, unknown>;
}

function passesFilter(
  props: Record<string, unknown>,
  filters: {
    region: string | null;
    district: string | null;
    electrification: string;
    hasEducation: boolean | null;
    hasHealth: boolean | null;
    securityRisk: string[];
  }
): boolean {
  if (filters.region && props.region !== filters.region) return false;
  if (filters.district && props.district !== filters.district) return false;
  if (filters.electrification === "electrified" && !props.has_nightlight) return false;
  if (filters.electrification === "unelectrified" && props.has_nightlight) return false;
  if (filters.hasEducation === true && !props.has_education) return false;
  if (filters.hasHealth === true && !props.has_health) return false;
  if (filters.securityRisk.length > 0 && !filters.securityRisk.includes(props.security_risk as string)) return false;
  return true;
}

function BoundMap() {
  const map = useMap();
  useEffect(() => {
    map.setMaxBounds(SL_BOUNDS);
    map.setMinZoom(7);
  }, [map]);
  return null;
}

const PROJECT_TYPE_COLORS: Record<string, string> = {
  generation: "#1EB53A",
  transmission: "#0072C6",
  infrastructure: "#F4A300",
  off_grid: "#E74C3C",
};

const STATUS_LABELS: Record<string, string> = {
  funded: "Funded",
  in_progress: "In Progress",
  procurement: "Procurement",
  feasibility: "Feasibility",
  development: "Development",
};

function createProjectIcon(type: string) {
  const color = PROJECT_TYPE_COLORS[type] || "#64748B";
  return L.divIcon({
    className: "",
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
    html: `<div style="width:24px;height:24px;position:relative">
      <svg viewBox="0 0 24 32" width="24" height="32">
        <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20C24 5.4 18.6 0 12 0z" fill="${color}" stroke="white" stroke-width="1.5"/>
        <circle cx="12" cy="11" r="5" fill="white"/>
      </svg>
    </div>`,
  });
}

function ProjectMarkers() {
  const mappableProjects = projects.filter((p) => p.gps && p.gps.lat && p.gps.lng);

  return (
    <>
      {mappableProjects.map((p) => (
        <Marker
          key={p.id}
          position={[p.gps!.lat, p.gps!.lng]}
          icon={createProjectIcon(p.type)}
        >
          <Tooltip
            direction="top"
            offset={[0, -28]}
            className="project-tooltip"
            sticky
          >
            <div style={{ minWidth: 220, maxWidth: 280, fontSize: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4, color: PROJECT_TYPE_COLORS[p.type] || "#333" }}>
                {p.name}
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  <tr><td style={{ color: "#64748B", paddingRight: 8 }}>Type</td><td style={{ fontWeight: 500 }}>{p.type.replace(/_/g, " ")}</td></tr>
                  <tr><td style={{ color: "#64748B", paddingRight: 8 }}>Stage</td><td style={{ fontWeight: 500 }}>{p.stage || STATUS_LABELS[p.status] || p.status}</td></tr>
                  <tr><td style={{ color: "#64748B", paddingRight: 8 }}>Cost</td><td style={{ fontWeight: 500 }}>${p.cost_usd_million}M</td></tr>
                  {p.capacity_mw ? <tr><td style={{ color: "#64748B" }}>Capacity</td><td style={{ fontWeight: 500 }}>{p.capacity_mw} MW</td></tr> : null}
                  <tr><td style={{ color: "#64748B" }}>Sponsor</td><td style={{ fontWeight: 500 }}>{p.lead || "GoSL"}</td></tr>
                  <tr><td style={{ color: "#64748B" }}>Commission</td><td style={{ fontWeight: 500 }}>{p.target_date || "TBD"}</td></tr>
                  {p.population_served ? <tr><td style={{ color: "#64748B" }}>Impact</td><td style={{ fontWeight: 500 }}>{p.population_served.toLocaleString()} people</td></tr> : null}
                </tbody>
              </table>
              <div style={{ marginTop: 6, textAlign: "right" }}>
                <a href={`/pfs/${p.id}`} target="_blank" rel="noreferrer" style={{ color: "#0072C6", fontWeight: 600, textDecoration: "underline" }}>
                  View PFS →
                </a>
              </div>
            </div>
          </Tooltip>
        </Marker>
      ))}
    </>
  );
}

function SettlementMarkers({
  features,
  colorAttribute,
  filters,
  onSelect,
}: {
  features: SettlementFeature[];
  colorAttribute: string;
  filters: {
    region: string | null;
    district: string | null;
    electrification: string;
    hasEducation: boolean | null;
    hasHealth: boolean | null;
    securityRisk: string[];
  };
  onSelect: (id: string) => void;
}) {
  const map = useMap();
  const zoom = map.getZoom();
  const radius = zoom < 8 ? 2 : zoom < 12 ? 4 : 7;

  const filtered = useMemo(
    () => features.filter((f) => passesFilter(f.properties, filters)),
    [features, filters]
  );

  return (
    <>
      {filtered.map((feature) => {
        const [lng, lat] = feature.geometry.coordinates;
        const color = getColor(colorAttribute, feature.properties);
        const name = (feature.properties.name as string) || "Unknown";
        const pop = feature.properties.population;

        return (
          <CircleMarker
            key={feature.properties.id as string}
            center={[lat, lng]}
            radius={radius}
            pathOptions={{
              fillColor: color,
              color: "#fff",
              weight: 1,
              fillOpacity: 0.85,
            }}
            eventHandlers={{
              click: () => onSelect(feature.properties.id as string),
            }}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{name}</p>
                <p className="text-gray-600">Pop: {String(pop)}</p>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </>
  );
}

export default function MapView() {
  const { state, dispatch } = useAppState();
  const [settlements, setSettlements] = useState<SettlementFeature[]>([]);
  const [districtGeo, setDistrictGeo] = useState<GeoJSON.FeatureCollection | null>(null);
  const [transmissionGeo, setTransmissionGeo] = useState<GeoJSON.FeatureCollection | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<SettlementDetail | null>(null);
  const [detailCache, setDetailCache] = useState<Record<string, SettlementDetail>>({});
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetch("/data/settlements-points.json")
      .then((r) => r.json())
      .then((geo: GeoJSON.FeatureCollection) =>
        setSettlements(geo.features as unknown as SettlementFeature[])
      );
    fetch("/data/geo/districts.geojson")
      .then((r) => r.json())
      .then(setDistrictGeo)
      .catch(() => {});
    fetch("/data/geo/transmission-lines.geojson")
      .then((r) => r.json())
      .then(setTransmissionGeo)
      .catch(() => {});
  }, []);

  const handleSelect = useCallback(
    async (id: string) => {
      dispatch({ type: "SELECT_SETTLEMENT", payload: id });

      if (detailCache[id]) {
        setSelectedDetail(detailCache[id]);
      } else {
        try {
          const res = await fetch("/data/settlements-detail.json");
          const allDetails = await res.json();
          setDetailCache(allDetails);
          setSelectedDetail(allDetails[id] || null);
        } catch {
          setSelectedDetail(null);
        }
      }
    },
    [dispatch, detailCache]
  );

  const districtStyle = useCallback(
    () => ({
      fillColor: "#0072C6",
      fillOpacity: 0.05,
      color: "#0072C6",
      weight: 1.5,
      opacity: 0.6,
    }),
    []
  );

  const transmissionStyle = useCallback(
    (feature: GeoJSON.Feature | undefined) => ({
      color: feature?.properties?.status === "Planned" ? "#F4A300" : "#E74C3C",
      weight: 2.5,
      dashArray: feature?.properties?.status === "Planned" ? "8 4" : undefined,
    }),
    []
  );

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[8.46, -11.78]}
        zoom={7}
        zoomControl={false}
        maxBounds={SL_BOUNDS}
        minZoom={7}
        maxZoom={16}
        style={{ width: "100%", height: "100%" }}
        className="z-0"
      >
        <BoundMap />
        <ZoomControl position="topright" />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {state.visibleLayers.districts && districtGeo && (
          <GeoJSON
            key="districts"
            data={districtGeo}
            style={districtStyle}
            onEachFeature={(feature, layer) => {
              if (feature.properties?.shapeName) {
                layer.bindTooltip(feature.properties.shapeName, {
                  permanent: false,
                  direction: "center",
                  className: "text-xs font-semibold",
                });
              }
            }}
          />
        )}

        {state.visibleLayers.transmission && transmissionGeo && (
          <GeoJSON
            key="transmission"
            data={transmissionGeo}
            style={transmissionStyle}
          />
        )}

        {state.visibleLayers.settlements && settlements.length > 0 && (
          <SettlementMarkers
            features={settlements}
            colorAttribute={state.colorAttribute}
            filters={state.filters}
            onSelect={handleSelect}
          />
        )}

        {state.visibleLayers.projects && <ProjectMarkers />}
      </MapContainer>

      <div className="absolute top-3 left-3 z-[1000] flex flex-col gap-2">
        <div className="bg-white rounded-lg shadow-lg px-3 py-2">
          <label className="text-xs font-medium text-cdmu-gray-700 block mb-1">
            Color by
          </label>
          <select
            value={state.colorAttribute}
            onChange={(e) =>
              dispatch({ type: "SET_COLOR_ATTRIBUTE", payload: e.target.value })
            }
            className="text-sm border border-cdmu-gray-200 rounded px-2 py-1 bg-white"
          >
            <option value="nightlight">Electrification</option>
            <option value="population">Population</option>
            <option value="dist_transmission">Distance to Grid</option>
            <option value="demand">Demand</option>
            <option value="pv_value">Solar PV Potential</option>
            <option value="security_risk">Security Risk</option>
          </select>
        </div>

        {COLOR_LABELS[state.colorAttribute] && (
          <div className="bg-white rounded-lg shadow-lg px-3 py-2">
            <p className="text-xs font-medium text-cdmu-gray-700 mb-1">
              {COLOR_LABELS[state.colorAttribute].label}
            </p>
            {COLOR_LABELS[state.colorAttribute].items.map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-xs">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-cdmu-gray-600">{item.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <LayerControls />

      <button
        onClick={() => setShowFilters(!showFilters)}
        className="absolute bottom-4 left-3 z-[1000] bg-white rounded-lg shadow-lg px-3 py-2 text-sm font-medium text-cdmu-blue hover:bg-cdmu-gray-50 transition-colors"
      >
        Filters {showFilters ? "▲" : "▼"}
      </button>

      {showFilters && <FilterPanel />}

      {selectedDetail && (
        <SettlementPanel
          detail={selectedDetail}
          onClose={() => {
            dispatch({ type: "SELECT_SETTLEMENT", payload: null });
            setSelectedDetail(null);
          }}
        />
      )}
    </div>
  );
}
