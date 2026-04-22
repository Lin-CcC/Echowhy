import { applyReviewScope, type ReviewQueueItem } from "@/features/review";
import type {
  QuestionLocatorCounts,
  QuestionLocatorFilter,
  QuestionLocatorModel,
} from "./types";

type BuildQuestionLocatorModelOptions = {
  items: ReviewQueueItem[];
  filter: QuestionLocatorFilter;
  topicId: string;
  angleId: string;
  orderedQuestionIds: string[];
};

function clampRelativePosition(value: number) {
  return Math.max(0, Math.min(1, value));
}

function getRelativeTop(
  questionId: string,
  orderedQuestionIds: string[],
) {
  const orderIndex = orderedQuestionIds.indexOf(questionId);

  if (orderIndex < 0) {
    return null;
  }

  if (orderedQuestionIds.length <= 1) {
    return 0.5;
  }

  return clampRelativePosition(orderIndex / (orderedQuestionIds.length - 1));
}

export function buildQuestionLocatorModel({
  items,
  filter,
  topicId,
  angleId,
  orderedQuestionIds,
}: BuildQuestionLocatorModelOptions): QuestionLocatorModel {
  const scopedItems = applyReviewScope(items, {
    filter,
    topicId,
    angleId,
  });

  const locatorItems = scopedItems
    .map((item) => {
      const relativeTop = getRelativeTop(item.questionId, orderedQuestionIds);

      return relativeTop === null
        ? null
        : {
            questionId: item.questionId,
            questionPrompt: item.questionPrompt,
            relativeTop,
          };
    })
    .filter(
      (
        item,
      ): item is QuestionLocatorModel["items"][number] => Boolean(item),
    )
    .sort((left, right) => left.relativeTop - right.relativeTop);

  return {
    filter,
    totalCount: locatorItems.length,
    items: locatorItems,
  };
}

export function buildQuestionLocatorCounts({
  items,
  topicId,
  angleId,
}: Omit<BuildQuestionLocatorModelOptions, "filter" | "orderedQuestionIds">): QuestionLocatorCounts {
  return {
    weak: applyReviewScope(items, {
      filter: "weak",
      topicId,
      angleId,
    }).length,
    unanswered: applyReviewScope(items, {
      filter: "unanswered",
      topicId,
      angleId,
    }).length,
    pending: applyReviewScope(items, {
      filter: "pending",
      topicId,
      angleId,
    }).length,
    bookmarked: applyReviewScope(items, {
      filter: "bookmarked",
      topicId,
      angleId,
    }).length,
  };
}
