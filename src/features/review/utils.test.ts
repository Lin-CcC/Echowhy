import { describe, expect, it } from "vitest";
import type {
  LearningModuleRecord,
  PersistedTopicSessionState,
  TopicFeedbackPreview,
  TopicSession,
} from "@/features/topic-session";
import {
  buildReviewQueue,
  filterReviewQueueItems,
  getReviewFilterLabel,
  getScopedReviewChapterSummary,
} from "./utils";

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

function createTopicState(
  overrides: Partial<PersistedTopicSessionState> = {},
): PersistedTopicSessionState {
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
        attemptRecordsByQuestionId: {
          "q-1": [
            {
              id: "attempt-1",
              createdAt: "2026-04-22T09:01:00.000Z",
              userAnswer: "Because no token exists yet.",
              aiFeedback: createFeedback({
                score: 88,
                level: "good",
                label: "Good!",
              }),
              score: 88,
              status: "Strong",
              revealedAnswerUsed: false,
            },
          ],
        },
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
            }),
            summary: null,
            isCollapsed: false,
            updatedAt: "2026-04-22T09:06:00.000Z",
          },
        },
      ],
    },
    questionReviewStateById: {
      "q-1": {
        bookmarked: true,
        updatedAt: "2026-04-22T09:02:00.000Z",
      },
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
    ...overrides,
  };
}

describe("buildReviewQueue", () => {
  it("collects question records, independent flags, and queue counts", () => {
    const queue = buildReviewQueue({
      modules: [createModuleRecord()],
      loadTopicState: () => createTopicState(),
      resolveTopicSession: () => createTopicSession(),
    });

    expect(queue.items.map((item) => item.id)).toEqual([
      "topic-1:angle-main:branch-1",
      "topic-1:angle-main:q-2",
      "topic-1:angle-main:q-1",
    ]);
    expect(queue.counts.all).toBe(3);
    expect(queue.counts.weak).toBe(1);
    expect(queue.counts.unanswered).toBe(1);
    expect(queue.counts.pending).toBe(1);
    expect(queue.counts.skipped).toBe(0);
    expect(queue.counts.bookmarked).toBe(1);
    expect(queue.chapters).toHaveLength(1);
    expect(queue.chapters[0]).toMatchObject({
      id: "topic-1:angle-main",
      topicId: "topic-1",
      angleId: "angle-main",
      moduleTitle: "JWT timing",
      angleTitle: "Request flow",
      counts: {
        all: 3,
        weak: 1,
        unanswered: 1,
        pending: 1,
        skipped: 0,
        bookmarked: 1,
      },
      latestActivityAt: "2026-04-22T09:07:00.000Z",
      summaryState: {
        status: "provisional",
        reason: "pending",
        recommendedAction: "review-question",
        reviewQuestionId: "q-2",
      },
    });

    expect(queue.items[0]).toMatchObject({
      questionId: "branch-1",
      source: "inserted",
      isWeak: true,
      isSelfMarkedWeak: true,
      analysisDimensions: [
        "grounding",
        "causal-link",
        "calibration",
      ],
    });
    expect(queue.items[1]).toMatchObject({
      questionId: "q-2",
      source: "main",
      isPending: true,
      status: "unanswered",
      analysisDimensions: [],
    });
    expect(queue.items[2]).toMatchObject({
      questionId: "q-1",
      isBookmarked: true,
      status: "answered-good",
      analysisDimensions: [],
    });
  });

  it("ignores locked future questions that have not entered the learning chain yet", () => {
    const queue = buildReviewQueue({
      modules: [createModuleRecord()],
      loadTopicState: () =>
        createTopicState({
          angleStateById: {
            "angle-main": {
              unlockedStepCount: 1,
              answerStateByQuestionId: {},
              attemptRecordsByQuestionId: {},
              customQuestion: "",
              generatedDiscussionSteps: [],
            },
          },
          insertedQuestionsByAngleId: {},
          questionReviewStateById: {},
        }),
      resolveTopicSession: () => createTopicSession(),
    });

    expect(queue.items.map((item) => item.questionId)).toEqual(["q-1"]);
    expect(queue.counts.unanswered).toBe(1);
  });

  it("treats continue-ladder progress as unanswered instead of skipped", () => {
    const queue = buildReviewQueue({
      modules: [createModuleRecord()],
      loadTopicState: () =>
        createTopicState({
          angleStateById: {
            "angle-main": {
              unlockedStepCount: 2,
              answerStateByQuestionId: {
                "q-1": {
                  questionId: "q-1",
                  answer: "",
                  status: "continued" as never,
                  feedback: null,
                  summary: "Continued via ladder.",
                  isCollapsed: true,
                  updatedAt: "2026-04-22T09:01:00.000Z",
                },
              },
              attemptRecordsByQuestionId: {},
              customQuestion: "",
              generatedDiscussionSteps: [],
            },
          },
          insertedQuestionsByAngleId: {},
          questionReviewStateById: {},
        }),
      resolveTopicSession: () => createTopicSession(),
    });

    expect(queue.items.map((item) => [item.questionId, item.status])).toEqual([
      ["q-2", "unanswered"],
      ["q-1", "unanswered"],
    ]);
    expect(queue.counts.unanswered).toBe(2);
    expect(queue.counts.skipped).toBe(0);
  });

  it("ignores undefined angle progress entries when collecting chapter summaries", () => {
    const queue = buildReviewQueue({
      modules: [createModuleRecord()],
      loadTopicState: () =>
        createTopicState({
          angleStateById: {
            "angle-main": {
              unlockedStepCount: 1,
              answerStateByQuestionId: {},
              attemptRecordsByQuestionId: {},
              customQuestion: "",
              generatedDiscussionSteps: [],
              chapterSummaryState: {
                status: "grounded",
                reason: "all-passed",
                recommendedAction: "explore-next-angle",
                firstReachedAt: "2026-04-22T09:10:00.000Z",
                lastUpdatedAt: "2026-04-22T09:10:00.000Z",
                reviewQuestionId: null,
              },
            },
            "angle-stale": undefined,
          },
          insertedQuestionsByAngleId: {},
          questionReviewStateById: {},
        }),
      resolveTopicSession: () => createTopicSession(),
    });

    expect(queue.chapters).toHaveLength(1);
    expect(queue.chapters[0].summaryState?.status).toBe("grounded");
  });
});

describe("getScopedReviewChapterSummary", () => {
  it("returns the current chapter summary when the scope targets a topic angle", () => {
    const queue = buildReviewQueue({
      modules: [createModuleRecord()],
      loadTopicState: () => createTopicState(),
      resolveTopicSession: () => createTopicSession(),
    });

    expect(
      getScopedReviewChapterSummary(queue.chapters, {
        topicId: "topic-1",
        angleId: "angle-main",
      }),
    ).toMatchObject({
      id: "topic-1:angle-main",
      summaryState: {
        status: "provisional",
        reviewQuestionId: "q-2",
      },
    });
  });

  it("returns null when the scope does not point at a known chapter", () => {
    const queue = buildReviewQueue({
      modules: [createModuleRecord()],
      loadTopicState: () => createTopicState(),
      resolveTopicSession: () => createTopicSession(),
    });

    expect(
      getScopedReviewChapterSummary(queue.chapters, {
        topicId: "topic-1",
        angleId: "angle-missing",
      }),
    ).toBeNull();
  });
});

describe("filterReviewQueueItems", () => {
  it("filters the queue by independent review views", () => {
    const queue = buildReviewQueue({
      modules: [createModuleRecord()],
      loadTopicState: () => createTopicState(),
      resolveTopicSession: () => createTopicSession(),
    });

    expect(filterReviewQueueItems(queue.items, "weak").map((item) => item.questionId)).toEqual([
      "branch-1",
    ]);
    expect(
      filterReviewQueueItems(queue.items, "bookmarked").map((item) => item.questionId),
    ).toEqual(["q-1"]);
    expect(filterReviewQueueItems(queue.items, "pending").map((item) => item.questionId)).toEqual([
      "q-2",
    ]);
  });
});

describe("getReviewFilterLabel", () => {
  it("returns the quiet label for each supported filter", () => {
    expect(getReviewFilterLabel("all")).toBe("All");
    expect(getReviewFilterLabel("weak")).toBe("Needs work");
    expect(getReviewFilterLabel("unanswered")).toBe("Unanswered");
    expect(getReviewFilterLabel("pending")).toBe("Pending");
    expect(getReviewFilterLabel("skipped")).toBe("Skipped");
    expect(getReviewFilterLabel("bookmarked")).toBe("Favorites");
  });
});
