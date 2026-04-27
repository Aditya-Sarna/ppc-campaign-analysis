# PPC Campaign Analytics — Product Requirements Document

## Original Problem Statement
> https://github.com/Aditya-Sarna/ppc-campaign-analysis make a world class modern looking ui ux for this all the info must be there

## User-confirmed choices (Apr 27, 2026)
- Data source: real `ppc_campaign_performance_data.xlsx` (1,000 rows, 19 columns, date range 2024-02-10 → 2025-02-09)
- Visual direction: Light editorial premium (Notion/Apple) — modern & stylistic
- ML predictions: skipped — pre-computed insights only
- Auth: none (open dashboard)

## Architecture
- **Backend** — FastAPI (`/app/backend/server.py`), loads xlsx once at startup, caps outliers (1st–99th pct), computes Performance label via median ROAS. Exposes:
  - `GET /api/meta` → filter options + dataset metadata
  - `GET /api/analytics` → all aggregations (KPIs, charts, heatmaps, top/bottom 10, correlation, insights), filterable by platforms / regions / ages / content_types / genders / date range
- **Frontend** — React + Tailwind + Recharts + Framer Motion, single Dashboard page (`/app/frontend/src/pages/Dashboard.jsx`)
- **MongoDB** — present but unused (read-only analytics on flat dataset)
- **Design tokens** — `/app/design_guidelines.json` (Cormorant Garamond + Manrope, terracotta accent #D1603D, hairline borders, cream background #F9F9F6)

## What's been implemented (Apr 27, 2026)
- Editorial dashboard with sticky filter bar (5 multiselect pills + date range + reset) and live count
- 5 KPI cards with oversized serif numerals and accent rule
- 6 tabs with editorial underline style:
  1. **Insights** — best-platform/region/age/content callouts, High vs Low profile, 4-step strategic recommendations, budget allocation, top/bottom 10 campaign tables
  2. **ROAS Analysis** — platform bar, distribution histogram, Platform×Content heatmap, performance split donut, content-type breakdown
  3. **Geographic & Audience** — region bars (ROAS + revenue), age bar, Region×Age heatmap, Region×Platform heatmap
  4. **CPC & Spend** — CPC by platform, CPC vs ROAS scatter, Spend vs Revenue scatter (color-coded by platform), budget allocation
  5. **Trends** — monthly ROAS+revenue combo, monthly campaign count, monthly spend vs revenue, quarterly platform lines
  6. **Correlation** — full 12×12 correlation matrix with editorial gradient
- Custom heatmap component with cream→terracotta gradient
- All interactive elements have `data-testid` attributes
- Framer Motion entrance animations on KPI cards and callouts

## User personas
- Performance marketers reviewing PPC efficacy
- Growth/marketing leads making budget allocation decisions
- Analysts presenting campaign reviews to stakeholders

## Core requirements (static)
- Preserve every analysis surface from the original Streamlit dashboard
- Deliver an editorial premium aesthetic (not generic SaaS)
- All filters propagate consistently to every chart/insight
- No live ML — only descriptive analytics

## Backlog
- **P1** — Lazy-mount charts in inactive tabs to silence Recharts width(-1) warnings
- **P1** — Optional CSV/Excel upload from UI
- **P2** — Export filtered view as PDF / CSV
- **P2** — Saved filter presets (cookie or localStorage)
- **P3** — Light/dark theme toggle
- **P3** — Drill-down: click a KPI / heatmap cell to filter dataset

## Test status
- Backend: 11/11 pytest tests pass (`/app/backend/tests/test_ppc_api.py`)
- Frontend: all 6 tabs render, filters work end-to-end, no page errors
- Test report: `/app/test_reports/iteration_1.json`
