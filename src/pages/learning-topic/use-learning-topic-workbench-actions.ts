import { useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { FeedbackCardState } from "@/features/source-reference";
import type {
  TopicAngleProgressState,
  TopicBehaviorSignalCounts,
  TopicDiscussionStep,
  TopicSession,
} from "@/features/topic-session";
import {
  evaluateTopicAnswer,
  filterValidReferenceIds,
  getAttemptRecordStatus,
} from "@/features/topic-session";

type UseLearningTopicWorkbenchActionsParams = {
  topic: TopicSession;
  selectedAngleId: string;
  setAngleStateById: Dispatch<
    SetStateAction<Record<string, TopicAngleProgressState>>
  >;
  setPreviewSource: Dispatch<SetStateAction<string | null>>;
  pinnedSources: string[];
  setPinnedSourcesByAngleId: Dispatch<SetStateAction<Record<string, string[]>>>;
  floatingFeedbacks: FeedbackCardState[];
  setFloatingFeedbacks: Dispatch<SetStateAction<FeedbackCardState[]>>;
  activeFeedbackId: string | null;
  setActiveFeedbackId: Dispatch<SetStateAction<string | null>>;
  setDraftAnswersByQuestionId: Dispatch<SetStateAction<Record<string, string>>>;
  revealedQuestionIds: Record<string, boolean>;
  setRevealedQuestionIds: Dispatch<SetStateAction<Record<string, boolean>>>;
  clearFocusedQuestion: () => void;
  setBehaviorSignalCounts: Dispatch<SetStateAction<TopicBehaviorSignalCounts>>;
  discussionSteps: TopicDiscussionStep[];
  currentStepIndex: number;
  currentStep: TopicDiscussionStep | null;
};

export function useLearningTopicWorkbenchActions({
  topic,
  selectedAngleId,
  setAngleStateById,
  setPreviewSource,
  pinnedSources,
  setPinnedSourcesByAngleId,
  floatingFeedbacks,
  setFloatingFeedbacks,
  activeFeedbackId,
  setActiveFeedbackId,
  setDraftAnswersByQuestionId,
  revealedQuestionIds,
  setRevealedQuestionIds,
  clearFocusedQuestion,
  setBehaviorSignalCounts,
  discussionSteps,
  currentStepIndex,
  currentStep,
}: UseLearningTopicWorkbenchActionsParams) {
  const updatePinnedSourcesForCurrentAngle = useCallback(
    (updater: (currentPinnedSources: string[]) => string[]) => {
      setPinnedSourcesByAngleId((previous) => {
        const currentPinnedSources = previous[selectedAngleId] ?? [];
        const nextPinnedSources = filterValidReferenceIds(
          topic,
          updater(currentPinnedSources),
        );

        if (!nextPinnedSources.length) {
          const remainingPinnedSources = { ...previous };
          delete remainingPinnedSources[selectedAngleId];
          return remainingPinnedSources;
        }

        return {
          ...previous,
          [selectedAngleId]: nextPinnedSources,
        };
      });
    },
    [selectedAngleId, setPinnedSourcesByAngleId, topic],
  );

  const handlePreviewReference = useCallback(
    (referenceId: string) => {
      if (!pinnedSources.includes(referenceId)) {
        setPreviewSource(referenceId);
      }
    },
    [pinnedSources, setPreviewSource],
  );

  const handleClearPreviewReference = useCallback(() => {
    setPreviewSource(null);
  }, [setPreviewSource]);

  const handlePinSource = useCallback(
    (referenceId: string) => {
      updatePinnedSourcesForCurrentAngle((previous) =>
        previous.includes(referenceId)
          ? previous.filter((id) => id !== referenceId)
          : [...previous, referenceId],
      );
      setPreviewSource(null);
    },
    [setPreviewSource, updatePinnedSourcesForCurrentAngle],
  );

  const handleUnpinSource = useCallback(
    (referenceId: string) => {
      updatePinnedSourcesForCurrentAngle((previous) =>
        previous.filter((id) => id !== referenceId),
      );
    },
    [updatePinnedSourcesForCurrentAngle],
  );

  const handleClearAllSources = useCallback(() => {
    updatePinnedSourcesForCurrentAngle(() => []);
    setPreviewSource(null);
  }, [setPreviewSource, updatePinnedSourcesForCurrentAngle]);

  const handleCheckCurrent = useCallback(
    (answer: string) => {
      if (!currentStep) {
        return;
      }

      const feedback = evaluateTopicAnswer(currentStep.question, answer);
      setDraftAnswersByQuestionId((previous) => ({
        ...previous,
        [currentStep.question.id]: answer,
      }));
      const feedbackCardId = `${currentStep.question.id}-${Date.now()}`;
      setFloatingFeedbacks((previous) => [
        ...previous,
        {
          id: feedbackCardId,
          angleId: selectedAngleId,
          questionId: currentStep.question.id,
          answer,
          feedback,
          revealedAnswerUsed: Boolean(revealedQuestionIds[currentStep.question.id]),
        },
      ]);
      setActiveFeedbackId(feedbackCardId);
    },
    [
      currentStep,
      revealedQuestionIds,
      selectedAngleId,
      setActiveFeedbackId,
      setDraftAnswersByQuestionId,
      setFloatingFeedbacks,
    ],
  );

  const dismissFloatingFeedback = useCallback(
    (feedbackId: string) => {
      const feedbackCard = floatingFeedbacks.find(
        (feedback) => feedback.id === feedbackId,
      );

      if (!feedbackCard) {
        return;
      }

      const passed = feedbackCard.feedback.score >= 60;
      const feedbackStepIndex = discussionSteps.findIndex(
        (step) => step.question.id === feedbackCard.questionId,
      );

      setAngleStateById((previous) => {
        const angleState = previous[feedbackCard.angleId];

        if (!angleState) {
          return previous;
        }

        const nextUnlocked = passed
          ? Math.min(
              Math.max(
                angleState.unlockedStepCount,
                (feedbackStepIndex >= 0 ? feedbackStepIndex : currentStepIndex) + 2,
              ),
              discussionSteps.length,
            )
          : angleState.unlockedStepCount;
        const nextAttempt = {
          id: `${feedbackCard.questionId}-${Date.now()}`,
          createdAt: new Date().toISOString(),
          userAnswer: feedbackCard.answer,
          aiFeedback: feedbackCard.feedback,
          score: feedbackCard.feedback.score,
          status: getAttemptRecordStatus(feedbackCard.feedback.score),
          revealedAnswerUsed: feedbackCard.revealedAnswerUsed,
        };

        return {
          ...previous,
          [feedbackCard.angleId]: {
            ...angleState,
            unlockedStepCount: nextUnlocked,
            attemptRecordsByQuestionId: {
              ...angleState.attemptRecordsByQuestionId,
              [feedbackCard.questionId]: [
                ...(angleState.attemptRecordsByQuestionId[feedbackCard.questionId] ??
                  []),
                nextAttempt,
              ],
            },
            answerStateByQuestionId: {
              ...angleState.answerStateByQuestionId,
              [feedbackCard.questionId]: {
                questionId: feedbackCard.questionId,
                answer: feedbackCard.answer,
                status: passed ? "passed" : "failed",
                feedback: feedbackCard.feedback,
                summary: passed ? feedbackCard.feedback.nextSuggestion : null,
                isCollapsed: passed,
                revealedAnswerUsed: feedbackCard.revealedAnswerUsed,
                updatedAt: new Date().toISOString(),
              },
            },
          },
        };
      });
      setBehaviorSignalCounts((previous) => ({
        ...previous,
        answerChecks: previous.answerChecks + 1,
      }));

      setFloatingFeedbacks((previous) => {
        const nextFeedbacks = previous.filter(
          (feedback) => feedback.id !== feedbackId,
        );
        setActiveFeedbackId((current) => {
          if (current !== feedbackId) {
            return current;
          }

          return nextFeedbacks[nextFeedbacks.length - 1]?.id ?? null;
        });
        return nextFeedbacks;
      });

      if (passed) {
        clearFocusedQuestion();
        setPreviewSource(null);
        setRevealedQuestionIds((previous) => {
          const next = { ...previous };
          delete next[feedbackCard.questionId];
          return next;
        });
      }
    },
    [
      clearFocusedQuestion,
      currentStepIndex,
      discussionSteps,
      floatingFeedbacks,
      setActiveFeedbackId,
      setAngleStateById,
      setBehaviorSignalCounts,
      setFloatingFeedbacks,
      setPreviewSource,
      setRevealedQuestionIds,
    ],
  );

  const handleSelectFeedback = useCallback(
    (feedbackId: string) => {
      setActiveFeedbackId(feedbackId);
    },
    [setActiveFeedbackId],
  );

  const handleCycleFeedback = useCallback(
    (direction: "previous" | "next") => {
      if (!floatingFeedbacks.length) {
        return;
      }

      const currentIndex = Math.max(
        floatingFeedbacks.findIndex((feedback) => feedback.id === activeFeedbackId),
        0,
      );
      const nextIndex =
        direction === "previous"
          ? (currentIndex - 1 + floatingFeedbacks.length) % floatingFeedbacks.length
          : (currentIndex + 1) % floatingFeedbacks.length;

      setActiveFeedbackId(floatingFeedbacks[nextIndex]?.id ?? null);
    },
    [activeFeedbackId, floatingFeedbacks, setActiveFeedbackId],
  );

  const handleReorderPinnedSources = useCallback(
    (nextPinnedSources: string[]) => {
      updatePinnedSourcesForCurrentAngle(() => nextPinnedSources);
    },
    [updatePinnedSourcesForCurrentAngle],
  );

  const handleReorderFeedbacks = useCallback(
    (draggedFeedbackId: string, targetFeedbackId: string) => {
      setFloatingFeedbacks((previous) => {
        const draggedIndex = previous.findIndex(
          (feedback) => feedback.id === draggedFeedbackId,
        );
        const targetIndex = previous.findIndex(
          (feedback) => feedback.id === targetFeedbackId,
        );

        if (draggedIndex < 0 || targetIndex < 0 || draggedIndex === targetIndex) {
          return previous;
        }

        const nextFeedbacks = [...previous];
        const [draggedFeedback] = nextFeedbacks.splice(draggedIndex, 1);
        nextFeedbacks.splice(targetIndex, 0, draggedFeedback!);
        return nextFeedbacks;
      });
    },
    [setFloatingFeedbacks],
  );

  const handleWorkbenchCardInserted = useCallback(
    (payload: { kind?: "feedback" | "source"; id?: string }) => {
      if (payload.kind === "feedback" && payload.id) {
        dismissFloatingFeedback(payload.id);
      }
    },
    [dismissFloatingFeedback],
  );

  return {
    handlePreviewReference,
    handleClearPreviewReference,
    handlePinSource,
    handleUnpinSource,
    handleClearAllSources,
    handleCheckCurrent,
    dismissFloatingFeedback,
    handleSelectFeedback,
    handleCycleFeedback,
    handleReorderPinnedSources,
    handleReorderFeedbacks,
    handleWorkbenchCardInserted,
  };
}
