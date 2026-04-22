import type { Dispatch, SetStateAction } from "react";
import type { FeedbackCardState } from "@/features/source-reference";
import type {
  InsertedQuestionRecord,
  TopicAngleProgressState,
  TopicBehaviorSignalCounts,
  TopicDiscussionStep,
  TopicQuestionReviewState,
  TopicSession,
} from "@/features/topic-session";
import { useLearningTopicQuestionActions } from "./use-learning-topic-question-actions";
import { useLearningTopicWorkbenchActions } from "./use-learning-topic-workbench-actions";

type UseLearningTopicInteractionsParams = {
  topic: TopicSession;
  selectedAngleId: string;
  setSelectedAngleId: Dispatch<SetStateAction<string>>;
  setIsAngleMenuOpen: Dispatch<SetStateAction<boolean>>;
  setAngleStateById: Dispatch<
    SetStateAction<Record<string, TopicAngleProgressState>>
  >;
  setPreviewSource: Dispatch<SetStateAction<string | null>>;
  pinnedSources: string[];
  setPinnedSourcesByAngleId: Dispatch<SetStateAction<Record<string, string[]>>>;
  floatingFeedbacks: FeedbackCardState[];
  setFloatingFeedbacks: Dispatch<SetStateAction<FeedbackCardState[]>>;
  activeFeedbackId: string | null;
  setActiveFeedbackId: Dispatch<SetStateAction<string | null>>;
  setDraftAnswersByQuestionId: Dispatch<SetStateAction<Record<string, string>>>;
  setCustomQuestionDraftsByAngleId: Dispatch<
    SetStateAction<Record<string, string>>
  >;
  revealedQuestionIds: Record<string, boolean>;
  setRevealedQuestionIds: Dispatch<SetStateAction<Record<string, boolean>>>;
  insertedQuestions: InsertedQuestionRecord[];
  setInsertedQuestionsByAngleId: Dispatch<
    SetStateAction<Record<string, InsertedQuestionRecord[]>>
  >;
  questionReviewStateById: Record<string, TopicQuestionReviewState | undefined>;
  setQuestionReviewStateById: Dispatch<
    SetStateAction<Record<string, TopicQuestionReviewState | undefined>>
  >;
  setBehaviorSignalCounts: Dispatch<SetStateAction<TopicBehaviorSignalCounts>>;
  discussionSteps: TopicDiscussionStep[];
  currentStepIndex: number;
  currentStep: TopicDiscussionStep | null;
  nextAngleId: string | null;
};

export function useLearningTopicInteractions(
  params: UseLearningTopicInteractionsParams,
) {
  const questionActions = useLearningTopicQuestionActions({
    selectedAngleId: params.selectedAngleId,
    setSelectedAngleId: params.setSelectedAngleId,
    setIsAngleMenuOpen: params.setIsAngleMenuOpen,
    setAngleStateById: params.setAngleStateById,
    setDraftAnswersByQuestionId: params.setDraftAnswersByQuestionId,
    setCustomQuestionDraftsByAngleId: params.setCustomQuestionDraftsByAngleId,
    currentStepIndex: params.currentStepIndex,
    currentStep: params.currentStep,
    discussionSteps: params.discussionSteps,
    nextAngleId: params.nextAngleId,
    insertedQuestions: params.insertedQuestions,
    setInsertedQuestionsByAngleId: params.setInsertedQuestionsByAngleId,
    questionReviewStateById: params.questionReviewStateById,
    setQuestionReviewStateById: params.setQuestionReviewStateById,
    revealedQuestionIds: params.revealedQuestionIds,
    setRevealedQuestionIds: params.setRevealedQuestionIds,
    setBehaviorSignalCounts: params.setBehaviorSignalCounts,
  });
  const workbenchActions = useLearningTopicWorkbenchActions({
    topic: params.topic,
    selectedAngleId: params.selectedAngleId,
    setAngleStateById: params.setAngleStateById,
    setPreviewSource: params.setPreviewSource,
    pinnedSources: params.pinnedSources,
    setPinnedSourcesByAngleId: params.setPinnedSourcesByAngleId,
    floatingFeedbacks: params.floatingFeedbacks,
    setFloatingFeedbacks: params.setFloatingFeedbacks,
    activeFeedbackId: params.activeFeedbackId,
    setActiveFeedbackId: params.setActiveFeedbackId,
    setDraftAnswersByQuestionId: params.setDraftAnswersByQuestionId,
    revealedQuestionIds: params.revealedQuestionIds,
    setRevealedQuestionIds: params.setRevealedQuestionIds,
    setBehaviorSignalCounts: params.setBehaviorSignalCounts,
    discussionSteps: params.discussionSteps,
    currentStepIndex: params.currentStepIndex,
    currentStep: params.currentStep,
  });

  return {
    ...questionActions,
    ...workbenchActions,
  };
}
