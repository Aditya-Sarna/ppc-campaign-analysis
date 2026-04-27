import React from "react";
import { formatCurrency, formatNumber } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

export default function CampaignTable({ campaigns, accent = "high", testId }) {
  const accentClass =
    accent === "high"
      ? "text-high border-high/30 bg-high/5"
      : "text-low border-low/30 bg-low/5";

  return (
    <div className="overflow-x-auto -mx-2" data-testid={testId}>
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b-2 border-ink">
            <th className="text-xs uppercase tracking-[0.15em] text-stone py-3 px-2 text-left font-sans">
              Campaign
            </th>
            <th className="text-xs uppercase tracking-[0.15em] text-stone py-3 px-2 text-left font-sans">
              Platform
            </th>
            <th className="text-xs uppercase tracking-[0.15em] text-stone py-3 px-2 text-left font-sans">
              Region
            </th>
            <th className="text-xs uppercase tracking-[0.15em] text-stone py-3 px-2 text-left font-sans">
              Age
            </th>
            <th className="text-xs uppercase tracking-[0.15em] text-stone py-3 px-2 text-right font-sans">
              ROAS
            </th>
            <th className="text-xs uppercase tracking-[0.15em] text-stone py-3 px-2 text-right font-sans">
              Spend
            </th>
            <th className="text-xs uppercase tracking-[0.15em] text-stone py-3 px-2 text-right font-sans">
              Revenue
            </th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((c) => (
            <tr
              key={c.campaign_id}
              className="border-b border-line-soft hover:bg-cream/30 transition-colors"
            >
              <td className="py-3 px-2 font-mono text-ink-soft">{c.campaign_id}</td>
              <td className="py-3 px-2 text-ink">{c.platform}</td>
              <td className="py-3 px-2 text-stone">{c.region}</td>
              <td className="py-3 px-2 text-stone">{c.target_age}</td>
              <td className="py-3 px-2 text-right">
                <span className={`inline-flex font-mono text-sm font-medium px-2.5 py-0.5 rounded-md border ${accentClass}`}>
                  {c.roas.toFixed(2)}
                </span>
              </td>
              <td className="py-3 px-2 text-right font-mono text-ink-soft">
                {formatCurrency(c.spend)}
              </td>
              <td className="py-3 px-2 text-right font-mono text-ink font-medium">
                {formatCurrency(c.revenue)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
