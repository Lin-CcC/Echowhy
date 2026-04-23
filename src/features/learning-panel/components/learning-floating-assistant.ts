import {
  getTopicChapterSummaryPresentation,
  type TopicAnswerAnalysisDimension,
  type TopicAnswerState,
  type TopicChapterSummaryState,
  type TopicFeedbackLevel,
} from "@/features/topic-session";

export type LearningFloatingAssistantMode =
  | "insert"
  | "draft"
  | "feedback"
  | "chapter";

export type LearningFloatingAssistantTone =
  | "cyan"
  | "emerald"
  | "amber"
  | "rose"
  | "slate";

export type LearningFloatingAssistantPrimaryAction =
  | "insert-question"
  | "continue-ladder"
  | "review-question"
  | "explore-next";

export type LearningFloatingAssistantState = {
  mode: LearningFloatingAssistantMode;
  eyebrow: string;
  label: string;
  summary: string;
  detail: string;
  tone: LearningFloatingAssistantTone;
  primaryAction: LearningFloatingAssistantPrimaryAction;
};

const analysisDimensionLabels: Record<TopicAnswerAnalysisDimension, string> = {
  "target-fit": "Target Fit",
  "conceptual-accuracy": "Conceptual Accuracy",
  "causal-link": "Causal Link",
  grounding: "Grounding",
  calibration: "Calibration",
};

function getFeedbackTone(level: TopicFeedbackLevel): LearningFloatingAssistantTone {
  if (level === "weak") {
    return "rose";
  }

  if (level === "partial") {
    return "amber";
  }

  return "emerald";
}

function getChapterTone(
  chapterSummaryState: TopicChapterSummaryState,
): LearningFloatingAssistantTone {
  if (chapterSummaryState.status === "grounded") {
    return "emerald";
  }

  if (chapterSummaryState.status === "provisional") {
    return "amber";
  }

  return "rose";
}

function getChapterPrimaryAction(
  chapterSummaryState: TopicChapterSummaryState,
): LearningFloatingAssistantPrimaryAction {
  if (chapterSummaryState.recommendedAction === "review-question") {
    return "review-question";
  }

  if (chapterSummaryState.recommendedAction === "explore-next-angle") {
    return "explore-next";
  }

  return "continue-ladder";
}

function formatAnalysisDimensions(
  dimensions: TopicAnswerAnalysisDimension[] | undefined,
) {
  if (!dimensions?.length) {
    return "Response analysis is clean enough for now.";
  }

  return `Response analysis: ${dimensions
    .map((dimension) => analysisDimensionLabels[dimension])
    .join(" / ")}`;
}

export function buildLearningFloatingAssistantState({
  hasDraft,
  showCompletionCard,
  chapterSummaryState,
  currentAnswerState,
}: {
  hasDraft: boolean;
  showCompletionCard: boolean;
  chapterSummaryState?: TopicChapterSummaryState;
  currentAnswerState?: TopicAnswerState;
}): LearningFloatingAssistantState {
  if (showCompletionCard && chapterSummaryState) {
    const presentation = getTopicChapterSummaryPresentation(chapterSummaryState);

    return {
      mode: "chapter",
      eyebrow: "Chapter note",
      label: presentation.heading,
      summary: presentation.summary,
      detail: presentation.detail,
      tone: getChapterTone(chapterSummaryState),
      primaryAction: getChapterPrimaryAction(chapterSummaryState),
    };
  }

  if (currentAnswerState?.feedback) {
    return {
      mode: "feedback",
      eyebrow: "Feedback",
      label: `${currentAnswerState.feedback.label} | ${currentAnswerState.feedback.score}`,
      summary: currentAnswerState.feedback.nextSuggestion,
      detail: formatAnalysisDimensions(currentAnswerState.feedback.analysisDimensions),
      tone: getFeedbackTone(currentAnswerState.feedback.level),
      primaryAction: "continue-ladder",
    };
  }

  if (hasDraft) {
    return {
      mode: "draft",
      eyebrow: "Draft",
      label: "Question draft ready",
      summary: "Drop it into the reading flow when the question has enough shape.",
      detail: "Drag the icon to a reading slot.",
      tone: "cyan",
      primaryAction: "insert-question",
    };
  }

  return {
    mode: "insert",
    eyebrow: "Assistant",
    label: "My question",
    summary: "Drag this into the content when a sharp why appears.",
    detail: "The inserted question becomes part of this learning chain.",
    tone: "cyan",
    primaryAction: "insert-question",
  };
}
