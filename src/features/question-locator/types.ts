import type { ReviewQueueFilter } from "@/features/review";

export type QuestionLocatorFilter = Extract<
  ReviewQueueFilter,
  "weak" | "unanswered" | "pending" | "bookmarked"
>;

export type QuestionLocatorItem = {
  questionId: string;
  questionPrompt: string;
  relativeTop: number;
};

export type QuestionLocatorCounts = Record<QuestionLocatorFilter, number>;

export type QuestionLocatorModel = {
  filter: QuestionLocatorFilter;
  totalCount: number;
  items: QuestionLocatorItem[];
};
