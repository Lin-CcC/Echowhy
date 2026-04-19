export type TopicNodeVisualState = "dim" | "pulsing" | "lit";

export type TopicNode = {
  id: string;
  angleId?: string;
  label: string;
  prompt: string;
  x: number;
  y: number;
  visualState: TopicNodeVisualState;
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
};

export type TopicFeedbackPreview = {
  score: number;
  level: "weak" | "partial" | "good" | "strong";
  correctPoints: string[];
  vaguePoints: string[];
  missingPoints: string[];
  nextSuggestion: string;
};

export type TopicDiscussionStep = {
  id: string;
  block: TopicExplanationBlock;
  question: TopicNode;
  defaultReferenceId?: string;
};

export type TopicAnswerState = {
  questionId: string;
  answer: string;
  status: "checked" | "skipped";
  feedback: TopicFeedbackPreview | null;
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
  sourceReferences: TopicSourceReference[];
  initialActiveQuestionId: string;
  feedbackPreview: TopicFeedbackPreview;
};
