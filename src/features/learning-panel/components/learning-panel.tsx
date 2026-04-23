import { useEffect, useRef, type FormEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useThemeMode } from "@/app/theme/theme-provider";
import type {
  InsertedQuestionRecord,
  TopicChapterSummaryState,
  TopicAnswerState,
  TopicDiscussionStep,
  TopicQuestionReviewState,
} from "@/features/topic-session";
import { buildLearningFloatingAssistantState } from "./learning-floating-assistant";
import { LearningFloatingInsertLauncher } from "./learning-floating-insert-launcher";
import { LearningPanelBody } from "./learning-panel-body";
import { LearningPanelHeader } from "./learning-panel-header";
import { LearningPanelInsertStack } from "./learning-panel-insert-stack";
import { useLearningPanelInsertFlow } from "./use-learning-panel-insert-flow";

const answerSchema = z.object({
  answer: z.string().trim().min(8, "Try answering in a complete thought."),
});

const customQuestionSchema = z.object({
  question: z.string().trim().min(6, "Give this follow-up a little more shape."),
});

type AnswerValues = z.infer<typeof answerSchema>;
type CustomQuestionValues = z.infer<typeof customQuestionSchema>;

type LearningPanelProps = {
  title: string;
  rootQuestion: string;
  steps: TopicDiscussionStep[];
  currentStepIndex: number;
  visibleStepCount: number;
  answerStateByQuestionId: Record<string, TopicAnswerState | undefined>;
  questionReviewStateById: Record<string, TopicQuestionReviewState | undefined>;
  activeReferenceIds: string[];
  highlightedBlockId: string | null;
  prefilledAnswer?: string;
  showCustomComposer: boolean;
  customQuestionDraft: string;
  chapterSummaryState?: TopicChapterSummaryState;
  showCompletionCard: boolean;
  activeAngleTitle: string;
  canExploreAnotherAngle: boolean;
  insertedQuestions: InsertedQuestionRecord[];
  onDraftAnswerChange: (questionId: string, draft: string) => void;
  onCustomQuestionDraftChange: (draft: string) => void;
  onToggleHistory: (questionId: string) => void;
  onInsertQuestion: (targetId: string, question: string) => void;
  onDeleteInsertedQuestion: (questionId: string) => void;
  onInsertedQuestionDraftChange: (questionId: string, draft: string) => void;
  onCheckInsertedQuestion: (questionId: string, answer: string) => void;
  onWorkbenchCardInserted: (payload: {
    kind?: "feedback" | "source";
    id?: string;
  }) => void;
  onCheckCurrent: (answer: string) => void;
  onContinueLadder: () => void;
  onSkipCurrent: () => void;
  onToggleQuestionPending: (questionId: string) => void;
  onToggleQuestionBookmark: (questionId: string) => void;
  onToggleQuestionWeak: (questionId: string) => void;
  onTryAgain: () => void;
  onRevealAnswer: () => void;
  onResumeQuestion: (questionId: string) => void;
  onPreviewReference: (referenceId: string) => void;
  onClearPreviewReference: () => void;
  onPinSource: (referenceId: string) => void;
  onSubmitCustomQuestion: (question: string) => void;
  onExploreAnotherAngle: () => void;
  onResumeRecommendedQuestion: () => void;
  onReturnToLibrary: () => void;
  onAskFollowUp: () => void;
};

export function LearningPanel({
  title,
  rootQuestion,
  steps,
  currentStepIndex,
  visibleStepCount,
  answerStateByQuestionId,
  questionReviewStateById,
  activeReferenceIds,
  highlightedBlockId,
  prefilledAnswer,
  showCustomComposer,
  customQuestionDraft,
  chapterSummaryState,
  showCompletionCard,
  activeAngleTitle,
  canExploreAnotherAngle,
  insertedQuestions,
  onDraftAnswerChange,
  onCustomQuestionDraftChange,
  onToggleHistory,
  onInsertQuestion,
  onDeleteInsertedQuestion,
  onInsertedQuestionDraftChange,
  onCheckInsertedQuestion,
  onWorkbenchCardInserted,
  onCheckCurrent,
  onContinueLadder,
  onSkipCurrent,
  onToggleQuestionPending,
  onToggleQuestionBookmark,
  onToggleQuestionWeak,
  onTryAgain,
  onRevealAnswer,
  onResumeQuestion,
  onPreviewReference,
  onClearPreviewReference,
  onPinSource,
  onSubmitCustomQuestion,
  onExploreAnotherAngle,
  onResumeRecommendedQuestion,
  onReturnToLibrary,
  onAskFollowUp,
}: LearningPanelProps) {
  const { theme } = useThemeMode();
  const isDark = theme === "dark";
  const useLightShield = !isDark;
  const currentStep = steps[currentStepIndex];
  const currentAnswerState = currentStep
    ? answerStateByQuestionId[currentStep.question.id]
    : undefined;

  const answerForm = useForm<AnswerValues>({
    resolver: zodResolver(answerSchema),
    defaultValues: { answer: prefilledAnswer ?? "" },
  });

  const customQuestionForm = useForm<CustomQuestionValues>({
    resolver: zodResolver(customQuestionSchema),
    defaultValues: { question: customQuestionDraft },
  });

  const lastQuestionIdRef = useRef<string | null>(null);
  const lastCustomComposerVisibleRef = useRef(false);
  const {
    isInsertDragging,
    activeInsertTargetId,
    insertComposerTargetId,
    insertQuestionDraft,
    insertButtonPosition,
    isFloatingWindowHovered,
    insertedWorkbenchBlocksByTargetId,
    setInsertQuestionDraft,
    setIsFloatingWindowHovered,
    cancelFloatingInsert,
    handleInsertDragStart,
    handleSubmitInsertedQuestion,
    handleWorkbenchCardDrop,
    handleRootDragOver,
    handleInsertSlotDragOver,
    handleFloatingComposerFocus,
    handleFloatingComposerBlur,
    stopReadingAutoScroll,
    removeInsertedWorkbenchBlock,
  } = useLearningPanelInsertFlow({
    onInsertQuestion,
    onWorkbenchCardInserted,
  });

  useEffect(() => {
    const nextQuestionId = currentStep?.question.id ?? null;

    if (!nextQuestionId) {
      lastQuestionIdRef.current = null;
      return;
    }

    const nextAnswer = prefilledAnswer ?? "";
    const currentValue = answerForm.getValues("answer") ?? "";
    const questionChanged = lastQuestionIdRef.current !== nextQuestionId;

    if (questionChanged || currentValue !== nextAnswer) {
      answerForm.reset({ answer: nextAnswer });
    }

    lastQuestionIdRef.current = nextQuestionId;
  }, [currentStep?.question.id, prefilledAnswer, answerForm]);

  useEffect(() => {
    if (!showCustomComposer) {
      lastCustomComposerVisibleRef.current = false;
      return;
    }

    const nextQuestion = customQuestionDraft ?? "";
    const currentValue = customQuestionForm.getValues("question") ?? "";
    const composerBecameVisible = !lastCustomComposerVisibleRef.current;

    if (composerBecameVisible || currentValue !== nextQuestion) {
      customQuestionForm.reset({ question: nextQuestion });
    }

    lastCustomComposerVisibleRef.current = true;
  }, [customQuestionDraft, customQuestionForm, showCustomComposer]);

  const handleSubmit = answerForm.handleSubmit(({ answer }) => onCheckCurrent(answer));
  const handleCustomQuestionSubmit = customQuestionForm.handleSubmit(({ question }) =>
    onSubmitCustomQuestion(question),
  );

  const answerField = answerForm.register("answer");
  const customQuestionField = customQuestionForm.register("question");
  const visibleSteps = steps.slice(0, visibleStepCount);
  const failedCurrentAttempt = currentAnswerState?.status === "failed";
  const assistantState = buildLearningFloatingAssistantState({
    hasDraft: Boolean(insertQuestionDraft.trim()),
    showCompletionCard,
    chapterSummaryState,
    currentAnswerState,
  });
  const insertedQuestionsByTargetId = insertedQuestions.reduce<
    Record<string, InsertedQuestionRecord[]>
  >((accumulator, question) => {
    accumulator[question.targetId] = [
      ...(accumulator[question.targetId] ?? []),
      question,
    ];
    return accumulator;
  }, {});

  function handleAnswerFormSubmit(event: FormEvent<HTMLFormElement>) {
    void handleSubmit(event);
  }

  function handleCustomComposerFormSubmit(event: FormEvent<HTMLFormElement>) {
    void handleCustomQuestionSubmit(event);
  }

  function handleCurrentAnswerChange(nextValue: string) {
    if (!currentStep) {
      return;
    }

    onDraftAnswerChange(currentStep.question.id, nextValue);
  }

  function renderInsertSlot(targetId: string) {
    return (
      <LearningPanelInsertStack
        targetId={targetId}
        activeInsertTargetId={activeInsertTargetId}
        insertComposerTargetId={insertComposerTargetId}
        insertQuestionDraft={insertQuestionDraft}
        insertedWorkbenchBlocksByTargetId={insertedWorkbenchBlocksByTargetId}
        insertedQuestionsByTargetId={insertedQuestionsByTargetId}
        isDark={isDark}
        useLightShield={useLightShield}
        onSlotDragOver={handleInsertSlotDragOver}
        onSlotDrop={handleWorkbenchCardDrop}
        onDraftChange={setInsertQuestionDraft}
        onComposerFocus={handleFloatingComposerFocus}
        onComposerBlur={handleFloatingComposerBlur}
        onCancel={() => cancelFloatingInsert({ clearDraft: true })}
        onSubmit={handleSubmitInsertedQuestion}
        onRemoveWorkbenchBlock={removeInsertedWorkbenchBlock}
        onDeleteInsertedQuestion={onDeleteInsertedQuestion}
        onInsertedQuestionDraftChange={onInsertedQuestionDraftChange}
        onCheckInsertedQuestion={onCheckInsertedQuestion}
      />
    );
  }

  return (
    <div
      className="mx-auto w-full max-w-3xl px-8 py-8 pb-24"
      onDragOver={handleRootDragOver}
      onDrop={stopReadingAutoScroll}
    >
      {!insertComposerTargetId ? (
        <LearningFloatingInsertLauncher
          isInsertDragging={isInsertDragging}
          insertButtonPosition={insertButtonPosition}
          isFloatingWindowHovered={isFloatingWindowHovered}
          hasDraft={Boolean(insertQuestionDraft.trim())}
          isDark={isDark}
          useLightShield={useLightShield}
          assistantState={assistantState}
          onMouseEnter={() => setIsFloatingWindowHovered(true)}
          onMouseLeave={() => setIsFloatingWindowHovered(false)}
          onPointerDown={handleInsertDragStart}
          onContinueLadder={onContinueLadder}
          onReviewQuestion={onResumeRecommendedQuestion}
          onExploreNext={onExploreAnotherAngle}
        />
      ) : null}

      <LearningPanelHeader
        title={title}
        rootQuestion={rootQuestion}
        useLightShield={useLightShield}
      />

      {renderInsertSlot("after-root")}

      <LearningPanelBody
        visibleSteps={visibleSteps}
        currentStepIndex={currentStepIndex}
        showCompletionCard={showCompletionCard}
        showCustomComposer={showCustomComposer}
        chapterSummaryState={chapterSummaryState}
        currentAnswerState={currentAnswerState}
        failedCurrentAttempt={failedCurrentAttempt}
        answerStateByQuestionId={answerStateByQuestionId}
        questionReviewStateById={questionReviewStateById}
        activeReferenceIds={activeReferenceIds}
        highlightedBlockId={highlightedBlockId}
        activeAngleTitle={activeAngleTitle}
        canExploreAnotherAngle={canExploreAnotherAngle}
        answerField={answerField}
        customQuestionField={customQuestionField}
        answerErrorMessage={answerForm.formState.errors.answer?.message ?? ""}
        customQuestionErrorMessage={
          customQuestionForm.formState.errors.question?.message ?? ""
        }
        useLightShield={useLightShield}
        isDark={isDark}
        currentStepQuestionId={currentStep?.question.id}
        renderInsertSlot={renderInsertSlot}
        onToggleHistory={onToggleHistory}
        onToggleQuestionPending={onToggleQuestionPending}
        onToggleQuestionBookmark={onToggleQuestionBookmark}
        onToggleQuestionWeak={onToggleQuestionWeak}
        onPreviewReference={onPreviewReference}
        onClearPreviewReference={onClearPreviewReference}
        onPinSource={onPinSource}
        onCurrentAnswerChange={handleCurrentAnswerChange}
        onAnswerSubmit={handleAnswerFormSubmit}
        onTryAgain={onTryAgain}
        onRevealAnswer={onRevealAnswer}
        onContinueLadder={onContinueLadder}
        onSkipCurrent={onSkipCurrent}
        onResumeQuestion={onResumeQuestion}
        onCustomQuestionSubmit={handleCustomComposerFormSubmit}
        onCustomQuestionDraftChange={onCustomQuestionDraftChange}
        onExploreAnotherAngle={onExploreAnotherAngle}
        onResumeRecommendedQuestion={onResumeRecommendedQuestion}
        onReturnToLibrary={onReturnToLibrary}
        onAskFollowUp={onAskFollowUp}
      />
    </div>
  );
}
