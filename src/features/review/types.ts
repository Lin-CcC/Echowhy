import type {
  AttemptRecord,
  TopicAnswerAnalysisDimension,
  TopicChapterSummaryState,
  TopicFeedbackPreview,
  TopicQuestionReviewState,
} from "@/features/topic-session";

export type ReviewQueueFilter =
  | "all"
  | "weak"
  | "unanswered"
  | "pending"
  | "skipped"
  | "bookmarked";

export type ReviewQueueStatus =
  | "answered-good"
  | "answered-weak"
  | "unanswered"
  | "skipped";

export type ReviewQueueItemSource = "main" | "inserted";

export type ReviewQueueAttempt = AttemptRecord & {
  synthetic?: boolean;
};

export type ReviewQueueItem = {
  id: string;
  topicId: string;
  moduleId: string;
  moduleTitle: string;
  angleId: string;
  angleTitle: string;
  questionId: string;
  questionPrompt: string;
  sourceLabel: string;
  source: ReviewQueueItemSource;
  status: ReviewQueueStatus;
  isPending: boolean;
  isBookmarked: boolean;
  isSelfMarkedWeak: boolean;
  isWeak: boolean;
  latestActivityAt: string;
  latestAnswer: string | null;
  latestFeedback: TopicFeedbackPreview | null;
  analysisDimensions: TopicAnswerAnalysisDimension[];
  summary: string | null;
  attempts: ReviewQueueAttempt[];
  routeSearch: {
    angle: string;
    question: string;
  };
  reviewState: TopicQuestionReviewState | null;
};

export type ReviewQueueCounts = Record<ReviewQueueFilter, number>;

export type ReviewChapterSummary = {
  id: string;
  topicId: string;
  moduleId: string;
  moduleTitle: string;
  angleId: string;
  angleTitle: string;
  sourceLabel: string;
  latestActivityAt: string;
  counts: ReviewQueueCounts;
  summaryState: TopicChapterSummaryState | null;
  routeSearch: {
    angle: string;
  };
};

export type ReviewQueue = {
  items: ReviewQueueItem[];
  chapters: ReviewChapterSummary[];
  counts: ReviewQueueCounts;
};

export type ReviewScope = {
  filter?: Exclude<ReviewQueueFilter, "all">;
  topicId?: string;
  angleId?: string;
  analysisDimension?: TopicAnswerAnalysisDimension;
  source?: "locator" | "analyze";
  sourceLabel?: string;
  sourceDetail?: string;
};
