export interface Settlement {
  id: string;
  name: string;
  district: string;
  region: string;
  population: number;
  has_nightlight: boolean;
  has_education: boolean;
  has_health: boolean;
  dist_transmission: number;
  dist_planned_transmission: number;
  pv_value: number;
  demand: number;
  security_risk: "low" | "medium" | "high";
  num_buildings: number;
}

export interface SettlementDetail {
  village_name: string;
  region: string;
  district: string;
  population: number;
  num_buildings: number;
  large_buildings: number;
  medium_buildings: number;
  small_buildings: number;
  very_small_structures: number;
  building_density: number;
  closest_distance_water: number;
  main_road_access: boolean;
  dist_main_road_km: number;
  nearest_hub_name: string;
  dist_nearest_hub_km: number;
  num_education_facilities: number;
  num_health_facilities: number;
  mean_rwi: number;
  distance_to_existing_transmission_lines: number;
  distance_to_planned_transmission_lines: number;
  has_nightlight: boolean;
  pv_value: number;
  crop_types: string;
  ag_area: number;
  ag_value: number;
  ag_yield: number;
  security_risk: string;
  num_connections: number;
  demand: number;
  demand_connection: number;
}

export interface KPI {
  id: string;
  label: string;
  unit: string;
  baseline: number;
  baseline_year: number;
  current: number;
  target: number;
  target_year: number;
  breakdown?: Record<string, { baseline: number; target: number }>;
}

export interface ActionItem {
  id: string;
  indicator: string;
  baseline: boolean;
  status: Status;
  responsible: string;
  actions: {
    text: string;
    target_date: string;
    status: Status;
  }[];
}

export interface Pillar {
  id: number;
  name: string;
  short: string;
  icon: string;
  color: string;
  action_items: ActionItem[];
}

export type Status = "not_started" | "in_progress" | "completed" | "delayed";

export interface Project {
  id: string;
  name: string;
  cost_usd_million: number;
  status: string;
  notes: string;
  type: string;
  region: string;
  capacity_mw?: number;
  technology?: string;
  lead?: string;
  target_date?: string;
  pillar?: number;
  description?: string;
  location?: string;
  stage?: string;
  gps?: { lat: number; lng: number };
  ppa_price?: number;
  capacity_factor?: number;
  project_life?: number;
  opex_pct?: number;
  debt_ratio?: number;
  interest_rate?: number;
  loan_tenure?: number;
  population_served?: number;
  households?: number;
  connections?: number;
}

export interface InvestmentPartner {
  name: string;
  short: string;
  committed: number;
  disbursed: number;
  timeline: string;
  projects: string[];
}

export interface DistrictStats {
  region: string;
  settlements: number;
  population: number;
  electrified: number;
  unelectrified: number;
  total_demand: number;
  total_buildings: number;
  education_facilities: number;
  health_facilities: number;
  avg_dist_transmission: number;
  avg_pv_value: number;
  security_low: number;
  security_medium: number;
  security_high: number;
}

export type ColorAttribute =
  | "nightlight"
  | "population"
  | "dist_transmission"
  | "demand"
  | "pv_value"
  | "security_risk";

export interface FilterState {
  region: string | null;
  district: string | null;
  populationRange: [number, number];
  distTransmissionRange: [number, number];
  electrification: "all" | "electrified" | "unelectrified";
  hasEducation: boolean | null;
  hasHealth: boolean | null;
  securityRisk: string[];
}
