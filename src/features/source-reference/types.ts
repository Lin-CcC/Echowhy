import type {
  TopicFeedbackLevel,
  TopicFeedbackPreview,
} from "@/features/topic-session";

export type FeedbackCardState = {
  id: string;
  angleId: string;
  questionId: string;
  answer: string;
  feedback: TopicFeedbackPreview;
  revealedAnswerUsed: boolean;
};

export type SourceDropTarget = {
  referenceId: string;
  position: "before" | "after";
} | null;

export type ActiveFeedbackTone = {
  badge: string;
  accent: string;
  shell: string;
  border: string;
  subtle: string;
};

export type WorkbenchInsertPayload = {
  kind: "feedback" | "source";
  id: string;
  label: string;
  insertPrompt: string;
  feedbackLevel?: TopicFeedbackLevel;
  title?: string;
  subtitle?: string;
  body?: string;
  code?: string;
  meta?: string;
};
