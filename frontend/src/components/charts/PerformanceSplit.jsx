import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import Panel from "@/components/Panel";
import { formatCurrency, formatPercent } from "@/lib/api";

export default function PerformanceSplit({ split }) {
  if (!split) return null;
  const COLORS = { High: "#4A7A64", Low: "#C84B31" };

  return (
    <Panel
      title="High vs Low Performing"
      subtitle="Performance Mix"
      testId="chart-performance-split"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div style={{ width: "100%", height: 240 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={split.counts}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                stroke="#fff"
                strokeWidth={2}
              >
                {split.counts.map((entry) => (
                  <Cell key={entry.name} fill={COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                wrapperStyle={{ fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-3">
          {split.stats?.map((s) => (
            <div
              key={s.performance}
              className="border-b border-line-soft pb-3 last:border-b-0 last:pb-0"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: COLORS[s.performance] }}
                />
                <span className="editorial-subhead">{s.performance} performers</span>
              </div>
              <div className="grid grid-cols-2 gap-y-1 text-xs text-stone">
                <span>Avg ROAS</span>
                <span className="text-ink font-medium font-mono text-right">
                  {s.roas.toFixed(2)}
                </span>
                <span>Avg Spend</span>
                <span className="text-ink font-medium font-mono text-right">
                  {formatCurrency(s.spend)}
                </span>
                <span>Avg Revenue</span>
                <span className="text-ink font-medium font-mono text-right">
                  {formatCurrency(s.revenue)}
                </span>
                <span>Avg Conv. Rate</span>
                <span className="text-ink font-medium font-mono text-right">
                  {formatPercent(s.conversion_rate)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}
