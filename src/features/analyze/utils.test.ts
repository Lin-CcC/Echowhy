import { describe, expect, it } from "vitest";
import type {
  LearningModuleRecord,
  PersistedTopicSessionState,
  TopicFeedbackPreview,
  TopicSession,
} from "@/features/topic-session";
import { buildAnalyzePreview, hasAnalyzePreviewData } from "./utils";

function createFeedback(
  overrides: Partial<TopicFeedbackPreview> = {},
): TopicFeedbackPreview {
  return {
    score: overrides.score ?? 92,
    level: overrides.level ?? "strong",
    label: overrides.label ?? "Strong!",
    correctPoints: overrides.correctPoints ?? ["Grounded answer"],
    vaguePoints: overrides.vaguePoints ?? [],
    missingPoints: overrides.missingPoints ?? [],
    nextSuggestion: overrides.nextSuggestion ?? "Keep going.",
    analysisDimensions: overrides.analysisDimensions ?? [],
  };
}

function createTopicSession(): TopicSession {
  return {
    id: "topic-1",
    title: "JWT timing",
    rootQuestion: "What should be understood first?",
    goal: "Understand the login chain.",
    overview: "A compact test topic.",
    explanationBlocks: [
      {
        id: "exp-1",
        title: "Step 1",
        content: "First explanation block",
        order: 1,
      },
      {
        id: "exp-2",
        title: "Step 2",
        content: "Second explanation block",
        order: 2,
      },
    ],
    learningAngles: [
      {
        id: "angle-main",
        title: "Request flow",
        description: "Trace the request flow.",
        isCustom: false,
      },
    ],
    questions: [
      {
        id: "q-1",
        label: "Question 1",
        prompt: "Why can login not verify JWT first?",
        x: 0,
        y: 0,
        visualState: "dim",
        blockId: "exp-1",
      },
      {
        id: "q-2",
        label: "Question 2",
        prompt: "What does JWT prove later?",
        x: 10,
        y: 10,
        visualState: "dim",
        blockId: "exp-2",
      },
    ],
    edges: [],
    discussionPlans: [
      {
        id: "plan-1",
        angleId: "angle-main",
        blockId: "exp-1",
        questionId: "q-1",
      },
      {
        id: "plan-2",
        angleId: "angle-main",
        blockId: "exp-2",
        questionId: "q-2",
      },
    ],
    sourceReferences: [],
    initialActiveQuestionId: "q-1",
    feedbackPreview: createFeedback(),
    sourceImport: {
      id: "source-1",
      projectName: "RBAC Project",
      overview: [],
      guidedQuestions: [],
      fileTree: [],
    },
  };
}

function createModuleRecord(): LearningModuleRecord {
  return {
    id: "module-1",
    title: "JWT timing",
    sourceId: "source-1",
    sourceLabel: "RBAC Project",
    sourceFiles: ["AuthService.java"],
    children: [
      {
        id: "child-main",
        label: "Request flow",
        topicId: "topic-1",
        angleId: "angle-main",
        kind: "angle",
        createdAt: "2026-04-22T09:00:00.000Z",
      },
    ],
    kind: "source-backed",
    createdAt: "2026-04-22T08:00:00.000Z",
    updatedAt: "2026-04-22T09:10:00.000Z",
  };
}

function createTopicState(): PersistedTopicSessionState {
  return {
    version: 1,
    selectedAngleId: "angle-main",
    angleStateById: {
      "angle-main": {
        unlockedStepCount: 2,
        answerStateByQuestionId: {
          "q-1": {
            questionId: "q-1",
            answer: "Because no token exists yet.",
            status: "passed",
            feedback: createFeedback({
              score: 88,
              level: "good",
              label: "Good!",
            }),
            summary: "Grounded enough to move on.",
            isCollapsed: true,
            updatedAt: "2026-04-22T09:01:00.000Z",
          },
        },
        attemptRecordsByQuestionId: {},
        customQuestion: "",
        generatedDiscussionSteps: [],
        chapterSummaryState: {
          status: "provisional",
          reason: "pending",
          recommendedAction: "review-question",
          firstReachedAt: "2026-04-22T09:03:00.000Z",
          lastUpdatedAt: "2026-04-22T09:03:00.000Z",
          reviewQuestionId: "q-2",
        },
      },
    },
    draftAnswersByQuestionId: {},
    customQuestionDraftsByAngleId: {},
    revealedQuestionIds: {},
    insertedQuestionsByAngleId: {
      "angle-main": [
        {
          id: "branch-1",
          angleId: "angle-main",
          targetId: "exp-2",
          prompt: "Why does the token become useful only later?",
          createdAt: "2026-04-22T09:05:00.000Z",
          visualState: "pulsing",
          answerDraft: "It is minted after login succeeds.",
          answerState: {
            questionId: "branch-1",
            answer: "It is minted after login succeeds.",
            status: "failed",
            feedback: createFeedback({
              score: 42,
              level: "weak",
              label: "Weak",
              nextSuggestion: "Tie issuance timing to the protected request.",
              analysisDimensions: ["grounding", "causal-link", "calibration"],
            }),
            summary: null,
            isCollapsed: false,
            updatedAt: "2026-04-22T09:06:00.000Z",
          },
        },
      ],
    },
    questionReviewStateById: {
      "q-2": {
        pending: true,
        updatedAt: "2026-04-22T09:03:00.000Z",
      },
      "branch-1": {
        selfMarkedWeak: true,
        updatedAt: "2026-04-22T09:07:00.000Z",
      },
    },
    behaviorSignalCounts: {
      answerChecks: 1,
      continueLadderCount: 0,
      branchQuestionCount: 1,
      skipCount: 0,
      pendingMarkCount: 1,
    },
  };
}

describe("buildAnalyzePreview", () => {
  it("reports that an empty preview has no reviewable learning data yet", () => {
    const preview = buildAnalyzePreview({ modules: [] });

    expect(hasAnalyzePreviewData(preview)).toBe(false);
  });

  it("builds global patterns, chapter patterns, and learning behavior from persisted learning state", () => {
    const preview = buildAnalyzePreview({
      modules: [createModuleRecord()],
      loadTopicState: () => createTopicState(),
      resolveTopicSession: () => createTopicSession(),
    });

    expect(hasAnalyzePreviewData(preview)).toBe(true);

    expect(preview.globalPatterns.weakDimensions).toEqual([
      expect.objectContaining({
        dimension: "grounding",
        count: 1,
        reviewScope: expect.objectContaining({
          source: "analyze",
          sourceLabel: "From Global Pattern",
          sourceDetail: "Grounding",
          analysisDimension: "grounding",
        }),
      }),
      expect.objectContaining({
        dimension: "causal-link",
        count: 1,
      }),
      expect.objectContaining({
        dimension: "calibration",
        count: 1,
      }),
    ]);

    expect(preview.globalPatterns.statusBacklog).toEqual([
      expect.objectContaining({
        filter: "weak",
        count: 1,
      }),
      expect.objectContaining({
        filter: "unanswered",
        count: 1,
      }),
      expect.objectContaining({
        filter: "pending",
        count: 1,
      }),
    ]);

    expect(preview.globalPatterns.revisitAreas).toEqual([
      expect.objectContaining({
        id: "topic-1:angle-main",
        title: "Request flow",
        status: "provisional",
        unresolvedCount: 2,
      }),
    ]);

    expect(preview.chapterPatterns).toEqual([
      expect.objectContaining({
        id: "topic-1:angle-main",
        title: "Request flow",
        summaryState: expect.objectContaining({
          status: "provisional",
          reviewQuestionId: "q-2",
        }),
        topWeakDimensions: ["grounding", "causal-link", "calibration"],
      }),
    ]);

    expect(preview.learningBehavior.map((item) => item.id)).toEqual([
      "answer-vs-ladder",
      "main-vs-branch",
      "dig-vs-defer",
    ]);
    expect(preview.learningBehavior[0]).toMatchObject({
      dominantSide: "answer",
      numerator: 1,
      denominator: 0,
    });
    expect(preview.learningBehavior[1]).toMatchObject({
      dominantSide: "balanced",
      numerator: 1,
      denominator: 1,
    });
    expect(preview.learningBehavior[2]).toMatchObject({
      dominantSide: "defer",
      numerator: 0,
      denominator: 1,
    });
    expect(preview.learningBehavior[2]?.detail).toBe(
      "Keep digging: 0 / Pending / Skip: 1",
    );
  });
});
