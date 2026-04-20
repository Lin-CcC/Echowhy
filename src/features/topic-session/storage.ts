import type { TopicAngleProgressState } from "./types";

export type PersistedTopicSessionState = {
  version: 1;
  selectedAngleId: string;
  angleStateById: Record<string, TopicAngleProgressState | undefined>;
  pinnedSources?: string[];
  pinnedSourcesByAngleId?: Record<string, string[]>;
  draftAnswersByQuestionId: Record<string, string>;
  customQuestionDraftsByAngleId: Record<string, string>;
  revealedQuestionIds: Record<string, boolean>;
};

const STORAGE_PREFIX = "echowhy:topic-session";

function getStorageKey(topicId: string) {
  return `${STORAGE_PREFIX}:${topicId}`;
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

    return parsedValue;
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
