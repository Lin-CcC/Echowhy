import {
  buildDiscussionSteps,
  inferTopicAnswerAnalysisDimensions,
  loadPersistedTopicSessionState,
  resolveTopicSession,
  type LearningModuleRecord,
  type PersistedTopicSessionState,
  type TopicAnswerState,
  type TopicNode,
  type TopicQuestionReviewState,
  type TopicSession,
} from "@/features/topic-session";
import type {
  ReviewQueue,
  ReviewChapterSummary,
  ReviewQueueAttempt,
  ReviewQueueCounts,
  ReviewScope,
  ReviewQueueFilter,
  ReviewQueueItem,
  ReviewQueueStatus,
} from "./types";

type LoadTopicState = (
  topicId: string,
) => PersistedTopicSessionState | null;

type ResolveTopicSession = (options: {
  module: LearningModuleRecord;
  topicId: string;
}) => TopicSession | null;

type BuildReviewQueueOptions = {
  modules: LearningModuleRecord[];
  loadTopicState?: LoadTopicState;
  resolveTopicSession?: ResolveTopicSession;
};

const reviewFilterLabels: Record<ReviewQueueFilter, string> = {
  all: "All",
  weak: "Needs work",
  unanswered: "Unanswered",
  pending: "Pending",
  skipped: "Skipped",
  bookmarked: "Favorites",
};

function getTimestampValue(value: string | undefined) {
  if (!value) {
    return 0;
  }

  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function getLatestAttempt(
  attempts: ReviewQueueAttempt[],
) {
  return attempts.length > 0 ? attempts[attempts.length - 1] : null;
}

function createSyntheticAttempt(
  answerState: TopicAnswerState,
): ReviewQueueAttempt | null {
  if (!answerState.feedback || !answerState.updatedAt || !answerState.answer.trim()) {
    return null;
  }

  return {
    id: `${answerState.questionId}-synthetic`,
    createdAt: answerState.updatedAt,
    userAnswer: answerState.answer,
    aiFeedback: answerState.feedback,
    score: answerState.feedback.score,
    status:
      answerState.feedback.score >= 85
        ? "Strong"
        : answerState.feedback.score >= 60
          ? "Partial"
          : "Weak",
    revealedAnswerUsed: Boolean(answerState.revealedAnswerUsed),
    synthetic: true,
  };
}

function getQuestionStatus(
  answerState: TopicAnswerState | undefined,
  isWeak: boolean,
): ReviewQueueStatus {
  if (!answerState) {
    return "unanswered";
  }

  if (answerState.status === "continued") {
    return "unanswered";
  }

  if (answerState.status === "skipped") {
    return "skipped";
  }

  return isWeak ? "answered-weak" : "answered-good";
}

function buildReviewAttempts(
  answerState: TopicAnswerState | undefined,
  attempts: ReviewQueueAttempt[],
) {
  if (attempts.length > 0) {
    return [...attempts].sort(
      (left, right) =>
        getTimestampValue(right.createdAt) - getTimestampValue(left.createdAt),
    );
  }

  const syntheticAttempt = answerState ? createSyntheticAttempt(answerState) : null;
  return syntheticAttempt ? [syntheticAttempt] : [];
}

function getLatestActivityAt(
  reviewState: TopicQuestionReviewState | null,
  answerState: TopicAnswerState | undefined,
  attempts: ReviewQueueAttempt[],
  fallbackCreatedAt: string,
) {
  const latestAttempt = getLatestAttempt(attempts);

  return (
    reviewState?.updatedAt ??
    latestAttempt?.createdAt ??
    answerState?.updatedAt ??
    fallbackCreatedAt
  );
}

function getLatestAnswer(
  answerState: TopicAnswerState | undefined,
  attempts: ReviewQueueAttempt[],
) {
  if (typeof answerState?.answer === "string" && answerState.answer.trim()) {
    return answerState.answer;
  }

  return getLatestAttempt(attempts)?.userAnswer ?? null;
}

function getLatestFeedback(
  answerState: TopicAnswerState | undefined,
  attempts: ReviewQueueAttempt[],
) {
  return answerState?.feedback ?? getLatestAttempt(attempts)?.aiFeedback ?? null;
}

function getAnalysisDimensions(
  question: TopicNode,
  answerState: TopicAnswerState | undefined,
  attempts: ReviewQueueAttempt[],
) {
  const latestFeedback = getLatestFeedback(answerState, attempts);
  const latestAnswer = getLatestAnswer(answerState, attempts);

  if (!latestFeedback || !latestAnswer?.trim()) {
    return [];
  }

  return (
    latestFeedback.analysisDimensions ??
    inferTopicAnswerAnalysisDimensions({
      question,
      answer: latestAnswer,
      score: latestFeedback.score,
    })
  );
}

function matchesFilter(item: ReviewQueueItem, filter: ReviewQueueFilter) {
  if (filter === "all") {
    return true;
  }

  if (filter === "weak") {
    return item.isWeak;
  }

  if (filter === "unanswered") {
    return item.status === "unanswered";
  }

  if (filter === "pending") {
    return item.isPending;
  }

  if (filter === "skipped") {
    return item.status === "skipped";
  }

  return item.isBookmarked;
}

function matchesScope(item: ReviewQueueItem, scope: ReviewScope) {
  if (scope.topicId && item.topicId !== scope.topicId) {
    return false;
  }

  if (scope.angleId && item.angleId !== scope.angleId) {
    return false;
  }

  if (scope.filter && !matchesFilter(item, scope.filter)) {
    return false;
  }

  if (
    scope.analysisDimension &&
    !item.analysisDimensions.includes(scope.analysisDimension)
  ) {
    return false;
  }

  return true;
}

function createEmptyCounts(): ReviewQueueCounts {
  return {
    all: 0,
    weak: 0,
    unanswered: 0,
    pending: 0,
    skipped: 0,
    bookmarked: 0,
  };
}

function createReviewChapterSummaryId(item: {
  topicId: string;
  angleId: string;
}) {
  return `${item.topicId}:${item.angleId}`;
}

function createDefaultResolveTopicSession({
  module,
  topicId,
}: {
  module: LearningModuleRecord;
  topicId: string;
}) {
  return resolveTopicSession({
    topicId,
    seedQuestion: module.seedQuestion,
    sourceId: module.sourceId,
    sourceLabel: module.sourceLabel,
  });
}

function buildMainQuestionItems(
  module: LearningModuleRecord,
  topic: TopicSession,
  persistedState: PersistedTopicSessionState,
) {
  return module.children.flatMap((child) => {
    const angleId = child.angleId;

    if (!angleId) {
      return [];
    }

    const angle = topic.learningAngles.find((item) => item.id === angleId);
    const angleState = persistedState.angleStateById[angleId];

    if (!angle || !angleState || angleState.unlockedStepCount <= 0) {
      return [];
    }

    const steps = buildDiscussionSteps(
      topic,
      angleId,
      angleState.customQuestion || child.customQuestion,
      angleState.generatedDiscussionSteps,
    ).slice(0, Math.max(0, angleState.unlockedStepCount));

    return steps.map((step) => {
      const attempts = (
        angleState.attemptRecordsByQuestionId[step.question.id] ?? []
      ).map((attempt) => ({
        ...attempt,
      }));
      const reviewState =
        persistedState.questionReviewStateById?.[step.question.id] ?? null;
      const answerState = angleState.answerStateByQuestionId[step.question.id];
      const isWeak =
        reviewState?.selfMarkedWeak === true ||
        answerState?.feedback?.level === "weak" ||
        attempts.some((attempt) => attempt.status === "Weak");
      const reviewAttempts = buildReviewAttempts(answerState, attempts);

      return {
        id: `${topic.id}:${angleId}:${step.question.id}`,
        topicId: topic.id,
        moduleId: module.id,
        moduleTitle: module.title,
        angleId,
        angleTitle: angle.title,
        questionId: step.question.id,
        questionPrompt: step.question.prompt,
        sourceLabel: module.sourceLabel ?? topic.sourceImport.projectName,
        source: "main" as const,
        status: getQuestionStatus(answerState, isWeak),
        isPending: reviewState?.pending === true,
        isBookmarked: reviewState?.bookmarked === true,
        isSelfMarkedWeak: reviewState?.selfMarkedWeak === true,
        isWeak,
        latestActivityAt: getLatestActivityAt(
          reviewState,
          answerState,
          reviewAttempts,
          module.updatedAt,
        ),
        latestAnswer: getLatestAnswer(answerState, reviewAttempts),
        latestFeedback: getLatestFeedback(answerState, reviewAttempts),
        analysisDimensions: getAnalysisDimensions(
          step.question,
          answerState,
          reviewAttempts,
        ),
        summary: answerState?.summary ?? null,
        attempts: reviewAttempts,
        routeSearch: {
          angle: angleId,
          question: step.question.id,
        },
        reviewState,
      };
    });
  });
}

function buildInsertedQuestionItems(
  module: LearningModuleRecord,
  topic: TopicSession,
  persistedState: PersistedTopicSessionState,
) {
  return module.children.flatMap((child) => {
    const angleId = child.angleId;

    if (!angleId) {
      return [];
    }

    const angle = topic.learningAngles.find((item) => item.id === angleId);
    const insertedQuestions =
      persistedState.insertedQuestionsByAngleId?.[angleId] ?? [];

    if (!angle || insertedQuestions.length === 0) {
      return [];
    }

    return insertedQuestions.map((question) => {
      const reviewState =
        persistedState.questionReviewStateById?.[question.id] ?? null;
      const answerState = question.answerState;
      const reviewAttempts = buildReviewAttempts(answerState, []);
      const isWeak =
        reviewState?.selfMarkedWeak === true ||
        answerState?.feedback?.level === "weak";
      const reviewQuestionNode: TopicNode = {
        id: question.id,
        angleId,
        label: question.prompt,
        prompt: question.prompt,
        x: 0,
        y: 0,
        visualState: question.visualState,
      };

      return {
        id: `${topic.id}:${angleId}:${question.id}`,
        topicId: topic.id,
        moduleId: module.id,
        moduleTitle: module.title,
        angleId,
        angleTitle: angle.title,
        questionId: question.id,
        questionPrompt: question.prompt,
        sourceLabel: module.sourceLabel ?? topic.sourceImport.projectName,
        source: "inserted" as const,
        status: getQuestionStatus(answerState, isWeak),
        isPending: reviewState?.pending === true,
        isBookmarked: reviewState?.bookmarked === true,
        isSelfMarkedWeak: reviewState?.selfMarkedWeak === true,
        isWeak,
        latestActivityAt: getLatestActivityAt(
          reviewState,
          answerState,
          reviewAttempts,
          question.createdAt,
        ),
        latestAnswer: getLatestAnswer(answerState, reviewAttempts),
        latestFeedback: getLatestFeedback(answerState, reviewAttempts),
        analysisDimensions: getAnalysisDimensions(
          reviewQuestionNode,
          answerState,
          reviewAttempts,
        ),
        summary: answerState?.summary ?? null,
        attempts: reviewAttempts,
        routeSearch: {
          angle: angleId,
          question: question.id,
        },
        reviewState,
      };
    });
  });
}

function buildCounts(items: ReviewQueueItem[]) {
  return items.reduce((counts, item) => {
    counts.all += 1;

    if (item.isWeak) {
      counts.weak += 1;
    }

    if (item.status === "unanswered") {
      counts.unanswered += 1;
    }

    if (item.isPending) {
      counts.pending += 1;
    }

    if (item.status === "skipped") {
      counts.skipped += 1;
    }

    if (item.isBookmarked) {
      counts.bookmarked += 1;
    }

    return counts;
  }, createEmptyCounts());
}

function buildReviewChapterSummaries({
  items,
  summaryStateById,
}: {
  items: ReviewQueueItem[];
  summaryStateById: Record<string, ReviewChapterSummary["summaryState"] | undefined>;
}) {
  const itemsByChapterId = items.reduce<Record<string, ReviewQueueItem[]>>(
    (result, item) => {
      const chapterId = createReviewChapterSummaryId(item);
      const currentItems = result[chapterId] ?? [];
      currentItems.push(item);
      result[chapterId] = currentItems;
      return result;
    },
    {},
  );

  return Object.entries(itemsByChapterId)
    .map(([chapterId, chapterItems]) => {
      const firstItem = chapterItems[0];
      const latestActivityAt = chapterItems.reduce((latest, item) => {
        return getTimestampValue(item.latestActivityAt) >
          getTimestampValue(latest)
          ? item.latestActivityAt
          : latest;
      }, firstItem.latestActivityAt);

      return {
        id: chapterId,
        topicId: firstItem.topicId,
        moduleId: firstItem.moduleId,
        moduleTitle: firstItem.moduleTitle,
        angleId: firstItem.angleId,
        angleTitle: firstItem.angleTitle,
        sourceLabel: firstItem.sourceLabel,
        latestActivityAt,
        counts: buildCounts(chapterItems),
        summaryState: summaryStateById[chapterId] ?? null,
        routeSearch: {
          angle: firstItem.angleId,
        },
      } satisfies ReviewChapterSummary;
    })
    .sort((left, right) => {
      const timeDiff =
        getTimestampValue(right.latestActivityAt) -
        getTimestampValue(left.latestActivityAt);

      if (timeDiff !== 0) {
        return timeDiff;
      }

      return left.angleTitle.localeCompare(right.angleTitle);
    });
}

export function buildReviewQueue({
  modules,
  loadTopicState = loadPersistedTopicSessionState,
  resolveTopicSession = createDefaultResolveTopicSession,
}: BuildReviewQueueOptions): ReviewQueue {
  const summaryStateById: Record<
    string,
    ReviewChapterSummary["summaryState"] | undefined
  > = {};
  const items = modules
    .flatMap((module) => {
      const topicId = module.children[0]?.topicId ?? module.id;
      const topic = resolveTopicSession({
        module,
        topicId,
      });

      if (!topic) {
        return [];
      }

      const persistedState = loadTopicState(topic.id);

      if (!persistedState) {
        return [];
      }

      Object.entries(persistedState.angleStateById).forEach(([angleId, angleState]) => {
        if (!angleState) {
          return;
        }

        summaryStateById[`${topic.id}:${angleId}`] = angleState.chapterSummaryState;
      });

      return [
        ...buildMainQuestionItems(module, topic, persistedState),
        ...buildInsertedQuestionItems(module, topic, persistedState),
      ];
    })
    .sort((left, right) => {
      const timeDiff =
        getTimestampValue(right.latestActivityAt) -
        getTimestampValue(left.latestActivityAt);

      if (timeDiff !== 0) {
        return timeDiff;
      }

      return left.questionPrompt.localeCompare(right.questionPrompt);
    });

  return {
    items,
    chapters: buildReviewChapterSummaries({
      items,
      summaryStateById,
    }),
    counts: buildCounts(items),
  };
}

export function filterReviewQueueItems(
  items: ReviewQueueItem[],
  filter: ReviewQueueFilter,
) {
  return items.filter((item) => matchesFilter(item, filter));
}

export function applyReviewScope(
  items: ReviewQueueItem[],
  scope: ReviewScope,
) {
  return items.filter((item) => matchesScope(item, scope));
}

export function getScopedReviewChapterSummary(
  chapters: ReviewChapterSummary[],
  scope: ReviewScope | null,
) {
  if (!scope?.topicId || !scope.angleId) {
    return null;
  }

  return (
    chapters.find(
      (chapter) =>
        chapter.topicId === scope.topicId && chapter.angleId === scope.angleId,
    ) ?? null
  );
}

export function getReviewFilterLabel(filter: ReviewQueueFilter) {
  return reviewFilterLabels[filter];
}
