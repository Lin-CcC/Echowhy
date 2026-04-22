import { useMemo } from "react";
import type { QuestionLocatorFilter } from "@/features/question-locator";
import type {
  InsertedQuestionRecord,
  LearningModuleRecord,
  TopicAngleProgressState,
  TopicBehaviorSignalCounts,
  TopicDiscussionStep,
  TopicNode,
  TopicNodeVisualState,
  TopicQuestionReviewState,
  TopicSession,
} from "@/features/topic-session";
import { buildTopicReviewBridge } from "./topic-review-bridge";

type UseLearningTopicStructureParams = {
  topic: TopicSession;
  storedModule: LearningModuleRecord | null;
  selectedAngleId: string;
  angleStateById: Record<string, TopicAngleProgressState>;
  pinnedSourcesByAngleId: Record<string, string[]>;
  draftAnswersByQuestionId: Record<string, string>;
  customQuestionDraftsByAngleId: Record<string, string>;
  revealedQuestionIds: Record<string, boolean>;
  insertedQuestionsByAngleId: Record<string, InsertedQuestionRecord[]>;
  questionReviewStateById: Record<string, TopicQuestionReviewState | undefined>;
  behaviorSignalCounts: TopicBehaviorSignalCounts;
  activeScanFilter: QuestionLocatorFilter | null;
  discussionSteps: TopicDiscussionStep[];
  activeAngleState: TopicAngleProgressState | undefined;
  insertedQuestions: InsertedQuestionRecord[];
  currentStepIndex: number;
  showCompletionCard: boolean;
};

export function useLearningTopicStructure({
  topic,
  storedModule,
  selectedAngleId,
  angleStateById,
  pinnedSourcesByAngleId,
  draftAnswersByQuestionId,
  customQuestionDraftsByAngleId,
  revealedQuestionIds,
  insertedQuestionsByAngleId,
  questionReviewStateById,
  behaviorSignalCounts,
  activeScanFilter,
  discussionSteps,
  activeAngleState,
  insertedQuestions,
  currentStepIndex,
  showCompletionCard,
}: UseLearningTopicStructureParams) {
  const insertedQuestionsByTarget = useMemo(
    () =>
      insertedQuestions.reduce<Record<string, InsertedQuestionRecord[]>>(
        (accumulator, question) => {
          accumulator[question.targetId] = [
            ...(accumulator[question.targetId] ?? []),
            question,
          ];
          return accumulator;
        },
        {},
      ),
    [insertedQuestions],
  );

  const constellationNodes = useMemo(() => {
    const baseNodes = discussionSteps.map((step: TopicDiscussionStep, index: number) => {
      const answerState = activeAngleState?.answerStateByQuestionId[step.question.id];
      let visualState: TopicNodeVisualState = "dim";

      if (answerState?.status === "passed") {
        visualState = "lit";
      } else if (!showCompletionCard && index === currentStepIndex) {
        visualState = "pulsing";
      }

      return {
        ...step.question,
        visualState,
      };
    });

    function mapInsertedQuestion(question: InsertedQuestionRecord) {
      return {
        id: question.id,
        angleId: question.angleId,
        label: "My question",
        prompt: question.prompt,
        x: 0,
        y: 0,
        visualState:
          question.answerState?.status === "passed" ? "lit" : question.visualState,
      } satisfies TopicNode;
    }

    const orderedNodes: TopicNode[] = [
      ...(insertedQuestionsByTarget["after-root"] ?? []).map(mapInsertedQuestion),
    ];

    for (const [index, node] of baseNodes.entries()) {
      const step = discussionSteps[index];
      const insertedAfterStep =
        insertedQuestionsByTarget[`after-step:${step?.id}`] ?? [];
      const answerState = step
        ? activeAngleState?.answerStateByQuestionId[step.question.id]
        : undefined;
      const shouldInsertBeforeNode = !answerState || answerState.status === "failed";

      if (shouldInsertBeforeNode) {
        orderedNodes.push(...insertedAfterStep.map(mapInsertedQuestion));
      }

      orderedNodes.push(node);

      if (!shouldInsertBeforeNode) {
        orderedNodes.push(...insertedAfterStep.map(mapInsertedQuestion));
      }
    }

    return orderedNodes;
  }, [
    activeAngleState?.answerStateByQuestionId,
    currentStepIndex,
    discussionSteps,
    insertedQuestionsByTarget,
    showCompletionCard,
  ]);

  const constellationEdges = useMemo(
    () =>
      constellationNodes.slice(0, -1).map((node, index) => ({
        from: node.id,
        to: constellationNodes[index + 1]!.id,
      })),
    [constellationNodes],
  );

  const { locatorCounts, locatorModel } = useMemo(
    () =>
      buildTopicReviewBridge({
        topic,
        storedModule,
        selectedAngleId,
        angleStateById,
        pinnedSourcesByAngleId,
        draftAnswersByQuestionId,
        customQuestionDraftsByAngleId,
        revealedQuestionIds,
        insertedQuestionsByAngleId,
        questionReviewStateById,
        behaviorSignalCounts,
        activeScanFilter,
        orderedQuestionIds: constellationNodes.map((node) => node.id),
      }),
    [
      activeScanFilter,
      angleStateById,
      behaviorSignalCounts,
      constellationNodes,
      customQuestionDraftsByAngleId,
      draftAnswersByQuestionId,
      insertedQuestionsByAngleId,
      pinnedSourcesByAngleId,
      questionReviewStateById,
      revealedQuestionIds,
      selectedAngleId,
      storedModule,
      topic,
    ],
  );

  return {
    constellationNodes,
    constellationEdges,
    locatorCounts,
    locatorModel,
  };
}
