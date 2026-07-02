# Product Requirements Document (PRD)
## Sierra Leone CDMU Mission 300 Dashboard
**Version:** 2.0  
**Author:** AfCEN Engineering  
**Last Updated:** 2026-07-02  
**Status:** Production (Live on Vercel)

---

## 1. Product Overview

The SL CDMU Dashboard is a GIS-enabled monitoring and decision-support platform for Sierra Leone's Compact Delivery & Monitoring Unit (CDMU) under the Ministry of Energy. It tracks the implementation of Sierra Leone's Mission 300 National Energy Compact, which targets 78% electricity access by 2030 through a $2.245B investment programme across 24 priority projects.

**Live URL:** https://sl-cdmu-dashboard.vercel.app  
**Repository:** https://github.com/Denohatma/sl-cdmu-dashboard.git  
**Branch:** `main`

### 1.1 Key Users

| Role | Description | Access Level |
|------|-------------|-------------|
| **CDMU Staff** | Ministry of Energy compact delivery team | Full access: edit notes, projects, partners, KPIs, admin panel |
| **External** | DFIs, partners, government officials, public stakeholders | View-only: dashboards, map, reports, PFS documents |

### 1.2 Core Value Proposition

- Real-time compact progress monitoring with KPI speedometers
- GIS visualization of 16,522 settlements with electrification status
- Standardized CDMU scoring for 24 MoE priority projects (9-dimension weighted index)
- Auto-generated Pre-Feasibility Studies with financial modeling (LCOE, IRR, NPV, DSCR)
- Investment pipeline tracking with partner prospect management
- District-level portfolio analysis for cross-sector impact planning

---

## 2. Technical Architecture

### 2.1 Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 15.5.20 |
| Runtime | React | 19.2.4 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 3.4.19 |
| Maps | Leaflet + react-leaflet | 1.9.4 / 5.0.0 |
| Charts | Tremor React | 3.18.7 |
| Export | jsPDF + html2canvas | 4.2.1 / 1.4.1 |
| Deployment | Vercel | Serverless |
| Node | Node.js 20 (required) | 20.x |

### 2.2 Project Structure

```
sl-cdmu-dashboard/
  app/                          # Next.js App Router pages
    layout.tsx                  # Root layout (fonts, metadata)
    page.tsx                    # Main dashboard (split panel + map)
    globals.css                 # Global styles + glassmorphism utilities
    admin/page.tsx              # Admin data editor (password-gated)
    pfs/[id]/page.tsx           # 20-section PFS report page
    project/[id]/page.tsx       # Project detail page (4 tabs)
    api/
      admin/auth/route.ts       # POST: password authentication
      admin/update/route.ts     # POST: JSON data file updates
      settlement/route.ts       # GET: settlement detail by ID
  components/
    chatbot/SaloneChat.tsx      # Rule-based Krio/English chatbot
    dashboard/                  # 10 dashboard panel components
    layout/SplitPanel.tsx       # Collapsible split panel
    map/                        # Map view + filter/layer controls
  lib/
    types.ts                    # All TypeScript interfaces
    filter-context.tsx          # Global app state (useReducer + Context)
    role-context.tsx            # Role-based permissions (RBAC)
    scoring.ts                  # CDMU project scoring algorithm
    pfs-calculations.ts         # Financial model (LCOE/IRR/NPV/DSCR)
    export.ts                   # PDF/PNG export utilities
  data/                         # Source JSON data files (7 files)
  public/
    data/                       # Static-served data files
      geo/                      # GeoJSON (districts, transmission lines)
    logos/                       # Partner and branding logos (8 files)
```

### 2.3 Data Architecture

All data is stored as static JSON files. There is no external database. The admin panel writes to both `data/` and `public/data/` directories.

| File | Records | Description |
|------|---------|-------------|
| `projects.json` | 24 projects | MoE priority projects with 24 fields each (financial params, GPS, technology, status) |
| `settlements-points.json` | 16,522 features | GeoJSON FeatureCollection with electrification, infrastructure, and demographic data per settlement |
| `settlements-detail.json` | 16,522 entries | Extended settlement profiles (30+ fields: agriculture, buildings, infrastructure distances) |
| `districts.json` | 14 districts | Regional stats: population, settlements, electrification rate, facilities |
| `kpis.json` | 4 KPIs | Compact targets with baselines, current values, and breakdowns |
| `pillars.json` | 5 pillars | 22 action items with 48 sub-actions, status tracking, responsible parties |
| `investments.json` | 6 sectors + 6 partners | Financial breakdown: $2.245B total, public/private split, partner commitments |
| `metrics.json` | 5 pillars, 31 metrics | Sector-level M&E indicators |
| `minigrids.json` | 110 sites | Mini-grid locations with capacity, operator, status, connections |
| `districts.geojson` | 14 polygons | District boundary geometries |
| `transmission-lines.geojson` | Line features | Transmission corridor geometries |

### 2.4 State Management

Two React Context providers (no Redux/Zustand):

**AppProvider (`filter-context.tsx`)** -- Global app state:
- `filters` -- 8 filter dimensions (region, district, population, electrification, etc.)
- `selectedSettlement` / `selectedDistrict` -- current map selection
- `activeTab` -- current dashboard tab
- `colorAttribute` -- map coloring mode (6 options)
- `visibleLayers` -- 5 boolean toggles (projects, settlements, districts, transmission, minigrids)

**RoleProvider (`role-context.tsx`)** -- User role state:
- `role` -- `cdmu_staff` or `external` (toggled via header button)
- `permissions` -- 8 boolean flags controlling UI visibility

### 2.5 Routing

| Path | Type | Description |
|------|------|-------------|
| `/` | Client page | Main dashboard with split panel (dashboard + map) |
| `/project/[id]` | Dynamic client page | Project detail with 4 tabs: Overview, Financials, Documents, Risk |
| `/pfs/[id]` | Dynamic client page | Full 20-section Pre-Feasibility Study report |
| `/admin` | Client page | Password-gated JSON data editor |
| `/api/admin/auth` | API route (POST) | Password authentication |
| `/api/admin/update` | API route (POST) | Data file write operations |
| `/api/settlement` | API route (GET) | Settlement detail lookup with in-memory caching |

---

## 3. Feature Specifications

### 3.1 Dashboard Overview Tab

**Components:** Hero banner, KPIScorecard, InvestmentChart, Five Strategic Pillars, Key Partners, Key Milestones

**KPI Speedometers (4 gauges):**
- Electricity Access Rate: 36% baseline -> 42% current -> 78% target (2030)
- Clean Cooking Access: 1.5% -> 3.8% -> 25%
- Renewable Energy Share: 46% -> 48% -> 52%
- Private Capital Mobilized: $615M -> $872M -> $1.4B

Each speedometer is an SVG gauge with 4 color zones (red/amber/yellow/green), animated needle, and optional breakdown table.

### 3.2 Interactive Map

**Engine:** Leaflet with react-leaflet (client-side only, SSR disabled)

**5 Toggleable Layers:**
1. **Projects** (24 markers) -- Custom colored markers by status, clickable with tooltip showing name/cost/status/capacity
2. **Settlements** (16,522 CircleMarkers) -- Color-coded by electrification attribute, clickable for detail panel
3. **District Boundaries** (14 polygons) -- GeoJSON overlay with hover highlighting
4. **Transmission Lines** -- GeoJSON line features for corridor visualization
5. **Mini-grid Sites** (110 markers) -- Operational/construction/planned status

**4 Basemap Styles:** Dark (CARTO), Light (CARTO), Satellite (Esri), Terrain (OpenTopoMap)

**Color-by Options:** Electrification status, population, nightlight, PV potential, demand, security risk

**Filter Panel:** Region, district, electrification status, security risk, education/health facility presence

**Settlement Detail Panel:** Slide-in panel with demographics, infrastructure distances, energy demand, building counts, agriculture data (30+ fields)

### 3.3 CDMU Project Scoring

**Algorithm:** 9-dimension weighted index (0-100 scale, whole numbers)

| Dimension | Weight | Scoring Logic |
|-----------|--------|---------------|
| Readiness | 18% | Status-based: in_progress=80, funded=70, procurement=60, development=40, feasibility=20 |
| Scale of Impact | 13% | Population thresholds: >1M=100, >500K=80, >200K=60, >100K=40, else=20 |
| Bankability | 18% | funded/in_progress=80, has PPA=70, else=40 |
| Country Enablement | 10% | MCC/World Bank=90, Government/Ministry=80, else=50 |
| Scalability | 3% | Solar/minigrid=90, hydro=60, else=40 |
| Climate Impact | 13% | Solar/hydro=90, thermal/gas=30, else=50 |
| Job Creation | 10% | MW-based: solar=MW*2, hydro=MW*1, else=MW*0.8 (capped at 100) |
| Regional Integration | 8% | Transmission type=90, else=40 |
| Gender & Inclusion | 7% | Off-grid=80, pop>200K=70, else=50 |

**Score Labels:** >=70 STRONG (green), >=50 MODERATE (amber), <50 WEAK (red)

### 3.4 Pre-Feasibility Study (PFS) Engine

Auto-generated 20-section PFS reports with full financial modeling.

**Key Formulas:**
- **LCOE** = (CAPEX * CRF + Annual OPEX) / Annual Energy Yield
- **CRF** = [WACC * (1+WACC)^n] / [(1+WACC)^n - 1], where WACC = 12%
- **Project IRR** = Newton-Raphson solver on full cashflow series
- **NPV @10%** = Discounted cashflow summation
- **DSCR** = Annual Revenue / Annual Debt Service
- **CO2 Abatement** = (AEY_MWh) * 0.52 tCO2/MWh

**Sensitivity Analysis:** 7 scenarios testing CAPEX +/-20%, CF +/-15%, PPA +/-20%  
**Bankability Threshold:** DSCR >= 1.25 AND IRR >= 8%

**Risk Register:** 8 technology-adaptive risks with likelihood/impact/RAG/mitigation

### 3.5 Investment Pipeline

- 6-sector breakdown (Generation, Transmission, Distribution, Off-Grid, Clean Cooking, Institutional)
- 6 tracked DFI partners with committed/disbursed tracking
- 13-entry partner prospect pipeline (Active/Pipeline/Prospect stages)
- Editable notes and pipeline stage management (CDMU Staff only)

### 3.6 Chatbot ("Salone")

Rule-based keyword-matching chatbot with ~30 knowledge base entries. Responds in mixed English/Krio (Sierra Leonean Creole). Can trigger tab navigation based on query context.

### 3.7 Role-Based Access

| Permission | CDMU Staff | External |
|------------|-----------|----------|
| View dashboards, map, reports | Yes | Yes |
| Export PDF/PNG | Yes | Yes |
| Edit project notes | Yes | No |
| Edit partners/KPIs | Yes | No |
| Access admin panel | Yes | No |
| Edit timeline/pillars | Yes | No |

### 3.8 Admin Panel

Password-protected (`/admin`) data editor that allows CDMU Staff to:
- Load any of 5 data files (kpis, pillars, investments, projects, metrics)
- Edit raw JSON in a textarea
- Save changes (writes to both `data/` and `public/data/` directories)
- Default password: `cdmu-admin-2025` (configurable via `ADMIN_PASSWORD` env var)

### 3.9 Export

- **Dashboard PDF** -- Landscape A4 with title page + optional map capture (html2canvas + jsPDF)
- **Map PNG** -- Direct screenshot download of map element
- **PFS Print** -- Browser print dialog for 20-section PFS reports (print-optimized CSS)

---

## 4. Design System

### 4.1 Visual Language

Apple-inspired glassmorphism with frosted glass effects:

```css
.glass      { background: rgba(255,255,255,0.72); backdrop-filter: blur(20px) saturate(180%); }
.glass-dark { background: rgba(28,28,30,0.78); backdrop-filter: blur(20px) saturate(180%); }
.glass-card { background: rgba(255,255,255,0.65); backdrop-filter: blur(12px) saturate(150%); border: 1px solid rgba(255,255,255,0.45); }
```

### 4.2 Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `cdmu-blue` | #007AFF | Primary actions, active tabs, links |
| `cdmu-green` | #34C759 | Success, positive scores, electrified |
| `cdmu-red` | #FF3B30 | Errors, weak scores, unelectrified |
| `cdmu-amber` | #FF9500 | Warnings, moderate scores |
| `cdmu-gold` | #F4A300 | Accent, current values, equity |
| `cdmu-navy` | #0072C6 | Headers, investment values |
| `cdmu-gray-50` | #F2F2F7 | Background |
| `cdmu-gray-900` | #1C1C1E | Text |

### 4.3 Typography

- **Primary:** Open Sans (via Google Fonts)
- **Monospace:** Geist Mono (for data/code)
- **System fallback:** -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica Neue

### 4.4 Component Patterns

- **Cards:** `glass-card rounded-2xl` with `shadow-apple` on hover
- **Buttons:** `rounded-full` pill shape with `transition-all duration-200`
- **Tabs:** Pill-shaped with active state `bg-cdmu-blue text-white shadow-apple`
- **Modals:** Glass backdrop (`bg-black/20 backdrop-blur-md`) with glass panel

---

## 5. Data Sources

| Source | Data | Update Frequency |
|--------|------|------------------|
| World Bank DRE Atlas | Settlement electrification status | Annual |
| geoBoundaries | District polygons | Static |
| ENERGYDATA.INFO | Solar PV potential, transmission networks | Annual |
| Ministry of Energy | Project pipeline, financial parameters | Quarterly |
| CDMU | KPI progress, action items, M&E metrics | Monthly |
| SEforALL / AfDB | Compact targets, investment tracking | Quarterly |

---

## 6. Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_MAPBOX_TOKEN` | No | None | Mapbox token (not actively used; Leaflet/CARTO tiles used instead) |
| `ADMIN_PASSWORD` | No | `cdmu-admin-2025` | Admin panel authentication password |

---

## 7. Deployment

- **Platform:** Vercel (serverless)
- **Build command:** `npm run build` (Next.js production build)
- **Install command:** `npm install` with `legacy-peer-deps=true` (configured in `.npmrc`)
- **Node version:** 20.x required
- **Domain:** `sl-cdmu-dashboard.vercel.app`
- **Auto-deploy:** Push to `main` branch triggers production deployment

---

## 8. Known Limitations & Future Work

| Item | Status | Notes |
|------|--------|-------|
| PFS Agents | In Development | AI-powered agents for automated bankable-quality PFS reports |
| Document Upload | UI Ready, Backend Pending | Upload area exists on project detail pages; needs file storage integration |
| Real Authentication | Not Implemented | Currently uses role toggle + simple admin password |
| Database | Not Implemented | All data is static JSON; needs migration to database for multi-user editing |
| Real-time Data | Not Implemented | KPIs and project status are manually updated via admin panel |
| Mapbox GL | Installed, Not Used | mapbox-gl and maplibre-gl packages installed but Leaflet is the active map engine |
