import { getTopicChapterSummaryPresentation } from "@/features/topic-session";
import { getReviewFilterLabel } from "../utils";
import { getReviewChapterStatusLabel } from "../presentation";
import type { ReviewChapterSummary, ReviewScope } from "../types";

type ReviewScopeBannerProps = {
  scope: ReviewScope;
  itemCount: number;
  chapterSummary?: ReviewChapterSummary | null;
  onOpenFlaggedQuestion?: (() => void) | null;
  onClearScope: () => void;
};

function getScopeTitle(
  scope: ReviewScope,
  chapterSummary: ReviewChapterSummary | null | undefined,
) {
  return scope.source === "locator"
    ? "Filtered From Topic Scan"
    : scope.source === "analyze"
      ? scope.sourceLabel ?? "Filtered From Analyze"
    : chapterSummary
      ? "Chapter Review"
    : "Filtered Results";
}

function buildScopeMeta(
  scope: ReviewScope,
  itemCount: number,
  chapterSummary: ReviewChapterSummary | null | undefined,
) {
  const segments = [
    scope.filter ? getReviewFilterLabel(scope.filter) : null,
    scope.source === "analyze" ? scope.sourceDetail ?? null : null,
    chapterSummary?.angleTitle ?? (scope.angleId ? "Current angle" : null),
    chapterSummary?.summaryState
      ? getReviewChapterStatusLabel(chapterSummary.summaryState.status)
      : null,
    `${itemCount} question${itemCount === 1 ? "" : "s"}`,
  ].filter((segment): segment is string => Boolean(segment));

  return segments.join(" / ");
}

export function ReviewScopeBanner({
  scope,
  itemCount,
  chapterSummary,
  onOpenFlaggedQuestion,
  onClearScope,
}: ReviewScopeBannerProps) {
  const chapterPresentation = chapterSummary?.summaryState
    ? getTopicChapterSummaryPresentation(chapterSummary.summaryState)
    : null;
  const analyzeSummary =
    scope.source === "analyze"
      ? scope.sourceDetail
        ? `This Review slice comes from Analyze and stays scoped to "${scope.sourceDetail}".`
        : "This Review slice comes from Analyze and stays scoped to one detected pattern."
      : null;

  return (
    <section className="border-b border-slate-200/75 pb-5 dark:border-white/8">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">
            {getScopeTitle(scope, chapterSummary)}
          </p>
          {chapterSummary ? (
            <>
              <h2 className="mt-4 max-w-3xl text-2xl font-light leading-[1.35] text-slate-900 dark:text-slate-50">
                {chapterSummary.angleTitle}
              </h2>
              <p className="mt-4 max-w-3xl text-lg font-light leading-8 text-slate-900 dark:text-slate-50">
                {chapterPresentation?.summary ??
                  "This chapter view keeps Review scoped to one learning angle."}
              </p>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500 dark:text-slate-400">
                {chapterPresentation?.detail ??
                  "Use this scoped queue to reopen the exact question that still needs attention."}
              </p>
            </>
          ) : (
            <p className="mt-4 max-w-3xl text-lg font-light leading-8 text-slate-900 dark:text-slate-50">
              {analyzeSummary ??
                "This view keeps the Review queue scoped to the questions surfaced by your Topic scan."}
            </p>
          )}
          <p className="mt-3 text-[11px] uppercase tracking-[0.24em] text-cyan-700 dark:text-cyan-400">
            {buildScopeMeta(scope, itemCount, chapterSummary)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          {chapterSummary?.summaryState?.reviewQuestionId && onOpenFlaggedQuestion ? (
            <button
              type="button"
              onClick={onOpenFlaggedQuestion}
              className="border-b border-cyan-500/45 pb-1 text-[11px] uppercase tracking-[0.24em] text-cyan-700 transition-colors hover:text-cyan-900 dark:border-cyan-400/45 dark:text-cyan-400 dark:hover:text-cyan-300"
            >
              Open flagged question
            </button>
          ) : null}

          <button
            type="button"
            onClick={onClearScope}
            className="border-b border-cyan-500/45 pb-1 text-[11px] uppercase tracking-[0.24em] text-cyan-700 transition-colors hover:text-cyan-900 dark:border-cyan-400/45 dark:text-cyan-400 dark:hover:text-cyan-300"
          >
            Back to Review
          </button>
        </div>
      </div>
    </section>
  );
}
