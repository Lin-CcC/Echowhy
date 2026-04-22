import type {
  TopicAnswerState,
  TopicDiscussionStep,
  TopicQuestionReviewState,
} from "@/features/topic-session";
import { InlineFeedback } from "./inline-feedback";
import { QuestionReviewActions } from "./question-review-actions";
import { ReadingLine } from "./reading-line";

type LearningHistoryQuestionCardProps = {
  step: TopicDiscussionStep;
  answerState: TopicAnswerState;
  reviewState: TopicQuestionReviewState | undefined;
  isHistoryExpanded: boolean;
  useLightShield: boolean;
  isDark: boolean;
  onToggleHistory: (questionId: string) => void;
  onToggleQuestionPending: (questionId: string) => void;
  onToggleQuestionBookmark: (questionId: string) => void;
  onToggleQuestionWeak: (questionId: string) => void;
};

export function LearningHistoryQuestionCard({
  step,
  answerState,
  reviewState,
  isHistoryExpanded,
  useLightShield,
  isDark,
  onToggleHistory,
  onToggleQuestionPending,
  onToggleQuestionBookmark,
  onToggleQuestionWeak,
}: LearningHistoryQuestionCardProps) {
  return (
    <div
      id={`question-${step.question.id}`}
      data-insert-disabled="true"
      className="py-1 pl-6"
    >
      <button
        type="button"
        onClick={() => onToggleHistory(step.question.id)}
        className="group flex w-full items-center justify-between gap-4 text-left"
      >
        <div className="space-y-1.5">
          <p className="text-sm font-normal italic text-slate-500 transition-colors group-hover:text-cyan-600 dark:text-slate-200 dark:group-hover:text-cyan-400">
            <ReadingLine shield={useLightShield}>
              <span className="font-bold not-italic">Q:</span>{" "}
              {step.question.prompt}
            </ReadingLine>
          </p>
          {answerState.summary ? (
            <p className="text-sm text-slate-500 dark:text-slate-300">
              <ReadingLine shield={useLightShield}>
                {answerState.summary}
              </ReadingLine>
            </p>
          ) : null}
        </div>
        <span className="shrink-0 text-xs text-slate-400 dark:text-slate-400">
          {isHistoryExpanded ? "-" : "+"}
        </span>
      </button>

      <div
        className={
          isHistoryExpanded
            ? "mt-1.5 max-h-96 overflow-hidden opacity-100 transition-all duration-300 ease-out"
            : "max-h-0 overflow-hidden opacity-0 transition-all duration-300 ease-out"
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          <ReadingLine shield={useLightShield}>
            <span className="font-bold text-cyan-600 dark:text-cyan-400">
              Answer:
            </span>{" "}
            {answerState.status === "skipped"
              ? "Skipped for now."
              : answerState.answer}
          </ReadingLine>
        </p>
        <InlineFeedback
          answerState={answerState}
          useLightShield={useLightShield}
        />
        <QuestionReviewActions
          questionId={step.question.id}
          reviewState={reviewState}
          isDark={isDark}
          onTogglePending={onToggleQuestionPending}
          onToggleBookmark={onToggleQuestionBookmark}
          onToggleWeak={onToggleQuestionWeak}
        />
      </div>
    </div>
  );
}
