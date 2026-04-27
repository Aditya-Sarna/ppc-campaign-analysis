import React from "react";
import MultiSelect from "@/components/MultiSelect";
import DateRangePill from "@/components/DateRangePill";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

export default function FilterBar({ meta, filters, setFilters, count }) {
  if (!meta) return null;

  const update = (key) => (val) => setFilters((f) => ({ ...f, [key]: val }));

  const reset = () =>
    setFilters({
      platforms: meta.platforms,
      regions: meta.regions,
      ages: meta.ages,
      content_types: meta.content_types,
      genders: meta.genders,
      start_date: meta.date_min,
      end_date: meta.date_max,
    });

  return (
    <div
      className="sticky top-0 z-40 -mx-6 md:-mx-12 lg:-mx-16 px-6 md:px-12 lg:px-16 py-4 bg-bg/85 backdrop-blur-xl border-b border-line"
      data-testid="filter-bar"
    >
      <div className="flex flex-wrap items-center gap-2.5">
        <MultiSelect
          label="Platform"
          options={meta.platforms}
          value={filters.platforms}
          onChange={update("platforms")}
          testId="filter-platforms"
        />
        <MultiSelect
          label="Region"
          options={meta.regions}
          value={filters.regions}
          onChange={update("regions")}
          testId="filter-regions"
        />
        <MultiSelect
          label="Age"
          options={meta.ages}
          value={filters.ages}
          onChange={update("ages")}
          testId="filter-ages"
        />
        <MultiSelect
          label="Content"
          options={meta.content_types}
          value={filters.content_types}
          onChange={update("content_types")}
          testId="filter-content-types"
        />
        <MultiSelect
          label="Gender"
          options={meta.genders}
          value={filters.genders}
          onChange={update("genders")}
          testId="filter-genders"
        />
        <DateRangePill
          start={filters.start_date}
          end={filters.end_date}
          min={meta.date_min}
          max={meta.date_max}
          onChange={({ start, end }) =>
            setFilters((f) => ({ ...f, start_date: start, end_date: end }))
          }
          testId="filter-date-range"
        />

        <div className="flex-1" />

        <div className="flex items-center gap-3 text-xs">
          <span className="text-stone uppercase tracking-[0.15em]">Showing</span>
          <span className="font-serif text-2xl text-ink leading-none" data-testid="filter-count">
            {count?.toLocaleString() ?? "—"}
          </span>
          <span className="text-stone">campaigns</span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={reset}
          data-testid="filter-reset"
          className="text-xs uppercase tracking-[0.15em] text-stone hover:text-ink hover:bg-transparent"
        >
          <RotateCcw className="mr-1.5 h-3 w-3" />
          Reset
        </Button>
      </div>
    </div>
  );
}
