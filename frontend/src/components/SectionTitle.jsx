import React from "react";

/**
 * Section block with editorial title + supporting line.
 */
export default function SectionTitle({ kicker, title, description, action }) {
  return (
    <div className="flex items-end justify-between gap-6 mb-8">
      <div className="max-w-3xl">
        {kicker && <div className="editorial-subhead mb-3">{kicker}</div>}
        <h2 className="font-serif font-light tracking-tight text-ink text-3xl sm:text-4xl lg:text-[2.6rem] leading-[1.05]">
          {title}
        </h2>
        {description && (
          <p className="mt-3 text-sm text-stone leading-relaxed max-w-xl">{description}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
