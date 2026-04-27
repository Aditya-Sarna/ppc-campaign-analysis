import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import FilterBar from "@/components/FilterBar";
import KPICard from "@/components/KPICard";
import SectionTitle from "@/components/SectionTitle";
import Panel from "@/components/Panel";
import Heatmap from "@/components/Heatmap";
import CampaignTable from "@/components/CampaignTable";
import CorrelationMatrix from "@/components/CorrelationMatrix";
import BudgetAllocation from "@/components/BudgetAllocation";
import ContentTypeBreakdown from "@/components/ContentTypeBreakdown";
import InsightsPanel from "@/components/InsightsPanel";

import PlatformROASChart from "@/components/charts/PlatformROASChart";
import ROASDistributionChart from "@/components/charts/ROASDistributionChart";
import PerformanceSplit from "@/components/charts/PerformanceSplit";
import HBarChart from "@/components/charts/HBarChart";
import CPCvsROASScatter from "@/components/charts/CPCvsROASScatter";
import MonthlyTrendChart from "@/components/charts/MonthlyTrendChart";
import MonthlySpendRevenueChart from "@/components/charts/MonthlySpendRevenueChart";
import QuarterlyPlatformChart from "@/components/charts/QuarterlyPlatformChart";

import {
  fetchMeta,
  fetchAnalytics,
  formatCurrency,
  formatNumber,
} from "@/lib/api";
import { Loader2, BarChart3 } from "lucide-react";

const TABS = [
  { value: "insights", label: "Insights" },
  { value: "roas", label: "ROAS Analysis" },
  { value: "geo", label: "Geographic & Audience" },
  { value: "cpc", label: "CPC & Spend" },
  { value: "trends", label: "Trends" },
  { value: "correlation", label: "Correlation" },
];

export default function Dashboard() {
  const [meta, setMeta] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [filters, setFilters] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Initial meta load
  useEffect(() => {
    fetchMeta().then((m) => {
      setMeta(m);
      setFilters({
        platforms: m.platforms,
        regions: m.regions,
        ages: m.ages,
        content_types: m.content_types,
        genders: m.genders,
        start_date: m.date_min,
        end_date: m.date_max,
      });
    });
  }, []);

  // Fetch analytics whenever filters change
  useEffect(() => {
    if (!filters) return;
    const isFirst = !analytics;
    if (isFirst) setLoading(true);
    else setRefreshing(true);
    fetchAnalytics(filters)
      .then((d) => setAnalytics(d))
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  if (loading || !meta || !analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="flex flex-col items-center gap-4 text-stone">
          <Loader2 className="h-6 w-6 animate-spin text-terracotta" />
          <span className="editorial-subhead">Loading campaign data</span>
        </div>
      </div>
    );
  }

  const k = analytics.kpis;

  return (
    <div className="min-h-screen bg-bg" data-testid="dashboard-root">
      <div className="px-6 md:px-12 lg:px-16 py-8 md:py-10 max-w-[1400px] mx-auto">
        {/* ─── Header ─── */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 md:mb-14"
        >
          <div className="flex items-center gap-2 mb-4 text-stone">
            <BarChart3 className="h-4 w-4 text-terracotta" />
            <span className="editorial-subhead">Volume 01 · 2024–2025</span>
          </div>
          <h1 className="font-serif font-light text-ink text-5xl sm:text-6xl lg:text-7xl tracking-tighter leading-[0.95] mb-5">
            The PPC <em className="italic text-terracotta font-light">Performance</em>
            <br />
            Review.
          </h1>
          <p className="max-w-2xl text-base text-stone leading-relaxed">
            A close reading of {meta.total_rows.toLocaleString()} pay-per-click campaigns across five
            platforms and five regions. Filter the dataset, study the distribution, and decide where the
            next dollar should land.
          </p>
        </motion.header>

        {/* ─── Filter Bar ─── */}
        <FilterBar
          meta={meta}
          filters={filters}
          setFilters={setFilters}
          count={analytics.count}
        />

        {refreshing && (
          <div className="flex items-center gap-2 mt-3 text-xs text-stone">
            <Loader2 className="h-3 w-3 animate-spin text-terracotta" />
            <span className="uppercase tracking-widest">Updating</span>
          </div>
        )}

        {analytics.empty ? (
          <div className="text-center py-32">
            <h2 className="font-serif text-3xl text-ink mb-3">No campaigns match your filters.</h2>
            <p className="text-stone">Try expanding the criteria above.</p>
          </div>
        ) : (
          <>
            {/* ─── KPI Row ─── */}
            <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
              <KPICard
                index={0}
                label="Campaigns"
                value={k.total_campaigns.toLocaleString()}
                sublabel={`Median ROAS ${k.median_roas.toFixed(2)}`}
                testId="kpi-campaigns"
              />
              <KPICard
                index={1}
                label="Avg ROAS"
                value={k.avg_roas.toFixed(2)}
                sublabel={`Avg CTR ${(k.avg_ctr * 100).toFixed(1)}%`}
                accent
                testId="kpi-avg-roas"
              />
              <KPICard
                index={2}
                label="Avg CPC"
                value={`$${k.avg_cpc.toFixed(2)}`}
                sublabel={`${formatNumber(k.total_clicks)} clicks`}
                testId="kpi-avg-cpc"
              />
              <KPICard
                index={3}
                label="Revenue"
                value={formatCurrency(k.total_revenue)}
                sublabel={`${formatNumber(k.total_conversions)} conversions`}
                accent
                testId="kpi-revenue"
              />
              <KPICard
                index={4}
                label="Spend"
                value={formatCurrency(k.total_spend)}
                sublabel={`${formatNumber(k.total_impressions)} impressions`}
                testId="kpi-spend"
              />
            </div>

            {/* ─── Tabs ─── */}
            <div className="mt-16 md:mt-20">
              <Tabs defaultValue="insights" className="w-full">
                <TabsList
                  className="bg-transparent border-b border-line rounded-none h-auto p-0 w-full flex-wrap justify-start gap-0 overflow-x-auto"
                  data-testid="dashboard-tabs"
                >
                  {TABS.map((t) => (
                    <TabsTrigger
                      key={t.value}
                      value={t.value}
                      data-testid={`tab-${t.value}`}
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-ink data-[state=active]:bg-transparent data-[state=active]:text-ink data-[state=active]:shadow-none px-5 py-3 text-xs font-sans font-semibold uppercase tracking-[0.18em] text-stone hover:text-ink transition-colors"
                    >
                      {t.label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {/* INSIGHTS TAB ─────────────────────────────────────── */}
                <TabsContent value="insights" className="mt-10">
                  <SectionTitle
                    kicker="Editorial · Action items"
                    title="What the numbers say."
                    description="A distilled view of where to invest, what to scale, and what to retire."
                  />
                  <InsightsPanel insights={analytics.insights} />

                  <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <BudgetAllocation data={analytics.budget_allocation} />
                    <Panel
                      title="Top 10 Campaigns to Scale"
                      subtitle="Strong ROAS, increase budget"
                      testId="top-campaigns"
                    >
                      <CampaignTable
                        campaigns={analytics.top_campaigns}
                        accent="high"
                        testId="table-top-campaigns"
                      />
                    </Panel>
                  </div>

                  <div className="mt-6">
                    <Panel
                      title="Bottom 10 Campaigns to Review"
                      subtitle="Weak ROAS, pause or refresh creative"
                      testId="bottom-campaigns"
                    >
                      <CampaignTable
                        campaigns={analytics.bottom_campaigns}
                        accent="low"
                        testId="table-bottom-campaigns"
                      />
                    </Panel>
                  </div>
                </TabsContent>

                {/* ROAS TAB ─────────────────────────────────────────── */}
                <TabsContent value="roas" className="mt-10">
                  <SectionTitle
                    kicker="Section I"
                    title="Return on ad spend."
                    description="Where ROAS concentrates — by platform, distribution, and the High/Low split that anchors the rest of the analysis."
                  />
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <PlatformROASChart data={analytics.roas_by_platform} />
                    <ROASDistributionChart
                      data={analytics.roas_distribution}
                      median={k.median_roas}
                    />
                  </div>
                  <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Panel
                      title="ROAS Heatmap — Platform × Content"
                      subtitle="Targeting matrix"
                      testId="heatmap-platform-content"
                    >
                      <Heatmap
                        rows={analytics.platform_content_heatmap.rows}
                        cols={analytics.platform_content_heatmap.cols}
                        values={analytics.platform_content_heatmap.values}
                        format={(v) => v?.toFixed(1)}
                        testId="hm-platform-content"
                      />
                    </Panel>
                    <PerformanceSplit split={analytics.performance_split} />
                  </div>
                  <div className="mt-6">
                    <ContentTypeBreakdown data={analytics.content_type_stats} />
                  </div>
                </TabsContent>

                {/* GEO TAB ──────────────────────────────────────────── */}
                <TabsContent value="geo" className="mt-10">
                  <SectionTitle
                    kicker="Section II"
                    title="Geography & audience."
                    description="Regional performance and age-group affinity. The pairings worth doubling down on become obvious."
                  />
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <HBarChart
                      data={analytics.roas_by_region.map((r) => ({ label: r.region, value: r.roas }))}
                      title="Average ROAS by Region"
                      subtitle="Regional returns"
                      color="#D1603D"
                      testId="chart-roas-region"
                    />
                    <HBarChart
                      data={analytics.revenue_by_region.map((r) => ({ label: r.region, value: r.revenue }))}
                      title="Total Revenue by Region"
                      subtitle="Where the money is"
                      color="#111110"
                      isCurrency
                      testId="chart-revenue-region"
                    />
                  </div>
                  <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <HBarChart
                      data={analytics.roas_by_age.map((r) => ({ label: r.age, value: r.roas }))}
                      title="Average ROAS by Age Group"
                      subtitle="Audience returns"
                      color="#7D8471"
                      testId="chart-roas-age"
                    />
                    <Panel
                      title="ROAS Heatmap — Region × Age"
                      subtitle="Audience-geo matrix"
                      testId="heatmap-region-age"
                    >
                      <Heatmap
                        rows={analytics.region_age_heatmap.rows}
                        cols={analytics.region_age_heatmap.cols}
                        values={analytics.region_age_heatmap.values}
                        format={(v) => v?.toFixed(1)}
                        testId="hm-region-age"
                      />
                    </Panel>
                  </div>
                  <div className="mt-6">
                    <Panel
                      title="ROAS Heatmap — Region × Platform"
                      subtitle="Channel-geo matrix"
                      testId="heatmap-region-platform"
                    >
                      <Heatmap
                        rows={analytics.region_platform_heatmap.rows}
                        cols={analytics.region_platform_heatmap.cols}
                        values={analytics.region_platform_heatmap.values}
                        format={(v) => v?.toFixed(1)}
                        testId="hm-region-platform"
                      />
                    </Panel>
                  </div>
                </TabsContent>

                {/* CPC TAB ──────────────────────────────────────────── */}
                <TabsContent value="cpc" className="mt-10">
                  <SectionTitle
                    kicker="Section III"
                    title="Cost & spend efficiency."
                    description="Cost-per-click profiles by channel, plus the relationship between spend and the revenue it produces."
                  />
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <HBarChart
                      data={analytics.cpc_by_platform.map((r) => ({ label: r.platform, value: r.cpc }))}
                      title="Average CPC by Platform"
                      subtitle="Click economics"
                      format={(v) => `$${v.toFixed(2)}`}
                      color="#DDA77B"
                      testId="chart-cpc-platform"
                    />
                    <CPCvsROASScatter
                      data={analytics.cpc_vs_roas}
                      title="CPC vs ROAS"
                      subtitle="Inverse pressure"
                      testId="chart-cpc-roas"
                    />
                  </div>
                  <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <CPCvsROASScatter
                      data={analytics.spend_vs_revenue}
                      title="Spend vs Revenue"
                      subtitle="Per platform"
                      byPlatform
                      xKey="spend"
                      yKey="revenue"
                      xLabel="Spend ($)"
                      yLabel="Revenue ($)"
                      testId="chart-spend-revenue"
                    />
                    <BudgetAllocation data={analytics.budget_allocation} />
                  </div>
                </TabsContent>

                {/* TRENDS TAB ───────────────────────────────────────── */}
                <TabsContent value="trends" className="mt-10">
                  <SectionTitle
                    kicker="Section IV"
                    title="Time series."
                    description="A month-by-month and quarter-by-quarter view of how ROAS and revenue have moved."
                  />
                  <div className="grid grid-cols-1 gap-6">
                    <MonthlyTrendChart data={analytics.monthly_trends} />
                  </div>
                  <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <HBarChart
                      data={analytics.monthly_trends.slice().reverse().map((m) => ({
                        label: m.month,
                        value: m.campaigns,
                      }))}
                      title="Monthly Campaign Count"
                      subtitle="Volume by month"
                      color="#7D8471"
                      format={(v) => v}
                      testId="chart-monthly-count"
                    />
                    <MonthlySpendRevenueChart data={analytics.monthly_trends} />
                  </div>
                  <div className="mt-6">
                    <QuarterlyPlatformChart
                      data={analytics.quarterly_platform}
                      platforms={analytics.quarterly_platform_keys}
                    />
                  </div>
                </TabsContent>

                {/* CORRELATION TAB ──────────────────────────────────── */}
                <TabsContent value="correlation" className="mt-10">
                  <SectionTitle
                    kicker="Section V"
                    title="Correlation matrix."
                    description="Linear relationships across the twelve numeric metrics. Read it as the underlying skeleton of the dataset — what moves with what."
                  />
                  <CorrelationMatrix
                    cols={analytics.correlation_matrix.cols}
                    values={analytics.correlation_matrix.values}
                  />
                </TabsContent>
              </Tabs>
            </div>

            {/* ─── Footer ─── */}
            <footer className="mt-24 pt-8 border-t border-line text-xs text-stone flex flex-wrap items-center justify-between gap-3">
              <span>
                PPC Campaign Analytics ·{" "}
                <span className="font-mono">{meta.total_rows.toLocaleString()} rows</span> ·{" "}
                <span className="font-mono">
                  {meta.date_min} → {meta.date_max}
                </span>
              </span>
              <span className="uppercase tracking-[0.18em]">Editorial Edition</span>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}
