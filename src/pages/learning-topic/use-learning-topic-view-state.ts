import { useCallback, useEffect, useRef, useState } from "react";
import {
  reduceQuestionLocatorFilter,
  type QuestionLocatorFilter,
} from "@/features/question-locator";
import { resolveRecoverableQuestionId } from "@/features/topic-session";

type RecoverableQuestionOptions = Parameters<typeof resolveRecoverableQuestionId>[0];

type UseLearningTopicViewStateOptions = {
  topicId: string;
  selectedAngleId: string;
  routeQuestionId: string | undefined;
  discussionSteps: RecoverableQuestionOptions["discussionSteps"];
  visibleStepCount: RecoverableQuestionOptions["visibleStepCount"];
  chapterReviewQuestionId: string | null | undefined;
  focusQuestion: (questionId: string) => void;
};

export function useLearningTopicViewState({
  topicId,
  selectedAngleId,
  routeQuestionId,
  discussionSteps,
  visibleStepCount,
  chapterReviewQuestionId,
  focusQuestion,
}: UseLearningTopicViewStateOptions) {
  const [activeScanFilter, setActiveScanFilter] =
    useState<QuestionLocatorFilter | null>(null);
  const [highlightedBlockId, setHighlightedBlockId] = useState<string | null>(
    null,
  );
  const highlightTimeoutRef = useRef<number | null>(null);
  const consumedRoutedScrollKeyRef = useRef<string | null>(null);
  const consumedRoutedFocusKeyRef = useRef<string | null>(null);

  const scrollToQuestion = useCallback((questionId: string) => {
    const element = document.getElementById(`question-${questionId}`);

    if (!element) {
      return;
    }

    element.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const triggerBlockHighlight = useCallback((blockId: string) => {
    setHighlightedBlockId(blockId);

    if (highlightTimeoutRef.current) {
      window.clearTimeout(highlightTimeoutRef.current);
    }

    highlightTimeoutRef.current = window.setTimeout(() => {
      setHighlightedBlockId(null);
    }, 1120);
  }, []);

  useEffect(() => {
    if (!routeQuestionId) {
      consumedRoutedScrollKeyRef.current = null;
      consumedRoutedFocusKeyRef.current = null;
      return;
    }

    const routeKey = `${topicId}:${selectedAngleId}:${routeQuestionId}`;
    const routedFocusQuestionId = resolveRecoverableQuestionId({
      discussionSteps,
      visibleStepCount,
      requestedQuestionId: routeQuestionId,
    });

    if (
      routedFocusQuestionId &&
      consumedRoutedFocusKeyRef.current !== routeKey
    ) {
      focusQuestion(routedFocusQuestionId);
      consumedRoutedFocusKeyRef.current = routeKey;
    }

    if (consumedRoutedScrollKeyRef.current === routeKey) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const questionElement = document.getElementById(
        `question-${routeQuestionId}`,
      );

      if (!questionElement) {
        return;
      }

      questionElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      consumedRoutedScrollKeyRef.current = routeKey;
    }, 120);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [
    discussionSteps,
    focusQuestion,
    routeQuestionId,
    selectedAngleId,
    topicId,
    visibleStepCount,
  ]);

  useEffect(
    () => () => {
      if (highlightTimeoutRef.current) {
        window.clearTimeout(highlightTimeoutRef.current);
      }
    },
    [],
  );

  const handleSelectRecoverableQuestion = useCallback(
    (questionId: string) => {
      const recoverableQuestionId = resolveRecoverableQuestionId({
        discussionSteps,
        visibleStepCount,
        requestedQuestionId: questionId,
      });

      if (recoverableQuestionId) {
        focusQuestion(recoverableQuestionId);
      }

      scrollToQuestion(questionId);
    },
    [discussionSteps, focusQuestion, scrollToQuestion, visibleStepCount],
  );

  const handleResumeQuestion = useCallback(
    (questionId: string) => {
      focusQuestion(questionId);
      scrollToQuestion(questionId);
    },
    [focusQuestion, scrollToQuestion],
  );

  const handleResumeClosureQuestion = useCallback(() => {
    if (!chapterReviewQuestionId) {
      return;
    }

    handleResumeQuestion(chapterReviewQuestionId);
  }, [chapterReviewQuestionId, handleResumeQuestion]);

  const handleToggleScanFilter = useCallback(
    (filter: QuestionLocatorFilter) => {
      setActiveScanFilter((current) =>
        reduceQuestionLocatorFilter(current, {
          type: "toggle-filter",
          filter,
        }),
      );
    },
    [],
  );

  const handleClearScanFilter = useCallback(() => {
    setActiveScanFilter((current) =>
      reduceQuestionLocatorFilter(current, {
        type: "clear",
      }),
    );
  }, []);

  const handleSelectLocatorQuestion = useCallback(
    (questionId: string) => {
      handleSelectRecoverableQuestion(questionId);
      setActiveScanFilter((current) =>
        reduceQuestionLocatorFilter(current, {
          type: "select-locator-item",
        }),
      );
    },
    [handleSelectRecoverableQuestion],
  );

  const handleFocusReferenceBlock = useCallback(
    (blockId: string, questionId?: string) => {
      const element =
        (questionId
          ? document.getElementById(`question-${questionId}`)
          : null) ??
        (blockId ? document.getElementById(`block-${blockId}`) : null);

      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      if (blockId) {
        triggerBlockHighlight(blockId);
      }
    },
    [triggerBlockHighlight],
  );

  return {
    activeScanFilter,
    highlightedBlockId,
    scrollToQuestion,
    handleSelectRecoverableQuestion,
    handleResumeQuestion,
    handleResumeClosureQuestion,
    handleToggleScanFilter,
    handleClearScanFilter,
    handleSelectLocatorQuestion,
    handleFocusReferenceBlock,
  };
}
