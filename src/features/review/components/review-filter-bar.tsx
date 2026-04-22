import { cn } from "@/lib/utils";
import { getReviewFilterLabel } from "../utils";
import type { ReviewQueueCounts, ReviewQueueFilter } from "../types";

type ReviewFilterBarProps = {
  activeFilter: ReviewQueueFilter;
  counts: ReviewQueueCounts;
  onFilterChange: (filter: ReviewQueueFilter) => void;
};

const filterOrder: ReviewQueueFilter[] = [
  "all",
  "weak",
  "unanswered",
  "pending",
  "skipped",
  "bookmarked",
];

export function ReviewFilterBar({
  activeFilter,
  counts,
  onFilterChange,
}: ReviewFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-slate-200/75 pb-4 dark:border-white/8">
      {filterOrder.map((filter) => {
        const active = filter === activeFilter;

        return (
          <button
            key={filter}
            type="button"
            onClick={() => onFilterChange(filter)}
            className={cn(
              "inline-flex items-baseline gap-2 border-b border-transparent pb-1 text-left transition-colors",
              active
                ? "border-cyan-500/55 text-slate-900 dark:border-cyan-400/55 dark:text-slate-50"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100",
            )}
          >
            <span className="text-[11px] uppercase tracking-[0.24em]">
              {getReviewFilterLabel(filter)}
            </span>
            <span className="text-sm font-light">
              {counts[filter]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
