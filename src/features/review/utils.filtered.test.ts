import { describe, expect, it } from "vitest";
import type { ReviewQueueItem } from "./types";
import { applyReviewScope } from "./utils";

function createReviewQueueItem(
  overrides: Partial<ReviewQueueItem> = {},
): ReviewQueueItem {
  return {
    id: overrides.id ?? "topic-1:angle-main:q-1",
    topicId: overrides.topicId ?? "topic-1",
    moduleId: overrides.moduleId ?? "module-1",
    moduleTitle: overrides.moduleTitle ?? "JWT timing",
    angleId: overrides.angleId ?? "angle-main",
    angleTitle: overrides.angleTitle ?? "Request flow",
    questionId: overrides.questionId ?? "q-1",
    questionPrompt: overrides.questionPrompt ?? "Why does login check password first?",
    sourceLabel: overrides.sourceLabel ?? "RBAC Project",
    source: overrides.source ?? "main",
    status: overrides.status ?? "answered-good",
    isPending: overrides.isPending ?? false,
    isBookmarked: overrides.isBookmarked ?? false,
    isSelfMarkedWeak: overrides.isSelfMarkedWeak ?? false,
    isWeak: overrides.isWeak ?? false,
    latestActivityAt: overrides.latestActivityAt ?? "2026-04-22T10:00:00.000Z",
    latestAnswer: overrides.latestAnswer ?? null,
    latestFeedback: overrides.latestFeedback ?? null,
    summary: overrides.summary ?? null,
    attempts: overrides.attempts ?? [],
    routeSearch: overrides.routeSearch ?? {
      angle: overrides.angleId ?? "angle-main",
      question: overrides.questionId ?? "q-1",
    },
    reviewState: overrides.reviewState ?? null,
  };
}

describe("applyReviewScope", () => {
  it("keeps only the requested filter inside the requested topic and angle", () => {
    const result = applyReviewScope(
      [
        createReviewQueueItem({
          questionId: "q-1",
          isWeak: true,
          status: "answered-weak",
        }),
        createReviewQueueItem({
          id: "topic-1:angle-main:q-2",
          questionId: "q-2",
          isWeak: false,
          status: "answered-good",
        }),
        createReviewQueueItem({
          id: "topic-1:angle-secondary:q-3",
          angleId: "angle-secondary",
          angleTitle: "JWT timing",
          questionId: "q-3",
          isWeak: true,
          status: "answered-weak",
          routeSearch: {
            angle: "angle-secondary",
            question: "q-3",
          },
        }),
        createReviewQueueItem({
          id: "topic-2:angle-main:q-4",
          topicId: "topic-2",
          moduleTitle: "Another topic",
          questionId: "q-4",
          isWeak: true,
          status: "answered-weak",
        }),
      ],
      {
        filter: "weak",
        topicId: "topic-1",
        angleId: "angle-main",
      },
    );

    expect(result.map((item) => item.questionId)).toEqual(["q-1"]);
  });

  it("returns all topic-scoped questions when no filter is provided", () => {
    const result = applyReviewScope(
      [
        createReviewQueueItem({
          questionId: "q-1",
          status: "unanswered",
        }),
        createReviewQueueItem({
          id: "topic-1:angle-main:q-2",
          questionId: "q-2",
          isPending: true,
        }),
        createReviewQueueItem({
          id: "topic-2:angle-main:q-3",
          topicId: "topic-2",
          questionId: "q-3",
        }),
      ],
      {
        topicId: "topic-1",
      },
    );

    expect(result.map((item) => item.questionId)).toEqual(["q-1", "q-2"]);
  });
});
