import React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

/**
 * Date range pill — uses shadcn calendar.
 */
export default function DateRangePill({ start, end, min, max, onChange, testId }) {
  const range = {
    from: start ? parseISO(start) : undefined,
    to: end ? parseISO(end) : undefined,
  };

  const handleSelect = (val) => {
    onChange({
      start: val?.from ? format(val.from, "yyyy-MM-dd") : null,
      end: val?.to ? format(val.to, "yyyy-MM-dd") : null,
    });
  };

  const summary =
    start && end
      ? `${format(parseISO(start), "MMM d, yy")} – ${format(parseISO(end), "MMM d, yy")}`
      : "All dates";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          data-testid={testId}
          className="h-9 rounded-full bg-white border-line hover:bg-cream/40 hover:border-ink transition-all px-4 font-sans text-xs"
        >
          <CalendarIcon className="mr-2 h-3.5 w-3.5 text-stone" />
          <span className="text-stone mr-1">Range:</span>
          <span className="text-ink font-medium">{summary}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2 bg-white border-line shadow-xl rounded-xl" align="start">
        <Calendar
          mode="range"
          selected={range}
          onSelect={handleSelect}
          numberOfMonths={2}
          fromDate={min ? parseISO(min) : undefined}
          toDate={max ? parseISO(max) : undefined}
          defaultMonth={start ? parseISO(start) : min ? parseISO(min) : undefined}
        />
      </PopoverContent>
    </Popover>
  );
}
