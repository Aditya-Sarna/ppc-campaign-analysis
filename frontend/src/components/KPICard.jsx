import React from "react";
import { motion } from "framer-motion";

/**
 * Editorial KPI Card — oversized serif numeral, hairline borders, accent rule.
 */
export default function KPICard({ label, value, sublabel, accent = false, index = 0, testId }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      data-testid={testId}
      className="relative flex flex-col justify-between min-h-[140px] bg-white border border-line rounded-xl px-6 py-5 transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(17,17,16,0.05)]"
    >
      <span
        className={`absolute top-0 left-6 right-6 h-px ${
          accent ? "bg-terracotta" : "bg-ink"
        }`}
      />
      <div className="editorial-subhead">{label}</div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="font-serif font-light tracking-tighter text-ink text-5xl sm:text-6xl leading-none">
          {value}
        </span>
      </div>
      {sublabel && (
        <div className="mt-2 text-xs text-stone font-sans tracking-wide">{sublabel}</div>
      )}
    </motion.div>
  );
}
