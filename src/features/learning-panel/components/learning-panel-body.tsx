import type { FormEventHandler, ReactNode } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { cn } from "@/lib/utils";
import type {
  TopicAnswerState,
  TopicChapterSummaryState,
  TopicDiscussionStep,
  TopicQuestionReviewState,
} from "@/features/topic-session";
import { LearningBlockContent } from "./learning-block-content";
import { LearningPanelCompletionCard } from "./learning-panel-completion-card";
import { LearningCurrentQuestionCard } from "./learning-current-question-card";
import { LearningCustomQuestionComposer } from "./learning-custom-question-composer";
import { LearningHistoryQuestionCard } from "./learning-history-question-card";
import { ReadingLine } from "./reading-line";

type LearningPanelBodyProps = {
  visibleSteps: TopicDiscussionStep[];
  currentStepIndex: number;
  showCompletionCard: boolean;
  showCustomComposer: boolean;
  chapterSummaryState?: TopicChapterSummaryState;
  currentAnswerState: TopicAnswerState | undefined;
  failedCurrentAttempt: boolean;
  answerStateByQuestionId: Record<string, TopicAnswerState | undefined>;
  questionReviewStateById: Record<string, TopicQuestionReviewState | undefined>;
  activeReferenceIds: string[];
  highlightedBlockId: string | null;
  activeAngleTitle: string;
  canExploreAnotherAngle: boolean;
  answerField: UseFormRegisterReturn<"answer">;
  customQuestionField: UseFormRegisterReturn<"question">;
  answerErrorMessage: string;
  customQuestionErrorMessage: string;
  useLightShield: boolean;
  isDark: boolean;
  currentStepQuestionId?: string;
  renderInsertSlot: (targetId: string) => ReactNode;
  onToggleHistory: (questionId: string) => void;
  onToggleQuestionPending: (questionId: string) => void;
  onToggleQuestionBookmark: (questionId: string) => void;
  onToggleQuestionWeak: (questionId: string) => void;
  onPreviewReference: (referenceId: string) => void;
  onClearPreviewReference: () => void;
  onPinSource: (referenceId: string) => void;
  onCurrentAnswerChange: (nextValue: string) => void;
  onAnswerSubmit: FormEventHandler<HTMLFormElement>;
  onTryAgain: () => void;
  onRevealAnswer: () => void;
  onContinueLadder: () => void;
  onSkipCurrent: () => void;
  onResumeQuestion: (questionId: string) => void;
  onCustomQuestionSubmit: FormEventHandler<HTMLFormElement>;
  onCustomQuestionDraftChange: (draft: string) => void;
  onExploreAnotherAngle: () => void;
  onResumeRecommendedQuestion: () => void;
  onReturnToLibrary: () => void;
  onAskFollowUp: () => void;
};

export function LearningPanelBody({
  visibleSteps,
  currentStepIndex,
  showCompletionCard,
  showCustomComposer,
  chapterSummaryState,
  currentAnswerState,
  failedCurrentAttempt,
  answerStateByQuestionId,
  questionReviewStateById,
  activeReferenceIds,
  highlightedBlockId,
  activeAngleTitle,
  canExploreAnotherAngle,
  answerField,
  customQuestionField,
  answerErrorMessage,
  customQuestionErrorMessage,
  useLightShield,
  isDark,
  currentStepQuestionId,
  renderInsertSlot,
  onToggleHistory,
  onToggleQuestionPending,
  onToggleQuestionBookmark,
  onToggleQuestionWeak,
  onPreviewReference,
  onClearPreviewReference,
  onPinSource,
  onCurrentAnswerChange,
  onAnswerSubmit,
  onTryAgain,
  onRevealAnswer,
  onContinueLadder,
  onSkipCurrent,
  onResumeQuestion,
  onCustomQuestionSubmit,
  onCustomQuestionDraftChange,
  onExploreAnotherAngle,
  onResumeRecommendedQuestion,
  onReturnToLibrary,
  onAskFollowUp,
}: LearningPanelBodyProps) {
  return (
    <div className="mt-10 flex flex-col gap-[18px] text-[15px] font-normal leading-relaxed text-slate-700 dark:text-slate-300 dark:[text-shadow:0_0_8px_#0a0f1a,_0_0_16px_#0a0f1a]">
      {visibleSteps.map((step, index) => {
        const answerState = answerStateByQuestionId[step.question.id];
        const reviewState = questionReviewStateById[step.question.id];
        const isHistoryExpanded = !answerState?.isCollapsed;
        const isCurrent = index === currentStepIndex && !showCompletionCard;
        const showHistoryCard = Boolean(
          answerState && answerState.status !== "failed" && !isCurrent,
        );

        return (
          <div key={step.id} className="flex flex-col gap-[18px]">
            {showHistoryCard ? (
              <>
                {answerState ? (
                  <LearningHistoryQuestionCard
                    step={step}
                    answerState={answerState}
                    reviewState={reviewState}
                    isHistoryExpanded={isHistoryExpanded}
                    useLightShield={useLightShield}
                    isDark={isDark}
                    onToggleHistory={onToggleHistory}
                    onToggleQuestionPending={onToggleQuestionPending}
                    onToggleQuestionBookmark={onToggleQuestionBookmark}
                    onToggleQuestionWeak={onToggleQuestionWeak}
                    onResumeQuestion={onResumeQuestion}
                  />
                ) : null}
                {renderInsertSlot(`after-history:${step.question.id}`)}
              </>
            ) : null}

            <div
              id={`block-${step.block.id}`}
              className={cn(
                "-mx-4 px-4 transition-colors duration-300",
                highlightedBlockId === step.block.id && "block-focus-flash",
              )}
            >
              <h3 className="mb-2 text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-slate-200 dark:tracking-[0.1em]">
                <ReadingLine shield={useLightShield}>
                  {step.block.title ?? `Step ${index + 1}`}
                </ReadingLine>
              </h3>
              <LearningBlockContent
                step={step}
                shield={useLightShield}
                isDark={isDark}
                activeReferenceIds={activeReferenceIds}
                onPreviewReference={onPreviewReference}
                onClearPreviewReference={onClearPreviewReference}
                onPinSource={onPinSource}
              />
            </div>

            {renderInsertSlot(`after-step:${step.id}`)}

            {isCurrent ? (
              <>
                <LearningCurrentQuestionCard
                  step={step}
                  answerField={answerField}
                  errorMessage={answerErrorMessage}
                  failedCurrentAttempt={failedCurrentAttempt}
                  currentAnswerState={currentAnswerState}
                  reviewState={reviewState}
                  useLightShield={useLightShield}
                  isDark={isDark}
                  onSubmit={onAnswerSubmit}
                  onAnswerChange={(nextValue) => {
                    if (currentStepQuestionId) {
                      onCurrentAnswerChange(nextValue);
                    }
                  }}
                  onTryAgain={onTryAgain}
                  onRevealAnswer={onRevealAnswer}
                  onContinueLadder={onContinueLadder}
                  onSkipCurrent={onSkipCurrent}
                  onToggleQuestionPending={onToggleQuestionPending}
                  onToggleQuestionBookmark={onToggleQuestionBookmark}
                  onToggleQuestionWeak={onToggleQuestionWeak}
                />
                {renderInsertSlot(`after-current:${step.question.id}`)}
              </>
            ) : null}
          </div>
        );
      })}

      {showCustomComposer ? (
        <>
          <LearningCustomQuestionComposer
            questionField={customQuestionField}
            errorMessage={customQuestionErrorMessage}
            useLightShield={useLightShield}
            isDark={isDark}
            onSubmit={onCustomQuestionSubmit}
            onQuestionChange={onCustomQuestionDraftChange}
          />
          {renderInsertSlot("after-custom-question")}
        </>
      ) : null}

      {showCompletionCard ? (
        <>
          <LearningPanelCompletionCard
            chapterSummaryState={chapterSummaryState}
            activeAngleTitle={activeAngleTitle}
            canExploreAnotherAngle={canExploreAnotherAngle}
            onExploreAnotherAngle={onExploreAnotherAngle}
            onResumeRecommendedQuestion={onResumeRecommendedQuestion}
            onReturnToLibrary={onReturnToLibrary}
            onAskFollowUp={onAskFollowUp}
          />
          {renderInsertSlot("after-completion-card")}
        </>
      ) : null}
    </div>
  );
}
