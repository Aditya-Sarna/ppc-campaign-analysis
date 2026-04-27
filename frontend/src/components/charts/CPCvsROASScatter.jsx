import React from "react";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ZAxis,
  Legend,
} from "recharts";
import Panel from "@/components/Panel";
import { PLATFORM_COLORS } from "@/lib/api";

export default function CPCvsROASScatter({ data, title, subtitle, byPlatform = false, xKey = "cpc", yKey = "roas", xLabel = "CPC ($)", yLabel = "ROAS", testId }) {
  // Group by platform for legend if needed
  const grouped = byPlatform
    ? Object.entries(
        data.reduce((acc, d) => {
          (acc[d.platform] ||= []).push(d);
          return acc;
        }, {})
      )
    : [["All", data]];

  return (
    <Panel title={title} subtitle={subtitle} testId={testId}>
      <div style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer>
          <ScatterChart margin={{ top: 16, right: 16, bottom: 24, left: 8 }}>
            <CartesianGrid stroke="#E5E5E0" strokeDasharray="2 4" />
            <XAxis
              type="number"
              dataKey={xKey}
              name={xLabel}
              tickLine={false}
              axisLine={false}
              label={{ value: xLabel, position: "insideBottom", offset: -8, fill: "#6b6a68", fontSize: 11 }}
            />
            <YAxis
              type="number"
              dataKey={yKey}
              name={yLabel}
              tickLine={false}
              axisLine={false}
              label={{ value: yLabel, angle: -90, position: "insideLeft", fill: "#6b6a68", fontSize: 11 }}
            />
            <ZAxis range={[40, 80]} />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} />
            {byPlatform && <Legend wrapperStyle={{ fontSize: 11 }} />}
            {grouped.map(([name, points], i) => (
              <Scatter
                key={name}
                name={name}
                data={points}
                fill={PLATFORM_COLORS[name] || ["#111110", "#D1603D", "#7D8471", "#A5ACB5", "#DDA77B"][i % 5]}
                fillOpacity={0.55}
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}
