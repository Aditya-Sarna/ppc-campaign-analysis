import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import Panel from "@/components/Panel";
import { PLATFORM_COLORS } from "@/lib/api";

export default function QuarterlyPlatformChart({ data, platforms }) {
  return (
    <Panel
      title="Quarterly Platform Performance"
      subtitle="ROAS by quarter, per channel"
      testId="chart-quarterly-platform"
    >
      <div style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 16, right: 24, bottom: 8, left: 8 }}>
            <CartesianGrid vertical={false} stroke="#E5E5E0" strokeDasharray="2 4" />
            <XAxis dataKey="quarter" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {platforms?.map((p) => (
              <Line
                key={p}
                type="monotone"
                dataKey={p}
                stroke={PLATFORM_COLORS[p] || "#111110"}
                strokeWidth={2.5}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}
