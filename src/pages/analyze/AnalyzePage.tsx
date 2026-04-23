import { useMemo } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import {
  buildAnalyzePreview,
  getAnalyzeDimensionLabel,
  hasAnalyzePreviewData,
  type AnalyzeBehaviorInsight,
  type AnalyzeChapterPattern,
  type AnalyzeTab,
} from "@/features/analyze";
import type { ReviewScope } from "@/features/review";
import { loadLearningModules } from "@/features/topic-session";
import { cn } from "@/lib/utils";

const analyzeTabs: Array<{
  id: AnalyzeTab;
  label: string;
}> = [
  { id: "global", label: "Global Patterns" },
  { id: "chapters", label: "Chapter Patterns" },
  { id: "behavior", label: "Learning Behavior" },
];

function getActiveTab(
  value: AnalyzeTab | undefined,
): AnalyzeTab {
  return value ?? "global";
}

function renderSectionHeading(title: string, description: string) {
  return (
    <div className="max-w-3xl">
      <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">
        {title}
      </p>
      <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
}

function renderBehaviorCard(item: AnalyzeBehaviorInsight) {
  return (
    <article
      key={item.id}
      className="border-b border-slate-200/75 py-5 dark:border-white/8"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">
            {item.title}
          </p>
          <h3 className="mt-3 text-xl font-light leading-8 text-slate-900 dark:text-slate-50">
            {item.summary}
          </h3>
          <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">
            {item.detail}
          </p>
        </div>

        <p className="shrink-0 text-[11px] uppercase tracking-[0.24em] text-cyan-600 dark:text-cyan-400">
          {item.numerator} / {item.denominator}
        </p>
      </div>
    </article>
  );
}

function renderAnalyzeEmptyState({
  onOpenStart,
  onOpenReview,
}: {
  onOpenStart: () => void;
  onOpenReview: () => void;
}) {
  return (
    <section className="mt-12 max-w-3xl border-l border-cyan-500/35 py-2 pl-6 dark:border-cyan-400/30">
      <p className="text-[10px] uppercase tracking-[0.24em] text-cyan-700 dark:text-cyan-400">
        Not enough signal yet
      </p>
      <h2 className="mt-4 text-3xl font-light leading-[1.25] text-slate-900 dark:text-slate-50">
        Learn a little more, then Analyze will start seeing patterns.
      </h2>
      <p className="mt-4 text-sm leading-7 text-slate-500 dark:text-slate-400">
        This preview needs answered questions, continued ladder steps, pending
        marks, or saved questions before it can summarize your learning habits.
        Nothing is wrong here; the page is waiting for real learning traces.
      </p>
      <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
        <button
          type="button"
          onClick={onOpenStart}
          className="border-b border-cyan-500/45 pb-1 text-[11px] uppercase tracking-[0.24em] text-cyan-700 transition-colors hover:text-cyan-900 dark:border-cyan-400/45 dark:text-cyan-400 dark:hover:text-cyan-300"
        >
          Start learning
        </button>
        <button
          type="button"
          onClick={onOpenReview}
          className="border-b border-slate-300/70 pb-1 text-[11px] uppercase tracking-[0.24em] text-slate-500 transition-colors hover:text-slate-800 dark:border-white/12 dark:text-slate-400 dark:hover:text-slate-100"
        >
          Open Review
        </button>
      </div>
    </section>
  );
}

export function AnalyzePage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/analyze" });
  const modules = useMemo(() => loadLearningModules(), []);
  const preview = useMemo(
    () =>
      buildAnalyzePreview({
        modules,
      }),
    [modules],
  );
  const activeTab = getActiveTab(search.tab);
  const hasPreviewData = hasAnalyzePreviewData(preview);
  const scopedChapter = useMemo(
    () =>
      search.topicId && search.angleId
        ? preview.chapterPatterns.find(
            (chapter) =>
              chapter.topicId === search.topicId &&
              chapter.angleId === search.angleId,
          ) ?? null
        : null,
    [preview.chapterPatterns, search.angleId, search.topicId],
  );

  function handleTabChange(tab: AnalyzeTab) {
    void navigate({
      to: "/analyze",
      search: {
        tab,
        topicId: tab === "chapters" ? search.topicId : undefined,
        angleId: tab === "chapters" ? search.angleId : undefined,
      },
    });
  }

  function handleOpenReview(searchState: ReviewScope) {
    void navigate({
      to: "/review",
      search: searchState,
    });
  }

  function handleOpenReviewHome() {
    void navigate({
      to: "/review",
      search: {},
    });
  }

  function handleOpenStart() {
    void navigate({
      to: "/",
    });
  }

  function handleOpenDimensionReview(
    dimension: AnalyzeChapterPattern["topWeakDimensions"][number],
  ) {
    void navigate({
      to: "/review",
      search: {
        source: "analyze",
        sourceLabel: "From Global Pattern",
        sourceDetail: getAnalyzeDimensionLabel(dimension),
        analysisDimension: dimension,
      },
    });
  }

  return (
    <section className="mx-auto flex w-full max-w-[1500px] flex-col px-10 pb-20 pt-14 sm:px-12">
      <div className="max-w-4xl">
        <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">
          Analyze Preview
        </p>
        <h1 className="mt-6 text-balance text-4xl font-light tracking-tight text-slate-900 dark:text-slate-50 sm:text-5xl">
          Spot the patterns before they harden into habits.
        </h1>
        <p className="mt-6 max-w-3xl text-base leading-8 text-slate-500 dark:text-slate-400">
          Analyze looks across questions, chapters, and learning behavior. It
          is intentionally light in this version: just enough to help you see
          where to return in Review next.
        </p>
      </div>

      <div className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-slate-200/75 pb-4 dark:border-white/8">
        {analyzeTabs.map((tab) => {
          const active = tab.id === activeTab;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "border-b border-transparent pb-1 text-[11px] uppercase tracking-[0.24em] transition-colors",
                active
                  ? "border-cyan-500/55 text-slate-900 dark:border-cyan-400/55 dark:text-slate-50"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {!hasPreviewData
        ? renderAnalyzeEmptyState({
            onOpenStart: handleOpenStart,
            onOpenReview: handleOpenReviewHome,
          })
        : null}

      {activeTab === "global" && hasPreviewData ? (
        <div className="mt-10 space-y-12">
          <section>
            {renderSectionHeading(
              "Weak Dimensions",
              "These are the answer dimensions that most often stay fragile across your recent questions.",
            )}
            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              {preview.globalPatterns.weakDimensions.map((item) => (
                <button
                  key={item.dimension}
                  type="button"
                  onClick={() => handleOpenDimensionReview(item.dimension)}
                  className="border border-slate-200/70 px-4 py-4 text-left transition-colors hover:border-slate-300/90 dark:border-white/8 dark:hover:border-white/14"
                >
                  <p className="text-[10px] uppercase tracking-[0.24em] text-cyan-600 dark:text-cyan-400">
                    {item.count} question{item.count === 1 ? "" : "s"}
                  </p>
                  <h3 className="mt-3 text-xl font-light leading-8 text-slate-900 dark:text-slate-50">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">
                    {item.summary}
                  </p>
                </button>
              ))}
            </div>
          </section>

          <section>
            {renderSectionHeading(
              "Backlog States",
              "These are the states you most often leave in the queue for later.",
            )}
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {preview.globalPatterns.statusBacklog.map((item) => (
                <button
                  key={item.filter}
                  type="button"
                  onClick={() => handleOpenReview(item.reviewScope)}
                  className="border border-slate-200/70 px-4 py-4 text-left transition-colors hover:border-slate-300/90 dark:border-white/8 dark:hover:border-white/14"
                >
                  <p className="text-[10px] uppercase tracking-[0.24em] text-cyan-600 dark:text-cyan-400">
                    {item.count} question{item.count === 1 ? "" : "s"}
                  </p>
                  <h3 className="mt-3 text-xl font-light leading-8 text-slate-900 dark:text-slate-50">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">
                    {item.summary}
                  </p>
                </button>
              ))}
            </div>
          </section>

          <section>
            {renderSectionHeading(
              "Needs Revisit",
              "These knowledge blocks still carry the most unresolved pressure right now.",
            )}
            <div className="mt-5 flex flex-col">
              {preview.globalPatterns.revisitAreas.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleOpenReview(item.reviewScope)}
                  className="border-b border-slate-200/75 py-5 text-left transition-colors hover:text-slate-900 dark:border-white/8 dark:hover:text-slate-50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">
                        {item.sourceLabel}
                      </p>
                      <h3 className="mt-3 text-xl font-light leading-8 text-slate-900 dark:text-slate-50">
                        {item.title}
                      </h3>
                      <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500 dark:text-slate-400">
                        {item.summary}
                      </p>
                    </div>
                    <p className="shrink-0 text-[11px] uppercase tracking-[0.24em] text-cyan-600 dark:text-cyan-400">
                      {item.unresolvedCount} open
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>
      ) : null}

      {activeTab === "chapters" && hasPreviewData ? (
        <div className="mt-10">
          {renderSectionHeading(
            "Chapter Patterns",
            scopedChapter
              ? `This preview is currently scoped to "${scopedChapter.title}".`
              : "Series Analyze stays chapter-first in this version so you can see how one learning block is holding together.",
          )}

          <div className="mt-5 flex flex-col">
            {(scopedChapter ? [scopedChapter] : preview.chapterPatterns).map((chapter) => (
              <article
                key={chapter.id}
                className="border-b border-slate-200/75 py-5 dark:border-white/8"
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">
                      {chapter.sourceLabel}
                    </p>
                    <h3 className="mt-3 text-2xl font-light leading-9 text-slate-900 dark:text-slate-50">
                      {chapter.title}
                    </h3>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500 dark:text-slate-400">
                      {chapter.summary}
                    </p>
                    {chapter.topWeakDimensions.length > 0 ? (
                      <p className="mt-3 text-[11px] uppercase tracking-[0.24em] text-cyan-600 dark:text-cyan-400">
                        {chapter.topWeakDimensions
                          .map((dimension) => getAnalyzeDimensionLabel(dimension))
                          .join(" / ")}
                      </p>
                    ) : null}
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-cyan-600 dark:text-cyan-400">
                      {chapter.unresolvedCount} open
                    </p>
                    <button
                      type="button"
                      onClick={() => handleOpenReview(chapter.reviewScope)}
                      className="mt-4 border-b border-cyan-500/45 pb-1 text-[11px] uppercase tracking-[0.24em] text-cyan-700 transition-colors hover:text-cyan-900 dark:border-cyan-400/45 dark:text-cyan-400 dark:hover:text-cyan-300"
                    >
                      Open in Review
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : null}

      {activeTab === "behavior" && hasPreviewData ? (
        <div className="mt-10">
          {renderSectionHeading(
            "Learning Behavior",
            "This version keeps behavior signals intentionally light: just enough to show how you usually keep learning moving.",
          )}
          <div className="mt-5">
            {preview.learningBehavior.map((item) => renderBehaviorCard(item))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
