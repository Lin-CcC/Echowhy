export type {
  AttemptRecord,
  AttemptRecordStatus,
  InsertedQuestionRecord,
  TopicAnswerState,
  TopicAngle,
  TopicAngleProgressState,
  TopicBehaviorSignalCounts,
  TopicDiscussionStep,
  TopicDiscussionPlan,
  TopicEdge,
  TopicExplanationBlock,
  TopicFeedbackLevel,
  TopicFeedbackPreview,
  TopicFeedbackTemplate,
  TopicGuidedEntry,
  TopicNode,
  TopicQuestionReviewState,
  TopicNodeVisualState,
  TopicProjectTreeItem,
  TopicSession,
  TopicSourceImport,
  TopicSourceReference,
} from "./types";

export {
  loadPersistedTopicSessionState,
  savePersistedTopicSessionState,
  type PersistedTopicSessionState,
} from "./storage";

export {
  createGeneratedTopicSession,
  resolveTopicSession,
} from "./topic-resolver";

export {
  createEmptyBehaviorSignalCounts,
  createInitialAngleProgress,
  createTopicModuleRecord,
  filterValidReferenceIds,
  mergePersistedAngleProgress,
  normalizePinnedSourcesByAngle,
} from "./topic-state";

export {
  buildDiscussionSteps,
  evaluateTopicAnswer,
  getAttemptRecordStatus,
  getFirstIncompleteAngleId,
} from "./session-helpers";

export {
  appendLearningModuleChild,
  deleteLearningModule,
  getLearningModuleById,
  loadLearningModules,
  saveLearningModules,
  upsertLearningModule,
  type LearningModuleChildKind,
  type LearningModuleChildRecord,
  type LearningModuleKind,
  type LearningModuleRecord,
} from "./module-storage";
