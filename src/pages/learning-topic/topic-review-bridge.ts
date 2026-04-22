import {
  buildQuestionLocatorCounts,
  buildQuestionLocatorModel,
  type QuestionLocatorCounts,
  type QuestionLocatorFilter,
  type QuestionLocatorModel,
} from "@/features/question-locator";
import { buildReviewQueue } from "@/features/review";
import {
  createTopicModuleRecord,
  type InsertedQuestionRecord,
  type LearningModuleRecord,
  type PersistedTopicSessionState,
  type TopicAngleProgressState,
  type TopicBehaviorSignalCounts,
  type TopicQuestionReviewState,
  type TopicSession,
} from "@/features/topic-session";

type BuildTopicReviewBridgeOptions = {
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
  orderedQuestionIds: string[];
};

type TopicReviewBridge = {
  locatorCounts: QuestionLocatorCounts;
  locatorModel: QuestionLocatorModel | null;
};

function createPersistedTopicState({
  selectedAngleId,
  angleStateById,
  pinnedSourcesByAngleId,
  draftAnswersByQuestionId,
  customQuestionDraftsByAngleId,
  revealedQuestionIds,
  insertedQuestionsByAngleId,
  questionReviewStateById,
  behaviorSignalCounts,
}: Omit<BuildTopicReviewBridgeOptions, "topic" | "storedModule" | "activeScanFilter" | "orderedQuestionIds">): PersistedTopicSessionState {
  return {
    version: 1,
    selectedAngleId,
    angleStateById,
    pinnedSourcesByAngleId,
    draftAnswersByQuestionId,
    customQuestionDraftsByAngleId,
    revealedQuestionIds,
    insertedQuestionsByAngleId,
    questionReviewStateById,
    behaviorSignalCounts,
  };
}

export function buildTopicReviewBridge({
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
  orderedQuestionIds,
}: BuildTopicReviewBridgeOptions): TopicReviewBridge {
  const topicModule = createTopicModuleRecord(topic, storedModule);
  const persistedTopicState = createPersistedTopicState({
    selectedAngleId,
    angleStateById,
    pinnedSourcesByAngleId,
    draftAnswersByQuestionId,
    customQuestionDraftsByAngleId,
    revealedQuestionIds,
    insertedQuestionsByAngleId,
    questionReviewStateById,
    behaviorSignalCounts,
  });
  const reviewQueue = buildReviewQueue({
    modules: [topicModule],
    loadTopicState: () => persistedTopicState,
    resolveTopicSession: () => topic,
  });
  const locatorCounts = buildQuestionLocatorCounts({
    items: reviewQueue.items,
    topicId: topic.id,
    angleId: selectedAngleId,
  });

  return {
    locatorCounts,
    locatorModel: activeScanFilter
      ? buildQuestionLocatorModel({
          items: reviewQueue.items,
          filter: activeScanFilter,
          topicId: topic.id,
          angleId: selectedAngleId,
          orderedQuestionIds,
        })
      : null,
  };
}
