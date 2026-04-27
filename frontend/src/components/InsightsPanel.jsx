import React from "react";
import { motion } from "framer-motion";
import Panel from "@/components/Panel";
import { formatCurrency, formatPercent } from "@/lib/api";
import { TrendingUp, TrendingDown, Award, Target, Sparkles, MapPin } from "lucide-react";

const CalloutCard = ({ icon: Icon, label, name, value, sub, accent = false, testId }) => (
  <motion.div
    whileHover={{ y: -2 }}
    data-testid={testId}
    className={`relative bg-white border border-line rounded-xl p-5 transition-all hover:shadow-[0_8px_30px_rgba(17,17,16,0.04)]`}
  >
    <span
      className={`absolute top-0 left-5 right-5 h-px ${accent ? "bg-terracotta" : "bg-ink"}`}
    />
    <div className="flex items-start justify-between mb-3">
      <span className="editorial-subhead">{label}</span>
      <Icon className="h-4 w-4 text-stone" />
    </div>
    <div className="font-serif font-light text-3xl text-ink leading-tight tracking-tight">
      {name}
    </div>
    <div className="mt-2 flex items-baseline gap-2">
      <span className="font-mono text-base font-medium text-ink">{value}</span>
      <span className="text-xs text-stone uppercase tracking-wider">{sub}</span>
    </div>
  </motion.div>
);

export default function InsightsPanel({ insights }) {
  if (!insights) return null;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CalloutCard
          icon={Award}
          label="Best Platform"
          name={insights.best_platform?.name || "—"}
          value={insights.best_platform?.roas?.toFixed(2) || "—"}
          sub="ROAS"
          accent
          testId="insight-best-platform"
        />
        <CalloutCard
          icon={MapPin}
          label="Best Region"
          name={insights.best_region?.name || "—"}
          value={insights.best_region?.roas?.toFixed(2) || "—"}
          sub="ROAS"
          testId="insight-best-region"
        />
        <CalloutCard
          icon={Target}
          label="Best Age Group"
          name={insights.best_age?.name || "—"}
          value={insights.best_age?.roas?.toFixed(2) || "—"}
          sub="ROAS"
          testId="insight-best-age"
        />
        <CalloutCard
          icon={Sparkles}
          label="Best Content"
          name={insights.best_content?.name || "—"}
          value={insights.best_content?.roas?.toFixed(2) || "—"}
          sub="ROAS"
          accent
          testId="insight-best-content"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Panel title="High Performers — Profile" subtitle="What winners look like" testId="insight-high-profile">
          <div className="space-y-3">
            <Row label="Avg Spend" value={formatCurrency(insights.high_avg_spend)} />
            <Row label="Avg Conversion Rate" value={formatPercent(insights.high_conv_rate)} accent />
            <Row label="Top 10% Current Spend" value={formatCurrency(insights.scale_spend_top_10pct)} />
          </div>
          <p className="mt-4 pt-4 border-t border-line-soft text-sm text-stone leading-relaxed">
            <span className="text-high font-medium">↑ Scale</span> winning campaigns. Increase spend by 20–40% on top performers and duplicate their creative+audience pairings into untapped regions.
          </p>
        </Panel>

        <Panel title="Low Performers — Profile" subtitle="Where budget leaks" testId="insight-low-profile">
          <div className="space-y-3">
            <Row label="Avg Spend" value={formatCurrency(insights.low_avg_spend)} />
            <Row label="Avg Conversion Rate" value={formatPercent(insights.low_conv_rate)} />
            <Row label="Bottom 10% Wasted Spend" value={formatCurrency(insights.wasted_spend_bottom_10pct)} accent />
          </div>
          <p className="mt-4 pt-4 border-t border-line-soft text-sm text-stone leading-relaxed">
            <span className="text-low font-medium">↓ Pause or refresh</span> the bottom decile. High CPC paired with low conversion rate is the budget-drain signature.
          </p>
        </Panel>
      </div>

      <Panel title="Strategic Recommendations" subtitle="Action plan" testId="insight-actions">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5">
          {[
            ["Audience targeting", `Concentrate creative testing on the ${insights.best_age?.name} age cohort and ${insights.best_content?.name?.toLowerCase()} formats — both lead the dataset on ROAS.`],
            ["Channel mix", `Shift budget toward ${insights.best_platform?.name}; review ${insights.worst_platform?.name} (worst ROAS at ${insights.worst_platform?.roas?.toFixed(2)}) with creative refreshes or A/B tests.`],
            ["Geographic priorities", `${insights.best_region?.name} delivers the strongest returns. Allocate 30–35% of regional budget here for the next cycle.`],
            ["Continuous optimisation", "Use the High vs Low classifier to flag new campaigns automatically: anything below median ROAS triggers a review workflow before scale-up."],
          ].map(([title, body], i) => (
            <div key={title} className="flex gap-4">
              <span className="font-serif text-3xl text-terracotta leading-none flex-shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <div className="editorial-subhead mb-1.5">{title}</div>
                <p className="text-sm text-ink-soft leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

const Row = ({ label, value, accent }) => (
  <div className="flex items-baseline justify-between gap-4 border-b border-line-soft pb-2 last:border-b-0 last:pb-0">
    <span className="text-sm text-stone">{label}</span>
    <span
      className={`font-mono text-base font-medium ${accent ? "text-terracotta" : "text-ink"}`}
    >
      {value}
    </span>
  </div>
);
