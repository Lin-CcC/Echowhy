import type {
  TopicAngleProgressState,
  TopicAnswerState,
  TopicDiscussionStep,
  TopicQuestionReviewState,
} from "./types";

export type TopicChapterClosureStatus = "grounded" | "provisional" | "unsettled";

export type TopicChapterReviewReason =
  | "weak"
  | "pending"
  | "continued"
  | "skipped"
  | "unanswered";

export type TopicChapterClosureState = {
  status: TopicChapterClosureStatus;
  canMoveOn: boolean;
  summary: string;
  detail: string;
  reviewQuestionId: string | null;
  reviewReason: TopicChapterReviewReason | null;
};

function isPassed(answerState: TopicAnswerState | undefined) {
  return answerState?.status === "passed";
}

export function isTopicAnswerHandled(answerState: TopicAnswerState | undefined) {
  return (
    answerState?.status === "passed" ||
    answerState?.status === "skipped" ||
    answerState?.status === "continued"
  );
}

export function canAngleProgressMoveOn(
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

  return answerStates.every((answerState) => isTopicAnswerHandled(answerState));
}

function getReviewReason({
  answerState,
  reviewState,
}: {
  answerState: TopicAnswerState | undefined;
  reviewState: TopicQuestionReviewState | undefined;
}): TopicChapterReviewReason | null {
  if (!answerState) {
    return "unanswered";
  }

  if (answerState.status === "failed") {
    return "weak";
  }

  if (reviewState?.selfMarkedWeak === true || answerState.feedback?.level === "weak") {
    return "weak";
  }

  if (reviewState?.pending === true) {
    return "pending";
  }

  if (answerState.status === "continued") {
    return "continued";
  }

  if (answerState.status === "skipped") {
    return "skipped";
  }

  return null;
}

function getReasonPriority(reason: TopicChapterReviewReason | null) {
  switch (reason) {
    case "unanswered":
      return 0;
    case "weak":
      return 1;
    case "pending":
      return 2;
    case "continued":
      return 3;
    case "skipped":
      return 4;
    default:
      return 99;
  }
}

function getGroundedState(): TopicChapterClosureState {
  return {
    status: "grounded",
    canMoveOn: true,
    summary: "This chapter is grounded enough to move on.",
    detail:
      "The current chain has enough structure to continue without forcing another pass right now.",
    reviewQuestionId: null,
    reviewReason: null,
  };
}

function getProvisionalState(
  reviewQuestionId: string | null,
  reviewReason: TopicChapterReviewReason | null,
): TopicChapterClosureState {
  const summary =
    reviewReason === "weak"
      ? "You can continue, but one key question is still weak."
      : reviewReason === "pending"
        ? "You can continue, but one question is still marked for review."
        : reviewReason === "continued"
          ? "You can continue, but one laddered question is still unanswered."
          : "You can continue, but one question is still skipped for now.";

  return {
    status: "provisional",
    canMoveOn: true,
    summary,
    detail:
      "This chapter can close for now, but keeping a breadcrumb back to the weaker node will make the learning flow safer.",
    reviewQuestionId,
    reviewReason,
  };
}

function getUnsettledState(
  reviewQuestionId: string | null,
  reviewReason: TopicChapterReviewReason | null,
): TopicChapterClosureState {
  return {
    status: "unsettled",
    canMoveOn: false,
    summary: "This chapter still feels unsettled. Consider one more pass.",
    detail:
      "One visible node in this chapter still needs to be handled before the chapter can safely close.",
    reviewQuestionId,
    reviewReason,
  };
}

export function getTopicChapterClosureState({
  discussionSteps,
  angleState,
  questionReviewStateById,
}: {
  discussionSteps: TopicDiscussionStep[];
  angleState: TopicAngleProgressState | undefined;
  questionReviewStateById: Record<string, TopicQuestionReviewState | undefined>;
}): TopicChapterClosureState {
  if (!angleState || discussionSteps.length === 0) {
    return getUnsettledState(null, null);
  }

  const rankedSteps = discussionSteps
    .map((step, index) => {
      const answerState = angleState.answerStateByQuestionId[step.question.id];
      const reviewState = questionReviewStateById[step.question.id];
      const reviewReason = getReviewReason({
        answerState,
        reviewState,
      });

      return {
        index,
        step,
        answerState,
        reviewReason,
      };
    })
    .sort((left, right) => {
      const priorityDiff =
        getReasonPriority(left.reviewReason) - getReasonPriority(right.reviewReason);

      if (priorityDiff !== 0) {
        return priorityDiff;
      }

      return left.index - right.index;
    });

  const reviewTarget = rankedSteps.find((entry) => entry.reviewReason !== null) ?? null;
  const reviewQuestionId = reviewTarget?.step.question.id ?? null;
  const reviewReason = reviewTarget?.reviewReason ?? null;
  const canMoveOn = discussionSteps.every((step) =>
    isTopicAnswerHandled(angleState.answerStateByQuestionId[step.question.id]),
  );

  if (!canMoveOn) {
    return getUnsettledState(reviewQuestionId, reviewReason);
  }

  const allPassed = discussionSteps.every((step) =>
    isPassed(angleState.answerStateByQuestionId[step.question.id]),
  );

  if (allPassed && !reviewReason) {
    return getGroundedState();
  }

  return getProvisionalState(reviewQuestionId, reviewReason);
}
