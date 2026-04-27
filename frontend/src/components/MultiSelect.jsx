import React from "react";
import { Check, ChevronDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

/**
 * Editorial multiselect — pill button, sleek dropdown with checkboxes.
 */
export default function MultiSelect({ label, options, value, onChange, testId }) {
  const allSelected = value.length === options.length;
  const toggle = (opt) => {
    if (value.includes(opt)) {
      onChange(value.filter((v) => v !== opt));
    } else {
      onChange([...value, opt]);
    }
  };
  const toggleAll = () => onChange(allSelected ? [] : [...options]);

  const summary =
    value.length === 0
      ? "None"
      : allSelected
        ? "All"
        : value.length <= 2
          ? value.join(", ")
          : `${value.length} selected`;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          data-testid={testId}
          className="h-9 rounded-full bg-white border-line hover:bg-cream/40 hover:border-ink transition-all px-4 font-sans text-xs uppercase tracking-[0.15em] text-ink-soft"
        >
          <span className="text-stone normal-case tracking-normal mr-2">{label}:</span>
          <span className="text-ink font-medium normal-case tracking-normal">{summary}</span>
          <ChevronDown className="ml-2 h-3.5 w-3.5 text-stone" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-60 p-2 bg-white border-line shadow-xl rounded-xl"
      >
        <button
          type="button"
          onClick={toggleAll}
          className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium text-ink hover:bg-cream/50"
          data-testid={`${testId}-toggle-all`}
        >
          <span>{allSelected ? "Clear all" : "Select all"}</span>
          <span className="text-xs text-stone uppercase tracking-widest">
            {value.length}/{options.length}
          </span>
        </button>
        <div className="my-1 h-px bg-line" />
        <div className="max-h-64 overflow-y-auto">
          {options.map((opt) => {
            const checked = value.includes(opt);
            return (
              <button
                type="button"
                key={opt}
                onClick={() => toggle(opt)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-cream/50 text-ink-soft"
                data-testid={`${testId}-option-${opt.replace(/\s+/g, "-")}`}
              >
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded border ${
                    checked
                      ? "bg-ink border-ink"
                      : "border-line bg-white"
                  }`}
                >
                  {checked && <Check className="h-3 w-3 text-white" />}
                </span>
                <span className="flex-1 text-left">{opt}</span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
