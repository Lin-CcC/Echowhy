import { describe, expect, it } from "vitest";
import type { TopicAnswerState, TopicChapterSummaryState } from "@/features/topic-session";
import { buildLearningFloatingAssistantState } from "./learning-floating-assistant";

function createFeedbackState(): TopicAnswerState {
  return {
    questionId: "q-1",
    answer: "The server must issue the token after credentials are checked.",
    status: "passed",
    feedback: {
      score: 82,
      level: "good",
      label: "Good!",
      correctPoints: ["You identified the login timing."],
      vaguePoints: [],
      missingPoints: ["Name the exact trust boundary."],
      nextSuggestion: "Connect token issuance to later protected requests.",
      analysisDimensions: ["causal-link"],
    },
    summary: null,
    isCollapsed: false,
  };
}

function createChapterSummaryState(
  overrides: Partial<TopicChapterSummaryState> = {},
): TopicChapterSummaryState {
  return {
    status: "provisional",
    reason: "continued",
    recommendedAction: "review-question",
    firstReachedAt: "2026-04-23T10:00:00.000Z",
    lastUpdatedAt: "2026-04-23T10:05:00.000Z",
    reviewQuestionId: "q-2",
    ...overrides,
  };
}

describe("buildLearningFloatingAssistantState", () => {
  it("prioritizes chapter guidance when the current chapter completion card is visible", () => {
    const state = buildLearningFloatingAssistantState({
      hasDraft: false,
      showCompletionCard: true,
      chapterSummaryState: createChapterSummaryState(),
      currentAnswerState: createFeedbackState(),
    });

    expect(state).toMatchObject({
      mode: "chapter",
      eyebrow: "Chapter note",
      tone: "amber",
      primaryAction: "review-question",
    });
  });

  it("surfaces feedback with response analysis when the current answer has feedback", () => {
    const state = buildLearningFloatingAssistantState({
      hasDraft: false,
      showCompletionCard: false,
      currentAnswerState: createFeedbackState(),
    });

    expect(state).toMatchObject({
      mode: "feedback",
      eyebrow: "Feedback",
      tone: "emerald",
      primaryAction: "continue-ladder",
    });
    expect(state.detail).toContain("Causal Link");
  });

  it("keeps the insert-question role visible when the user has a floating draft", () => {
    const state = buildLearningFloatingAssistantState({
      hasDraft: true,
      showCompletionCard: false,
    });

    expect(state).toMatchObject({
      mode: "draft",
      eyebrow: "Draft",
      primaryAction: "insert-question",
    });
  });
});
