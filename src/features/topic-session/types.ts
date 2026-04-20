export type TopicNodeVisualState = "dim" | "pulsing" | "lit";

export type TopicFeedbackLevel = "weak" | "partial" | "good" | "strong";

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
};

export type TopicDiscussionStep = {
  id: string;
  angleId: string;
  block: TopicExplanationBlock;
  question: TopicNode;
  defaultReferenceId?: string;
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
  status: "passed" | "failed" | "skipped";
  feedback: TopicFeedbackPreview | null;
  summary: string | null;
  isCollapsed: boolean;
  revealedAnswerUsed?: boolean;
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
