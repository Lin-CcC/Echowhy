import { describe, expect, it } from "vitest";
import { buildDiscussionSteps } from "./session-helpers";
import type { TopicGeneratedDiscussionStep, TopicSession } from "./types";

function createTopicSession(): TopicSession {
  return {
    id: "topic-1",
    title: "Topic",
    rootQuestion: "What matters first?",
    goal: "Goal",
    overview: "Overview",
    explanationBlocks: [
      {
        id: "exp-1",
        title: "Step 1",
        content: "First explanation",
        order: 1,
      },
      {
        id: "exp-2",
        title: "Step 2",
        content: "Second explanation",
        order: 2,
      },
    ],
    learningAngles: [
      {
        id: "angle-main",
        title: "Main",
        description: "Main angle",
        isCustom: false,
      },
    ],
    questions: [
      {
        id: "q-1",
        angleId: "angle-main",
        label: "Q1",
        prompt: "Why first?",
        x: 0,
        y: 0,
        visualState: "dim",
        blockId: "exp-1",
      },
      {
        id: "q-2",
        angleId: "angle-main",
        label: "Q2",
        prompt: "Why second?",
        x: 0,
        y: 0,
        visualState: "dim",
        blockId: "exp-2",
      },
    ],
    edges: [],
    discussionPlans: [
      {
        id: "step-1",
        angleId: "angle-main",
        blockId: "exp-1",
        questionId: "q-1",
      },
      {
        id: "step-2",
        angleId: "angle-main",
        blockId: "exp-2",
        questionId: "q-2",
      },
    ],
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
  };
}

function createGeneratedStep(
  overrides: Partial<TopicGeneratedDiscussionStep> = {},
): TopicGeneratedDiscussionStep {
  return {
    id: overrides.id ?? "generated-step-1",
    angleId: overrides.angleId ?? "angle-main",
    afterQuestionId: overrides.afterQuestionId ?? "q-1",
    createdAt: overrides.createdAt ?? "2026-04-23T00:00:00.000Z",
    block: overrides.block ?? {
      id: "generated-exp-1",
      title: "Ladder 1",
      content: "Generated explanation",
      order: 1.1,
    },
    question: overrides.question ?? {
      id: "generated-q-1",
      angleId: "angle-main",
      label: "Ladder 1",
      prompt: "What is the next distinction?",
      x: 0,
      y: 0,
      visualState: "dim",
    },
    defaultReferenceId: overrides.defaultReferenceId,
  };
}

describe("buildDiscussionSteps", () => {
  it("inserts generated continue-ladder steps immediately after their parent question", () => {
    const steps = buildDiscussionSteps(
      createTopicSession(),
      "angle-main",
      undefined,
      [
        createGeneratedStep(),
        createGeneratedStep({
          id: "generated-step-2",
          afterQuestionId: "generated-q-1",
          block: {
            id: "generated-exp-2",
            title: "Ladder 2",
            content: "Second generated explanation",
            order: 1.2,
          },
          question: {
            id: "generated-q-2",
            angleId: "angle-main",
            label: "Ladder 2",
            prompt: "What comes after that distinction?",
            x: 0,
            y: 0,
            visualState: "dim",
          },
        }),
      ],
    );

    expect(steps.map((step) => step.question.id)).toEqual([
      "q-1",
      "generated-q-1",
      "generated-q-2",
      "q-2",
    ]);
  });
});
