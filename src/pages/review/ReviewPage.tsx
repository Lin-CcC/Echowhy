import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import {
  applyReviewScope,
  ReviewDetailPanel,
  ReviewFilterBar,
  ReviewQueueList,
  ReviewScopeBanner,
  buildReviewQueue,
  filterReviewQueueItems,
  type ReviewQueueFilter,
  type ReviewQueueItem,
  type ReviewScope,
} from "@/features/review";
import { loadLearningModules } from "@/features/topic-session";

function getDefaultFilter(items: ReturnType<typeof buildReviewQueue>["items"]) {
  if (items.some((item) => item.isWeak)) {
    return "weak";
  }

  if (items.some((item) => item.status === "unanswered")) {
    return "unanswered";
  }

  if (items.some((item) => item.isPending)) {
    return "pending";
  }

  if (items.some((item) => item.isBookmarked)) {
    return "bookmarked";
  }

  if (items.some((item) => item.status === "skipped")) {
    return "skipped";
  }

  return "all";
}

export function ReviewPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/review" });
  const [activeFilter, setActiveFilter] = useState<ReviewQueueFilter>("all");
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const queue = useMemo(
    () =>
      buildReviewQueue({
        modules: loadLearningModules(),
      }),
    [],
  );
  const activeScope = useMemo<ReviewScope | null>(() => {
    if (!search.filter && !search.topicId && !search.angleId && !search.source) {
      return null;
    }

    return {
      filter: search.filter,
      topicId: search.topicId,
      angleId: search.angleId,
      source: search.source,
    };
  }, [search.angleId, search.filter, search.source, search.topicId]);
  const visibleItems = useMemo(
    () =>
      activeScope
        ? applyReviewScope(queue.items, activeScope)
        : filterReviewQueueItems(queue.items, activeFilter),
    [activeFilter, activeScope, queue.items],
  );
  const activeItem = useMemo(
    () =>
      visibleItems.find((item) => item.id === activeItemId) ??
      visibleItems[0] ??
      null,
    [activeItemId, visibleItems],
  );

  useEffect(() => {
    setActiveFilter((current) => {
      if (queue.counts[current] > 0) {
        return current;
      }

      return getDefaultFilter(queue.items);
    });
  }, [queue.counts, queue.items]);

  useEffect(() => {
    setActiveItemId(activeItem?.id ?? null);
  }, [activeItem?.id]);

  function handleOpenTopic(item: ReviewQueueItem) {
    void navigate({
      to: "/topic/$id",
      params: {
        id: item.topicId,
      },
      search: {
        angle: item.routeSearch.angle,
        question: item.routeSearch.question,
      },
    });
  }

  function handleClearScope() {
    void navigate({
      to: "/review",
      search: {},
    });
  }

  return (
    <section className="mx-auto flex w-full max-w-[1500px] flex-col px-10 pb-20 pt-14 sm:px-12">
      <div className="max-w-4xl">
        <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">
          Review
        </p>
        <h1 className="mt-6 text-balance text-4xl font-light tracking-tight text-slate-900 dark:text-slate-50 sm:text-5xl">
          Reopen the questions that still deserve your attention.
        </h1>
        <p className="mt-6 max-w-3xl text-base leading-8 text-slate-500 dark:text-slate-400">
          Review stays question-first. It does not replace Topic; it helps you
          find the unresolved, postponed, bookmarked, or still-fragile nodes,
          then drop back into the exact learning thread.
        </p>
      </div>

      <div className="mt-14">
        {activeScope ? (
          <ReviewScopeBanner
            scope={activeScope}
            itemCount={visibleItems.length}
            onClearScope={handleClearScope}
          />
        ) : (
          <ReviewFilterBar
            activeFilter={activeFilter}
            counts={queue.counts}
            onFilterChange={setActiveFilter}
          />
        )}
      </div>

      <div className="mt-10 grid gap-10 xl:grid-cols-[minmax(22rem,34rem)_minmax(0,1fr)]">
        <div>
          <ReviewQueueList
            items={visibleItems}
            activeItemId={activeItem?.id ?? null}
            onSelect={setActiveItemId}
          />
        </div>

        <ReviewDetailPanel item={activeItem} onOpenTopic={handleOpenTopic} />
      </div>
    </section>
  );
}
