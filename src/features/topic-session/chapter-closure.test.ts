import { describe, expect, it } from "vitest";
import { getTopicChapterClosureState } from "./chapter-closure";
import type {
  TopicAngleProgressState,
  TopicDiscussionStep,
  TopicQuestionReviewState,
} from "./types";

function createDiscussionSteps(): TopicDiscussionStep[] {
  return [
    {
      id: "step-1",
      angleId: "angle-main",
      block: {
        id: "exp-1",
        title: "Step 1",
        content: "First explanation",
        order: 1,
      },
      question: {
        id: "q-1",
        angleId: "angle-main",
        label: "Q1",
        prompt: "Why first?",
        x: 0,
        y: 0,
        visualState: "dim",
      },
    },
    {
      id: "step-2",
      angleId: "angle-main",
      block: {
        id: "exp-2",
        title: "Step 2",
        content: "Second explanation",
        order: 2,
      },
      question: {
        id: "q-2",
        angleId: "angle-main",
        label: "Q2",
        prompt: "Why second?",
        x: 0,
        y: 0,
        visualState: "dim",
      },
    },
  ];
}

function createAngleState(
  overrides: Partial<TopicAngleProgressState> = {},
): TopicAngleProgressState {
  return {
    unlockedStepCount: 2,
    answerStateByQuestionId: {},
    attemptRecordsByQuestionId: {},
    customQuestion: "",
    generatedDiscussionSteps: [],
    ...overrides,
  };
}

describe("getTopicChapterClosureState", () => {
  it("marks a fully answered chapter as grounded", () => {
    const closure = getTopicChapterClosureState({
      discussionSteps: createDiscussionSteps(),
      angleState: createAngleState({
        answerStateByQuestionId: {
          "q-1": {
            questionId: "q-1",
            answer: "first",
            status: "passed",
            feedback: null,
            summary: null,
            isCollapsed: true,
          },
          "q-2": {
            questionId: "q-2",
            answer: "second",
            status: "passed",
            feedback: null,
            summary: null,
            isCollapsed: true,
          },
        },
      }),
      questionReviewStateById: {},
    });

    expect(closure).toMatchObject({
      status: "grounded",
      canMoveOn: true,
      reviewQuestionId: null,
    });
    expect(closure.summary).toContain("grounded enough to move on");
  });

  it("marks a handled but unresolved chapter as provisional and points back to the right question", () => {
    const closure = getTopicChapterClosureState({
      discussionSteps: createDiscussionSteps(),
      angleState: createAngleState({
        answerStateByQuestionId: {
          "q-1": {
            questionId: "q-1",
            answer: "first",
            status: "passed",
            feedback: null,
            summary: null,
            isCollapsed: true,
          },
          "q-2": {
            questionId: "q-2",
            answer: "",
            status: "continued",
            feedback: null,
            summary: "Continued via ladder.",
            isCollapsed: true,
          },
        },
      }),
      questionReviewStateById: {
        "q-2": {
          pending: true,
        } satisfies TopicQuestionReviewState,
      },
    });

    expect(closure).toMatchObject({
      status: "provisional",
      canMoveOn: true,
      reviewQuestionId: "q-2",
      reviewReason: "pending",
    });
    expect(closure.summary).toContain("continue");
  });

  it("keeps the chapter unsettled when the visible chain still has an unanswered node", () => {
    const closure = getTopicChapterClosureState({
      discussionSteps: createDiscussionSteps(),
      angleState: createAngleState({
        answerStateByQuestionId: {
          "q-1": {
            questionId: "q-1",
            answer: "first",
            status: "passed",
            feedback: null,
            summary: null,
            isCollapsed: true,
          },
        },
      }),
      questionReviewStateById: {},
    });

    expect(closure).toMatchObject({
      status: "unsettled",
      canMoveOn: false,
      reviewQuestionId: "q-2",
      reviewReason: "unanswered",
    });
    expect(closure.summary).toContain("unsettled");
  });
});
