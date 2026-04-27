import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import Panel from "@/components/Panel";
import { formatCurrency } from "@/lib/api";

export default function MonthlySpendRevenueChart({ data }) {
  const fmtMonth = (m) => {
    if (!m) return m;
    const [y, mm] = m.split("-");
    return new Date(parseInt(y), parseInt(mm) - 1).toLocaleString("en-US", {
      month: "short",
      year: "2-digit",
    });
  };

  return (
    <Panel
      title="Monthly Spend vs Revenue"
      subtitle="Cash flow"
      testId="chart-monthly-spend-revenue"
    >
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 16, right: 16, bottom: 8, left: 8 }}>
            <CartesianGrid vertical={false} stroke="#E5E5E0" strokeDasharray="2 4" />
            <XAxis dataKey="month" tickFormatter={fmtMonth} tickLine={false} axisLine={false} />
            <YAxis tickFormatter={(v) => `$${(v / 1_000_000).toFixed(1)}M`} tickLine={false} axisLine={false} />
            <Tooltip labelFormatter={fmtMonth} formatter={(v, n) => [formatCurrency(v), n]} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="spend" name="Spend" fill="#C84B31" radius={[3, 3, 0, 0]} fillOpacity={0.85} />
            <Bar dataKey="revenue" name="Revenue" fill="#4A7A64" radius={[3, 3, 0, 0]} fillOpacity={0.85} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}
