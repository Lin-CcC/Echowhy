import type { TopicFeedbackPreview } from "@/features/topic-session";

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
