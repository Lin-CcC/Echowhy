import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { ConstellationView } from "@/features/constellation-view";
import { LearningPanel } from "@/features/learning-panel";
import { SourceReferencePanel } from "@/features/source-reference";
import type {
  TopicAnswerState,
  TopicFeedbackPreview,
  TopicNodeVisualState,
  TopicSession,
} from "@/features/topic-session";
import {
  buildDiscussionSteps,
  evaluateTopicAnswer,
  getFirstIncompleteAngleId,
} from "@/features/topic-session/session-helpers";
import { constellationTopic, getConstellationTopicById } from "@/mock/data/constellation-topic";
import { cn } from "@/lib/utils";

type AngleProgressState = {
  unlockedStepCount: number;
  answerStateByQuestionId: Record<string, TopicAnswerState | undefined>;
  customQuestion: string;
};

type FeedbackCardState = {
  angleId: string;
  questionId: string;
  answer: string;
  feedback: TopicFeedbackPreview;
  revealedAnswerUsed: boolean;
};

function createInitialAngleProgress(topic: TopicSession) {
  return topic.learningAngles.reduce<Record<string, AngleProgressState>>((accumulator, angle) => {
    accumulator[angle.id] = {
      unlockedStepCount: angle.isCustom ? 0 : 1,
      answerStateByQuestionId: {},
      customQuestion: "",
    };
    return accumulator;
  }, {});
}

export function LearningTopicPage() {
  const { id } = useParams({ from: "/topic/$id" });
  const search = useSearch({ from: "/topic/$id" });
  const navigate = useNavigate();
  const topic = getConstellationTopicById(id) ?? constellationTopic;
  const defaultAngleId =
    topic.learningAngles.find((angle) => !angle.isCustom)?.id ?? topic.learningAngles[0]?.id ?? "";

  const [selectedAngleId, setSelectedAngleId] = useState(
    topic.learningAngles.some((angle) => angle.id === search.angle) ? search.angle ?? defaultAngleId : defaultAngleId,
  );
  const [angleStateById, setAngleStateById] = useState<Record<string, AngleProgressState>>(
    createInitialAngleProgress(topic),
  );
  const [isAngleMenuOpen, setIsAngleMenuOpen] = useState(false);
  const [previewSource, setPreviewSource] = useState<string | null>(null);
  const [pinnedSources, setPinnedSources] = useState<string[]>([]);
  const [floatingFeedback, setFloatingFeedback] = useState<FeedbackCardState | null>(null);
  const [draftAnswersByQuestionId, setDraftAnswersByQuestionId] = useState<Record<string, string>>({});
  const [revealedQuestionIds, setRevealedQuestionIds] = useState<Record<string, boolean>>({});
  const [highlightedBlockId, setHighlightedBlockId] = useState<string | null>(null);
  const [showReturnToCurrent, setShowReturnToCurrent] = useState(false);
  const highlightTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const initialAngleId =
      topic.learningAngles.some((angle) => angle.id === search.angle)
        ? search.angle ?? defaultAngleId
        : defaultAngleId;
    const initialProgress = createInitialAngleProgress(topic);

    if (initialAngleId === "angle-custom-followup" && search.customQuestion?.trim()) {
      initialProgress["angle-custom-followup"] = {
        ...initialProgress["angle-custom-followup"],
        customQuestion: search.customQuestion.trim(),
        unlockedStepCount: 1,
      };
    }

    setSelectedAngleId(initialAngleId);
    setAngleStateById(initialProgress);
    setPreviewSource(null);
    setPinnedSources([]);
    setFloatingFeedback(null);
    setDraftAnswersByQuestionId({});
    setRevealedQuestionIds({});
    setHighlightedBlockId(null);
    setShowReturnToCurrent(false);
  }, [defaultAngleId, search.angle, search.customQuestion, topic]);

  const activeAngle =
    topic.learningAngles.find((angle) => angle.id === selectedAngleId) ?? topic.learningAngles[0];
  const activeAngleState =
    angleStateById[selectedAngleId] ?? createInitialAngleProgress(topic)[selectedAngleId];

  const discussionSteps = useMemo(
    () => buildDiscussionSteps(topic, selectedAngleId, activeAngleState?.customQuestion),
    [activeAngleState?.customQuestion, selectedAngleId, topic],
  );

  const visibleStepCount =
    selectedAngleId === "angle-custom-followup" && !activeAngleState?.customQuestion
      ? 0
      : Math.min(activeAngleState?.unlockedStepCount ?? 1, discussionSteps.length);

  const currentStepIndex = visibleStepCount > 0 ? Math.min(visibleStepCount - 1, discussionSteps.length - 1) : -1;
  const currentStep = currentStepIndex >= 0 ? discussionSteps[currentStepIndex] : null;
  const currentAnswerState = currentStep
    ? activeAngleState?.answerStateByQuestionId[currentStep.question.id]
    : undefined;
  const currentDraftAnswer = currentStep ? draftAnswersByQuestionId[currentStep.question.id] : "";

  const completedAngleIds = useMemo(
    () =>
      topic.learningAngles
        .filter((angle) => !angle.isCustom)
        .filter((angle) => {
          const steps = buildDiscussionSteps(
            topic,
            angle.id,
            angleStateById[angle.id]?.customQuestion,
          );

          return (
            steps.length > 0 &&
            steps.every(
              (step) =>
                angleStateById[angle.id]?.answerStateByQuestionId[step.question.id]?.status ===
                "passed",
            )
          );
        })
        .map((angle) => angle.id),
    [angleStateById, topic],
  );

  const showCompletionCard =
    discussionSteps.length > 0 &&
    discussionSteps.every(
      (step) => activeAngleState?.answerStateByQuestionId[step.question.id]?.status === "passed",
    );

  const nextAngleId = getFirstIncompleteAngleId(topic, completedAngleIds);
  const canExploreAnotherAngle = Boolean(nextAngleId && nextAngleId !== selectedAngleId);

  const constellationNodes = useMemo(
    () =>
      discussionSteps.map((step, index) => {
        const answerState = activeAngleState?.answerStateByQuestionId[step.question.id];
        let visualState: TopicNodeVisualState = "dim";

        if (answerState?.status === "passed") {
          visualState = "lit";
        } else if (!showCompletionCard && index === currentStepIndex) {
          visualState = "pulsing";
        }

        return {
          ...step.question,
          visualState,
        };
      }),
    [activeAngleState?.answerStateByQuestionId, currentStepIndex, discussionSteps, showCompletionCard],
  );

  const constellationEdges = useMemo(
    () =>
      discussionSteps.slice(0, -1).map((step, index) => ({
        from: step.question.id,
        to: discussionSteps[index + 1]!.question.id,
      })),
    [discussionSteps],
  );

  useEffect(() => {
    if (!currentStep) {
      setShowReturnToCurrent(false);
      return;
    }

    const target = document.getElementById(`question-${currentStep.question.id}`);
    if (!target) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowReturnToCurrent(!entry.isIntersecting);
      },
      { threshold: 0.35 },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [currentStep?.question.id]);

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
    }, 2000);
  };

  const scrollToQuestion = (questionId: string) => {
    const element = document.getElementById(`question-${questionId}`);
    if (!element) {
      return;
    }

    element.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleSelectNode = (nodeId: string) => {
    scrollToQuestion(nodeId);
  };

  const handleToggleHistory = (questionId: string) => {
    setAngleStateById((previous) => {
      const angleState = previous[selectedAngleId];
      const current = angleState?.answerStateByQuestionId[questionId];

      if (!angleState || !current) {
        return previous;
      }

      return {
        ...previous,
        [selectedAngleId]: {
          ...angleState,
          answerStateByQuestionId: {
            ...angleState.answerStateByQuestionId,
            [questionId]: {
              ...current,
              isCollapsed: !current.isCollapsed,
            },
          },
        },
      };
    });
  };

  const handlePreviewReference = (referenceId: string) => {
    if (!pinnedSources.includes(referenceId)) {
      setPreviewSource(referenceId);
    }
  };

  const handleClearPreviewReference = () => {
    setPreviewSource(null);
  };

  const handlePinSource = (referenceId: string) => {
    setPinnedSources((previous) =>
      previous.includes(referenceId)
        ? previous.filter((id) => id !== referenceId)
        : [...previous, referenceId],
    );
    setPreviewSource(null);
  };

  const handleUnpinSource = (referenceId: string) => {
    setPinnedSources((previous) => previous.filter((id) => id !== referenceId));
  };

  const handleClearAllSources = () => {
    setPinnedSources([]);
    setPreviewSource(null);
  };

  const handleCheckCurrent = (answer: string) => {
    if (!currentStep) {
      return;
    }

    const feedback = evaluateTopicAnswer(currentStep.question, answer);
    setDraftAnswersByQuestionId((previous) => ({
      ...previous,
      [currentStep.question.id]: answer,
    }));
    setFloatingFeedback({
      angleId: selectedAngleId,
      questionId: currentStep.question.id,
      answer,
      feedback,
      revealedAnswerUsed: Boolean(revealedQuestionIds[currentStep.question.id]),
    });
  };

  const dismissFloatingFeedback = () => {
    if (!floatingFeedback) {
      return;
    }

    const passed = floatingFeedback.feedback.score >= 60;

    setAngleStateById((previous) => {
      const angleState = previous[floatingFeedback.angleId];

      if (!angleState) {
        return previous;
      }

      const nextUnlocked = passed
        ? Math.min(Math.max(angleState.unlockedStepCount, currentStepIndex + 2), discussionSteps.length)
        : angleState.unlockedStepCount;

      return {
        ...previous,
        [floatingFeedback.angleId]: {
          ...angleState,
          unlockedStepCount: nextUnlocked,
          answerStateByQuestionId: {
            ...angleState.answerStateByQuestionId,
            [floatingFeedback.questionId]: {
              questionId: floatingFeedback.questionId,
              answer: floatingFeedback.answer,
              status: passed ? "passed" : "failed",
              feedback: floatingFeedback.feedback,
              summary: passed ? floatingFeedback.feedback.nextSuggestion : null,
              isCollapsed: passed,
              revealedAnswerUsed: floatingFeedback.revealedAnswerUsed,
            },
          },
        },
      };
    });

    setFloatingFeedback(null);

    if (passed) {
      setPreviewSource(null);
      setRevealedQuestionIds((previous) => {
        const next = { ...previous };
        delete next[currentStep?.question.id ?? ""];
        return next;
      });
    }
  };

  const handleSkipCurrent = () => {
    if (!currentStep) {
      return;
    }

    setAngleStateById((previous) => {
      const angleState = previous[selectedAngleId];

      if (!angleState) {
        return previous;
      }

      return {
        ...previous,
        [selectedAngleId]: {
          ...angleState,
          unlockedStepCount: Math.min(
            Math.max(angleState.unlockedStepCount, currentStepIndex + 2),
            discussionSteps.length,
          ),
          answerStateByQuestionId: {
            ...angleState.answerStateByQuestionId,
            [currentStep.question.id]: {
              questionId: currentStep.question.id,
              answer: "",
              status: "skipped",
              feedback: null,
              summary: "Skipped for now.",
              isCollapsed: true,
            },
          },
        },
      };
    });
  };

  const handleTryAgain = () => {
    if (!currentStep) {
      return;
    }

    setAngleStateById((previous) => {
      const angleState = previous[selectedAngleId];
      if (!angleState) {
        return previous;
      }

      const nextAnswers = { ...angleState.answerStateByQuestionId };
      delete nextAnswers[currentStep.question.id];

      return {
        ...previous,
        [selectedAngleId]: {
          ...angleState,
          answerStateByQuestionId: nextAnswers,
        },
      };
    });
  };

  const handleRevealAnswer = () => {
    if (!currentStep?.question.revealAnswer) {
      return;
    }

    setDraftAnswersByQuestionId((previous) => ({
      ...previous,
      [currentStep.question.id]: currentStep.question.revealAnswer ?? "",
    }));
    setRevealedQuestionIds((previous) => ({
      ...previous,
      [currentStep.question.id]: true,
    }));
  };

  const handleSubmitCustomQuestion = (question: string) => {
    setAngleStateById((previous) => ({
      ...previous,
      [selectedAngleId]: {
        ...previous[selectedAngleId],
        customQuestion: question,
        unlockedStepCount: 1,
        answerStateByQuestionId: {},
      },
    }));
  };

  const handleExploreAnotherAngle = () => {
    if (!nextAngleId) {
      return;
    }

    setSelectedAngleId(nextAngleId);
    setIsAngleMenuOpen(false);
  };

  const handleAskFollowUp = () => {
    setSelectedAngleId("angle-custom-followup");
    setIsAngleMenuOpen(false);
  };

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

  const activeReferenceIds = useMemo(
    () => [...new Set([...pinnedSources, ...(previewSource ? [previewSource] : [])])],
    [pinnedSources, previewSource],
  );

  const activeAngleLabel = activeAngle?.title ?? "Request flow";

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
                  className="whitespace-nowrap text-left text-[9px] font-mono uppercase tracking-[0.16em] text-slate-500 transition-colors hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400"
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

            <div className="relative flex-1">
              <ConstellationView
                nodes={constellationNodes}
                edges={constellationEdges}
                activeNodeId={currentStep?.question.id ?? ""}
                onSelectNode={handleSelectNode}
              />
            </div>
          </div>
        </aside>

        <main className="stealth-scrollbar relative flex-1 overflow-y-auto overflow-x-hidden bg-transparent pb-40">
          <div className="w-full">
            <LearningPanel
              title={topic.title}
              rootQuestion={activeAngle?.rootQuestion ?? topic.rootQuestion}
              steps={discussionSteps}
              currentStepIndex={currentStepIndex}
              visibleStepCount={visibleStepCount}
              answerStateByQuestionId={activeAngleState?.answerStateByQuestionId ?? {}}
              activeReferenceIds={activeReferenceIds}
              highlightedBlockId={highlightedBlockId}
              prefilledAnswer={currentDraftAnswer}
              showCustomComposer={selectedAngleId === "angle-custom-followup" && discussionSteps.length === 0}
              customQuestionDraft={activeAngleState?.customQuestion ?? ""}
              showCompletionCard={showCompletionCard}
              activeAngleTitle={activeAngleLabel}
              canExploreAnotherAngle={canExploreAnotherAngle}
              onToggleHistory={handleToggleHistory}
              onCheckCurrent={handleCheckCurrent}
              onSkipCurrent={handleSkipCurrent}
              onTryAgain={handleTryAgain}
              onRevealAnswer={handleRevealAnswer}
              onPreviewReference={handlePreviewReference}
              onClearPreviewReference={handleClearPreviewReference}
              onPinSource={handlePinSource}
              onSubmitCustomQuestion={handleSubmitCustomQuestion}
              onExploreAnotherAngle={handleExploreAnotherAngle}
              onReturnToLibrary={() => void navigate({ to: "/library" })}
              onAskFollowUp={handleAskFollowUp}
            />
          </div>

          {showReturnToCurrent && currentStep ? (
            <button
              type="button"
              onClick={() => scrollToQuestion(currentStep.question.id)}
              className={cn(
                "absolute bottom-6 right-8 z-20 rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] backdrop-blur-xl transition-colors",
                "border-slate-200/60 bg-white/46 text-slate-600 hover:text-cyan-600 dark:border-cyan-800/30 dark:bg-slate-950/34 dark:text-slate-300 dark:hover:text-cyan-400",
              )}
            >
              Return to current question
            </button>
          ) : null}
        </main>

        <SourceReferencePanel
          references={topic.sourceReferences}
          pinnedReferenceIds={pinnedSources}
          previewReferenceId={previewSource}
          floatingFeedback={floatingFeedback}
          onDismissFeedback={dismissFloatingFeedback}
          onUnpinSource={handleUnpinSource}
          onClearAllSources={handleClearAllSources}
          onFocusBlock={handleFocusReferenceBlock}
        />
      </div>

    </section>
  );
}
