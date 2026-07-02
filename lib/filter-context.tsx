"use client";

import { createContext, useContext, useReducer, type ReactNode } from "react";
import type { FilterState } from "./types";

interface AppState {
  filters: FilterState;
  selectedSettlement: string | null;
  selectedDistrict: string | null;
  activeTab: string;
  colorAttribute: string;
  visibleLayers: {
    districts: boolean;
    transmission: boolean;
    minigrids: boolean;
    settlements: boolean;
    projects: boolean;
  };
}

type Action =
  | { type: "SET_FILTER"; payload: Partial<FilterState> }
  | { type: "RESET_FILTERS" }
  | { type: "SELECT_SETTLEMENT"; payload: string | null }
  | { type: "SELECT_DISTRICT"; payload: string | null }
  | { type: "SET_TAB"; payload: string }
  | { type: "SET_COLOR_ATTRIBUTE"; payload: string }
  | { type: "TOGGLE_LAYER"; payload: keyof AppState["visibleLayers"] };

const initialFilters: FilterState = {
  region: null,
  district: null,
  populationRange: [0, 3000000],
  distTransmissionRange: [0, 500],
  electrification: "all",
  hasEducation: null,
  hasHealth: null,
  securityRisk: [],
};

const initialState: AppState = {
  filters: initialFilters,
  selectedSettlement: null,
  selectedDistrict: null,
  activeTab: "overview",
  colorAttribute: "nightlight",
  visibleLayers: {
    districts: true,
    transmission: false,
    minigrids: false,
    settlements: true,
    projects: true,
  },
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_FILTER":
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      };
    case "RESET_FILTERS":
      return { ...state, filters: initialFilters };
    case "SELECT_SETTLEMENT":
      return { ...state, selectedSettlement: action.payload };
    case "SELECT_DISTRICT":
      return {
        ...state,
        selectedDistrict: action.payload,
        filters: action.payload
          ? { ...state.filters, district: action.payload }
          : state.filters,
      };
    case "SET_TAB":
      return { ...state, activeTab: action.payload };
    case "SET_COLOR_ATTRIBUTE":
      return { ...state, colorAttribute: action.payload };
    case "TOGGLE_LAYER":
      return {
        ...state,
        visibleLayers: {
          ...state.visibleLayers,
          [action.payload]: !state.visibleLayers[action.payload],
        },
      };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppState must be used within AppProvider");
  return ctx;
}
