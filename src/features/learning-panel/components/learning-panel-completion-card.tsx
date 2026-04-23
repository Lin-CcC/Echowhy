import {
  getTopicChapterSummaryPresentation,
  type TopicChapterSummaryState,
} from "@/features/topic-session";

type LearningPanelCompletionCardProps = {
  chapterSummaryState?: TopicChapterSummaryState;
  activeAngleTitle: string;
  canExploreAnotherAngle: boolean;
  onExploreAnotherAngle: () => void;
  onResumeRecommendedQuestion: () => void;
  onReturnToLibrary: () => void;
  onAskFollowUp: () => void;
};

export function LearningPanelCompletionCard({
  chapterSummaryState,
  activeAngleTitle,
  canExploreAnotherAngle,
  onExploreAnotherAngle,
  onResumeRecommendedQuestion,
  onReturnToLibrary,
  onAskFollowUp,
}: LearningPanelCompletionCardProps) {
  if (!chapterSummaryState) {
    return null;
  }

  const presentation = getTopicChapterSummaryPresentation(chapterSummaryState);
  const showResumeAction =
    chapterSummaryState.recommendedAction === "review-question" &&
    Boolean(chapterSummaryState.reviewQuestionId);

  return (
    <div
      data-insert-disabled="true"
      className="rounded-2xl border border-slate-200/50 p-6 dark:border-cyan-800/30"
    >
      <p className="mb-3 text-lg font-medium text-slate-900 dark:text-slate-100">
        {presentation.heading}
      </p>
      <p className="text-sm text-slate-600 dark:text-slate-300">
        {presentation.summary}
      </p>
      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
        {activeAngleTitle}: {presentation.detail}
      </p>

      <div className="mt-6">
        <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
          Recommended next step
        </p>
        <div className="flex flex-wrap gap-3">
          {showResumeAction ? (
            <button
              type="button"
              onClick={onResumeRecommendedQuestion}
              className="border border-slate-200/60 px-4 py-2 text-xs uppercase tracking-widest text-slate-600 transition-colors hover:border-cyan-400 hover:text-cyan-600 dark:border-cyan-800/30 dark:text-slate-300 dark:hover:border-cyan-400 dark:hover:text-cyan-400"
            >
              [ Review flagged question ]
            </button>
          ) : null}
          <button
            type="button"
            onClick={onExploreAnotherAngle}
            disabled={!canExploreAnotherAngle}
            className="border border-slate-200/60 px-4 py-2 text-xs uppercase tracking-widest text-slate-600 transition-colors hover:border-cyan-400 hover:text-cyan-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-cyan-800/30 dark:text-slate-300 dark:hover:border-cyan-400 dark:hover:text-cyan-400"
          >
            [ Explore next angle ]
          </button>
          <button
            type="button"
            onClick={onReturnToLibrary}
            className="border border-slate-200/60 px-4 py-2 text-xs uppercase tracking-widest text-slate-600 transition-colors hover:border-cyan-400 hover:text-cyan-600 dark:border-cyan-800/30 dark:text-slate-300 dark:hover:border-cyan-400 dark:hover:text-cyan-400"
          >
            [ Return to Library ]
          </button>
          <button
            type="button"
            onClick={onAskFollowUp}
            className="border border-slate-200/60 px-4 py-2 text-xs uppercase tracking-widest text-slate-600 transition-colors hover:border-cyan-400 hover:text-cyan-600 dark:border-cyan-800/30 dark:text-slate-300 dark:hover:border-cyan-400 dark:hover:text-cyan-400"
          >
            [ Ask a follow-up question ]
          </button>
        </div>
      </div>
    </div>
  );
}
