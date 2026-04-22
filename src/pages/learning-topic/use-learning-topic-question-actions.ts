import { useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import type {
  InsertedQuestionRecord, TopicAnswerState, TopicAngleProgressState, TopicBehaviorSignalCounts,
  TopicDiscussionStep, TopicQuestionReviewState,
} from "@/features/topic-session";
import { evaluateTopicAnswer } from "@/features/topic-session";

type UseLearningTopicQuestionActionsParams = {
  selectedAngleId: string;
  setSelectedAngleId: Dispatch<SetStateAction<string>>;
  setIsAngleMenuOpen: Dispatch<SetStateAction<boolean>>;
  setAngleStateById: Dispatch<SetStateAction<Record<string, TopicAngleProgressState>>>;
  setDraftAnswersByQuestionId: Dispatch<SetStateAction<Record<string, string>>>;
  setCustomQuestionDraftsByAngleId: Dispatch<SetStateAction<Record<string, string>>>;
  currentStepIndex: number;
  currentStep: TopicDiscussionStep | null;
  discussionSteps: TopicDiscussionStep[];
  nextAngleId: string | null;
  insertedQuestions: InsertedQuestionRecord[];
  setInsertedQuestionsByAngleId: Dispatch<SetStateAction<Record<string, InsertedQuestionRecord[]>>>;
  questionReviewStateById: Record<string, TopicQuestionReviewState | undefined>;
  setQuestionReviewStateById: Dispatch<SetStateAction<Record<string, TopicQuestionReviewState | undefined>>>;
  revealedQuestionIds: Record<string, boolean>;
  setRevealedQuestionIds: Dispatch<SetStateAction<Record<string, boolean>>>;
  setBehaviorSignalCounts: Dispatch<SetStateAction<TopicBehaviorSignalCounts>>;
};

export function useLearningTopicQuestionActions({
  selectedAngleId,
  setSelectedAngleId,
  setIsAngleMenuOpen,
  setAngleStateById,
  setDraftAnswersByQuestionId,
  setCustomQuestionDraftsByAngleId,
  currentStepIndex,
  currentStep,
  discussionSteps,
  nextAngleId,
  insertedQuestions,
  setInsertedQuestionsByAngleId,
  questionReviewStateById,
  setQuestionReviewStateById,
  setRevealedQuestionIds,
  setBehaviorSignalCounts,
}: UseLearningTopicQuestionActionsParams) {
  const handleToggleHistory = useCallback(
    (questionId: string) => {
      setAngleStateById((previous) => {
        const angleState = previous[selectedAngleId];
        const current = angleState?.answerStateByQuestionId[questionId];
        if (!angleState || !current) {
          return previous;
        }
        return {
          ...previous,
          [selectedAngleId]: {
            ...angleState,
            answerStateByQuestionId: {
              ...angleState.answerStateByQuestionId,
              [questionId]: {
                ...current,
                isCollapsed: !current.isCollapsed,
              },
            },
          },
        };
      });
    },
    [selectedAngleId, setAngleStateById],
  );

  const handleInsertQuestion = useCallback(
    (targetId: string, prompt: string) => {
      const trimmedPrompt = prompt.trim();
      if (!trimmedPrompt) {
        return;
      }
      const createdAt = new Date().toISOString();
      setInsertedQuestionsByAngleId((previous) => ({
        ...previous,
        [selectedAngleId]: [
          ...(previous[selectedAngleId] ?? []),
          {
            id: `inserted-question-${Date.now()}`,
            angleId: selectedAngleId,
            targetId,
            prompt: trimmedPrompt,
            createdAt,
            visualState: "pulsing",
          },
        ],
      }));
      setBehaviorSignalCounts((previous) => ({
        ...previous,
        branchQuestionCount: previous.branchQuestionCount + 1,
      }));
    },
    [selectedAngleId, setBehaviorSignalCounts, setInsertedQuestionsByAngleId],
  );

  const handleDeleteInsertedQuestion = useCallback(
    (questionId: string) => {
      setInsertedQuestionsByAngleId((previous) => ({
        ...previous,
        [selectedAngleId]: (previous[selectedAngleId] ?? []).filter(
          (question) => question.id !== questionId,
        ),
      }));
    },
    [selectedAngleId, setInsertedQuestionsByAngleId],
  );

  const toggleQuestionReviewFlag = useCallback(
    (
      questionId: string,
      field: keyof Omit<TopicQuestionReviewState, "updatedAt">,
    ) => {
      const currentState = questionReviewStateById[questionId] ?? {};
      const nextFlagValue = !Boolean(currentState[field]);
      const updatedAt = new Date().toISOString();
      setQuestionReviewStateById((previous) => {
        const nextState: TopicQuestionReviewState = {
          ...(previous[questionId] ?? {}),
          [field]: nextFlagValue,
          updatedAt,
        };
        if (
          !nextState.pending &&
          !nextState.bookmarked &&
          !nextState.selfMarkedWeak
        ) {
          const nextReviewStateById = { ...previous };
          delete nextReviewStateById[questionId];
          return nextReviewStateById;
        }

        return {
          ...previous,
          [questionId]: nextState,
        };
      });
      if (field === "pending" && nextFlagValue) {
        setBehaviorSignalCounts((previous) => ({
          ...previous,
          pendingMarkCount: previous.pendingMarkCount + 1,
        }));
      }
    },
    [questionReviewStateById, setBehaviorSignalCounts, setQuestionReviewStateById],
  );

  const handleToggleQuestionPending = useCallback(
    (questionId: string) => {
      toggleQuestionReviewFlag(questionId, "pending");
    },
    [toggleQuestionReviewFlag],
  );

  const handleToggleQuestionBookmark = useCallback(
    (questionId: string) => {
      toggleQuestionReviewFlag(questionId, "bookmarked");
    },
    [toggleQuestionReviewFlag],
  );

  const handleToggleQuestionWeak = useCallback(
    (questionId: string) => {
      toggleQuestionReviewFlag(questionId, "selfMarkedWeak");
    },
    [toggleQuestionReviewFlag],
  );

  const updateInsertedQuestionForCurrentAngle = useCallback(
    (
      questionId: string,
      updater: (question: InsertedQuestionRecord) => InsertedQuestionRecord,
    ) => {
      setInsertedQuestionsByAngleId((previous) => ({
        ...previous,
        [selectedAngleId]: (previous[selectedAngleId] ?? []).map((question) =>
          question.id === questionId ? updater(question) : question,
        ),
      }));
    },
    [selectedAngleId, setInsertedQuestionsByAngleId],
  );

  const handleInsertedQuestionDraftChange = useCallback(
    (questionId: string, draft: string) => {
      updateInsertedQuestionForCurrentAngle(questionId, (question) => ({
        ...question,
        answerDraft: draft,
      }));
    },
    [updateInsertedQuestionForCurrentAngle],
  );

  const handleCheckInsertedQuestion = useCallback(
    (questionId: string, answer: string) => {
      const currentQuestion = insertedQuestions.find(
        (question) => question.id === questionId,
      );
      if (!currentQuestion) {
        return;
      }
      const feedback = evaluateTopicAnswer(
        {
          id: currentQuestion.id,
          angleId: selectedAngleId,
          label: "My question",
          prompt: currentQuestion.prompt,
          x: 0,
          y: 0,
          visualState: currentQuestion.visualState,
          keywordGroups: [
            ["why", "because", "understand", "rule", "flow"],
            ["auth", "jwt", "controller", "service", "token"],
          ],
          bonusKeywords: ["specific", "responsibility", "validation", "source"],
        },
        answer,
      );
      const passed = feedback.score >= 60;
      const answerState: TopicAnswerState = {
        questionId,
        answer,
        status: passed ? "passed" : "failed",
        feedback,
        summary: passed ? feedback.nextSuggestion : null,
        isCollapsed: passed,
        updatedAt: new Date().toISOString(),
      };

      updateInsertedQuestionForCurrentAngle(questionId, (question) => ({
        ...question,
        answerDraft: answer,
        answerState,
        visualState: passed ? "lit" : "pulsing",
      }));
      setBehaviorSignalCounts((previous) => ({
        ...previous,
        answerChecks: previous.answerChecks + 1,
      }));
    },
    [
      insertedQuestions,
      selectedAngleId,
      setBehaviorSignalCounts,
      updateInsertedQuestionForCurrentAngle,
    ],
  );

  const handleDraftAnswerChange = useCallback(
    (questionId: string, draft: string) => {
      setDraftAnswersByQuestionId((previous) => {
        if (previous[questionId] === draft) {
          return previous;
        }

        return {
          ...previous,
          [questionId]: draft,
        };
      });
    },
    [setDraftAnswersByQuestionId],
  );

  const handleCustomQuestionDraftChange = useCallback(
    (draft: string) => {
      setCustomQuestionDraftsByAngleId((previous) => {
        if (previous[selectedAngleId] === draft) {
          return previous;
        }
        return {
          ...previous,
          [selectedAngleId]: draft,
        };
      });
    },
    [selectedAngleId, setCustomQuestionDraftsByAngleId],
  );

  const handleSkipCurrent = useCallback(() => {
    if (!currentStep) {
      return;
    }
    setAngleStateById((previous) => {
      const angleState = previous[selectedAngleId];
      if (!angleState) {
        return previous;
      }
      return {
        ...previous,
        [selectedAngleId]: {
          ...angleState,
          unlockedStepCount: Math.min(
            Math.max(angleState.unlockedStepCount, currentStepIndex + 2),
            discussionSteps.length,
          ),
          answerStateByQuestionId: {
            ...angleState.answerStateByQuestionId,
            [currentStep.question.id]: {
              questionId: currentStep.question.id,
              answer: "",
              status: "skipped",
              feedback: null,
              summary: "Skipped for now.",
              isCollapsed: true,
              updatedAt: new Date().toISOString(),
            },
          },
        },
      };
    });
    setBehaviorSignalCounts((previous) => ({
      ...previous,
      skipCount: previous.skipCount + 1,
    }));
  }, [
    currentStep,
    currentStepIndex,
    discussionSteps.length,
    selectedAngleId,
    setAngleStateById,
    setBehaviorSignalCounts,
  ]);

  const handleTryAgain = useCallback(() => {
    if (!currentStep) {
      return;
    }
    setAngleStateById((previous) => {
      const angleState = previous[selectedAngleId];
      if (!angleState) {
        return previous;
      }
      const nextAnswers = { ...angleState.answerStateByQuestionId };
      delete nextAnswers[currentStep.question.id];
      return {
        ...previous,
        [selectedAngleId]: {
          ...angleState,
          answerStateByQuestionId: nextAnswers,
        },
      };
    });
  }, [currentStep, selectedAngleId, setAngleStateById]);

  const handleRevealAnswer = useCallback(() => {
    if (!currentStep?.question.revealAnswer) {
      return;
    }

    setDraftAnswersByQuestionId((previous) => ({
      ...previous,
      [currentStep.question.id]: currentStep.question.revealAnswer ?? "",
    }));
    setRevealedQuestionIds((previous) => ({
      ...previous,
      [currentStep.question.id]: true,
    }));
  }, [currentStep, setDraftAnswersByQuestionId, setRevealedQuestionIds]);

  const handleSubmitCustomQuestion = useCallback(
    (question: string) => {
      setAngleStateById((previous) => ({
        ...previous,
        [selectedAngleId]: {
          ...previous[selectedAngleId],
          customQuestion: question,
          unlockedStepCount: 1,
          answerStateByQuestionId: {},
          attemptRecordsByQuestionId: {},
        },
      }));
      setCustomQuestionDraftsByAngleId((previous) => ({
        ...previous,
        [selectedAngleId]: question,
      }));
    },
    [selectedAngleId, setAngleStateById, setCustomQuestionDraftsByAngleId],
  );

  const handleExploreAnotherAngle = useCallback(() => {
    if (!nextAngleId) {
      return;
    }

    setSelectedAngleId(nextAngleId);
    setIsAngleMenuOpen(false);
  }, [nextAngleId, setIsAngleMenuOpen, setSelectedAngleId]);

  const handleAskFollowUp = useCallback(() => {
    setSelectedAngleId("angle-custom-followup");
    setIsAngleMenuOpen(false);
  }, [setIsAngleMenuOpen, setSelectedAngleId]);

  return {
    handleToggleHistory,
    handleInsertQuestion,
    handleDeleteInsertedQuestion,
    handleToggleQuestionPending,
    handleToggleQuestionBookmark,
    handleToggleQuestionWeak,
    handleInsertedQuestionDraftChange,
    handleCheckInsertedQuestion,
    handleDraftAnswerChange,
    handleCustomQuestionDraftChange,
    handleSkipCurrent,
    handleTryAgain,
    handleRevealAnswer,
    handleSubmitCustomQuestion,
    handleExploreAnotherAngle,
    handleAskFollowUp,
  };
}
