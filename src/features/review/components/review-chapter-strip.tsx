import {
  getTopicChapterSummaryPresentation,
} from "@/features/topic-session";
import { cn } from "@/lib/utils";
import {
  formatReviewRelativeTime,
  getReviewChapterStatusLabel,
} from "../presentation";
import type { ReviewChapterSummary } from "../types";

type ReviewChapterStripProps = {
  chapters: ReviewChapterSummary[];
  activeChapterId: string | null;
  onSelectChapter: (chapter: ReviewChapterSummary) => void;
};

function buildChapterMeta(chapter: ReviewChapterSummary) {
  const segments = [
    `${chapter.counts.all} question${chapter.counts.all === 1 ? "" : "s"}`,
    chapter.counts.unanswered > 0
      ? `${chapter.counts.unanswered} unanswered`
      : null,
    chapter.counts.weak > 0 ? `${chapter.counts.weak} needs work` : null,
    chapter.counts.pending > 0 ? `${chapter.counts.pending} pending` : null,
    chapter.counts.bookmarked > 0
      ? `${chapter.counts.bookmarked} favorite${chapter.counts.bookmarked === 1 ? "" : "s"}`
      : null,
  ].filter((segment): segment is string => Boolean(segment));

  return segments.join(" / ");
}

function getChapterSummaryText(chapter: ReviewChapterSummary) {
  if (!chapter.summaryState) {
    return "This chapter is already in review and can be reopened question by question.";
  }

  return getTopicChapterSummaryPresentation(chapter.summaryState).summary;
}

export function ReviewChapterStrip({
  chapters,
  activeChapterId,
  onSelectChapter,
}: ReviewChapterStripProps) {
  if (chapters.length <= 0) {
    return null;
  }

  return (
    <section className="mt-6 border-t border-slate-200/75 pt-5 dark:border-white/8">
      <div className="flex items-center justify-between gap-4">
        <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">
          Chapters
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Open one chapter at a time without losing the question-first queue.
        </p>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {chapters.map((chapter) => {
          const active = chapter.id === activeChapterId;
          const summaryStatus = chapter.summaryState?.status ?? null;

          return (
            <button
              key={chapter.id}
              type="button"
              onClick={() => onSelectChapter(chapter)}
              className={cn(
                "border border-slate-200/70 px-4 py-4 text-left transition-colors dark:border-white/8",
                active
                  ? "border-cyan-500/45 bg-cyan-50/35 dark:border-cyan-400/35 dark:bg-cyan-500/5"
                  : "hover:border-slate-300/90 dark:hover:border-white/14",
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">
                    {chapter.moduleTitle}
                  </p>
                  <h3 className="mt-2 text-lg font-light leading-7 text-slate-900 dark:text-slate-50">
                    {chapter.angleTitle}
                  </h3>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-cyan-600 dark:text-cyan-400">
                    {summaryStatus
                      ? getReviewChapterStatusLabel(summaryStatus)
                      : "In Review"}
                  </p>
                  <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                    {formatReviewRelativeTime(chapter.latestActivityAt)}
                  </p>
                </div>
              </div>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
                {getChapterSummaryText(chapter)}
              </p>

              <p className="mt-4 text-[11px] uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">
                {buildChapterMeta(chapter)}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
