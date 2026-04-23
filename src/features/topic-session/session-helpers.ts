import type {
  AttemptRecordStatus,
  TopicDiscussionStep,
  TopicFeedbackLevel,
  TopicFeedbackPreview,
  TopicGeneratedDiscussionStep,
  TopicNode,
  TopicSession,
} from "./types";
import {
  countQuestionKeywordMatches,
  inferTopicAnswerAnalysisDimensions,
} from "./answer-analysis";

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

function buildBaseDiscussionSteps(
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

function appendGeneratedChildren(
  parentQuestionId: string,
  childrenByQuestionId: Map<string, TopicGeneratedDiscussionStep[]>,
  appendedStepIds: Set<string>,
): TopicDiscussionStep[] {
  const childSteps = childrenByQuestionId.get(parentQuestionId) ?? [];

  return childSteps.flatMap((step) => {
    if (appendedStepIds.has(step.id)) {
      return [];
    }

    appendedStepIds.add(step.id);

    return [
      step,
      ...appendGeneratedChildren(
        step.question.id,
        childrenByQuestionId,
        appendedStepIds,
      ),
    ];
  });
}

function createContinueLadderBlockContent(currentStep: TopicDiscussionStep) {
  const promptStem = currentStep.question.prompt.trim().replace(/[?？]+\s*$/, "");
  const blockLead = currentStep.block.title?.trim() || currentStep.question.label.trim();

  return [
    `This ladder step stays inside "${blockLead}" and pushes one layer deeper than "${promptStem}".`,
    "Instead of switching topics, it asks what hidden boundary, dependency, or timing detail makes the current understanding hold together.",
  ].join(" ");
}

function createContinueLadderPrompt(currentStep: TopicDiscussionStep) {
  const promptStem = currentStep.question.prompt.trim().replace(/[?？]+\s*$/, "");

  return `If "${promptStem}" is true, what deeper distinction or dependency explains it?`;
}

export function createContinueLadderDiscussionStep({
  currentStep,
  ladderIndex,
}: {
  currentStep: TopicDiscussionStep;
  ladderIndex: number;
}): TopicGeneratedDiscussionStep {
  const generatedStepId = `generated-step-${currentStep.angleId}-${ladderIndex}`;
  const generatedBlockId = `generated-exp-${currentStep.angleId}-${ladderIndex}`;
  const generatedQuestionId = `generated-q-${currentStep.angleId}-${ladderIndex}`;
  const nextReferenceIds = currentStep.question.referenceIds ?? [];
  const nextPrompt = createContinueLadderPrompt(currentStep);

  return {
    id: generatedStepId,
    angleId: currentStep.angleId,
    afterQuestionId: currentStep.question.id,
    createdAt: new Date().toISOString(),
    block: {
      id: generatedBlockId,
      title: `Next distinction ${ladderIndex}`,
      content: createContinueLadderBlockContent(currentStep),
      order: currentStep.block.order + ladderIndex / 10,
    },
    question: {
      id: generatedQuestionId,
      angleId: currentStep.angleId,
      label: `Next why ${ladderIndex}`,
      prompt: nextPrompt,
      x: currentStep.question.x + 170,
      y: Math.max(48, currentStep.question.y - 110),
      visualState: "dim",
      referenceIds: nextReferenceIds,
      revealAnswer:
        "A strong answer should name one deeper boundary, dependency, or timing detail that explains the current step without leaving the same source context.",
      keywordGroups: currentStep.question.keywordGroups,
      bonusKeywords: currentStep.question.bonusKeywords,
    },
    defaultReferenceId:
      currentStep.defaultReferenceId ?? currentStep.question.referenceIds?.[0],
  };
}

export function buildDiscussionSteps(
  topic: TopicSession,
  angleId: string,
  customQuestion?: string,
  generatedDiscussionSteps: TopicGeneratedDiscussionStep[] = [],
): TopicDiscussionStep[] {
  const baseSteps = buildBaseDiscussionSteps(topic, angleId, customQuestion);

  if (generatedDiscussionSteps.length === 0) {
    return baseSteps;
  }

  const childrenByQuestionId = generatedDiscussionSteps
    .filter((step) => step.angleId === angleId)
    .reduce<Map<string, TopicGeneratedDiscussionStep[]>>((accumulator, step) => {
      accumulator.set(step.afterQuestionId, [
        ...(accumulator.get(step.afterQuestionId) ?? []),
        step,
      ]);
      return accumulator;
    }, new Map());

  const appendedStepIds = new Set<string>();

  return baseSteps.flatMap((step) => [
    step,
    ...appendGeneratedChildren(
      step.question.id,
      childrenByQuestionId,
      appendedStepIds,
    ),
  ]);
}

export function evaluateTopicAnswer(question: TopicNode, answer: string): TopicFeedbackPreview {
  const normalizedAnswer = answer.trim().toLowerCase();
  const keywordMatches = countQuestionKeywordMatches(question, normalizedAnswer);

  const baseScore =
    keywordMatches.totalGroups > 0
      ? (keywordMatches.matchedGroups / keywordMatches.totalGroups) * 82
      : 40;
  const bonusScore =
    keywordMatches.totalBonus > 0
      ? (keywordMatches.matchedBonus / keywordMatches.totalBonus) * 18
      : 0;
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
    analysisDimensions: inferTopicAnswerAnalysisDimensions({
      question,
      answer,
      score,
    }),
  };
}

export function getAttemptRecordStatus(score: number): AttemptRecordStatus {
  if (score >= 85) {
    return "Strong";
  }

  if (score >= 60) {
    return "Partial";
  }

  return "Weak";
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
