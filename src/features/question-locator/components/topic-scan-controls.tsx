import { getReviewFilterLabel } from "@/features/review";
import { cn } from "@/lib/utils";
import type {
  QuestionLocatorCounts,
  QuestionLocatorFilter,
} from "../types";

type TopicScanControlsProps = {
  activeFilter: QuestionLocatorFilter | null;
  counts: QuestionLocatorCounts;
  onToggleFilter: (filter: QuestionLocatorFilter) => void;
  onClear: () => void;
  onOpenReview: () => void;
};

const filterOrder: QuestionLocatorFilter[] = [
  "weak",
  "unanswered",
  "pending",
  "bookmarked",
];

export function TopicScanControls({
  activeFilter,
  counts,
  onToggleFilter,
  onClear,
  onOpenReview,
}: TopicScanControlsProps) {
  return (
    <section className="relative z-10 px-8 pb-6">
      <p className="text-[9px] font-mono uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">
        Scan
      </p>

      <div className="mt-4 space-y-2">
        {filterOrder.map((filter) => {
          const active = filter === activeFilter;

          return (
            <button
              key={filter}
              type="button"
              onClick={() => onToggleFilter(filter)}
              className={cn(
                "flex w-full items-baseline justify-between border-b border-transparent pb-1 text-left transition-colors",
                active
                  ? "border-cyan-500/45 text-slate-900 dark:border-cyan-400/45 dark:text-slate-50"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100",
              )}
            >
              <span className="text-[10px] uppercase tracking-[0.24em]">
                {getReviewFilterLabel(filter)}
              </span>
              <span className="text-sm font-light">
                {counts[filter]}
              </span>
            </button>
          );
        })}
      </div>

      {activeFilter ? (
        <div className="mt-4 flex items-center gap-4 pt-1 text-[10px] uppercase tracking-[0.24em]">
          <button
            type="button"
            onClick={onOpenReview}
            className="border-b border-cyan-500/45 pb-1 text-cyan-700 transition-colors hover:text-cyan-900 dark:border-cyan-400/45 dark:text-cyan-400 dark:hover:text-cyan-300"
          >
            Open review
          </button>

          <button
            type="button"
            onClick={onClear}
            className="text-slate-400 transition-colors hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300"
          >
            Clear
          </button>
        </div>
      ) : null}
    </section>
  );
}
