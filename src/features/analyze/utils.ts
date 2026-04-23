import {
  buildReviewQueue,
  getReviewFilterLabel,
  type ReviewQueueFilter,
} from "@/features/review";
import {
  getTopicChapterSummaryPresentation,
  loadPersistedTopicSessionState,
  type LearningModuleRecord,
  type TopicAnswerAnalysisDimension,
} from "@/features/topic-session";
import type {
  AnalyzeBehaviorInsight,
  AnalyzeChapterPattern,
  AnalyzePreview,
  AnalyzeRevisitAreaSummary,
  AnalyzeStatusBacklogSummary,
  AnalyzeWeakDimensionSummary,
  LoadTopicState,
  ResolveTopicSession,
} from "./types";

const analysisDimensionLabels: Record<TopicAnswerAnalysisDimension, string> = {
  "target-fit": "Target Fit",
  "conceptual-accuracy": "Conceptual Accuracy",
  "causal-link": "Causal Link",
  grounding: "Grounding",
  calibration: "Calibration",
};

const analysisDimensionOrder: TopicAnswerAnalysisDimension[] = [
  "grounding",
  "causal-link",
  "conceptual-accuracy",
  "target-fit",
  "calibration",
];

const analyzeStatusOrder: Exclude<ReviewQueueFilter, "all" | "bookmarked">[] = [
  "weak",
  "unanswered",
  "pending",
  "skipped",
];

function getDimensionSummary(dimension: TopicAnswerAnalysisDimension) {
  if (dimension === "grounding") {
    return "These answers often stay too abstract and need one more source-anchored step.";
  }

  if (dimension === "causal-link") {
    return "These answers often name facts but leave the causal bridge under-explained.";
  }

  if (dimension === "conceptual-accuracy") {
    return "These answers stay on topic, but one key concept boundary is still missing.";
  }

  if (dimension === "target-fit") {
    return "These answers drift away from the actual question and need sharper targeting.";
  }

  return "These answers need better calibration between confidence, scope, and precision.";
}

function getStatusSummary(filter: Exclude<ReviewQueueFilter, "all" | "bookmarked">) {
  if (filter === "weak") {
    return "These are the questions whose latest state is still fragile enough to deserve another pass.";
  }

  if (filter === "unanswered") {
    return "These are already in your learning chain, but they have not been properly validated yet.";
  }

  if (filter === "pending") {
    return "These are the questions you explicitly marked to revisit later.";
  }

  return "These are the questions you deferred for now and can reopen when ready.";
}

function getStatusRank(status: AnalyzeRevisitAreaSummary["status"]) {
  if (status === "unsettled") {
    return 0;
  }

  if (status === "provisional") {
    return 1;
  }

  return 2;
}

function getUnresolvedItemCount(
  items: ReturnType<typeof buildReviewQueue>["items"],
) {
  return items.filter(
    (item) =>
      item.isWeak ||
      item.isPending ||
      item.status === "unanswered" ||
      item.status === "skipped",
  ).length;
}

function buildWeakDimensionSummaries(
  items: ReturnType<typeof buildReviewQueue>["items"],
): AnalyzeWeakDimensionSummary[] {
  const counts = items.reduce<Record<TopicAnswerAnalysisDimension, number>>(
    (result, item) => {
      item.analysisDimensions.forEach((dimension) => {
        result[dimension] = (result[dimension] ?? 0) + 1;
      });
      return result;
    },
    {} as Record<TopicAnswerAnalysisDimension, number>,
  );

  return analysisDimensionOrder
    .filter((dimension) => (counts[dimension] ?? 0) > 0)
    .map((dimension) => ({
      dimension,
      count: counts[dimension],
      title: analysisDimensionLabels[dimension],
      summary: getDimensionSummary(dimension),
      reviewScope: {
        source: "analyze" as const,
        sourceLabel: "From Global Pattern",
        sourceDetail: analysisDimensionLabels[dimension],
        analysisDimension: dimension,
      },
    }));
}

function buildStatusBacklogSummaries(
  queue: ReturnType<typeof buildReviewQueue>,
): AnalyzeStatusBacklogSummary[] {
  return analyzeStatusOrder
    .filter((filter) => queue.counts[filter] > 0)
    .map((filter) => ({
      filter,
      count: queue.counts[filter],
      title: getReviewFilterLabel(filter),
      summary: getStatusSummary(filter),
      reviewScope: {
        source: "analyze" as const,
        sourceLabel: "From Global Pattern",
        sourceDetail: getReviewFilterLabel(filter),
        filter,
      },
    }));
}

function buildRevisitAreaSummaries(
  queue: ReturnType<typeof buildReviewQueue>,
): AnalyzeRevisitAreaSummary[] {
  return queue.chapters
    .filter((chapter) => chapter.summaryState && chapter.summaryState.status !== "grounded")
    .map((chapter) => ({
      id: chapter.id,
      topicId: chapter.topicId,
      angleId: chapter.angleId,
      title: chapter.angleTitle,
      sourceLabel: chapter.sourceLabel,
      status: chapter.summaryState!.status,
      unresolvedCount: getUnresolvedItemCount(
        queue.items.filter(
          (item) =>
            item.topicId === chapter.topicId && item.angleId === chapter.angleId,
        ),
      ),
      summary: getTopicChapterSummaryPresentation(chapter.summaryState!).summary,
      reviewScope: {
        source: "analyze" as const,
        sourceLabel: "From Needs Revisit",
        sourceDetail: chapter.angleTitle,
        topicId: chapter.topicId,
        angleId: chapter.angleId,
      },
    }))
    .sort((left, right) => {
      const rankDiff = getStatusRank(left.status) - getStatusRank(right.status);

      if (rankDiff !== 0) {
        return rankDiff;
      }

      return right.unresolvedCount - left.unresolvedCount;
    });
}

function buildChapterPatterns(
  queue: ReturnType<typeof buildReviewQueue>,
): AnalyzeChapterPattern[] {
  return queue.chapters.map((chapter) => {
    const chapterItems = queue.items.filter(
      (item) =>
        item.topicId === chapter.topicId && item.angleId === chapter.angleId,
    );
    const dimensionCounts = chapterItems.reduce<
      Record<TopicAnswerAnalysisDimension, number>
    >((result, item) => {
      item.analysisDimensions.forEach((dimension) => {
        result[dimension] = (result[dimension] ?? 0) + 1;
      });
      return result;
    }, {} as Record<TopicAnswerAnalysisDimension, number>);

    const topWeakDimensions = analysisDimensionOrder.filter(
      (dimension) => (dimensionCounts[dimension] ?? 0) > 0,
    );
    const unresolvedCount = getUnresolvedItemCount(chapterItems);

    return {
      id: chapter.id,
      topicId: chapter.topicId,
      angleId: chapter.angleId,
      title: chapter.angleTitle,
      sourceLabel: chapter.sourceLabel,
      summaryState: chapter.summaryState,
      unresolvedCount,
      topWeakDimensions,
      summary: chapter.summaryState
        ? getTopicChapterSummaryPresentation(chapter.summaryState).detail
        : "This chapter is already in a reusable state and can be reopened question by question.",
      reviewScope: {
        source: "analyze" as const,
        sourceLabel: "From Chapter Pattern",
        sourceDetail: chapter.angleTitle,
        topicId: chapter.topicId,
        angleId: chapter.angleId,
      },
    };
  }).sort((left, right) => {
    const leftRank = left.summaryState ? getStatusRank(left.summaryState.status) : 2;
    const rightRank = right.summaryState ? getStatusRank(right.summaryState.status) : 2;
    const rankDiff = leftRank - rightRank;

    if (rankDiff !== 0) {
      return rankDiff;
    }

    return right.unresolvedCount - left.unresolvedCount;
  });
}

function buildBehaviorInsight(params: {
  id: AnalyzeBehaviorInsight["id"];
  title: string;
  answerSideLabel: string;
  alternativeSideLabel: string;
  numerator: number;
  denominator: number;
  dominantSide: AnalyzeBehaviorInsight["dominantSide"];
}) {
  const total = params.numerator + params.denominator;
  const emphasis =
    total <= 0
      ? "There is not enough behavior data yet."
      : params.dominantSide === "balanced"
        ? `You currently move through ${params.answerSideLabel.toLowerCase()} and ${params.alternativeSideLabel.toLowerCase()} in a fairly balanced way.`
        : `You currently lean more on ${params.dominantSide === "answer" || params.dominantSide === "main" || params.dominantSide === "dig"
            ? params.answerSideLabel.toLowerCase()
            : params.alternativeSideLabel.toLowerCase()}.`;

  return {
    id: params.id,
    title: params.title,
    summary: emphasis,
    detail:
      total <= 0
        ? "Keep learning a bit longer and this section will begin to reflect your real tendencies."
        : `${params.answerSideLabel}: ${params.numerator} / ${params.alternativeSideLabel}: ${params.denominator}`,
    dominantSide: params.dominantSide,
    numerator: params.numerator,
    denominator: params.denominator,
  } satisfies AnalyzeBehaviorInsight;
}

function resolveDominantSide({
  primary,
  secondary,
  primaryLabel,
  secondaryLabel,
}: {
  primary: number;
  secondary: number;
  primaryLabel: AnalyzeBehaviorInsight["dominantSide"];
  secondaryLabel: AnalyzeBehaviorInsight["dominantSide"];
}) {
  if (primary === secondary) {
    return "balanced" as const;
  }

  return primary > secondary ? primaryLabel : secondaryLabel;
}

function buildLearningBehavior(
  modules: LearningModuleRecord[],
  loadTopicState: LoadTopicState,
) {
  const behaviorCounts = modules.reduce(
    (result, module) => {
      const topicId = module.children[0]?.topicId ?? module.id;
      const persistedState = loadTopicState(topicId);

      if (!persistedState?.behaviorSignalCounts) {
        return result;
      }

      result.answerChecks += persistedState.behaviorSignalCounts.answerChecks;
      result.continueLadderCount +=
        persistedState.behaviorSignalCounts.continueLadderCount;
      result.branchQuestionCount +=
        persistedState.behaviorSignalCounts.branchQuestionCount;
      result.skipCount += persistedState.behaviorSignalCounts.skipCount;
      result.pendingMarkCount +=
        persistedState.behaviorSignalCounts.pendingMarkCount;

      return result;
    },
    {
      answerChecks: 0,
      continueLadderCount: 0,
      branchQuestionCount: 0,
      skipCount: 0,
      pendingMarkCount: 0,
    },
  );

  return [
    buildBehaviorInsight({
      id: "answer-vs-ladder",
      title: "Answer vs Continue Ladder",
      answerSideLabel: "Direct answering",
      alternativeSideLabel: "Continue Ladder",
      numerator: behaviorCounts.answerChecks,
      denominator: behaviorCounts.continueLadderCount,
      dominantSide: resolveDominantSide({
        primary: behaviorCounts.answerChecks,
        secondary: behaviorCounts.continueLadderCount,
        primaryLabel: "answer",
        secondaryLabel: "ladder",
      }),
    }),
    buildBehaviorInsight({
      id: "main-vs-branch",
      title: "Main thread vs Branch questions",
      answerSideLabel: "Main-thread progress",
      alternativeSideLabel: "Branch questions",
      numerator: behaviorCounts.answerChecks,
      denominator: behaviorCounts.branchQuestionCount,
      dominantSide: resolveDominantSide({
        primary: behaviorCounts.answerChecks,
        secondary: behaviorCounts.branchQuestionCount,
        primaryLabel: "main",
        secondaryLabel: "branch",
      }),
    }),
    buildBehaviorInsight({
      id: "dig-vs-defer",
      title: "Keep digging vs Defer",
      answerSideLabel: "Keep digging",
      alternativeSideLabel: "Pending / Skip",
      numerator: behaviorCounts.continueLadderCount,
      denominator: behaviorCounts.pendingMarkCount + behaviorCounts.skipCount,
      dominantSide: resolveDominantSide({
        primary: behaviorCounts.continueLadderCount,
        secondary: behaviorCounts.pendingMarkCount + behaviorCounts.skipCount,
        primaryLabel: "dig",
        secondaryLabel: "defer",
      }),
    }),
  ];
}

export function getAnalyzeDimensionLabel(
  dimension: TopicAnswerAnalysisDimension,
) {
  return analysisDimensionLabels[dimension];
}

export function buildAnalyzePreview({
  modules,
  loadTopicState = loadPersistedTopicSessionState,
  resolveTopicSession,
}: {
  modules: LearningModuleRecord[];
  loadTopicState?: LoadTopicState;
  resolveTopicSession?: ResolveTopicSession;
}): AnalyzePreview {
  const queue = buildReviewQueue({
    modules,
    loadTopicState,
    resolveTopicSession,
  });

  return {
    globalPatterns: {
      weakDimensions: buildWeakDimensionSummaries(queue.items),
      statusBacklog: buildStatusBacklogSummaries(queue),
      revisitAreas: buildRevisitAreaSummaries(queue),
    },
    chapterPatterns: buildChapterPatterns(queue),
    learningBehavior: buildLearningBehavior(modules, loadTopicState),
  };
}

export function hasAnalyzePreviewData(preview: AnalyzePreview) {
  const hasGlobalPattern =
    preview.globalPatterns.weakDimensions.length > 0 ||
    preview.globalPatterns.statusBacklog.length > 0 ||
    preview.globalPatterns.revisitAreas.length > 0;
  const hasChapterPattern = preview.chapterPatterns.length > 0;
  const hasBehaviorSignal = preview.learningBehavior.some(
    (item) => item.numerator + item.denominator > 0,
  );

  return hasGlobalPattern || hasChapterPattern || hasBehaviorSignal;
}
