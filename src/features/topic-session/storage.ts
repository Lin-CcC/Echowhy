import type {
  InsertedQuestionRecord,
  TopicAngleProgressState,
  TopicBehaviorSignalCounts,
  TopicQuestionReviewState,
} from "./types";

export type PersistedTopicSessionState = {
  version: 1;
  selectedAngleId: string;
  angleStateById: Record<string, TopicAngleProgressState | undefined>;
  pinnedSources?: string[];
  pinnedSourcesByAngleId?: Record<string, string[]>;
  draftAnswersByQuestionId: Record<string, string>;
  customQuestionDraftsByAngleId: Record<string, string>;
  revealedQuestionIds: Record<string, boolean>;
  insertedQuestionsByAngleId?: Record<string, InsertedQuestionRecord[]>;
  questionReviewStateById?: Record<string, TopicQuestionReviewState | undefined>;
  behaviorSignalCounts?: TopicBehaviorSignalCounts;
};

const STORAGE_PREFIX = "echowhy:topic-session";

function getStorageKey(topicId: string) {
  return `${STORAGE_PREFIX}:${topicId}`;
}

function normalizeQuestionReviewState(
  value: Partial<TopicQuestionReviewState> | null,
): TopicQuestionReviewState | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  return {
    pending: value.pending === true,
    bookmarked: value.bookmarked === true,
    selfMarkedWeak: value.selfMarkedWeak === true,
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : undefined,
  };
}

function normalizeQuestionReviewStateById(
  value: Record<string, unknown> | undefined,
) {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const entries = Object.entries(value)
    .map(([questionId, reviewState]) => {
      const normalizedState = normalizeQuestionReviewState(
        reviewState as Partial<TopicQuestionReviewState>,
      );

      return normalizedState ? [questionId, normalizedState] : null;
    })
    .filter(
      (
        entry,
      ): entry is [string, TopicQuestionReviewState] => Boolean(entry),
    );

  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
}

function normalizeBehaviorSignalCounts(
  value: Partial<TopicBehaviorSignalCounts> | undefined,
) {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  return {
    answerChecks:
      typeof value.answerChecks === "number" ? Math.max(0, value.answerChecks) : 0,
    continueLadderCount:
      typeof value.continueLadderCount === "number"
        ? Math.max(0, value.continueLadderCount)
        : 0,
    branchQuestionCount:
      typeof value.branchQuestionCount === "number"
        ? Math.max(0, value.branchQuestionCount)
        : 0,
    skipCount: typeof value.skipCount === "number" ? Math.max(0, value.skipCount) : 0,
    pendingMarkCount:
      typeof value.pendingMarkCount === "number"
        ? Math.max(0, value.pendingMarkCount)
        : 0,
  };
}

export function loadPersistedTopicSessionState(
  topicId: string,
): PersistedTopicSessionState | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(getStorageKey(topicId));

    if (!rawValue) {
      return null;
    }

    const parsedValue = JSON.parse(rawValue) as PersistedTopicSessionState;

    if (
      !parsedValue ||
      parsedValue.version !== 1 ||
      typeof parsedValue.selectedAngleId !== "string" ||
      typeof parsedValue.angleStateById !== "object" ||
      typeof parsedValue.draftAnswersByQuestionId !== "object"
    ) {
      return null;
    }

    return {
      ...parsedValue,
      questionReviewStateById: normalizeQuestionReviewStateById(
        parsedValue.questionReviewStateById as Record<string, unknown> | undefined,
      ),
      behaviorSignalCounts: normalizeBehaviorSignalCounts(
        parsedValue.behaviorSignalCounts,
      ),
    };
  } catch {
    return null;
  }
}

export function savePersistedTopicSessionState(
  topicId: string,
  state: PersistedTopicSessionState,
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(getStorageKey(topicId), JSON.stringify(state));
  } catch {
    // Ignore quota / serialization issues and keep the live session usable.
  }
}
