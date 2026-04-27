import React from "react";

/**
 * Editorial heatmap built with CSS grid.
 * Cells fade from cream → terracotta based on relative value.
 */
export default function Heatmap({ rows, cols, values, format = (v) => v?.toFixed(1), testId }) {
  if (!rows?.length || !cols?.length) {
    return <div className="text-stone text-sm py-8 text-center">No data</div>;
  }

  // Find min/max across non-null values for color scaling
  const flat = values.flat().filter((v) => v !== null && !isNaN(v));
  const min = Math.min(...flat);
  const max = Math.max(...flat);
  const range = max - min || 1;

  const cellColor = (v) => {
    if (v === null || isNaN(v)) return "#f9f9f6";
    const t = (v - min) / range;
    // Linear interpolation cream (#f4e3da) → terracotta (#d1603d) → deep ink (#7a3823)
    const stops = [
      [244, 227, 218], // cream
      [221, 167, 123], // peach
      [209, 96, 61], // terracotta
    ];
    const seg = t < 0.5 ? 0 : 1;
    const local = t < 0.5 ? t * 2 : (t - 0.5) * 2;
    const a = stops[seg];
    const b = stops[seg + 1];
    const r = Math.round(a[0] + (b[0] - a[0]) * local);
    const g = Math.round(a[1] + (b[1] - a[1]) * local);
    const bl = Math.round(a[2] + (b[2] - a[2]) * local);
    return `rgb(${r}, ${g}, ${bl})`;
  };

  const textColor = (v) => {
    if (v === null || isNaN(v)) return "#a5a39f";
    const t = (v - min) / range;
    return t > 0.55 ? "#ffffff" : "#111110";
  };

  return (
    <div className="w-full overflow-x-auto" data-testid={testId}>
      <div
        className="inline-grid gap-1.5"
        style={{
          gridTemplateColumns: `minmax(120px, max-content) repeat(${cols.length}, minmax(80px, 1fr))`,
        }}
      >
        {/* Header row */}
        <div />
        {cols.map((c) => (
          <div
            key={c}
            className="editorial-subhead text-center pb-2 border-b border-line"
            style={{ fontSize: "0.65rem" }}
          >
            {c}
          </div>
        ))}

        {/* Data rows */}
        {rows.map((rowName, ri) => (
          <React.Fragment key={rowName}>
            <div className="text-sm font-medium text-ink-soft pr-3 py-2 self-center">
              {rowName}
            </div>
            {cols.map((colName, ci) => {
              const v = values[ri][ci];
              return (
                <div
                  key={`${rowName}-${colName}`}
                  className="heat-cell rounded-md flex items-center justify-center font-mono text-sm font-medium aspect-[5/3] min-h-[44px]"
                  style={{
                    backgroundColor: cellColor(v),
                    color: textColor(v),
                  }}
                  title={`${rowName} × ${colName}: ${format(v)}`}
                >
                  {v === null || isNaN(v) ? "—" : format(v)}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
