import { Bookmark, CornerDownRight, Flag, TimerReset } from "lucide-react";
import { formatReviewRelativeTime, getReviewStatusLabel } from "../presentation";
import type { ReviewQueueItem } from "../types";

type ReviewDetailPanelProps = {
  item: ReviewQueueItem | null;
  onOpenTopic: (item: ReviewQueueItem) => void;
  onOpenSeriesAnalyze: (item: ReviewQueueItem) => void;
};

function buildSignals(item: ReviewQueueItem) {
  return [
    item.isPending
      ? {
          key: "pending",
          label: "Pending",
          icon: TimerReset,
        }
      : null,
    item.isBookmarked
      ? {
          key: "bookmarked",
          label: "Favorite",
          icon: Bookmark,
        }
      : null,
    item.isSelfMarkedWeak
      ? {
          key: "self-weak",
          label: "Manual weak",
          icon: Flag,
        }
      : null,
    item.source === "inserted"
      ? {
          key: "inserted",
          label: "Branch question",
          icon: CornerDownRight,
        }
      : null,
  ].filter(
    (
      signal,
    ): signal is {
      key: string;
      label: string;
      icon: typeof Bookmark;
    } => Boolean(signal),
  );
}

export function ReviewDetailPanel({
  item,
  onOpenTopic,
  onOpenSeriesAnalyze,
}: ReviewDetailPanelProps) {
  if (!item) {
    return (
      <section className="border-l border-slate-200/75 pl-8 dark:border-white/8">
        <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">
          Question Detail
        </p>
        <p className="mt-4 max-w-lg text-sm leading-7 text-slate-500 dark:text-slate-400">
          Select a question from the queue to reopen its latest answer, feedback,
          and attempt history.
        </p>
      </section>
    );
  }

  const signals = buildSignals(item);

  return (
    <section className="border-l border-slate-200/75 pl-8 dark:border-white/8">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">
            Question Detail
          </p>
          <h2 className="mt-4 max-w-3xl text-3xl font-light leading-[1.3] text-slate-900 dark:text-slate-50">
            {item.questionPrompt}
          </h2>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-x-6 gap-y-3">
          <button
            type="button"
            onClick={() => onOpenSeriesAnalyze(item)}
            className="border-b border-slate-300/70 pb-1 text-[11px] uppercase tracking-[0.24em] text-slate-500 transition-colors hover:text-slate-900 dark:border-white/10 dark:text-slate-400 dark:hover:text-slate-100"
          >
            Series Analyze
          </button>
          <button
            type="button"
            onClick={() => onOpenTopic(item)}
            className="border-b border-cyan-500/45 pb-1 text-[11px] uppercase tracking-[0.24em] text-cyan-700 transition-colors hover:text-cyan-900 dark:border-cyan-400/45 dark:text-cyan-400 dark:hover:text-cyan-300"
          >
            Back to Topic
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-500 dark:text-slate-400">
        <span>{item.moduleTitle}</span>
        <span>{item.angleTitle}</span>
        <span>{getReviewStatusLabel(item.status)}</span>
        <span>{formatReviewRelativeTime(item.latestActivityAt)}</span>
      </div>

      {signals.length > 0 ? (
        <div className="mt-6 flex flex-wrap gap-x-5 gap-y-3">
          {signals.map((signal) => {
            const Icon = signal.icon;

            return (
              <div
                key={signal.key}
                className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400"
              >
                <Icon size={13} className="text-cyan-600 dark:text-cyan-400" />
                <span>{signal.label}</span>
              </div>
            );
          })}
        </div>
      ) : null}

      <div className="mt-10 grid gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)]">
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">
            Latest Snapshot
          </p>

          <div className="mt-4 space-y-4 text-slate-600 dark:text-slate-300">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">
                Latest answer
              </p>
              <p className="mt-2 text-base leading-8">
                {item.latestAnswer ?? "No submitted answer yet."}
              </p>
            </div>

            {item.summary ? (
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">
                  Summary
                </p>
                <p className="mt-2 text-base leading-8">
                  {item.summary}
                </p>
              </div>
            ) : null}

            {item.latestFeedback ? (
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">
                  Latest feedback
                </p>
                <p className="mt-2 text-base leading-8">
                  {item.latestFeedback.nextSuggestion}
                </p>
              </div>
            ) : null}
          </div>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">
            Attempt History
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">
            Latest of {item.attempts.length} attempt{item.attempts.length === 1 ? "" : "s"}.
          </p>

          {item.attempts.length > 0 ? (
            <div className="mt-4 flex flex-col gap-4">
              {item.attempts.map((attempt) => (
                <article
                  key={attempt.id}
                  className="border-b border-slate-200/75 pb-4 dark:border-white/8"
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-600 dark:text-cyan-400">
                      {attempt.aiFeedback.label}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {formatReviewRelativeTime(attempt.createdAt)}
                    </p>
                  </div>
                  <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                    {attempt.userAnswer}
                  </p>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    {attempt.aiFeedback.nextSuggestion}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm leading-7 text-slate-500 dark:text-slate-400">
              No attempt history has been recorded for this question yet.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
