import React from "react";

/**
 * Panel — flat editorial container with hairline borders.
 */
export default function Panel({ children, title, subtitle, className = "", testId }) {
  return (
    <div
      data-testid={testId}
      className={`bg-white border border-line rounded-xl p-6 sm:p-7 ${className}`}
    >
      {(title || subtitle) && (
        <div className="mb-5 pb-4 border-b border-line-soft">
          {subtitle && <div className="editorial-subhead mb-1.5">{subtitle}</div>}
          {title && (
            <h3 className="font-serif font-medium text-ink text-xl sm:text-2xl tracking-tight">
              {title}
            </h3>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
