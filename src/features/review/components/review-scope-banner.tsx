import { getReviewFilterLabel } from "../utils";
import type { ReviewScope } from "../types";

type ReviewScopeBannerProps = {
  scope: ReviewScope;
  itemCount: number;
  onClearScope: () => void;
};

function getScopeTitle(scope: ReviewScope) {
  return scope.source === "locator"
    ? "Filtered From Topic Scan"
    : "Filtered Results";
}

function buildScopeMeta(scope: ReviewScope, itemCount: number) {
  const segments = [
    scope.filter ? getReviewFilterLabel(scope.filter) : null,
    scope.angleId ? "Current angle" : null,
    `${itemCount} question${itemCount === 1 ? "" : "s"}`,
  ].filter((segment): segment is string => Boolean(segment));

  return segments.join(" / ");
}

export function ReviewScopeBanner({
  scope,
  itemCount,
  onClearScope,
}: ReviewScopeBannerProps) {
  return (
    <section className="border-b border-slate-200/75 pb-5 dark:border-white/8">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">
            {getScopeTitle(scope)}
          </p>
          <p className="mt-4 max-w-3xl text-lg font-light leading-8 text-slate-900 dark:text-slate-50">
            This view keeps the Review queue scoped to the questions surfaced by
            your Topic scan.
          </p>
          <p className="mt-3 text-[11px] uppercase tracking-[0.24em] text-cyan-700 dark:text-cyan-400">
            {buildScopeMeta(scope, itemCount)}
          </p>
        </div>

        <button
          type="button"
          onClick={onClearScope}
          className="border-b border-cyan-500/45 pb-1 text-[11px] uppercase tracking-[0.24em] text-cyan-700 transition-colors hover:text-cyan-900 dark:border-cyan-400/45 dark:text-cyan-400 dark:hover:text-cyan-300"
        >
          Back to Review
        </button>
      </div>
    </section>
  );
}
