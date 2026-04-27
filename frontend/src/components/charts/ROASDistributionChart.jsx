import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import Panel from "@/components/Panel";

export default function ROASDistributionChart({ data, median }) {
  return (
    <Panel
      title="ROAS Distribution"
      subtitle="How returns spread across campaigns"
      testId="chart-roas-distribution"
    >
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 16, right: 16, bottom: 8, left: 0 }}>
            <CartesianGrid vertical={false} stroke="#E5E5E0" strokeDasharray="2 4" />
            <XAxis
              dataKey="bin"
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => v.toFixed(1)}
              interval={2}
            />
            <YAxis tickLine={false} axisLine={false} width={40} />
            <Tooltip
              cursor={{ fill: "#f4e3da40" }}
              formatter={(v) => [v, "Campaigns"]}
              labelFormatter={(v) => `ROAS ≈ ${Number(v).toFixed(2)}`}
            />
            {median !== undefined && (
              <ReferenceLine
                x={data.reduce((p, d) => (Math.abs(d.bin - median) < Math.abs(p.bin - median) ? d : p), data[0])?.bin}
                stroke="#D1603D"
                strokeDasharray="4 4"
                label={{ value: `Median ${median?.toFixed(2)}`, position: "top", fill: "#D1603D", fontSize: 11 }}
              />
            )}
            <Bar dataKey="count" fill="#111110" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}
