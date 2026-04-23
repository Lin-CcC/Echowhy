import { describe, expect, it } from "vitest";
import {
  createTopicChapterSummaryState,
  getTopicChapterSummaryPresentation,
} from "./chapter-summary";
import type { TopicChapterClosureState } from "./chapter-closure";

function createClosureState(
  overrides: Partial<TopicChapterClosureState> = {},
): TopicChapterClosureState {
  return {
    status: "grounded",
    canMoveOn: true,
    summary: "This chapter is grounded enough to move on.",
    detail: "The current chain has enough structure to continue.",
    reviewQuestionId: null,
    reviewReason: null,
    ...overrides,
  };
}

describe("createTopicChapterSummaryState", () => {
  it("creates a persisted summary record for the current closure state", () => {
    const summaryState = createTopicChapterSummaryState({
      closureState: createClosureState(),
      now: "2026-04-23T10:00:00.000Z",
    });

    expect(summaryState).toMatchObject({
      status: "grounded",
      reason: "all-passed",
      recommendedAction: "explore-next-angle",
      reviewQuestionId: null,
      firstReachedAt: "2026-04-23T10:00:00.000Z",
      lastUpdatedAt: "2026-04-23T10:00:00.000Z",
    });
  });

  it("preserves firstReachedAt when the chapter stays in the same status", () => {
    const summaryState = createTopicChapterSummaryState({
      closureState: createClosureState({
        status: "provisional",
        reviewQuestionId: "q-2",
        reviewReason: "pending",
      }),
      previousState: {
        status: "provisional",
        reason: "continued",
        recommendedAction: "review-question",
        firstReachedAt: "2026-04-23T10:00:00.000Z",
        lastUpdatedAt: "2026-04-23T10:03:00.000Z",
        reviewQuestionId: "q-1",
      },
      now: "2026-04-23T10:05:00.000Z",
    });

    expect(summaryState.firstReachedAt).toBe("2026-04-23T10:00:00.000Z");
    expect(summaryState.lastUpdatedAt).toBe("2026-04-23T10:05:00.000Z");
    expect(summaryState.reason).toBe("pending");
    expect(summaryState.reviewQuestionId).toBe("q-2");
  });

  it("resets firstReachedAt when the chapter moves into a new status", () => {
    const summaryState = createTopicChapterSummaryState({
      closureState: createClosureState({
        status: "unsettled",
        canMoveOn: false,
        reviewQuestionId: "q-3",
        reviewReason: "unanswered",
      }),
      previousState: {
        status: "provisional",
        reason: "pending",
        recommendedAction: "review-question",
        firstReachedAt: "2026-04-23T10:00:00.000Z",
        lastUpdatedAt: "2026-04-23T10:02:00.000Z",
        reviewQuestionId: "q-2",
      },
      now: "2026-04-23T10:07:00.000Z",
    });

    expect(summaryState.firstReachedAt).toBe("2026-04-23T10:07:00.000Z");
    expect(summaryState.lastUpdatedAt).toBe("2026-04-23T10:07:00.000Z");
    expect(summaryState.recommendedAction).toBe("stay-on-chapter");
  });
});

describe("getTopicChapterSummaryPresentation", () => {
  it("maps a persisted summary state back into completion-card copy", () => {
    const presentation = getTopicChapterSummaryPresentation({
      status: "provisional",
      reason: "pending",
      recommendedAction: "review-question",
      firstReachedAt: "2026-04-23T10:00:00.000Z",
      lastUpdatedAt: "2026-04-23T10:05:00.000Z",
      reviewQuestionId: "q-2",
    });

    expect(presentation).toMatchObject({
      heading: "Chapter Ready To Move On",
      summary: "You can continue, but one question is still marked for review.",
    });
  });
});
