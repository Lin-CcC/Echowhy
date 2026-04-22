import type {
  LearningModuleRecord,
} from "./module-storage";
import type {
  TopicAngleProgressState,
  TopicBehaviorSignalCounts,
  TopicSession,
} from "./types";

export function createInitialAngleProgress(topic: TopicSession) {
  return topic.learningAngles.reduce<Record<string, TopicAngleProgressState>>(
    (accumulator, angle) => {
      accumulator[angle.id] = {
        unlockedStepCount: angle.isCustom ? 0 : 1,
        answerStateByQuestionId: {},
        attemptRecordsByQuestionId: {},
        customQuestion: "",
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
