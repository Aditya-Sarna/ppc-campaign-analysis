import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LabelList,
  Cell,
} from "recharts";
import Panel from "@/components/Panel";
import { formatCurrency } from "@/lib/api";

export default function HBarChart({
  data,
  xKey = "value",
  yKey = "label",
  title,
  subtitle,
  format = (v) => v?.toFixed?.(2),
  color = "#111110",
  testId,
  isCurrency = false,
}) {
  return (
    <Panel title={title} subtitle={subtitle} testId={testId}>
      <div style={{ width: "100%", height: Math.max(220, data.length * 48) }}>
        <ResponsiveContainer>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 8, right: 56, bottom: 8, left: 8 }}
          >
            <CartesianGrid horizontal={false} stroke="#E5E5E0" strokeDasharray="2 4" />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tickFormatter={isCurrency ? (v) => formatCurrency(v) : undefined}
            />
            <YAxis
              type="category"
              dataKey={yKey}
              tickLine={false}
              axisLine={false}
              width={120}
            />
            <Tooltip
              cursor={{ fill: "#f4e3da40" }}
              formatter={(v) => [isCurrency ? formatCurrency(v) : format(v), title]}
            />
            <Bar dataKey={xKey} radius={[0, 6, 6, 0]}>
              <LabelList
                dataKey={xKey}
                position="right"
                style={{ fill: "#111110", fontSize: 12, fontWeight: 600 }}
                formatter={isCurrency ? (v) => formatCurrency(v) : format}
              />
              {data.map((_, i) => (
                <Cell key={i} fill={color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}
