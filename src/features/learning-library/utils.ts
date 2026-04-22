import {
  loadPersistedTopicSessionState,
  type LearningModuleRecord,
  type PersistedTopicSessionState,
  type TopicAngleProgressState,
} from "@/features/topic-session";
import type {
  BuildLibraryCardModelOptions,
  FilterAndSortLibraryCardsOptions,
  LibraryCardModel,
  LibraryCardStatus,
} from "./types";

type LoadTopicState = (
  topicId: string,
) => PersistedTopicSessionState | null;

function clampProgress(value: number) {
  return Math.max(0, Math.min(100, value));
}

function formatProgressLabel(completedCount: number, totalCount: number) {
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  return `${completedCount}/${totalCount} | ${percent}%`;
}

function normalizeQuery(value: string) {
  return value.trim().toLowerCase();
}

function getSourceFiles(module: LearningModuleRecord) {
  if (module.sourceFiles?.length) {
    return module.sourceFiles;
  }

  return module.sourceLabel ? [module.sourceLabel] : [];
}

function getSourceBadges(module: LearningModuleRecord) {
  const sourceFiles = getSourceFiles(module);

  if (sourceFiles.length > 0) {
    return sourceFiles.slice(0, 3);
  }

  return [module.sourceLabel ?? "Conceptual source"];
}

function getLibraryCardStatus(
  completedCount: number,
  totalCount: number,
): LibraryCardStatus {
  if (completedCount <= 0) {
    return "idle";
  }

  if (completedCount >= totalCount) {
    return "completed";
  }

  return "active";
}

export function formatRelativeModuleTime(
  value: string,
  options?: {
    now?: Date;
  },
) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "recently";
  }

  const now = options?.now ?? new Date();
  const diffInMilliseconds = now.getTime() - date.getTime();

  if (diffInMilliseconds < 0) {
    return "just now";
  }

  const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));

  if (diffInMinutes <= 0) {
    return "just now";
  }

  if (diffInMinutes === 1) {
    return "1 minute ago";
  }

  if (diffInMinutes < 60) {
    return `${diffInMinutes} minutes ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);

  if (diffInHours === 1) {
    return "1 hour ago";
  }

  if (diffInHours < 24) {
    return `${diffInHours} hours ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInDays === 1) {
    return "1 day ago";
  }

  if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(date);
}

export function isAngleProgressCompleted(
  angleProgress: TopicAngleProgressState | undefined,
) {
  if (!angleProgress || angleProgress.unlockedStepCount <= 0) {
    return false;
  }

  const answerStates = Object.values(angleProgress.answerStateByQuestionId).filter(
    (answerState): answerState is NonNullable<typeof answerState> =>
      Boolean(answerState),
  );

  if (answerStates.length < angleProgress.unlockedStepCount) {
    return false;
  }

  return answerStates.every((answerState) => answerState.status === "passed");
}

export function getCompletedChildIds(
  module: LearningModuleRecord,
  loadTopicState: LoadTopicState = loadPersistedTopicSessionState,
) {
  return module.children.flatMap((child) => {
    if (!child.angleId) {
      return [];
    }

    const persistedState = loadTopicState(child.topicId);
    const angleProgress = persistedState?.angleStateById[child.angleId];

    return isAngleProgressCompleted(angleProgress) ? [child.id] : [];
  });
}

export function buildLibraryCardModel(
  module: LearningModuleRecord,
  options?: BuildLibraryCardModelOptions,
): LibraryCardModel {
  const sourceFiles = getSourceFiles(module);
  const completedChildIds = new Set(options?.completedChildIds ?? []);
  const totalCount = Math.max(module.children.length, 1);
  const completedCount = Math.min(completedChildIds.size, totalCount);
  const percent = clampProgress(
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
  );

  return {
    id: module.id,
    title: module.title,
    sourceLabel: module.sourceLabel ?? "Conceptual source",
    sourceBadges: getSourceBadges(module),
    sourceFiles,
    status: getLibraryCardStatus(completedCount, totalCount),
    createdAt: module.createdAt,
    updatedAt: module.updatedAt,
    relativeUpdatedAt: formatRelativeModuleTime(module.updatedAt, {
      now: options?.now,
    }),
    progress: {
      totalCount,
      completedCount,
      percent,
      label: formatProgressLabel(completedCount, totalCount),
    },
  };
}

export function filterAndSortLibraryCardModels(
  cards: LibraryCardModel[],
  options: FilterAndSortLibraryCardsOptions,
) {
  const query = normalizeQuery(options.query);
  const filteredCards = query
    ? cards.filter((card) => {
        const searchableText = [
          card.title,
          card.sourceLabel,
          ...card.sourceFiles,
          ...card.sourceBadges,
        ]
          .join(" ")
          .toLowerCase();

        return searchableText.includes(query);
      })
    : cards;

  return [...filteredCards].sort((left, right) => {
    if (options.sortBy === "created-date") {
      return (
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
      );
    }

    if (options.sortBy === "progress") {
      if (right.progress.percent !== left.progress.percent) {
        return right.progress.percent - left.progress.percent;
      }

      if (right.progress.completedCount !== left.progress.completedCount) {
        return right.progress.completedCount - left.progress.completedCount;
      }
    }

    return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
  });
}
