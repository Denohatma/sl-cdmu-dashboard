# Standard Operating Procedure (SOP)
## Integrating the SL CDMU Dashboard with the AfCEN Main Platform
**Version:** 1.0  
**Author:** AfCEN Engineering  
**Last Updated:** 2026-07-02  
**Audience:** AfCEN developers integrating this dashboard into the main platform

---

## 1. Purpose

This SOP provides step-by-step instructions for AfCEN developers to:

1. Set up the SL CDMU Dashboard locally
2. Understand the codebase architecture and data flow
3. Integrate the dashboard as a module within the AfCEN main platform
4. Migrate from static JSON to the AfCEN shared database
5. Wire up AfCEN authentication, APIs, and shared services
6. Deploy and maintain the integrated version

---

## 2. Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js | 20.x | **Must be v20** -- v18 and v22 have compatibility issues with Next.js 15 |
| npm | 10.x+ | Comes with Node 20 |
| Git | 2.x+ | For repository access |
| Vercel CLI | Latest | Optional, for deployment testing |

### 2.1 Local Setup

```bash
# Clone the repository
git clone https://github.com/Denohatma/sl-cdmu-dashboard.git
cd sl-cdmu-dashboard

# Install dependencies (legacy-peer-deps required for @tremor/react)
npm install --legacy-peer-deps

# Create environment file
cp .env.example .env.local
# Edit .env.local and set ADMIN_PASSWORD if needed

# Start development server
npm run dev
# Dashboard available at http://localhost:3000
```

### 2.2 Build & Test

```bash
# Production build (must pass with zero errors)
npm run build

# Run production server locally
npm start

# Lint check
npm run lint
```

---

## 3. Architecture Overview

### 3.1 How the App is Built

```
                    +------------------+
                    |   app/page.tsx   |  <-- Entry point
                    |   (Client-side)  |
                    +--------+---------+
                             |
              +--------------+--------------+
              |                             |
    +---------v---------+       +-----------v-----------+
    |   DashboardPanel  |       |       MapView         |
    |  (Left half)      |       |   (Right half)        |
    |                   |       |   Leaflet + layers    |
    |  9 tab panels:    |       |   16K settlements     |
    |  - KPIScorecard   |       |   24 project markers  |
    |  - PillarTracker  |       |   110 minigrid sites  |
    |  - InvestmentChart|       |   District boundaries |
    |  - ProjectPipeline|       |   Transmission lines  |
    |  - DistrictProjects|      +-----------------------+
    |  - SectorMetrics  |
    |  - MilestoneTimeline|
    |  - Resources      |
    |  - AboutCompact   |
    +-------------------+
              |
    +---------v---------+
    |  SplitPanel       |  <-- Collapsible 50/50 split
    +-------------------+
              |
    +---------v---------+
    |  SaloneChat       |  <-- Floating chatbot (bottom-right)
    +-------------------+
```

### 3.2 Data Flow

```
data/*.json  ──(ES import)──>  app/page.tsx  ──(props)──>  Components
                                    |
                                    v
                            lib/scoring.ts       <-- CDMU scoring algorithm
                            lib/pfs-calculations.ts  <-- Financial model
                            lib/filter-context.tsx   <-- Global state (Context + useReducer)
                            lib/role-context.tsx     <-- Role permissions
                            lib/export.ts            <-- PDF/PNG export

public/data/*.json  ──(fetch)──>  MapView (GeoJSON, settlements)
                                  SettlementPanel (detail on click)
```

### 3.3 Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Static JSON (no database) | Rapid prototyping, works offline, no server costs. Trade-off: no concurrent editing |
| Client-side rendering | Map and dashboard are interactive; SSR adds complexity with Leaflet |
| Leaflet over Mapbox | No API key required for CARTO/Esri tiles, simpler deployment |
| Role toggle (no auth) | Demo/stakeholder presentations; real auth deferred to platform integration |
| Glassmorphism design | Premium feel for government/DFI stakeholders; Apple-style visual language |

---

## 4. Integration Strategy

### 4.1 Integration Options

| Option | Approach | Effort | Recommended For |
|--------|----------|--------|-----------------|
| **A. Iframe Embed** | Embed dashboard in an iframe on the main platform | Low | Quick demo, minimal coupling |
| **B. Micro-Frontend** | Deploy as standalone app, link from main platform navigation | Medium | Independent deployment, separate teams |
| **C. Module Import** | Copy components into main platform monorepo | High | Full integration, shared auth/data |
| **D. API-Backed Fork** | Replace JSON imports with API calls to AfCEN backend | Medium-High | Best long-term architecture |

**Recommended: Option D (API-Backed Fork)** -- gives full integration while preserving the dashboard's component architecture.

### 4.2 Option A: Iframe Embed (Quick Start)

```html
<!-- On the main AfCEN platform -->
<iframe
  src="https://sl-cdmu-dashboard.vercel.app"
  width="100%"
  height="100vh"
  style="border: none;"
  title="SL CDMU Dashboard"
/>
```

Pros: Zero code changes, works immediately  
Cons: No shared auth, no shared data, navigation is isolated

### 4.3 Option B: Micro-Frontend (Recommended for Phase 1)

1. Deploy the CDMU dashboard on its own subdomain (e.g., `sl.afcen.com`)
2. Add a navigation link from the main platform to the CDMU dashboard
3. Pass authentication tokens via URL parameters or shared cookies
4. Share the AfCEN design system CSS (colors, fonts, glass utilities)

### 4.4 Option D: API-Backed Fork (Recommended for Phase 2)

This section details how to replace the static JSON data layer with AfCEN's API backend.

---

## 5. Step-by-Step: Migrating to AfCEN Backend

### 5.1 Identify Data Endpoints

Map each JSON file to an AfCEN API endpoint:

| Current JSON File | Proposed API Endpoint | Method | Notes |
|-------------------|----------------------|--------|-------|
| `data/projects.json` | `GET /api/v1/countries/sl/projects` | GET | Returns `{ projects: Project[] }` |
| `data/kpis.json` | `GET /api/v1/countries/sl/kpis` | GET | Returns `{ targets: KPI[] }` |
| `data/pillars.json` | `GET /api/v1/countries/sl/pillars` | GET | Returns `{ pillars: Pillar[] }` |
| `data/investments.json` | `GET /api/v1/countries/sl/investments` | GET | Returns sector + partner data |
| `data/metrics.json` | `GET /api/v1/countries/sl/metrics` | GET | Returns pillar metrics |
| `data/districts.json` | `GET /api/v1/countries/sl/districts` | GET | Returns district stats |
| `data/minigrids.json` | `GET /api/v1/countries/sl/minigrids` | GET | Returns mini-grid sites |
| `public/data/settlements-points.json` | `GET /api/v1/countries/sl/settlements/points` | GET | GeoJSON FeatureCollection |
| `public/data/settlements-detail.json` | `GET /api/v1/countries/sl/settlements/:id` | GET | Single settlement detail |
| `public/data/geo/districts.geojson` | `GET /api/v1/countries/sl/geo/districts` | GET | GeoJSON polygons |
| `public/data/geo/transmission-lines.geojson` | `GET /api/v1/countries/sl/geo/transmission` | GET | GeoJSON lines |

### 5.2 Create a Data Service Layer

Create a new `lib/api.ts` that replaces the static imports:

```typescript
// lib/api.ts -- Replace static JSON imports with API calls

const API_BASE = process.env.NEXT_PUBLIC_AFCEN_API_URL || 'https://api.afcen.com';

async function fetchJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`,
      'Content-Type': 'application/json',
    },
    next: { revalidate: 300 }, // Cache for 5 minutes (ISR)
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function getProjects() {
  return fetchJSON<{ projects: Project[] }>('/api/v1/countries/sl/projects');
}

export async function getKPIs() {
  return fetchJSON<{ targets: KPI[] }>('/api/v1/countries/sl/kpis');
}

export async function getPillars() {
  return fetchJSON<{ pillars: Pillar[] }>('/api/v1/countries/sl/pillars');
}

export async function getInvestments() {
  return fetchJSON('/api/v1/countries/sl/investments');
}

export async function getMetrics() {
  return fetchJSON('/api/v1/countries/sl/metrics');
}

// ... etc for each data source
```

### 5.3 Refactor Data Loading

**Current pattern (static imports in `app/page.tsx`):**
```typescript
// CURRENT -- static JSON imports
import kpisRaw from "@/data/kpis.json";
import projectsRaw from "@/data/projects.json";
const kpisData = kpisRaw as { targets: KPI[] };
const projectsData = projectsRaw as { projects: Project[] };
```

**New pattern (API calls):**
```typescript
// NEW -- API-backed data loading
// Option A: Server Component (recommended)
import { getKPIs, getProjects } from "@/lib/api";

export default async function Home() {
  const [kpisData, projectsData] = await Promise.all([
    getKPIs(),
    getProjects(),
  ]);
  return <DashboardPanel kpis={kpisData.targets} projects={projectsData.projects} />;
}

// Option B: Client-side with SWR/React Query (if staying client-rendered)
import useSWR from 'swr';

function DashboardPanel() {
  const { data: kpis } = useSWR('/api/v1/countries/sl/kpis', fetcher);
  const { data: projects } = useSWR('/api/v1/countries/sl/projects', fetcher);
  // ...
}
```

### 5.4 Files to Modify for API Migration

| File | Change Required |
|------|----------------|
| `app/page.tsx` | Replace 5 JSON imports with API calls or props from server component |
| `app/project/[id]/page.tsx` | Replace `projectsRaw` import with API fetch for single project |
| `app/pfs/[id]/page.tsx` | Replace `projectsRaw` import with API fetch |
| `components/map/MapView.tsx` | Replace `fetch('/data/settlements-points.json')` with API endpoint |
| `components/map/SettlementPanel.tsx` | Replace `/api/settlement?id=` with AfCEN API endpoint |
| `app/api/settlement/route.ts` | Remove (replaced by AfCEN backend) |
| `app/api/admin/auth/route.ts` | Remove (replaced by AfCEN auth) |
| `app/api/admin/update/route.ts` | Remove (replaced by AfCEN admin API) |
| `app/admin/page.tsx` | Rewire to use AfCEN admin API for data updates |

### 5.5 Wire Up AfCEN Authentication

Replace the role toggle with AfCEN's auth system:

```typescript
// lib/role-context.tsx -- Replace with AfCEN auth

// CURRENT: Simple toggle
const [role, setRole] = useState<UserRole>("cdmu_staff");

// NEW: Read from AfCEN auth token
import { useAfCENAuth } from '@afcen/auth-sdk'; // or your auth package

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAfCENAuth();
  
  const role: UserRole = user?.role === 'admin' || user?.role === 'cdmu_staff' 
    ? 'cdmu_staff' 
    : 'external';

  const permissions = ROLE_PERMISSIONS[role];

  return (
    <RoleContext.Provider value={{ role, setRole: () => {}, permissions }}>
      {children}
    </RoleContext.Provider>
  );
}
```

### 5.6 Shared Design System

The dashboard uses Tailwind CSS with custom tokens. To match the AfCEN platform:

1. **Copy the color palette** from `tailwind.config.ts` into the main platform's Tailwind config
2. **Copy the glass utilities** from `app/globals.css` (`@layer utilities` block)
3. **Ensure Open Sans font** is loaded (or replace with AfCEN's brand font)
4. **Match the shadow tokens** (`shadow-apple`, `shadow-apple-lg`)

If the main platform uses a different CSS framework, extract the glass utilities as plain CSS and import them.

---

## 6. Component Reuse Guide

### 6.1 Standalone Components (No Dependencies)

These components can be copied directly into another project:

| Component | Props | Can Be Reused As-Is |
|-----------|-------|---------------------|
| `KPIScorecard` | `kpis: KPI[]` | Yes -- just pass KPI data |
| `MilestoneTimeline` | None (hardcoded) | Yes -- update milestone data |
| `AboutCompact` | None | Yes -- update static content |
| `Resources` | None | Yes -- update links/documents |
| `SplitPanel` | `left, right: ReactNode` | Yes -- generic layout component |

### 6.2 Components Requiring Context

These components use `filter-context` or `role-context`:

| Component | Dependencies | Integration Notes |
|-----------|-------------|-------------------|
| `MapView` | `filter-context`, settlements JSON, minigrids JSON | Wrap in `AppProvider`, provide data endpoints |
| `ProjectPipeline` | `role-context`, `scoring.ts` | Wrap in `RoleProvider`, import scoring module |
| `InvestmentChart` | `role-context` | Wrap in `RoleProvider` for edit permissions |
| `PillarTracker` | `types.ts` | Needs Pillar data type |
| `SaloneChat` | `onNavigateTab` callback | Wire to parent tab navigation |

### 6.3 Library Modules

| Module | Can Be Extracted | Notes |
|--------|-----------------|-------|
| `scoring.ts` | Yes | Self-contained; only imports `types.ts` |
| `pfs-calculations.ts` | Yes | Self-contained; only imports `types.ts`. Contains full financial model |
| `export.ts` | Yes | Depends on jsPDF + html2canvas |
| `filter-context.tsx` | Yes | Generic filter state manager; customize filter dimensions |
| `role-context.tsx` | Replace | Should be replaced with AfCEN auth |

---

## 7. TypeScript Interfaces

### 7.1 Core Types (from `lib/types.ts`)

```typescript
// Project -- the central data entity
interface Project {
  id: string;                    // Unique slug (e.g., "respite-solar")
  name: string;                  // Display name
  cost_usd_million: number;      // Total investment ($M)
  status: string;                // "feasibility" | "development" | "procurement" | "funded" | "in_progress"
  type: string;                  // "generation" | "transmission" | "infrastructure" | "off_grid"
  region: string;                // Geographic region
  notes?: string;                // CDMU staff notes
  capacity_mw?: number;          // Generation capacity
  technology?: string;           // Tech type key (maps to TECH_DEFAULTS)
  lead?: string;                 // Lead developer/sponsor
  target_date?: string;          // Target completion
  pillar?: number;               // Strategic pillar (1-5)
  description?: string;          // Project description
  location?: string;             // Specific location
  stage?: string;                // Pipeline stage label
  gps?: [number, number];        // [lat, lng] for map marker
  ppa_price?: number;            // PPA tariff ($/kWh)
  capacity_factor?: number;      // CF (0-1)
  project_life?: number;         // Years
  opex_pct?: number;             // Annual OPEX as % of CAPEX
  debt_ratio?: number;           // Debt fraction (0-1), null for grants
  interest_rate?: number;        // Annual interest rate (0-1)
  loan_tenure?: number;          // Loan term (years)
  population_served?: number;    // Target beneficiaries
  households?: number;           // Target households
  connections?: number;          // Target connections
}

// Settlement (map point)
interface Settlement {
  id: string;
  name: string;
  district: string;
  region: string;
  population: number;
  has_nightlight: boolean;
  has_education: boolean;
  has_health: boolean;
  dist_transmission: number;     // km to nearest transmission line
  pv_value: number;              // Solar PV potential (kWh/m2/day)
  demand: number;                // Estimated energy demand (kWh/yr)
  security_risk: string;         // "low" | "medium" | "high"
  num_buildings: number;
}

// KPI target
interface KPI {
  id: string;
  label: string;
  unit: string;                  // "%" | "USD"
  baseline: number;
  baseline_year: string;
  current: number;
  target: number;
  target_year: string;
  breakdown?: Record<string, { baseline: number; target: number }>;
}
```

---

## 8. Deployment Checklist

### 8.1 Pre-Deployment

- [ ] All `npm run build` passes with zero errors
- [ ] `npm run lint` passes
- [ ] `.npmrc` contains `legacy-peer-deps=true`
- [ ] Environment variables set on deployment platform
- [ ] Data files are up-to-date in `data/` and `public/data/`
- [ ] AfCEN logo present at `public/logos/afcen.png`

### 8.2 Vercel Deployment

```bash
# Deploy to production
npx vercel --prod --yes

# Or push to main branch (auto-deploys if connected)
git push origin main
```

### 8.3 Custom Domain Setup

1. In Vercel dashboard, go to Project Settings > Domains
2. Add custom domain (e.g., `sl-cdmu.afcen.com`)
3. Configure DNS: CNAME record pointing to `cname.vercel-dns.com`
4. SSL certificate is auto-provisioned

### 8.4 Environment Variables on Vercel

Set in Vercel Dashboard > Project Settings > Environment Variables:

| Variable | Value |
|----------|-------|
| `ADMIN_PASSWORD` | (secure password) |
| `NEXT_PUBLIC_AFCEN_API_URL` | (AfCEN API base URL, when integrated) |

---

## 9. Data Update Procedures

### 9.1 Updating Project Data (Current -- JSON-Based)

**Via Admin Panel:**
1. Navigate to `/admin`
2. Enter admin password
3. Select "projects" from the file dropdown
4. Edit JSON in the textarea
5. Click "Save" (writes to both `data/projects.json` and `public/data/projects.json`)

**Via Git (preferred for bulk updates):**
1. Edit `data/projects.json` directly
2. Copy to `public/data/projects.json`
3. Commit and push

### 9.2 Updating Settlement Data

Settlement data is large (~16K records). Update by:
1. Replace `public/data/settlements-points.json` (GeoJSON FeatureCollection)
2. Replace `public/data/settlements-detail.json` (detail records keyed by ID)
3. Deploy

### 9.3 Updating GIS Layers

1. Replace `public/data/geo/districts.geojson` (district boundaries)
2. Replace `public/data/geo/transmission-lines.geojson` (transmission corridors)
3. Deploy

---

## 10. Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| `npm install` fails on Vercel | Peer dependency conflicts with @tremor/react | Ensure `.npmrc` has `legacy-peer-deps=true` |
| Build fails with ESLint error | `<a>` tags used for internal navigation | Replace with `<Link>` from `next/link` |
| Map doesn't load | Leaflet CSS not loaded | Verify `leaflet/dist/leaflet.css` import in `app/layout.tsx` |
| NaN in DSCR/debt service | Grant-funded project has `debt_ratio: 0` | Use `isFinite()` check; display "N/A (grant-funded)" |
| Settlement panel empty | `settlements-detail.json` not in `public/data/` | Copy file or check API route `/api/settlement` |
| Admin save fails | Wrong password or file not in allowed list | Check `ADMIN_PASSWORD` env var; allowed files: kpis, pillars, investments, projects, metrics |
| Hydration mismatch warning | Browser extensions injecting DOM elements | `suppressHydrationWarning` is set on `<html>` tag in `layout.tsx` |

---

## 11. Contact & Support

| Role | Contact |
|------|---------|
| Platform Lead | AfCEN Engineering |
| Repository | https://github.com/Denohatma/sl-cdmu-dashboard |
| Deployment | Vercel (auto-deploy on push to `main`) |
| Live Dashboard | https://sl-cdmu-dashboard.vercel.app |
