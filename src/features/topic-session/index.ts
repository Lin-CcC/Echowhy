export type {
  AttemptRecord,
  AttemptRecordStatus,
  InsertedQuestionRecord,
  TopicAnswerState,
  TopicAngle,
  TopicAngleProgressState,
  TopicAnswerAnalysisDimension,
  TopicBehaviorSignalCounts,
  TopicDiscussionStep,
  TopicDiscussionPlan,
  TopicGeneratedDiscussionStep,
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
  applyContinueLadderProgress,
  applySkipCurrentQuestionProgress,
  createEmptyBehaviorSignalCounts,
  createInitialAngleProgress,
  createTopicModuleRecord,
  filterValidReferenceIds,
  mergePersistedAngleProgress,
  normalizePinnedSourcesByAngle,
  resolveCurrentDiscussionStepIndex,
  resolveRecoverableQuestionId,
  resolveRoutedFocusQuestionId,
} from "./topic-state";

export {
  countQuestionKeywordMatches,
  inferTopicAnswerAnalysisDimensions,
} from "./answer-analysis";

export {
  buildDiscussionSteps,
  createContinueLadderDiscussionStep,
  evaluateTopicAnswer,
  getAttemptRecordStatus,
  getFirstIncompleteAngleId,
} from "./session-helpers";

export type {
  TopicChapterClosureState,
  TopicChapterClosureStatus,
  TopicChapterReviewReason,
} from "./chapter-closure";

export {
  canAngleProgressMoveOn,
  getTopicChapterClosureState,
  isTopicAnswerHandled,
} from "./chapter-closure";

export type {
  TopicChapterRecommendedAction,
  TopicChapterSummaryReason,
  TopicChapterSummaryState,
  TopicChapterSummaryStatus,
} from "./types";

export {
  areTopicChapterSummaryStatesEqual,
  createTopicChapterSummaryState,
  getTopicChapterSummaryPresentation,
  normalizeTopicChapterSummaryState,
} from "./chapter-summary";

export { formatTopicFeedbackScoreLabel } from "./feedback-labels";

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
