import type {
  LearningModuleRecord,
  PersistedTopicSessionState,
  TopicAnswerAnalysisDimension,
  TopicChapterSummaryState,
  TopicSession,
} from "@/features/topic-session";
import type { ReviewQueueFilter, ReviewScope } from "@/features/review";

export type AnalyzeTab = "global" | "chapters" | "behavior";

export type AnalyzeWeakDimensionSummary = {
  dimension: TopicAnswerAnalysisDimension;
  count: number;
  title: string;
  summary: string;
  reviewScope: ReviewScope;
};

export type AnalyzeStatusBacklogSummary = {
  filter: Exclude<ReviewQueueFilter, "all" | "bookmarked" | "skipped"> | "skipped";
  count: number;
  title: string;
  summary: string;
  reviewScope: ReviewScope;
};

export type AnalyzeRevisitAreaSummary = {
  id: string;
  topicId: string;
  angleId: string;
  title: string;
  sourceLabel: string;
  status: TopicChapterSummaryState["status"];
  unresolvedCount: number;
  summary: string;
  reviewScope: ReviewScope;
};

export type AnalyzeChapterPattern = {
  id: string;
  topicId: string;
  angleId: string;
  title: string;
  sourceLabel: string;
  summaryState: TopicChapterSummaryState | null;
  unresolvedCount: number;
  topWeakDimensions: TopicAnswerAnalysisDimension[];
  summary: string;
  reviewScope: ReviewScope;
};

export type AnalyzeBehaviorInsight = {
  id: "answer-vs-ladder" | "main-vs-branch" | "dig-vs-defer";
  title: string;
  summary: string;
  detail: string;
  dominantSide: "answer" | "ladder" | "main" | "branch" | "dig" | "defer" | "balanced";
  numerator: number;
  denominator: number;
};

export type AnalyzePreview = {
  globalPatterns: {
    weakDimensions: AnalyzeWeakDimensionSummary[];
    statusBacklog: AnalyzeStatusBacklogSummary[];
    revisitAreas: AnalyzeRevisitAreaSummary[];
  };
  chapterPatterns: AnalyzeChapterPattern[];
  learningBehavior: AnalyzeBehaviorInsight[];
};

export type LoadTopicState = (
  topicId: string,
) => PersistedTopicSessionState | null;

export type ResolveTopicSession = (options: {
  module: LearningModuleRecord;
  topicId: string;
}) => TopicSession | null;
