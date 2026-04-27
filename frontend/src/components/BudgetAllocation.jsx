import React from "react";
import Panel from "@/components/Panel";
import { formatCurrency, PLATFORM_COLORS } from "@/lib/api";

export default function BudgetAllocation({ data }) {
  const max = Math.max(...data.map((d) => d.percent), 1);
  return (
    <Panel
      title="Budget Allocation Recommendation"
      subtitle="ROAS-Weighted"
      testId="budget-allocation"
    >
      <p className="text-sm text-stone mb-5 leading-relaxed">
        Suggested allocation weighted by each platform's average ROAS. Platforms with stronger returns earn larger shares of next quarter's budget.
      </p>
      <div className="space-y-4">
        {data.map((row) => (
          <div key={row.platform} data-testid={`alloc-${row.platform}`}>
            <div className="flex items-baseline justify-between mb-1.5">
              <div className="flex items-center gap-2.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: PLATFORM_COLORS[row.platform] || "#111110" }}
                />
                <span className="text-sm font-medium text-ink">{row.platform}</span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-xs text-stone font-mono">
                  Current {formatCurrency(row.current_spend)}
                </span>
                <span className="font-serif text-2xl text-ink leading-none">
                  {row.percent.toFixed(1)}<span className="text-stone text-sm">%</span>
                </span>
              </div>
            </div>
            <div className="h-1.5 bg-line-soft rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${(row.percent / max) * 100}%`,
                  backgroundColor: PLATFORM_COLORS[row.platform] || "#111110",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
