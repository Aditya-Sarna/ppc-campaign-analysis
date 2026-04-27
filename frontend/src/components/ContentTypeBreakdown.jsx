import React from "react";
import Panel from "@/components/Panel";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { formatCurrency, CHART_COLORS } from "@/lib/api";

export default function ContentTypeBreakdown({ data }) {
  return (
    <Panel
      title="Revenue Share by Content Type"
      subtitle="Creative formats"
      testId="chart-content-type"
    >
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
        <div style={{ width: "100%", height: 240 }} className="md:col-span-3">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={95}
                paddingAngle={2}
                dataKey="revenue"
                nameKey="content_type"
                stroke="#fff"
                strokeWidth={2}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="md:col-span-2 space-y-2">
          {data.map((row, i) => (
            <div
              key={row.content_type}
              className="flex items-center justify-between border-b border-line-soft pb-2 last:border-b-0"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                />
                <span className="text-sm text-ink">{row.content_type}</span>
              </div>
              <div className="text-right">
                <div className="font-mono text-sm text-ink">{row.roas.toFixed(2)}</div>
                <div className="text-[10px] text-stone uppercase tracking-wider">ROAS</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}
