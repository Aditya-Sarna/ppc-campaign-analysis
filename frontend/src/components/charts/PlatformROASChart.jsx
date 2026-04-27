import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
  LabelList,
} from "recharts";
import Panel from "@/components/Panel";
import { PLATFORM_COLORS } from "@/lib/api";

export default function PlatformROASChart({ data }) {
  return (
    <Panel
      title="Average ROAS by Platform"
      subtitle="Channel Performance"
      testId="chart-platform-roas"
    >
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 24, right: 16, bottom: 8, left: 0 }}>
            <CartesianGrid vertical={false} stroke="#E5E5E0" strokeDasharray="2 4" />
            <XAxis dataKey="platform" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} width={40} />
            <Tooltip cursor={{ fill: "#f4e3da40" }} />
            <Bar dataKey="roas" radius={[6, 6, 0, 0]}>
              <LabelList
                dataKey="roas"
                position="top"
                style={{ fill: "#111110", fontSize: 12, fontWeight: 600 }}
                formatter={(v) => v.toFixed(2)}
              />
              {data.map((d, i) => (
                <Cell key={i} fill={PLATFORM_COLORS[d.platform] || "#111110"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}
