import type {
  TopicDiscussionStep,
  TopicFeedbackLevel,
  TopicFeedbackPreview,
  TopicNode,
  TopicSession,
} from "./types";

const feedbackLabels: Record<TopicFeedbackLevel, string> = {
  weak: "Weak",
  partial: "Partial",
  good: "Good!",
  strong: "Strong!",
};

const genericCustomQuestion: TopicNode = {
  id: "q-custom-followup",
  angleId: "angle-custom-followup",
  label: "My own why",
  prompt: "What is the specific part you want to understand next?",
  x: 560,
  y: 220,
  visualState: "dim",
  blockId: "exp-custom-followup",
  referenceIds: ["ref-auth-controller", "ref-auth-service", "ref-jwt-service"],
  revealAnswer:
    "A good follow-up answer should name the exact confusion, connect it to one source file, and explain why that part feels unclear right now.",
  keywordGroups: [["why", "because", "understand"], ["auth", "jwt", "controller", "service"]],
  bonusKeywords: ["flow", "rule", "validation", "token"],
  feedbackByLevel: {
    weak: {
      correctPoints: ["The question at least points toward the project source."],
      vaguePoints: ["It still feels too broad to drive a precise learning step."],
      missingPoints: ["Name one exact mechanism, file, or responsibility split you want to unpack."],
      nextSuggestion:
        "Rewrite the follow-up as one sharp why-question tied to a specific part of the login flow.",
    },
    partial: {
      correctPoints: ["The follow-up question is starting to narrow down the curiosity."],
      vaguePoints: ["It could still point more directly at one mechanism or file."],
      missingPoints: ["Say what exact confusion you want the next explanation to resolve."],
      nextSuggestion:
        "Turn the follow-up into one sentence that names the exact boundary, file, or decision you want to inspect.",
    },
    good: {
      correctPoints: [
        "The follow-up names a real uncertainty inside the current topic.",
        "It is specific enough to anchor to the same project source.",
      ],
      vaguePoints: ["You could still make the target file or mechanism more explicit."],
      missingPoints: [],
      nextSuggestion:
        "Use this follow-up to branch into one source reference and one concrete decision point.",
    },
    strong: {
      correctPoints: [
        "The follow-up is sharp, grounded, and clearly attached to the current login topic.",
        "It gives the next learning branch a precise target rather than a vague curiosity.",
      ],
      vaguePoints: [],
      missingPoints: [],
      nextSuggestion:
        "Great. Use that exact question as the next branch and anchor it to the most relevant source file.",
    },
  },
};

export function buildDiscussionSteps(
  topic: TopicSession,
  angleId: string,
  customQuestion?: string,
): TopicDiscussionStep[] {
  if (angleId === "angle-custom-followup" && !customQuestion?.trim()) {
    return [];
  }

  const explanationBlockById = new Map(topic.explanationBlocks.map((block) => [block.id, block]));
  const questionById = new Map(topic.questions.map((question) => [question.id, question]));

  const plans =
    angleId === "angle-custom-followup"
      ? [
          {
            id: "step-custom-followup",
            angleId,
            blockId: "exp-custom-followup",
            questionId: "q-custom-followup",
            defaultReferenceId: "ref-auth-service",
          },
        ]
      : topic.discussionPlans.filter((plan) => plan.angleId === angleId);

  return plans.flatMap((plan) => {
    const block = explanationBlockById.get(plan.blockId);
    const question =
      plan.questionId === "q-custom-followup"
        ? {
            ...genericCustomQuestion,
            prompt: customQuestion?.trim() || genericCustomQuestion.prompt,
          }
        : questionById.get(plan.questionId);

    return block && question
      ? [
          {
            id: plan.id,
            angleId: plan.angleId,
            block,
            question,
            defaultReferenceId: plan.defaultReferenceId,
          },
        ]
      : [];
  });
}

function containsKeyword(normalizedAnswer: string, keyword: string) {
  return normalizedAnswer.includes(keyword.toLowerCase());
}

export function evaluateTopicAnswer(question: TopicNode, answer: string): TopicFeedbackPreview {
  const normalizedAnswer = answer.trim().toLowerCase();
  const keywordGroups = question.keywordGroups ?? [];
  const matchedGroups = keywordGroups.filter((group) =>
    group.some((keyword) => containsKeyword(normalizedAnswer, keyword)),
  ).length;

  const bonusKeywords = question.bonusKeywords ?? [];
  const matchedBonus = bonusKeywords.filter((keyword) =>
    containsKeyword(normalizedAnswer, keyword),
  ).length;

  const baseScore =
    keywordGroups.length > 0 ? (matchedGroups / keywordGroups.length) * 82 : 40;
  const bonusScore =
    bonusKeywords.length > 0 ? (matchedBonus / bonusKeywords.length) * 18 : 0;
  const lengthBonus =
    normalizedAnswer.length > 160 ? 8 : normalizedAnswer.length > 90 ? 4 : 0;
  const score = Math.max(18, Math.min(100, Math.round(baseScore + bonusScore + lengthBonus)));

  const level: TopicFeedbackLevel =
    score >= 90 ? "strong" : score >= 80 ? "good" : score >= 60 ? "partial" : "weak";

  const template = question.feedbackByLevel?.[level] ?? genericCustomQuestion.feedbackByLevel![level];

  return {
    score,
    level,
    label: feedbackLabels[level],
    correctPoints: template.correctPoints,
    vaguePoints: template.vaguePoints,
    missingPoints: template.missingPoints,
    nextSuggestion: template.nextSuggestion,
  };
}

export function getFirstIncompleteAngleId(
  topic: TopicSession,
  completedAngleIds: string[],
): string | null {
  return (
    topic.learningAngles.find(
      (angle) => !angle.isCustom && !completedAngleIds.includes(angle.id),
    )?.id ?? null
  );
}
