export type TopicNodeVisualState = "dim" | "pulsing" | "lit";

export type TopicFeedbackLevel = "weak" | "partial" | "good" | "strong";

export type TopicAnswerAnalysisDimension =
  | "target-fit"
  | "conceptual-accuracy"
  | "causal-link"
  | "grounding"
  | "calibration";

export type TopicFeedbackTemplate = {
  correctPoints: string[];
  vaguePoints: string[];
  missingPoints: string[];
  nextSuggestion: string;
};

export type TopicNode = {
  id: string;
  angleId?: string;
  label: string;
  prompt: string;
  x: number;
  y: number;
  visualState: TopicNodeVisualState;
  blockId?: string;
  referenceIds?: string[];
  revealAnswer?: string;
  inputPlaceholder?: string;
  keywordGroups?: string[][];
  bonusKeywords?: string[];
  feedbackByLevel?: Record<TopicFeedbackLevel, TopicFeedbackTemplate>;
};

export type TopicEdge = {
  from: string;
  to: string;
};

export type TopicExplanationBlock = {
  id: string;
  title?: string;
  content: string;
  order: number;
};

export type TopicAngle = {
  id: string;
  title: string;
  description: string;
  isCustom: boolean;
  rootQuestion?: string;
};

export type TopicSourceReference = {
  id: string;
  label: string;
  referencePath: string;
  snippet: string;
  startLine?: number;
  endLine?: number;
  fullContent?: string;
  linkedBlockId?: string;
  linkedQuestionId?: string;
  defaultHighlightLines?: number[];
};

export type TopicFeedbackPreview = TopicFeedbackTemplate & {
  score: number;
  level: TopicFeedbackLevel;
  label: string;
  analysisDimensions?: TopicAnswerAnalysisDimension[];
};

export type AttemptRecordStatus = "Weak" | "Partial" | "Strong";

export type AttemptRecord = {
  id: string;
  createdAt: string;
  userAnswer: string;
  aiFeedback: TopicFeedbackPreview;
  score: number;
  status: AttemptRecordStatus;
  revealedAnswerUsed: boolean;
};

export type InsertedQuestionRecord = {
  id: string;
  angleId: string;
  targetId: string;
  prompt: string;
  createdAt: string;
  visualState: TopicNodeVisualState;
  answerDraft?: string;
  answerState?: TopicAnswerState;
};

export type TopicDiscussionStep = {
  id: string;
  angleId: string;
  block: TopicExplanationBlock;
  question: TopicNode;
  defaultReferenceId?: string;
};

export type TopicGeneratedDiscussionStep = TopicDiscussionStep & {
  afterQuestionId: string;
  createdAt: string;
};

export type TopicDiscussionPlan = {
  id: string;
  angleId: string;
  blockId: string;
  questionId: string;
  defaultReferenceId?: string;
};

export type TopicAnswerState = {
  questionId: string;
  answer: string;
  status: "passed" | "failed" | "skipped" | "continued";
  feedback: TopicFeedbackPreview | null;
  summary: string | null;
  isCollapsed: boolean;
  revealedAnswerUsed?: boolean;
  updatedAt?: string;
};

export type TopicQuestionReviewState = {
  pending?: boolean;
  bookmarked?: boolean;
  selfMarkedWeak?: boolean;
  updatedAt?: string;
};

export type TopicBehaviorSignalCounts = {
  answerChecks: number;
  continueLadderCount: number;
  branchQuestionCount: number;
  skipCount: number;
  pendingMarkCount: number;
};

export type TopicChapterSummaryStatus = "grounded" | "provisional" | "unsettled";

export type TopicChapterSummaryReason =
  | "all-passed"
  | "weak"
  | "pending"
  | "continued"
  | "skipped"
  | "unanswered";

export type TopicChapterRecommendedAction =
  | "explore-next-angle"
  | "review-question"
  | "stay-on-chapter";

export type TopicChapterSummaryState = {
  status: TopicChapterSummaryStatus;
  reason: TopicChapterSummaryReason;
  recommendedAction: TopicChapterRecommendedAction;
  firstReachedAt: string;
  lastUpdatedAt: string;
  reviewQuestionId: string | null;
};

export type TopicAngleProgressState = {
  unlockedStepCount: number;
  answerStateByQuestionId: Record<string, TopicAnswerState | undefined>;
  attemptRecordsByQuestionId: Record<string, AttemptRecord[] | undefined>;
  customQuestion: string;
  generatedDiscussionSteps: TopicGeneratedDiscussionStep[];
  chapterSummaryState?: TopicChapterSummaryState;
};

export type TopicGuidedEntry = {
  id: string;
  label: string;
  topicId: string;
  angleId?: string;
  customQuestion?: string;
};

export type TopicProjectTreeItem = {
  id: string;
  label: string;
  kind: "directory" | "file";
  topicId: string;
  angleId?: string;
  customQuestion?: string;
};

export type TopicSourceImport = {
  id: string;
  projectName: string;
  overview: string[];
  guidedQuestions: TopicGuidedEntry[];
  fileTree: TopicProjectTreeItem[];
};

export type TopicSession = {
  id: string;
  title: string;
  rootQuestion: string;
  goal: string;
  overview: string;
  explanationBlocks: TopicExplanationBlock[];
  learningAngles: TopicAngle[];
  questions: TopicNode[];
  edges: TopicEdge[];
  discussionPlans: TopicDiscussionPlan[];
  sourceReferences: TopicSourceReference[];
  initialActiveQuestionId: string;
  feedbackPreview: TopicFeedbackPreview;
  sourceImport: TopicSourceImport;
};
