import { cn } from "@/lib/utils";
import { formatReviewRelativeTime, getReviewStatusLabel } from "../presentation";
import type { ReviewQueueItem } from "../types";

type ReviewQueueListProps = {
  items: ReviewQueueItem[];
  activeItemId: string | null;
  onSelect: (itemId: string) => void;
};

function buildMetaLine(item: ReviewQueueItem) {
  const markers = [
    item.isPending ? "Pending" : null,
    item.isBookmarked ? "Favorite" : null,
    item.isSelfMarkedWeak ? "Manual flag" : null,
    item.source === "inserted" ? "Branch" : null,
  ].filter((value): value is string => Boolean(value));

  return markers.length > 0 ? markers.join(" / ") : item.angleTitle;
}

function getQueueSummary(item: ReviewQueueItem) {
  if (item.summary?.trim()) {
    return item.summary;
  }

  if (item.latestFeedback?.nextSuggestion?.trim()) {
    return item.latestFeedback.nextSuggestion;
  }

  return "No submitted answer yet.";
}

export function ReviewQueueList({
  items,
  activeItemId,
  onSelect,
}: ReviewQueueListProps) {
  if (items.length <= 0) {
    return (
      <div className="border-b border-slate-200/75 py-8 dark:border-white/8">
        <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">
          Queue
        </p>
        <p className="mt-3 max-w-sm text-sm leading-7 text-slate-500 dark:text-slate-400">
          Nothing is waiting in this view right now. Keep learning in Topic, then
          come back here to reopen the questions that still need attention.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {items.map((item) => {
        const active = item.id === activeItemId;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={cn(
              "border-b border-slate-200/75 py-4 text-left transition-colors dark:border-white/8",
              active
                ? "text-slate-900 dark:text-slate-50"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100",
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">
                  {buildMetaLine(item)}
                </p>
                <h3 className="mt-2 line-clamp-2 text-lg font-light leading-8">
                  {item.questionPrompt}
                </h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  {item.moduleTitle} / {item.attempts.length} attempt
                  {item.attempts.length === 1 ? "" : "s"}
                </p>
                <p className="mt-2 line-clamp-2 text-sm leading-7 text-slate-500 dark:text-slate-400">
                  {getQueueSummary(item)}
                </p>
              </div>

              <div className="shrink-0 text-right">
                <p className="text-[10px] uppercase tracking-[0.24em] text-cyan-600 dark:text-cyan-400">
                  {getReviewStatusLabel(item.status)}
                </p>
                <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                  {formatReviewRelativeTime(item.latestActivityAt)}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
