import { describe, expect, it } from "vitest";
import type { LearningModuleRecord } from "@/features/topic-session/module-storage";
import {
  buildLibraryCardModel,
  filterAndSortLibraryCardModels,
  formatRelativeModuleTime,
  getBookmarkedQuestionCount,
  getCompletedChildIds,
  isAngleProgressCompleted,
} from "./utils";
import type { PersistedTopicSessionState } from "@/features/topic-session";

function createModuleRecord(
  overrides: Partial<LearningModuleRecord> = {},
): LearningModuleRecord {
  return {
    id: overrides.id ?? "module-1",
    title: overrides.title ?? "JWT timing",
    sourceId: overrides.sourceId,
    sourceLabel: overrides.sourceLabel ?? "RBAC Project",
    sourceFiles: overrides.sourceFiles ?? ["AuthService.java"],
    seedQuestion: overrides.seedQuestion,
    parentModuleId: overrides.parentModuleId,
    children: overrides.children ?? [],
    kind: overrides.kind ?? "source-backed",
    createdAt: overrides.createdAt ?? "2026-04-20T08:00:00.000Z",
    updatedAt: overrides.updatedAt ?? "2026-04-22T08:00:00.000Z",
  };
}

describe("buildLibraryCardModel", () => {
  it("maps a completed module to a completed card model", () => {
    const module = createModuleRecord({
      children: [
        {
          id: "child-1",
          label: "Flow",
          topicId: "module-1",
          kind: "angle",
          createdAt: "2026-04-22T07:00:00.000Z",
        },
        {
          id: "child-2",
          label: "Responsibility",
          topicId: "module-1",
          kind: "angle",
          createdAt: "2026-04-22T07:10:00.000Z",
        },
      ],
    });

    const model = buildLibraryCardModel(module, {
      completedChildIds: ["child-1", "child-2"],
    });

    expect(model.status).toBe("completed");
    expect(model.progress.completedCount).toBe(2);
    expect(model.progress.totalCount).toBe(2);
    expect(model.progress.percent).toBe(100);
    expect(model.progress.label).toBe("2/2 | 100%");
  });

  it("treats a module without progress as idle", () => {
    const model = buildLibraryCardModel(
      createModuleRecord({
        title: "Start from source",
        children: [],
      }),
    );

    expect(model.status).toBe("idle");
    expect(model.progress.totalCount).toBe(1);
    expect(model.progress.completedCount).toBe(0);
    expect(model.progress.percent).toBe(0);
  });

  it("adds a light bookmarked question hint when the topic contains favorites", () => {
    const model = buildLibraryCardModel(createModuleRecord(), {
      bookmarkedQuestionCount: 2,
    });

    expect(model.bookmarkedQuestionCount).toBe(2);
  });
});

describe("filterAndSortLibraryCardModels", () => {
  it("filters by title and source, then sorts by progress descending", () => {
    const cards = [
      {
        ...buildLibraryCardModel(
          createModuleRecord({
            id: "a",
            title: "JWT timing",
            children: [
              {
                id: "a-1",
                label: "Flow",
                topicId: "a",
                kind: "angle",
                createdAt: "2026-04-22T07:00:00.000Z",
              },
            ],
          }),
        ),
        progress: {
          totalCount: 1,
          completedCount: 1,
          percent: 100,
          label: "1/1 | 100%",
        },
        status: "completed" as const,
      },
      buildLibraryCardModel(
        createModuleRecord({
          id: "b",
          title: "Controller role",
          sourceLabel: "Billing Project",
        }),
      ),
      buildLibraryCardModel(
        createModuleRecord({
          id: "c",
          title: "Auth service",
          sourceLabel: "RBAC Project",
          children: [
            {
              id: "c-1",
              label: "Step 1",
              topicId: "c-step-1",
              kind: "angle",
              createdAt: "2026-04-22T07:00:00.000Z",
            },
            {
              id: "c-2",
              label: "Step 2",
              topicId: "c-step-2",
              kind: "angle",
              createdAt: "2026-04-22T07:10:00.000Z",
            },
          ],
        }),
        {
          completedChildIds: ["c-1"],
        },
      ),
    ];

    const result = filterAndSortLibraryCardModels(cards, {
      query: "rbac",
      sortBy: "progress",
    });

    expect(result.map((card) => card.id)).toEqual(["a", "c"]);
  });
});

describe("formatRelativeModuleTime", () => {
  it("formats a recent module update into relative time", () => {
    expect(
      formatRelativeModuleTime("2026-04-22T07:30:00.000Z", {
        now: new Date("2026-04-22T08:00:00.000Z"),
      }),
    ).toBe("30 minutes ago");
  });
});

describe("isAngleProgressCompleted", () => {
  it("requires every unlocked answer state to be passed", () => {
    expect(
      isAngleProgressCompleted({
        unlockedStepCount: 2,
        answerStateByQuestionId: {
          q1: {
            questionId: "q1",
            answer: "answer",
            status: "passed",
            feedback: null,
            summary: null,
            isCollapsed: true,
          },
        },
        attemptRecordsByQuestionId: {},
        customQuestion: "",
        generatedDiscussionSteps: [],
      }),
    ).toBe(false);

    expect(
      isAngleProgressCompleted({
        unlockedStepCount: 2,
        answerStateByQuestionId: {
          q1: {
            questionId: "q1",
            answer: "answer",
            status: "passed",
            feedback: null,
            summary: null,
            isCollapsed: true,
          },
          q2: {
            questionId: "q2",
            answer: "answer",
            status: "passed",
            feedback: null,
            summary: null,
            isCollapsed: true,
          },
        },
        attemptRecordsByQuestionId: {},
        customQuestion: "",
        generatedDiscussionSteps: [],
      }),
    ).toBe(true);
  });

  it("treats skipped or continued nodes as enough to move on in the current version", () => {
    expect(
      isAngleProgressCompleted({
        unlockedStepCount: 2,
        answerStateByQuestionId: {
          q1: {
            questionId: "q1",
            answer: "answer",
            status: "passed",
            feedback: null,
            summary: null,
            isCollapsed: true,
          },
          q2: {
            questionId: "q2",
            answer: "",
            status: "continued",
            feedback: null,
            summary: "Continued via ladder.",
            isCollapsed: true,
          },
        },
        attemptRecordsByQuestionId: {},
        customQuestion: "",
        generatedDiscussionSteps: [],
      }),
    ).toBe(true);
  });
});

describe("getCompletedChildIds", () => {
  it("collects completed child ids from persisted angle progress", () => {
    const module = createModuleRecord({
      children: [
        {
          id: "angle-flow",
          label: "Flow",
          topicId: "module-1",
          angleId: "angle-request-flow",
          kind: "angle",
          createdAt: "2026-04-22T07:00:00.000Z",
        },
        {
          id: "angle-custom",
          label: "My why",
          topicId: "module-1",
          angleId: "angle-custom-followup",
          kind: "my-own-why",
          createdAt: "2026-04-22T07:10:00.000Z",
        },
      ],
    });

    const state: PersistedTopicSessionState = {
      version: 1,
      selectedAngleId: "angle-request-flow",
      angleStateById: {
        "angle-request-flow": {
          unlockedStepCount: 1,
          answerStateByQuestionId: {
            q1: {
              questionId: "q1",
              answer: "answer",
              status: "passed",
              feedback: null,
              summary: null,
              isCollapsed: true,
            },
          },
          attemptRecordsByQuestionId: {},
          customQuestion: "",
          generatedDiscussionSteps: [],
        },
        "angle-custom-followup": {
          unlockedStepCount: 1,
          answerStateByQuestionId: {
            q2: {
              questionId: "q2",
              answer: "answer",
              status: "failed",
              feedback: null,
              summary: null,
              isCollapsed: false,
            },
          },
          attemptRecordsByQuestionId: {},
          customQuestion: "Why here?",
          generatedDiscussionSteps: [],
        },
      },
      draftAnswersByQuestionId: {},
      customQuestionDraftsByAngleId: {},
      revealedQuestionIds: {},
    };

    const completedChildIds = getCompletedChildIds(module, () => state);

    expect(completedChildIds).toEqual(["angle-flow"]);
  });
});

describe("getBookmarkedQuestionCount", () => {
  it("counts unique bookmarked questions across the module topics", () => {
    const module = createModuleRecord({
      children: [
        {
          id: "angle-flow",
          label: "Flow",
          topicId: "topic-1",
          angleId: "angle-request-flow",
          kind: "angle",
          createdAt: "2026-04-22T07:00:00.000Z",
        },
        {
          id: "angle-why",
          label: "Why",
          topicId: "topic-1",
          angleId: "angle-custom-followup",
          kind: "my-own-why",
          createdAt: "2026-04-22T07:10:00.000Z",
        },
      ],
    });
    const state: PersistedTopicSessionState = {
      version: 1,
      selectedAngleId: "angle-request-flow",
      angleStateById: {},
      draftAnswersByQuestionId: {},
      customQuestionDraftsByAngleId: {},
      revealedQuestionIds: {},
      questionReviewStateById: {
        q1: {
          bookmarked: true,
          updatedAt: "2026-04-22T07:11:00.000Z",
        },
        q2: {
          pending: true,
          updatedAt: "2026-04-22T07:12:00.000Z",
        },
        q3: {
          bookmarked: true,
          updatedAt: "2026-04-22T07:13:00.000Z",
        },
      },
    };

    expect(getBookmarkedQuestionCount(module, () => state)).toBe(2);
  });
});
