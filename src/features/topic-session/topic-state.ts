import type {
  LearningModuleRecord,
} from "./module-storage";
import { normalizeTopicChapterSummaryState } from "./chapter-summary";
import { createContinueLadderDiscussionStep } from "./session-helpers";
import type {
  TopicAnswerState,
  TopicAngleProgressState,
  TopicBehaviorSignalCounts,
  TopicDiscussionStep,
  TopicGeneratedDiscussionStep,
  TopicSession,
} from "./types";

type AdvanceCurrentQuestionProgressParams = {
  angleState: TopicAngleProgressState;
  currentStepIndex: number;
  discussionStepCount: number;
};

type ContinueLadderProgressParams = AdvanceCurrentQuestionProgressParams & {
  questionId: string;
  currentStep: TopicDiscussionStep;
};

type SkipCurrentQuestionProgressParams = AdvanceCurrentQuestionProgressParams & {
  questionId: string;
};

type ResolveCurrentDiscussionStepIndexParams = {
  discussionSteps: TopicDiscussionStep[];
  visibleStepCount: number;
  focusedQuestionId?: string | null;
};

type ResolveRecoverableQuestionIdParams = {
  discussionSteps: TopicDiscussionStep[];
  visibleStepCount: number;
  requestedQuestionId?: string | null;
};

function getNextUnlockedStepCount({
  angleState,
  currentStepIndex,
  discussionStepCount,
}: AdvanceCurrentQuestionProgressParams) {
  return Math.min(
    Math.max(angleState.unlockedStepCount, currentStepIndex + 2),
    discussionStepCount,
  );
}

function createCollapsedAnswerState(
  questionId: string,
  status: TopicAnswerState["status"],
  summary: string,
) {
  return {
    questionId,
    answer: "",
    status,
    feedback: null,
    summary,
    isCollapsed: true,
    updatedAt: new Date().toISOString(),
  } satisfies TopicAnswerState;
}

export function createInitialAngleProgress(topic: TopicSession) {
  return topic.learningAngles.reduce<Record<string, TopicAngleProgressState>>(
    (accumulator, angle) => {
      accumulator[angle.id] = {
        unlockedStepCount: angle.isCustom ? 0 : 1,
        answerStateByQuestionId: {},
        attemptRecordsByQuestionId: {},
        customQuestion: "",
        generatedDiscussionSteps: [],
      };
      return accumulator;
    },
    {},
  );
}

export function createEmptyBehaviorSignalCounts(): TopicBehaviorSignalCounts {
  return {
    answerChecks: 0,
    continueLadderCount: 0,
    branchQuestionCount: 0,
    skipCount: 0,
    pendingMarkCount: 0,
  };
}

export function applyContinueLadderProgress({
  angleState,
  currentStepIndex,
  discussionStepCount,
  questionId,
  currentStep,
}: ContinueLadderProgressParams): TopicAngleProgressState {
  const nextGeneratedStepIndex = angleState.generatedDiscussionSteps.length + 1;
  const nextGeneratedStep = createContinueLadderDiscussionStep({
    currentStep,
    ladderIndex: nextGeneratedStepIndex,
  });

  return {
    ...angleState,
    unlockedStepCount: Math.min(
      Math.max(angleState.unlockedStepCount + 1, currentStepIndex + 2),
      discussionStepCount + 1,
    ),
    answerStateByQuestionId: {
      ...angleState.answerStateByQuestionId,
      [questionId]: createCollapsedAnswerState(
        questionId,
        "continued",
        "Continued via ladder.",
      ),
    },
    generatedDiscussionSteps: [
      ...angleState.generatedDiscussionSteps,
      nextGeneratedStep,
    ],
  };
}

export function applySkipCurrentQuestionProgress({
  angleState,
  currentStepIndex,
  discussionStepCount,
  questionId,
}: SkipCurrentQuestionProgressParams): TopicAngleProgressState {
  return {
    ...angleState,
    unlockedStepCount: getNextUnlockedStepCount({
      angleState,
      currentStepIndex,
      discussionStepCount,
    }),
    answerStateByQuestionId: {
      ...angleState.answerStateByQuestionId,
      [questionId]: createCollapsedAnswerState(
        questionId,
        "skipped",
        "Skipped for now.",
      ),
    },
  };
}

export function resolveCurrentDiscussionStepIndex({
  discussionSteps,
  visibleStepCount,
  focusedQuestionId,
}: ResolveCurrentDiscussionStepIndexParams) {
  if (visibleStepCount <= 0 || discussionSteps.length === 0) {
    return -1;
  }

  const latestUnlockedStepIndex = Math.min(
    visibleStepCount - 1,
    discussionSteps.length - 1,
  );

  if (!focusedQuestionId) {
    return latestUnlockedStepIndex;
  }

  const focusedStepIndex = discussionSteps.findIndex(
    (step) => step.question.id === focusedQuestionId,
  );

  if (
    focusedStepIndex < 0 ||
    focusedStepIndex > latestUnlockedStepIndex
  ) {
    return latestUnlockedStepIndex;
  }

  return focusedStepIndex;
}

export function resolveRecoverableQuestionId({
  discussionSteps,
  visibleStepCount,
  requestedQuestionId,
}: ResolveRecoverableQuestionIdParams) {
  if (!requestedQuestionId || visibleStepCount <= 0 || discussionSteps.length === 0) {
    return null;
  }

  const latestUnlockedStepIndex = Math.min(
    visibleStepCount - 1,
    discussionSteps.length - 1,
  );
  const requestedStepIndex = discussionSteps.findIndex(
    (step) => step.question.id === requestedQuestionId,
  );

  if (requestedStepIndex < 0 || requestedStepIndex > latestUnlockedStepIndex) {
    return null;
  }

  return requestedQuestionId;
}

export function resolveRoutedFocusQuestionId({
  discussionSteps,
  visibleStepCount,
  routedQuestionId,
}: {
  discussionSteps: TopicDiscussionStep[];
  visibleStepCount: number;
  routedQuestionId?: string | null;
}) {
  return resolveRecoverableQuestionId({
    discussionSteps,
    visibleStepCount,
    requestedQuestionId: routedQuestionId,
  });
}

export function mergePersistedAngleProgress(
  topic: TopicSession,
  persistedState?: Record<string, TopicAngleProgressState | undefined>,
) {
  const initialState = createInitialAngleProgress(topic);

  return topic.learningAngles.reduce<Record<string, TopicAngleProgressState>>(
    (accumulator, angle) => {
      const fallbackState = initialState[angle.id];
      const persistedAngleState = persistedState?.[angle.id];

      accumulator[angle.id] = {
        ...fallbackState,
        unlockedStepCount:
          typeof persistedAngleState?.unlockedStepCount === "number"
            ? Math.max(
                fallbackState.unlockedStepCount,
                persistedAngleState.unlockedStepCount,
              )
            : fallbackState.unlockedStepCount,
        answerStateByQuestionId:
          persistedAngleState?.answerStateByQuestionId ?? {},
        attemptRecordsByQuestionId:
          persistedAngleState?.attemptRecordsByQuestionId ?? {},
        customQuestion:
          typeof persistedAngleState?.customQuestion === "string"
            ? persistedAngleState.customQuestion
            : fallbackState.customQuestion,
        generatedDiscussionSteps: Array.isArray(
          persistedAngleState?.generatedDiscussionSteps,
        )
          ? (persistedAngleState.generatedDiscussionSteps as TopicGeneratedDiscussionStep[])
          : fallbackState.generatedDiscussionSteps,
        chapterSummaryState: normalizeTopicChapterSummaryState(
          persistedAngleState?.chapterSummaryState,
        ),
      };

      return accumulator;
    },
    {},
  );
}

export function filterValidReferenceIds(
  topic: TopicSession,
  referenceIds: string[] = [],
) {
  const validReferenceIds = new Set(
    topic.sourceReferences.map((reference) => reference.id),
  );

  return referenceIds.filter(
    (referenceId, index, sourceIds) =>
      validReferenceIds.has(referenceId) &&
      sourceIds.indexOf(referenceId) === index,
  );
}

export function normalizePinnedSourcesByAngle(
  topic: TopicSession,
  pinnedSourcesByAngleId: Record<string, string[]> | undefined,
  legacyPinnedSources: string[] | undefined,
  fallbackAngleId: string,
) {
  const nextPinnedSourcesByAngleId: Record<string, string[]> = {};

  for (const angle of topic.learningAngles) {
    const rawPinnedSources = pinnedSourcesByAngleId?.[angle.id];
    const pinnedSources = filterValidReferenceIds(
      topic,
      Array.isArray(rawPinnedSources) ? rawPinnedSources : [],
    );

    if (pinnedSources.length > 0) {
      nextPinnedSourcesByAngleId[angle.id] = pinnedSources;
    }
  }

  const hasPinnedSourcesByAngle =
    Object.keys(nextPinnedSourcesByAngleId).length > 0;

  if (!hasPinnedSourcesByAngle) {
    const legacySources = filterValidReferenceIds(
      topic,
      Array.isArray(legacyPinnedSources) ? legacyPinnedSources : [],
    );

    if (legacySources.length > 0) {
      nextPinnedSourcesByAngleId[fallbackAngleId] = legacySources;
    }
  }

  return nextPinnedSourcesByAngleId;
}

export function createTopicModuleRecord(
  topic: TopicSession,
  storedModule: LearningModuleRecord | null,
) {
  if (storedModule) {
    return storedModule;
  }

  const createdAt = new Date().toISOString();

  return {
    id: topic.id,
    title: topic.title,
    sourceId: topic.sourceImport.id,
    sourceLabel: topic.sourceImport.projectName,
    sourceFiles: [],
    seedQuestion: undefined,
    parentModuleId: undefined,
    children: topic.learningAngles
      .filter((angle) => !angle.isCustom)
      .map((angle) => ({
        id: `${topic.id}-${angle.id}`,
        label: angle.title,
        topicId: topic.id,
        angleId: angle.id,
        kind: "angle" as const,
        createdAt,
      })),
    kind: "source-backed" as const,
    createdAt,
    updatedAt: createdAt,
  };
}
