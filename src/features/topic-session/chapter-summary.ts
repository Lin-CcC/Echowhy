import type { TopicChapterClosureState } from "./chapter-closure";
import type {
  TopicChapterRecommendedAction,
  TopicChapterSummaryReason,
  TopicChapterSummaryState,
} from "./types";

function resolveTopicChapterSummaryReason(
  closureState: TopicChapterClosureState,
): TopicChapterSummaryReason {
  if (closureState.status === "grounded") {
    return "all-passed";
  }

  return closureState.reviewReason ?? "unanswered";
}

function resolveTopicChapterRecommendedAction(
  closureState: TopicChapterClosureState,
): TopicChapterRecommendedAction {
  if (closureState.status === "unsettled") {
    return "stay-on-chapter";
  }

  if (closureState.reviewQuestionId) {
    return "review-question";
  }

  return "explore-next-angle";
}

function getSummaryStateSignature(summaryState: TopicChapterSummaryState) {
  return [
    summaryState.status,
    summaryState.reason,
    summaryState.recommendedAction,
    summaryState.reviewQuestionId ?? "",
  ].join("|");
}

export function areTopicChapterSummaryStatesEqual(
  left: TopicChapterSummaryState | undefined,
  right: TopicChapterSummaryState | undefined,
) {
  if (!left && !right) {
    return true;
  }

  if (!left || !right) {
    return false;
  }

  return (
    left.status === right.status &&
    left.reason === right.reason &&
    left.recommendedAction === right.recommendedAction &&
    left.firstReachedAt === right.firstReachedAt &&
    left.lastUpdatedAt === right.lastUpdatedAt &&
    left.reviewQuestionId === right.reviewQuestionId
  );
}

export function normalizeTopicChapterSummaryState(
  value: Partial<TopicChapterSummaryState> | null | undefined,
) {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const validStatuses = new Set(["grounded", "provisional", "unsettled"]);
  const validReasons = new Set([
    "all-passed",
    "weak",
    "pending",
    "continued",
    "skipped",
    "unanswered",
  ]);
  const validActions = new Set([
    "explore-next-angle",
    "review-question",
    "stay-on-chapter",
  ]);

  if (
    !validStatuses.has(value.status ?? "") ||
    !validReasons.has(value.reason ?? "") ||
    !validActions.has(value.recommendedAction ?? "") ||
    typeof value.firstReachedAt !== "string" ||
    typeof value.lastUpdatedAt !== "string"
  ) {
    return undefined;
  }

  return {
    status: value.status as TopicChapterSummaryState["status"],
    reason: value.reason as TopicChapterSummaryState["reason"],
    recommendedAction:
      value.recommendedAction as TopicChapterSummaryState["recommendedAction"],
    firstReachedAt: value.firstReachedAt,
    lastUpdatedAt: value.lastUpdatedAt,
    reviewQuestionId:
      typeof value.reviewQuestionId === "string" ? value.reviewQuestionId : null,
  } satisfies TopicChapterSummaryState;
}

export function createTopicChapterSummaryState({
  closureState,
  previousState,
  now,
}: {
  closureState: TopicChapterClosureState;
  previousState?: TopicChapterSummaryState;
  now?: string;
}): TopicChapterSummaryState {
  const timestamp = now ?? new Date().toISOString();
  const nextState: TopicChapterSummaryState = {
    status: closureState.status,
    reason: resolveTopicChapterSummaryReason(closureState),
    recommendedAction: resolveTopicChapterRecommendedAction(closureState),
    firstReachedAt:
      previousState?.status === closureState.status
        ? previousState.firstReachedAt
        : timestamp,
    lastUpdatedAt: timestamp,
    reviewQuestionId: closureState.reviewQuestionId,
  };

  if (
    previousState &&
    getSummaryStateSignature(previousState) === getSummaryStateSignature(nextState)
  ) {
    return {
      ...nextState,
      lastUpdatedAt: previousState.lastUpdatedAt,
    };
  }

  return nextState;
}

export function getTopicChapterSummaryPresentation(
  summaryState: TopicChapterSummaryState,
) {
  if (summaryState.status === "grounded") {
    return {
      heading: "Chapter Grounded",
      summary: "This chapter is grounded enough to move on.",
      detail:
        "The current chain has enough structure to continue without forcing another pass right now.",
      canMoveOn: true,
    };
  }

  if (summaryState.status === "unsettled") {
    return {
      heading: "Chapter Unsettled",
      summary: "This chapter still feels unsettled. Consider one more pass.",
      detail:
        "One visible node in this chapter still needs to be handled before the chapter can safely close.",
      canMoveOn: false,
    };
  }

  const summary =
    summaryState.reason === "weak"
      ? "You can continue, but one key question is still weak."
      : summaryState.reason === "pending"
        ? "You can continue, but one question is still marked for review."
        : summaryState.reason === "continued"
          ? "You can continue, but one laddered question is still unanswered."
          : "You can continue, but one question is still skipped for now.";

  return {
    heading: "Chapter Ready To Move On",
    summary,
    detail:
      "This chapter can close for now, but keeping a breadcrumb back to the weaker node will make the learning flow safer.",
    canMoveOn: true,
  };
}
