import { describe, expect, it } from "vitest";
import type { ReviewQueueItem } from "@/features/review";
import {
  buildQuestionLocatorCounts,
  buildQuestionLocatorModel,
  reduceQuestionLocatorFilter,
} from "./utils";

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
    analysisDimensions: overrides.analysisDimensions ?? [],
    summary: overrides.summary ?? null,
    attempts: overrides.attempts ?? [],
    routeSearch: overrides.routeSearch ?? {
      angle: overrides.angleId ?? "angle-main",
      question: overrides.questionId ?? "q-1",
    },
    reviewState: overrides.reviewState ?? null,
  };
}

describe("buildQuestionLocatorModel", () => {
  it("returns relative locator points only for the active filter in the current angle", () => {
    const model = buildQuestionLocatorModel({
      items: [
        createReviewQueueItem({
          questionId: "q-1",
          status: "unanswered",
        }),
        createReviewQueueItem({
          id: "topic-1:angle-main:q-2",
          questionId: "q-2",
          isPending: true,
          status: "answered-good",
        }),
        createReviewQueueItem({
          id: "topic-1:angle-main:q-3",
          questionId: "q-3",
          isWeak: true,
          status: "answered-weak",
        }),
        createReviewQueueItem({
          id: "topic-1:angle-secondary:q-4",
          angleId: "angle-secondary",
          angleTitle: "JWT timing",
          questionId: "q-4",
          isWeak: true,
          status: "answered-weak",
          routeSearch: {
            angle: "angle-secondary",
            question: "q-4",
          },
        }),
      ],
      filter: "weak",
      topicId: "topic-1",
      angleId: "angle-main",
      orderedQuestionIds: ["q-1", "q-2", "q-3"],
    });

    expect(model.filter).toBe("weak");
    expect(model.totalCount).toBe(1);
    expect(model.items).toEqual([
      {
        questionId: "q-3",
        questionPrompt: "Why does login check password first?",
        relativeTop: 1,
      },
    ]);
  });

  it("normalizes point positions when multiple questions match", () => {
    const model = buildQuestionLocatorModel({
      items: [
        createReviewQueueItem({
          questionId: "q-1",
          status: "unanswered",
        }),
        createReviewQueueItem({
          id: "topic-1:angle-main:q-2",
          questionId: "q-2",
          status: "unanswered",
        }),
        createReviewQueueItem({
          id: "topic-1:angle-main:q-3",
          questionId: "q-3",
          status: "answered-good",
        }),
      ],
      filter: "unanswered",
      topicId: "topic-1",
      angleId: "angle-main",
      orderedQuestionIds: ["q-1", "q-2", "q-3"],
    });

    expect(model.items.map((item) => item.questionId)).toEqual(["q-1", "q-2"]);
    expect(model.items[0]?.relativeTop).toBe(0);
    expect(model.items[1]?.relativeTop).toBe(0.5);
  });
});

describe("buildQuestionLocatorCounts", () => {
  it("builds scan counts for the current topic angle only", () => {
    const counts = buildQuestionLocatorCounts({
      items: [
        createReviewQueueItem({
          questionId: "q-1",
          status: "unanswered",
        }),
        createReviewQueueItem({
          id: "topic-1:angle-main:q-2",
          questionId: "q-2",
          isPending: true,
          status: "answered-good",
        }),
        createReviewQueueItem({
          id: "topic-1:angle-main:q-3",
          questionId: "q-3",
          isWeak: true,
          status: "answered-weak",
        }),
        createReviewQueueItem({
          id: "topic-1:angle-main:q-4",
          questionId: "q-4",
          isBookmarked: true,
          status: "answered-good",
        }),
        createReviewQueueItem({
          id: "topic-1:angle-secondary:q-5",
          angleId: "angle-secondary",
          angleTitle: "JWT timing",
          questionId: "q-5",
          isWeak: true,
          status: "answered-weak",
          routeSearch: {
            angle: "angle-secondary",
            question: "q-5",
          },
        }),
      ],
      topicId: "topic-1",
      angleId: "angle-main",
    });

    expect(counts).toEqual({
      weak: 1,
      unanswered: 1,
      pending: 1,
      bookmarked: 1,
    });
  });
});

describe("reduceQuestionLocatorFilter", () => {
  it("toggles the selected filter on and off", () => {
    expect(
      reduceQuestionLocatorFilter(null, {
        type: "toggle-filter",
        filter: "weak",
      }),
    ).toBe("weak");

    expect(
      reduceQuestionLocatorFilter("weak", {
        type: "toggle-filter",
        filter: "weak",
      }),
    ).toBeNull();
  });

  it("switches to the next filter when another scan is selected", () => {
    expect(
      reduceQuestionLocatorFilter("weak", {
        type: "toggle-filter",
        filter: "pending",
      }),
    ).toBe("pending");
  });

  it("returns to dormant after clearing or selecting a locator point", () => {
    expect(
      reduceQuestionLocatorFilter("bookmarked", {
        type: "clear",
      }),
    ).toBeNull();

    expect(
      reduceQuestionLocatorFilter("unanswered", {
        type: "select-locator-item",
      }),
    ).toBeNull();
  });
});
