import React from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import Panel from "@/components/Panel";
import { formatCurrency } from "@/lib/api";

export default function MonthlyTrendChart({ data }) {
  const fmtMonth = (m) => {
    if (!m) return m;
    const [y, mm] = m.split("-");
    const date = new Date(parseInt(y), parseInt(mm) - 1);
    return date.toLocaleString("en-US", { month: "short", year: "2-digit" });
  };

  return (
    <Panel
      title="Monthly Trend — Revenue & ROAS"
      subtitle="Time Series"
      testId="chart-monthly-trend"
    >
      <div style={{ width: "100%", height: 360 }}>
        <ResponsiveContainer>
          <ComposedChart data={data} margin={{ top: 16, right: 24, bottom: 8, left: 8 }}>
            <CartesianGrid vertical={false} stroke="#E5E5E0" strokeDasharray="2 4" />
            <XAxis
              dataKey="month"
              tickFormatter={fmtMonth}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              yAxisId="left"
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${(v / 1_000_000).toFixed(1)}M`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              labelFormatter={fmtMonth}
              formatter={(v, name) =>
                name === "Revenue" ? [formatCurrency(v), name] : [v.toFixed(2), name]
              }
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar
              yAxisId="left"
              dataKey="revenue"
              name="Revenue"
              fill="#DDA77B"
              fillOpacity={0.6}
              radius={[3, 3, 0, 0]}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="avg_roas"
              name="Avg ROAS"
              stroke="#111110"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "#D1603D", strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}
