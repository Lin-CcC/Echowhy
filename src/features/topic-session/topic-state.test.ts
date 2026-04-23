import { describe, expect, it } from "vitest";
import * as topicState from "./topic-state";

describe("applyContinueLadderProgress", () => {
  it("unlocks the next step while keeping the current question as unanswered in-flow history", () => {
    if (!("applyContinueLadderProgress" in topicState)) {
      expect(topicState).toHaveProperty("applyContinueLadderProgress");
      return;
    }

    const nextState = topicState.applyContinueLadderProgress({
      angleState: {
        unlockedStepCount: 1,
        answerStateByQuestionId: {},
        attemptRecordsByQuestionId: {},
        customQuestion: "",
        generatedDiscussionSteps: [],
      },
      currentStepIndex: 0,
      discussionStepCount: 3,
      questionId: "q-1",
      currentStep: {
        id: "step-1",
        angleId: "angle-main",
        block: {
          id: "b-1",
          title: "Step 1",
          content: "Current explanation",
          order: 1,
        },
        question: {
          id: "q-1",
          angleId: "angle-main",
          label: "Q1",
          prompt: "Why does this happen?",
          x: 0,
          y: 0,
          visualState: "dim",
          referenceIds: ["ref-1"],
          keywordGroups: [["why", "because"]],
          bonusKeywords: ["flow"],
        },
        defaultReferenceId: "ref-1",
      },
    });

    expect(nextState.unlockedStepCount).toBe(2);
    expect(nextState.answerStateByQuestionId).toMatchObject({
      "q-1": {
        questionId: "q-1",
        answer: "",
        status: "continued",
        feedback: null,
        summary: "Continued via ladder.",
        isCollapsed: true,
      },
    });
    expect(nextState.generatedDiscussionSteps).toHaveLength(1);
    expect(nextState.generatedDiscussionSteps?.[0]).toMatchObject({
      angleId: "angle-main",
      afterQuestionId: "q-1",
      defaultReferenceId: "ref-1",
      block: {
        content: expect.any(String),
      },
      question: {
        prompt: expect.any(String),
      },
    });
  });
});

describe("resolveCurrentDiscussionStepIndex", () => {
  it("focuses an unlocked historical question without rolling back visible progress", () => {
    const stepIndex = topicState.resolveCurrentDiscussionStepIndex({
      discussionSteps: [
        {
          id: "step-1",
          angleId: "angle-main",
          block: { id: "b-1", content: "a", order: 1 },
          question: {
            id: "q-1",
            angleId: "angle-main",
            label: "Q1",
            prompt: "q1",
            x: 0,
            y: 0,
            visualState: "dim",
          },
        },
        {
          id: "step-2",
          angleId: "angle-main",
          block: { id: "b-2", content: "b", order: 2 },
          question: {
            id: "q-2",
            angleId: "angle-main",
            label: "Q2",
            prompt: "q2",
            x: 0,
            y: 0,
            visualState: "dim",
          },
        },
        {
          id: "step-3",
          angleId: "angle-main",
          block: { id: "b-3", content: "c", order: 3 },
          question: {
            id: "q-3",
            angleId: "angle-main",
            label: "Q3",
            prompt: "q3",
            x: 0,
            y: 0,
            visualState: "dim",
          },
        },
      ],
      visibleStepCount: 3,
      focusedQuestionId: "q-1",
    });

    expect(stepIndex).toBe(0);
  });

  it("falls back to the latest unlocked step when the focus is missing or not yet visible", () => {
    const stepIndex = topicState.resolveCurrentDiscussionStepIndex({
      discussionSteps: [
        {
          id: "step-1",
          angleId: "angle-main",
          block: { id: "b-1", content: "a", order: 1 },
          question: {
            id: "q-1",
            angleId: "angle-main",
            label: "Q1",
            prompt: "q1",
            x: 0,
            y: 0,
            visualState: "dim",
          },
        },
        {
          id: "step-2",
          angleId: "angle-main",
          block: { id: "b-2", content: "b", order: 2 },
          question: {
            id: "q-2",
            angleId: "angle-main",
            label: "Q2",
            prompt: "q2",
            x: 0,
            y: 0,
            visualState: "dim",
          },
        },
      ],
      visibleStepCount: 1,
      focusedQuestionId: "q-2",
    });

    expect(stepIndex).toBe(0);
  });
});

describe("resolveRecoverableQuestionId", () => {
  it("accepts a visible main-step question as a recoverable current target", () => {
    const questionId = topicState.resolveRecoverableQuestionId({
      discussionSteps: [
        {
          id: "step-1",
          angleId: "angle-main",
          block: { id: "b-1", content: "a", order: 1 },
          question: {
            id: "q-1",
            angleId: "angle-main",
            label: "Q1",
            prompt: "q1",
            x: 0,
            y: 0,
            visualState: "dim",
          },
        },
        {
          id: "step-2",
          angleId: "angle-main",
          block: { id: "b-2", content: "b", order: 2 },
          question: {
            id: "q-2",
            angleId: "angle-main",
            label: "Q2",
            prompt: "q2",
            x: 0,
            y: 0,
            visualState: "dim",
          },
        },
      ],
      visibleStepCount: 1,
      requestedQuestionId: "q-1",
    });

    expect(questionId).toBe("q-1");
  });

  it("ignores a question when it is not part of the visible main steps", () => {
    const questionId = topicState.resolveRecoverableQuestionId({
      discussionSteps: [
        {
          id: "step-1",
          angleId: "angle-main",
          block: { id: "b-1", content: "a", order: 1 },
          question: {
            id: "q-1",
            angleId: "angle-main",
            label: "Q1",
            prompt: "q1",
            x: 0,
            y: 0,
            visualState: "dim",
          },
        },
      ],
      visibleStepCount: 1,
      requestedQuestionId: "branch-1",
    });

    expect(questionId).toBeNull();
  });
});

describe("mergePersistedAngleProgress", () => {
  it("preserves a persisted chapter summary state for each angle", () => {
    const mergedState = topicState.mergePersistedAngleProgress(
      {
        id: "topic-1",
        title: "Topic",
        rootQuestion: "Why?",
        goal: "Goal",
        overview: "Overview",
        explanationBlocks: [],
        learningAngles: [
          {
            id: "angle-main",
            title: "Main",
            description: "Main angle",
            isCustom: false,
          },
        ],
        questions: [],
        edges: [],
        discussionPlans: [],
        sourceReferences: [],
        initialActiveQuestionId: "q-1",
        feedbackPreview: {
          score: 90,
          level: "strong",
          label: "Strong!",
          correctPoints: [],
          vaguePoints: [],
          missingPoints: [],
          nextSuggestion: "Keep going.",
        },
        sourceImport: {
          id: "source-1",
          projectName: "Source",
          overview: [],
          guidedQuestions: [],
          fileTree: [],
        },
      },
      {
        "angle-main": {
          unlockedStepCount: 2,
          answerStateByQuestionId: {},
          attemptRecordsByQuestionId: {},
          customQuestion: "",
          generatedDiscussionSteps: [],
          chapterSummaryState: {
            status: "provisional",
            reason: "pending",
            recommendedAction: "review-question",
            firstReachedAt: "2026-04-23T10:00:00.000Z",
            lastUpdatedAt: "2026-04-23T10:04:00.000Z",
            reviewQuestionId: "q-2",
          },
        },
      },
    );

    expect(mergedState["angle-main"]?.chapterSummaryState).toEqual({
      status: "provisional",
      reason: "pending",
      recommendedAction: "review-question",
      firstReachedAt: "2026-04-23T10:00:00.000Z",
      lastUpdatedAt: "2026-04-23T10:04:00.000Z",
      reviewQuestionId: "q-2",
    });
  });
});
