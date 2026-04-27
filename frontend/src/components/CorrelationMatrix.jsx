import React from "react";
import Panel from "@/components/Panel";

export default function CorrelationMatrix({ cols, values }) {
  const cellColor = (v) => {
    if (v === null || isNaN(v)) return "#f9f9f6";
    // -1 (cool, ink) → 0 (cream) → 1 (terracotta)
    const t = (v + 1) / 2; // 0..1
    let r, g, b;
    if (t < 0.5) {
      // ink (#111110) → cream (#f4e3da)
      const local = t * 2;
      r = Math.round(17 + (244 - 17) * local);
      g = Math.round(17 + (227 - 17) * local);
      b = Math.round(16 + (218 - 16) * local);
    } else {
      // cream → terracotta (#d1603d)
      const local = (t - 0.5) * 2;
      r = Math.round(244 + (209 - 244) * local);
      g = Math.round(227 + (96 - 227) * local);
      b = Math.round(218 + (61 - 218) * local);
    }
    return `rgb(${r},${g},${b})`;
  };

  const textColor = (v) =>
    v < -0.3 ? "#ffffff" : v > 0.55 ? "#ffffff" : "#111110";

  return (
    <Panel
      title="Correlation Matrix"
      subtitle="How metrics move together"
      testId="chart-correlation"
    >
      <div className="overflow-x-auto -mx-2 px-2">
        <table className="min-w-full font-mono text-xs">
          <thead>
            <tr>
              <th className="p-1.5"></th>
              {cols.map((c) => (
                <th
                  key={c}
                  className="p-1.5 text-stone font-medium text-[10px] uppercase tracking-wider"
                  style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cols.map((rowName, ri) => (
              <tr key={rowName}>
                <td className="p-1.5 text-stone font-medium text-[10px] uppercase tracking-wider text-right pr-3">
                  {rowName}
                </td>
                {cols.map((colName, ci) => {
                  const v = values[ri][ci];
                  return (
                    <td key={colName} className="p-1">
                      <div
                        className="rounded-md flex items-center justify-center font-medium"
                        style={{
                          backgroundColor: cellColor(v),
                          color: textColor(v),
                          width: 56,
                          height: 32,
                        }}
                        title={`${rowName} × ${colName}: ${v?.toFixed(2)}`}
                      >
                        {v?.toFixed(2)}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
