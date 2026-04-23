import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { ConstellationView } from "@/features/constellation-view";
import { LearningPanel } from "@/features/learning-panel";
import {
  QuestionLocatorGutter,
  TopicScanControls,
  type QuestionLocatorFilter,
} from "@/features/question-locator";
import { SourceReferencePanel } from "@/features/source-reference";
import { resolveRecoverableQuestionId } from "@/features/topic-session";
import { cn } from "@/lib/utils";
import { useLearningTopicInteractions } from "./use-learning-topic-interactions";
import { useLearningTopicSession } from "./use-learning-topic-session";
import { useLearningTopicStructure } from "./use-learning-topic-structure";

export function LearningTopicPage() {
  const { id } = useParams({ from: "/topic/$id" });
  const search = useSearch({ from: "/topic/$id" });
  const navigate = useNavigate();
  const {
    storedModule,
    topic,
    selectedAngleId,
    setSelectedAngleId,
    isAngleMenuOpen,
    setIsAngleMenuOpen,
    angleStateById,
    setAngleStateById,
    previewSource,
    setPreviewSource,
    pinnedSourcesByAngleId,
    setPinnedSourcesByAngleId,
    floatingFeedbacks,
    setFloatingFeedbacks,
    activeFeedbackId,
    setActiveFeedbackId,
    draftAnswersByQuestionId,
    setDraftAnswersByQuestionId,
    customQuestionDraftsByAngleId,
    setCustomQuestionDraftsByAngleId,
    revealedQuestionIds,
    setRevealedQuestionIds,
    insertedQuestionsByAngleId,
    setInsertedQuestionsByAngleId,
    questionReviewStateById,
    setQuestionReviewStateById,
    focusQuestion,
    clearFocusedQuestion,
    behaviorSignalCounts,
    setBehaviorSignalCounts,
    activeAngle,
    activeAngleState,
    pinnedSources,
    insertedQuestions,
    discussionSteps,
    visibleStepCount,
    currentStepIndex,
    currentStep,
    currentDraftAnswer,
    chapterSummaryState,
    showCompletionCard,
    nextAngleId,
    canExploreAnotherAngle,
    showCustomComposer,
    currentCustomQuestionDraft,
    activeReferenceIds,
    activeFloatingFeedback,
    activeAngleLabel,
  } = useLearningTopicSession({
    topicId: id,
    routeAngleId: search.angle,
    routeCustomQuestion: search.customQuestion,
    routeSourceId: search.sourceId,
    routeSourceLabel: search.sourceLabel,
  });
  const [activeScanFilter, setActiveScanFilter] =
    useState<QuestionLocatorFilter | null>(null);
  const [highlightedBlockId, setHighlightedBlockId] = useState<string | null>(
    null,
  );
  const highlightTimeoutRef = useRef<number | null>(null);
  const consumedRoutedScrollKeyRef = useRef<string | null>(null);
  const consumedRoutedFocusKeyRef = useRef<string | null>(null);
  const { constellationNodes, constellationEdges, locatorCounts, locatorModel } =
    useLearningTopicStructure({
      topic,
      storedModule,
      selectedAngleId,
      angleStateById,
      pinnedSourcesByAngleId,
      draftAnswersByQuestionId,
      customQuestionDraftsByAngleId,
      revealedQuestionIds,
      insertedQuestionsByAngleId,
      questionReviewStateById,
      behaviorSignalCounts,
      activeScanFilter,
      discussionSteps,
      activeAngleState,
      insertedQuestions,
      currentStepIndex,
      showCompletionCard,
    });
  const {
    handleToggleHistory,
    handleInsertQuestion,
    handleDeleteInsertedQuestion,
    handleToggleQuestionPending,
    handleToggleQuestionBookmark,
    handleToggleQuestionWeak,
    handleInsertedQuestionDraftChange,
    handleCheckInsertedQuestion,
    handlePreviewReference,
    handleClearPreviewReference,
    handlePinSource,
    handleUnpinSource,
    handleClearAllSources,
    handleDraftAnswerChange,
    handleCustomQuestionDraftChange,
    handleCheckCurrent,
    dismissFloatingFeedback,
    handleSelectFeedback,
    handleCycleFeedback,
    handleReorderPinnedSources,
    handleReorderFeedbacks,
    handleWorkbenchCardInserted,
    handleContinueLadder,
    handleSkipCurrent,
    handleTryAgain,
    handleRevealAnswer,
    handleSubmitCustomQuestion,
    handleExploreAnotherAngle,
    handleAskFollowUp,
  } = useLearningTopicInteractions({
    topic,
    selectedAngleId,
    setSelectedAngleId,
    setIsAngleMenuOpen,
    setAngleStateById,
    setPreviewSource,
    pinnedSources,
    setPinnedSourcesByAngleId,
    floatingFeedbacks,
    setFloatingFeedbacks,
    activeFeedbackId,
    setActiveFeedbackId,
    setDraftAnswersByQuestionId,
    setCustomQuestionDraftsByAngleId,
    revealedQuestionIds,
    setRevealedQuestionIds,
    insertedQuestions,
    setInsertedQuestionsByAngleId,
    questionReviewStateById,
    setQuestionReviewStateById,
    activeAngleState,
    focusQuestion,
    clearFocusedQuestion,
    setBehaviorSignalCounts,
    discussionSteps,
    currentStepIndex,
    currentStep,
    nextAngleId,
  });

  useEffect(() => {
    if (!search.question) {
      consumedRoutedScrollKeyRef.current = null;
      consumedRoutedFocusKeyRef.current = null;
      return;
    }

    const routeKey = `${id}:${selectedAngleId}:${search.question}`;
    const routedFocusQuestionId = resolveRecoverableQuestionId({
      discussionSteps,
      visibleStepCount,
      requestedQuestionId: search.question,
    });

    if (
      routedFocusQuestionId &&
      consumedRoutedFocusKeyRef.current !== routeKey
    ) {
      focusQuestion(routedFocusQuestionId);
      consumedRoutedFocusKeyRef.current = routeKey;
    }

    if (consumedRoutedScrollKeyRef.current === routeKey) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const questionElement = document.getElementById(
        `question-${search.question}`,
      );

      if (!questionElement) {
        return;
      }

      questionElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      consumedRoutedScrollKeyRef.current = routeKey;
    }, 120);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [
    discussionSteps,
    focusQuestion,
    id,
    insertedQuestionsByAngleId,
    search.question,
    selectedAngleId,
    visibleStepCount,
  ]);

  useEffect(
    () => () => {
      if (highlightTimeoutRef.current) {
        window.clearTimeout(highlightTimeoutRef.current);
      }
    },
    [],
  );

  const triggerBlockHighlight = (blockId: string) => {
    setHighlightedBlockId(blockId);

    if (highlightTimeoutRef.current) {
      window.clearTimeout(highlightTimeoutRef.current);
    }

    highlightTimeoutRef.current = window.setTimeout(() => {
      setHighlightedBlockId(null);
    }, 1120);
  };

  const scrollToQuestion = (questionId: string) => {
    const element = document.getElementById(`question-${questionId}`);
    if (!element) {
      return;
    }

    element.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleSelectRecoverableQuestion = useCallback(
    (questionId: string) => {
      const recoverableQuestionId = resolveRecoverableQuestionId({
        discussionSteps,
        visibleStepCount,
        requestedQuestionId: questionId,
      });

      if (recoverableQuestionId) {
        focusQuestion(recoverableQuestionId);
      }

      scrollToQuestion(questionId);
    },
    [discussionSteps, focusQuestion, visibleStepCount],
  );

  const handleResumeQuestion = useCallback(
    (questionId: string) => {
      focusQuestion(questionId);
      scrollToQuestion(questionId);
    },
    [focusQuestion],
  );

  const handleResumeClosureQuestion = useCallback(() => {
    if (!chapterSummaryState?.reviewQuestionId) {
      return;
    }

    handleResumeQuestion(chapterSummaryState.reviewQuestionId);
  }, [chapterSummaryState?.reviewQuestionId, handleResumeQuestion]);

  const handleToggleScanFilter = useCallback(
    (filter: QuestionLocatorFilter) => {
      setActiveScanFilter((current) => (current === filter ? null : filter));
    },
    [],
  );

  const handleClearScanFilter = useCallback(() => {
    setActiveScanFilter(null);
  }, []);

  const handleOpenLocatorReview = useCallback(() => {
    if (!activeScanFilter) {
      return;
    }

    void navigate({
      to: "/review",
      search: {
        filter: activeScanFilter,
        topicId: topic.id,
        angleId: selectedAngleId,
        source: "locator",
      },
    });
  }, [activeScanFilter, navigate, selectedAngleId, topic.id]);

  const handleFocusReferenceBlock = (blockId: string, questionId?: string) => {
    const element =
      (questionId ? document.getElementById(`question-${questionId}`) : null) ??
      (blockId ? document.getElementById(`block-${blockId}`) : null);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    if (blockId) {
      triggerBlockHighlight(blockId);
    }
  };

  return (
    <section className="relative min-h-[calc(100vh-5rem)] w-full overflow-hidden bg-transparent">
      <div className="flex h-[calc(100vh-5rem)] w-full overflow-hidden">
        <aside className="relative hidden h-full w-[220px] shrink-0 border-r border-slate-200/50 bg-transparent lg:block dark:border-slate-800/50">
          <div className="relative flex h-full flex-col">
            <div className="relative z-10 px-8 pb-4 pt-8">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsAngleMenuOpen((previous) => !previous)}
                  className="block w-full max-w-[9.75rem] truncate whitespace-nowrap text-left text-[9px] font-mono uppercase tracking-[0.12em] text-slate-500 transition-colors hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400"
                  title={`Angle: ${activeAngleLabel}`}
                >
                  Angle: {activeAngleLabel} ▼
                </button>

                {isAngleMenuOpen ? (
                  <div className="absolute left-0 top-full z-20 mt-3 min-w-[12rem] rounded-2xl border border-slate-200/60 bg-white/70 p-2 backdrop-blur-xl dark:border-cyan-800/30 dark:bg-slate-950/55">
                    {topic.learningAngles.map((angle) => (
                      <button
                        key={angle.id}
                        type="button"
                        onClick={() => {
                          setSelectedAngleId(angle.id);
                          setIsAngleMenuOpen(false);
                        }}
                        className={cn(
                          "block w-full rounded-xl px-3 py-2 text-left text-sm transition-colors",
                          angle.id === selectedAngleId
                            ? "text-cyan-700 dark:text-cyan-400"
                            : "text-slate-600 hover:text-cyan-600 dark:text-slate-300 dark:hover:text-cyan-400",
                        )}
                      >
                        {angle.title}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <TopicScanControls
              activeFilter={activeScanFilter}
              counts={locatorCounts}
              onToggleFilter={handleToggleScanFilter}
              onClear={handleClearScanFilter}
              onOpenReview={handleOpenLocatorReview}
            />

            <div className="stealth-scrollbar relative flex-1 overflow-y-auto overflow-x-hidden">
              <ConstellationView
                nodes={constellationNodes}
                edges={constellationEdges}
                activeNodeId={currentStep?.question.id ?? ""}
                onSelectNode={handleSelectRecoverableQuestion}
              />
            </div>
          </div>
        </aside>

        <main
          data-auto-scroll-container
          className="stealth-scrollbar relative flex-1 overflow-y-auto overflow-x-hidden bg-transparent pb-40"
        >
          <div className="w-full">
            <LearningPanel
              title={topic.title}
              rootQuestion={activeAngle?.rootQuestion ?? topic.rootQuestion}
              steps={discussionSteps}
              currentStepIndex={currentStepIndex}
              visibleStepCount={visibleStepCount}
              answerStateByQuestionId={
                activeAngleState?.answerStateByQuestionId ?? {}
              }
              questionReviewStateById={questionReviewStateById}
              activeReferenceIds={activeReferenceIds}
              highlightedBlockId={highlightedBlockId}
              prefilledAnswer={currentDraftAnswer}
              showCustomComposer={showCustomComposer}
              customQuestionDraft={currentCustomQuestionDraft}
              chapterSummaryState={chapterSummaryState}
              showCompletionCard={showCompletionCard}
              activeAngleTitle={activeAngleLabel}
              canExploreAnotherAngle={canExploreAnotherAngle}
              insertedQuestions={insertedQuestions}
              onDraftAnswerChange={handleDraftAnswerChange}
              onCustomQuestionDraftChange={handleCustomQuestionDraftChange}
              onToggleHistory={handleToggleHistory}
              onInsertQuestion={handleInsertQuestion}
              onDeleteInsertedQuestion={handleDeleteInsertedQuestion}
              onInsertedQuestionDraftChange={handleInsertedQuestionDraftChange}
              onCheckInsertedQuestion={handleCheckInsertedQuestion}
              onWorkbenchCardInserted={handleWorkbenchCardInserted}
              onCheckCurrent={handleCheckCurrent}
              onContinueLadder={handleContinueLadder}
              onSkipCurrent={handleSkipCurrent}
              onToggleQuestionPending={handleToggleQuestionPending}
              onToggleQuestionBookmark={handleToggleQuestionBookmark}
              onToggleQuestionWeak={handleToggleQuestionWeak}
              onTryAgain={handleTryAgain}
              onRevealAnswer={handleRevealAnswer}
              onResumeQuestion={handleResumeQuestion}
              onPreviewReference={handlePreviewReference}
              onClearPreviewReference={handleClearPreviewReference}
              onPinSource={handlePinSource}
              onSubmitCustomQuestion={handleSubmitCustomQuestion}
              onExploreAnotherAngle={handleExploreAnotherAngle}
              onResumeRecommendedQuestion={handleResumeClosureQuestion}
              onReturnToLibrary={() => void navigate({ to: "/library" })}
              onAskFollowUp={handleAskFollowUp}
            />
          </div>
        </main>

        <QuestionLocatorGutter
          model={locatorModel}
          onSelectQuestion={handleSelectRecoverableQuestion}
        />

        <SourceReferencePanel
          references={topic.sourceReferences}
          pinnedReferenceIds={pinnedSources}
          previewReferenceId={previewSource}
          feedbackCards={floatingFeedbacks}
          activeFeedbackId={activeFloatingFeedback?.id ?? null}
          onDismissFeedback={dismissFloatingFeedback}
          onSelectFeedback={handleSelectFeedback}
          onCycleFeedback={handleCycleFeedback}
          onReorderFeedbacks={handleReorderFeedbacks}
          onReorderSources={handleReorderPinnedSources}
          onUnpinSource={handleUnpinSource}
          onClearAllSources={handleClearAllSources}
          onFocusBlock={handleFocusReferenceBlock}
          onFocusQuestion={scrollToQuestion}
        />
      </div>
    </section>
  );
}
