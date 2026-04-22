import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { ConstellationView } from "@/features/constellation-view";
import { LearningPanel } from "@/features/learning-panel";
import { SourceReferencePanel } from "@/features/source-reference";
import type {
  InsertedQuestionRecord,
  TopicAnswerState,
  TopicAngleProgressState,
  TopicFeedbackPreview,
  TopicNode,
  TopicNodeVisualState,
  TopicSession,
} from "@/features/topic-session";
import {
  buildDiscussionSteps,
  evaluateTopicAnswer,
  getFirstIncompleteAngleId,
  getAttemptRecordStatus,
} from "@/features/topic-session/session-helpers";
import {
  loadPersistedTopicSessionState,
  savePersistedTopicSessionState,
} from "@/features/topic-session";
import {
  getLearningModuleById,
  upsertLearningModule,
} from "@/features/topic-session/module-storage";
import {
  constellationTopic,
  getConstellationTopicById,
  getSourceImportById,
} from "@/mock/data/constellation-topic";
import { cn } from "@/lib/utils";

type FeedbackCardState = {
  id: string;
  angleId: string;
  questionId: string;
  answer: string;
  feedback: TopicFeedbackPreview;
  revealedAnswerUsed: boolean;
};

function createGeneratedTopicSession({
  topicId,
  seedQuestion,
  sourceId,
  sourceLabel,
}: {
  topicId: string;
  seedQuestion?: string;
  sourceId?: string;
  sourceLabel?: string;
}): TopicSession {
  const sourceImport = sourceId ? getSourceImportById(sourceId) : undefined;
  const sourceName =
    sourceImport?.projectName ??
    sourceLabel?.trim() ??
    (sourceId ? "Imported source" : "Conceptual source");
  const moduleTitle = seedQuestion || sourceName;
  const moduleRootQuestion =
    seedQuestion || `What is worth understanding first in ${sourceName}?`;

  return {
    ...constellationTopic,
    id: topicId,
    title: moduleTitle,
    rootQuestion: moduleRootQuestion,
    goal: seedQuestion
      ? `Build a grounded learning path around "${seedQuestion}".`
      : `Build a grounded learning path from ${sourceName}.`,
    overview: seedQuestion
      ? `This generated module starts from the learner's question, then asks Echowhy to organize useful angles from the available source material.`
      : `This generated module starts from the selected source material and lets Echowhy propose useful learning angles before the learner adds their own why.`,
    learningAngles: constellationTopic.learningAngles.map((angle) => {
      if (angle.isCustom) {
        return { ...angle };
      }

      if (angle.id === "angle-request-flow") {
        return {
          ...angle,
          rootQuestion: seedQuestion
            ? `What source flow is most useful for answering: ${seedQuestion}`
            : `What is the first useful flow to understand in ${sourceName}?`,
        };
      }

      if (angle.id === "angle-responsibility") {
        return {
          ...angle,
          rootQuestion: seedQuestion
            ? `Which responsibility boundary matters most for: ${seedQuestion}`
            : `Which responsibility boundary in ${sourceName} is easiest to misunderstand?`,
        };
      }

      if (angle.id === "angle-jwt-timing") {
        return {
          ...angle,
          rootQuestion: seedQuestion
            ? `What timing or sequence detail changes the answer to: ${seedQuestion}`
            : `What sequence or timing detail should be learned from ${sourceName}?`,
        };
      }

      return { ...angle };
    }),
    sourceImport: {
      ...(sourceImport ?? constellationTopic.sourceImport),
      id: sourceId ?? "source-conceptual-search",
      projectName: sourceName,
    },
  };
}

function createInitialAngleProgress(topic: TopicSession) {
  return topic.learningAngles.reduce<Record<string, TopicAngleProgressState>>(
    (accumulator, angle) => {
      accumulator[angle.id] = {
        unlockedStepCount: angle.isCustom ? 0 : 1,
        answerStateByQuestionId: {},
        attemptRecordsByQuestionId: {},
        customQuestion: "",
      };
      return accumulator;
    },
    {},
  );
}

function mergePersistedAngleProgress(
  topic: TopicSession,
  persistedState?: Record<string, TopicAngleProgressState | undefined>,
) {
  const initialState = createInitialAngleProgress(topic);

  return topic.learningAngles.reduce<Record<string, TopicAngleProgressState>>(
    (accumulator, angle) => {
      const fallbackState = initialState[angle.id];
      const persistedAngleState = persistedState?.[angle.id];

      accumulator[angle.id] = {
        ...fallbackState,
        unlockedStepCount:
          typeof persistedAngleState?.unlockedStepCount === "number"
            ? Math.max(
                fallbackState.unlockedStepCount,
                persistedAngleState.unlockedStepCount,
              )
            : fallbackState.unlockedStepCount,
        answerStateByQuestionId:
          persistedAngleState?.answerStateByQuestionId ?? {},
        attemptRecordsByQuestionId:
          persistedAngleState?.attemptRecordsByQuestionId ?? {},
        customQuestion:
          typeof persistedAngleState?.customQuestion === "string"
            ? persistedAngleState.customQuestion
            : fallbackState.customQuestion,
      };

      return accumulator;
    },
    {},
  );
}

function filterValidReferenceIds(
  topic: TopicSession,
  referenceIds: string[] = [],
) {
  const validReferenceIds = new Set(
    topic.sourceReferences.map((reference) => reference.id),
  );

  return referenceIds.filter(
    (referenceId, index, sourceIds) =>
      validReferenceIds.has(referenceId) &&
      sourceIds.indexOf(referenceId) === index,
  );
}

function normalizePinnedSourcesByAngle(
  topic: TopicSession,
  pinnedSourcesByAngleId: Record<string, string[]> | undefined,
  legacyPinnedSources: string[] | undefined,
  fallbackAngleId: string,
) {
  const nextPinnedSourcesByAngleId: Record<string, string[]> = {};

  for (const angle of topic.learningAngles) {
    const rawPinnedSources = pinnedSourcesByAngleId?.[angle.id];
    const pinnedSources = filterValidReferenceIds(
      topic,
      Array.isArray(rawPinnedSources) ? rawPinnedSources : [],
    );

    if (pinnedSources.length) {
      nextPinnedSourcesByAngleId[angle.id] = pinnedSources;
    }
  }

  const hasPinnedSourcesByAngle =
    Object.keys(nextPinnedSourcesByAngleId).length > 0;

  if (!hasPinnedSourcesByAngle) {
    const legacySources = filterValidReferenceIds(
      topic,
      Array.isArray(legacyPinnedSources) ? legacyPinnedSources : [],
    );

    if (legacySources.length) {
      nextPinnedSourcesByAngleId[fallbackAngleId] = legacySources;
    }
  }

  return nextPinnedSourcesByAngleId;
}

export function LearningTopicPage() {
  const { id } = useParams({ from: "/topic/$id" });
  const search = useSearch({ from: "/topic/$id" });
  const navigate = useNavigate();
  const knownTopic = getConstellationTopicById(id);
  const storedModule = knownTopic ? null : getLearningModuleById(id);
  const generatedQuestionTitle =
    search.customQuestion?.trim() || storedModule?.seedQuestion;
  const generatedSourceId = search.sourceId ?? storedModule?.sourceId;
  const generatedSourceLabel =
    search.sourceLabel ?? storedModule?.sourceLabel ?? storedModule?.title;
  const topic = useMemo(
    () =>
      knownTopic ??
      createGeneratedTopicSession({
        topicId: id,
        seedQuestion: generatedQuestionTitle,
        sourceId: generatedSourceId,
        sourceLabel: generatedSourceLabel,
      }),
    [generatedQuestionTitle, generatedSourceId, generatedSourceLabel, id, knownTopic],
  );
  const defaultAngleId =
    topic.learningAngles.find((angle) => !angle.isCustom)?.id ??
    topic.learningAngles[0]?.id ??
    "";

  const [selectedAngleId, setSelectedAngleId] = useState(
    topic.learningAngles.some((angle) => angle.id === search.angle)
      ? (search.angle ?? defaultAngleId)
      : defaultAngleId,
  );
  const [angleStateById, setAngleStateById] = useState<
    Record<string, TopicAngleProgressState>
  >(createInitialAngleProgress(topic));
  const [isAngleMenuOpen, setIsAngleMenuOpen] = useState(false);
  const [restoredTopicId, setRestoredTopicId] = useState<string | null>(null);
  const [previewSource, setPreviewSource] = useState<string | null>(null);
  const [pinnedSourcesByAngleId, setPinnedSourcesByAngleId] = useState<
    Record<string, string[]>
  >({});
  const [floatingFeedbacks, setFloatingFeedbacks] = useState<FeedbackCardState[]>(
    [],
  );
  const [activeFeedbackId, setActiveFeedbackId] = useState<string | null>(null);
  const [draftAnswersByQuestionId, setDraftAnswersByQuestionId] = useState<
    Record<string, string>
  >({});
  const [customQuestionDraftsByAngleId, setCustomQuestionDraftsByAngleId] =
    useState<Record<string, string>>({});
  const [revealedQuestionIds, setRevealedQuestionIds] = useState<
    Record<string, boolean>
  >({});
  const [highlightedBlockId, setHighlightedBlockId] = useState<string | null>(
    null,
  );
  const [insertedQuestionsByAngleId, setInsertedQuestionsByAngleId] = useState<
    Record<string, InsertedQuestionRecord[]>
  >({});
  const highlightTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (knownTopic) {
      return;
    }

    upsertLearningModule({
      id: topic.id,
      title: topic.title,
      seedQuestion: generatedQuestionTitle,
      sourceId: generatedSourceId,
      sourceLabel: topic.sourceImport.projectName,
      kind: generatedSourceId ? "source-backed" : "conceptual",
    });
  }, [
    generatedQuestionTitle,
    generatedSourceId,
    knownTopic,
    topic.id,
    topic.sourceImport.projectName,
    topic.title,
  ]);

  useEffect(() => {
    const hasRouteAngle = topic.learningAngles.some(
      (angle) => angle.id === search.angle,
    );
    const routeAngleId = hasRouteAngle ? (search.angle ?? defaultAngleId) : defaultAngleId;
    const persistedState = loadPersistedTopicSessionState(topic.id);
    const initialProgress = mergePersistedAngleProgress(
      topic,
      persistedState?.angleStateById,
    );
    const persistedAngleId = persistedState?.selectedAngleId;
    const shouldStartFromGeneratedAngles =
      Boolean(search.customQuestion?.trim()) && !search.angle && !knownTopic;
    const initialAngleId = hasRouteAngle
      ? routeAngleId
      : shouldStartFromGeneratedAngles
        ? defaultAngleId
        : topic.learningAngles.some((angle) => angle.id === persistedAngleId)
          ? (persistedAngleId ?? defaultAngleId)
          : defaultAngleId;

    if (search.customQuestion?.trim()) {
      initialProgress["angle-custom-followup"] = {
        ...initialProgress["angle-custom-followup"],
        answerStateByQuestionId: {},
        attemptRecordsByQuestionId: {},
        customQuestion: search.customQuestion.trim(),
        unlockedStepCount: 1,
      };
    }

    setSelectedAngleId(initialAngleId);
    setAngleStateById(initialProgress);
    setPreviewSource(null);
    setPinnedSourcesByAngleId(
      normalizePinnedSourcesByAngle(
        topic,
        persistedState?.pinnedSourcesByAngleId,
        persistedState?.pinnedSources,
        initialAngleId,
      ),
    );
    setFloatingFeedbacks([]);
    setActiveFeedbackId(null);
    setDraftAnswersByQuestionId(persistedState?.draftAnswersByQuestionId ?? {});
    setCustomQuestionDraftsByAngleId(
      persistedState?.customQuestionDraftsByAngleId ??
        topic.learningAngles.reduce<Record<string, string>>(
          (accumulator, angle) => {
            accumulator[angle.id] =
              initialProgress[angle.id]?.customQuestion ?? "";
            return accumulator;
          },
          {},
        ),
    );
    setRevealedQuestionIds(persistedState?.revealedQuestionIds ?? {});
    setInsertedQuestionsByAngleId(
      persistedState?.insertedQuestionsByAngleId ?? {},
    );
    setHighlightedBlockId(null);
    setRestoredTopicId(topic.id);
  }, [defaultAngleId, search.angle, search.customQuestion, topic]);

  useEffect(() => {
    if (restoredTopicId !== topic.id) {
      return;
    }

    savePersistedTopicSessionState(topic.id, {
      version: 1,
      selectedAngleId,
      angleStateById,
      pinnedSourcesByAngleId,
      draftAnswersByQuestionId,
      customQuestionDraftsByAngleId,
      revealedQuestionIds,
      insertedQuestionsByAngleId,
    });
  }, [
    angleStateById,
    customQuestionDraftsByAngleId,
    draftAnswersByQuestionId,
    insertedQuestionsByAngleId,
    pinnedSourcesByAngleId,
    revealedQuestionIds,
    restoredTopicId,
    selectedAngleId,
    topic.id,
  ]);

  const activeAngle =
    topic.learningAngles.find((angle) => angle.id === selectedAngleId) ??
    topic.learningAngles[0];
  const activeAngleState =
    angleStateById[selectedAngleId] ??
    createInitialAngleProgress(topic)[selectedAngleId];
  const pinnedSources = pinnedSourcesByAngleId[selectedAngleId] ?? [];
  const insertedQuestions = insertedQuestionsByAngleId[selectedAngleId] ?? [];

  const discussionSteps = useMemo(
    () =>
      buildDiscussionSteps(
        topic,
        selectedAngleId,
        activeAngleState?.customQuestion,
      ),
    [activeAngleState?.customQuestion, selectedAngleId, topic],
  );

  const visibleStepCount =
    selectedAngleId === "angle-custom-followup" &&
    !activeAngleState?.customQuestion
      ? 0
      : Math.min(
          activeAngleState?.unlockedStepCount ?? 1,
          discussionSteps.length,
        );

  const currentStepIndex =
    visibleStepCount > 0
      ? Math.min(visibleStepCount - 1, discussionSteps.length - 1)
      : -1;
  const currentStep =
    currentStepIndex >= 0 ? discussionSteps[currentStepIndex] : null;
  const currentDraftAnswer = currentStep
    ? draftAnswersByQuestionId[currentStep.question.id]
    : "";

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
                angleStateById[angle.id]?.answerStateByQuestionId[
                  step.question.id
                ]?.status === "passed",
            )
          );
        })
        .map((angle) => angle.id),
    [angleStateById, topic],
  );

  const showCompletionCard =
    discussionSteps.length > 0 &&
    discussionSteps.every(
      (step) =>
        activeAngleState?.answerStateByQuestionId[step.question.id]?.status ===
        "passed",
    );

  const nextAngleId = getFirstIncompleteAngleId(topic, completedAngleIds);
  const canExploreAnotherAngle = Boolean(
    nextAngleId && nextAngleId !== selectedAngleId,
  );

  const insertedQuestionsByTarget = useMemo(() => {
    return insertedQuestions.reduce<Record<string, InsertedQuestionRecord[]>>(
      (accumulator, question) => {
        accumulator[question.targetId] = [
          ...(accumulator[question.targetId] ?? []),
          question,
        ];
        return accumulator;
      },
      {},
    );
  }, [insertedQuestions]);

  const constellationNodes = useMemo(() => {
    const baseNodes = discussionSteps.map((step, index) => {
        const answerState =
          activeAngleState?.answerStateByQuestionId[step.question.id];
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
      });

    function mapInsertedQuestion(question: InsertedQuestionRecord) {
      return {
        id: question.id,
        angleId: question.angleId,
        label: "My question",
        prompt: question.prompt,
        x: 0,
        y: 0,
        visualState: question.answerState?.status === "passed" ? "lit" : question.visualState,
      };
    }

    const orderedNodes: TopicNode[] = [
      ...(insertedQuestionsByTarget["after-root"] ?? []).map(mapInsertedQuestion),
    ];

    for (const [index, node] of baseNodes.entries()) {
      const step = discussionSteps[index];
      const insertedAfterStep =
        insertedQuestionsByTarget[`after-step:${step?.id}`] ?? [];
      const answerState = step
        ? activeAngleState?.answerStateByQuestionId[step.question.id]
        : undefined;
      const shouldInsertBeforeNode =
        !answerState || answerState.status === "failed";

      if (shouldInsertBeforeNode) {
        orderedNodes.push(...insertedAfterStep.map(mapInsertedQuestion));
      }

      orderedNodes.push(node);

      if (!shouldInsertBeforeNode) {
        orderedNodes.push(...insertedAfterStep.map(mapInsertedQuestion));
      }
    }

    return orderedNodes;
  }, [
    activeAngleState?.answerStateByQuestionId,
    currentStepIndex,
    discussionSteps,
    insertedQuestionsByTarget,
    showCompletionCard,
  ]);

  const constellationEdges = useMemo(
    () =>
      constellationNodes.slice(0, -1).map((node, index) => ({
        from: node.id,
        to: constellationNodes[index + 1]!.id,
      })),
    [constellationNodes],
  );

  useEffect(
    () => () => {
      if (highlightTimeoutRef.current) {
        window.clearTimeout(highlightTimeoutRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    setPreviewSource(null);
    setFloatingFeedbacks([]);
    setActiveFeedbackId(null);
  }, [selectedAngleId]);

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

  const handleInsertQuestion = useCallback(
    (targetId: string, prompt: string) => {
      const trimmedPrompt = prompt.trim();

      if (!trimmedPrompt) {
        return;
      }

      const createdAt = new Date().toISOString();

      setInsertedQuestionsByAngleId((previous) => ({
        ...previous,
        [selectedAngleId]: [
          ...(previous[selectedAngleId] ?? []),
          {
            id: `inserted-question-${Date.now()}`,
            angleId: selectedAngleId,
            targetId,
            prompt: trimmedPrompt,
            createdAt,
            visualState: "pulsing",
          },
        ],
      }));
    },
    [selectedAngleId],
  );

  const handleDeleteInsertedQuestion = useCallback(
    (questionId: string) => {
      setInsertedQuestionsByAngleId((previous) => ({
        ...previous,
        [selectedAngleId]: (previous[selectedAngleId] ?? []).filter(
          (question) => question.id !== questionId,
        ),
      }));
    },
    [selectedAngleId],
  );

  const updateInsertedQuestionForCurrentAngle = useCallback(
    (
      questionId: string,
      updater: (question: InsertedQuestionRecord) => InsertedQuestionRecord,
    ) => {
      setInsertedQuestionsByAngleId((previous) => ({
        ...previous,
        [selectedAngleId]: (previous[selectedAngleId] ?? []).map((question) =>
          question.id === questionId ? updater(question) : question,
        ),
      }));
    },
    [selectedAngleId],
  );

  const handleInsertedQuestionDraftChange = useCallback(
    (questionId: string, draft: string) => {
      updateInsertedQuestionForCurrentAngle(questionId, (question) => ({
        ...question,
        answerDraft: draft,
      }));
    },
    [updateInsertedQuestionForCurrentAngle],
  );

  const handleCheckInsertedQuestion = useCallback(
    (questionId: string, answer: string) => {
      const currentQuestion = insertedQuestions.find(
        (question) => question.id === questionId,
      );

      if (!currentQuestion) {
        return;
      }

      const feedback = evaluateTopicAnswer(
        {
          id: currentQuestion.id,
          angleId: selectedAngleId,
          label: "My question",
          prompt: currentQuestion.prompt,
          x: 0,
          y: 0,
          visualState: currentQuestion.visualState,
          keywordGroups: [
            ["why", "because", "understand", "rule", "flow"],
            ["auth", "jwt", "controller", "service", "token"],
          ],
          bonusKeywords: ["specific", "responsibility", "validation", "source"],
        },
        answer,
      );
      const passed = feedback.score >= 60;
      const answerState: TopicAnswerState = {
        questionId,
        answer,
        status: passed ? "passed" : "failed",
        feedback,
        summary: passed ? feedback.nextSuggestion : null,
        isCollapsed: passed,
      };

      updateInsertedQuestionForCurrentAngle(questionId, (question) => ({
        ...question,
        answerDraft: answer,
        answerState,
        visualState: passed ? "lit" : "pulsing",
      }));
    },
    [insertedQuestions, selectedAngleId, updateInsertedQuestionForCurrentAngle],
  );

  const updatePinnedSourcesForCurrentAngle = useCallback(
    (updater: (currentPinnedSources: string[]) => string[]) => {
      setPinnedSourcesByAngleId((previous) => {
        const currentPinnedSources = previous[selectedAngleId] ?? [];
        const nextPinnedSources = filterValidReferenceIds(
          topic,
          updater(currentPinnedSources),
        );

        if (!nextPinnedSources.length) {
          const remainingPinnedSources = { ...previous };
          delete remainingPinnedSources[selectedAngleId];
          return remainingPinnedSources;
        }

        return {
          ...previous,
          [selectedAngleId]: nextPinnedSources,
        };
      });
    },
    [selectedAngleId, topic],
  );

  const handlePreviewReference = (referenceId: string) => {
    if (!pinnedSources.includes(referenceId)) {
      setPreviewSource(referenceId);
    }
  };

  const handleClearPreviewReference = () => {
    setPreviewSource(null);
  };

  const handlePinSource = (referenceId: string) => {
    updatePinnedSourcesForCurrentAngle((previous) =>
      previous.includes(referenceId)
        ? previous.filter((id) => id !== referenceId)
        : [...previous, referenceId],
    );
    setPreviewSource(null);
  };

  const handleUnpinSource = (referenceId: string) => {
    updatePinnedSourcesForCurrentAngle((previous) =>
      previous.filter((id) => id !== referenceId),
    );
  };

  const handleClearAllSources = () => {
    updatePinnedSourcesForCurrentAngle(() => []);
    setPreviewSource(null);
  };

  const handleDraftAnswerChange = useCallback(
    (questionId: string, draft: string) => {
      setDraftAnswersByQuestionId((previous) => {
        if (previous[questionId] === draft) {
          return previous;
        }

        return {
          ...previous,
          [questionId]: draft,
        };
      });
    },
    [],
  );

  const handleCustomQuestionDraftChange = useCallback(
    (draft: string) => {
      setCustomQuestionDraftsByAngleId((previous) => {
        if (previous[selectedAngleId] === draft) {
          return previous;
        }

        return {
          ...previous,
          [selectedAngleId]: draft,
        };
      });
    },
    [selectedAngleId],
  );

  const handleCheckCurrent = (answer: string) => {
    if (!currentStep) {
      return;
    }

    const feedback = evaluateTopicAnswer(currentStep.question, answer);
    setDraftAnswersByQuestionId((previous) => ({
      ...previous,
      [currentStep.question.id]: answer,
    }));
    const feedbackCardId = `${currentStep.question.id}-${Date.now()}`;
    setFloatingFeedbacks((previous) => [
      ...previous,
      {
        id: feedbackCardId,
        angleId: selectedAngleId,
        questionId: currentStep.question.id,
        answer,
        feedback,
        revealedAnswerUsed: Boolean(revealedQuestionIds[currentStep.question.id]),
      },
    ]);
    setActiveFeedbackId(feedbackCardId);
  };

  const dismissFloatingFeedback = (feedbackId: string) => {
    const feedbackCard = floatingFeedbacks.find(
      (feedback) => feedback.id === feedbackId,
    );

    if (!feedbackCard) {
      return;
    }

    const passed = feedbackCard.feedback.score >= 60;
    const feedbackStepIndex = discussionSteps.findIndex(
      (step) => step.question.id === feedbackCard.questionId,
    );

    setAngleStateById((previous) => {
      const angleState = previous[feedbackCard.angleId];

      if (!angleState) {
        return previous;
      }

      const nextUnlocked = passed
        ? Math.min(
            Math.max(
              angleState.unlockedStepCount,
              (feedbackStepIndex >= 0 ? feedbackStepIndex : currentStepIndex) + 2,
            ),
            discussionSteps.length,
          )
        : angleState.unlockedStepCount;
      const nextAttempt = {
        id: `${feedbackCard.questionId}-${Date.now()}`,
        createdAt: new Date().toISOString(),
        userAnswer: feedbackCard.answer,
        aiFeedback: feedbackCard.feedback,
        score: feedbackCard.feedback.score,
        status: getAttemptRecordStatus(feedbackCard.feedback.score),
        revealedAnswerUsed: feedbackCard.revealedAnswerUsed,
      };

      return {
        ...previous,
        [feedbackCard.angleId]: {
          ...angleState,
          unlockedStepCount: nextUnlocked,
          attemptRecordsByQuestionId: {
            ...angleState.attemptRecordsByQuestionId,
            [feedbackCard.questionId]: [
              ...(angleState.attemptRecordsByQuestionId[
                feedbackCard.questionId
              ] ?? []),
              nextAttempt,
            ],
          },
          answerStateByQuestionId: {
            ...angleState.answerStateByQuestionId,
            [feedbackCard.questionId]: {
              questionId: feedbackCard.questionId,
              answer: feedbackCard.answer,
              status: passed ? "passed" : "failed",
              feedback: feedbackCard.feedback,
              summary: passed ? feedbackCard.feedback.nextSuggestion : null,
              isCollapsed: passed,
              revealedAnswerUsed: feedbackCard.revealedAnswerUsed,
            },
          },
        },
      };
    });

    setFloatingFeedbacks((previous) => {
      const nextFeedbacks = previous.filter(
        (feedback) => feedback.id !== feedbackId,
      );
      setActiveFeedbackId((current) => {
        if (current !== feedbackId) {
          return current;
        }

        return nextFeedbacks[nextFeedbacks.length - 1]?.id ?? null;
      });
      return nextFeedbacks;
    });

    if (passed) {
      setPreviewSource(null);
      setRevealedQuestionIds((previous) => {
        const next = { ...previous };
        delete next[feedbackCard.questionId];
        return next;
      });
    }
  };

  const handleSelectFeedback = (feedbackId: string) => {
    setActiveFeedbackId(feedbackId);
  };

  const handleCycleFeedback = (direction: "previous" | "next") => {
    if (!floatingFeedbacks.length) {
      return;
    }

    const currentIndex = Math.max(
      floatingFeedbacks.findIndex((feedback) => feedback.id === activeFeedbackId),
      0,
    );
    const nextIndex =
      direction === "previous"
        ? (currentIndex - 1 + floatingFeedbacks.length) % floatingFeedbacks.length
        : (currentIndex + 1) % floatingFeedbacks.length;

    setActiveFeedbackId(floatingFeedbacks[nextIndex]?.id ?? null);
  };

  const handleReorderPinnedSources = (nextPinnedSources: string[]) => {
    updatePinnedSourcesForCurrentAngle(() => nextPinnedSources);
  };

  const handleReorderFeedbacks = (draggedFeedbackId: string, targetFeedbackId: string) => {
    setFloatingFeedbacks((previous) => {
      const draggedIndex = previous.findIndex(
        (feedback) => feedback.id === draggedFeedbackId,
      );
      const targetIndex = previous.findIndex(
        (feedback) => feedback.id === targetFeedbackId,
      );

      if (draggedIndex < 0 || targetIndex < 0 || draggedIndex === targetIndex) {
        return previous;
      }

      const nextFeedbacks = [...previous];
      const [draggedFeedback] = nextFeedbacks.splice(draggedIndex, 1);
      nextFeedbacks.splice(targetIndex, 0, draggedFeedback!);
      return nextFeedbacks;
    });
  };

  const handleWorkbenchCardInserted = useCallback(
    (payload: { kind?: "feedback" | "source"; id?: string }) => {
      if (payload.kind === "feedback" && payload.id) {
        dismissFloatingFeedback(payload.id);
      }
    },
    [dismissFloatingFeedback],
  );

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
        attemptRecordsByQuestionId: {},
      },
    }));
    setCustomQuestionDraftsByAngleId((previous) => ({
      ...previous,
      [selectedAngleId]: question,
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
    () => [
      ...new Set([...pinnedSources, ...(previewSource ? [previewSource] : [])]),
    ],
    [pinnedSources, previewSource],
  );
  const activeFloatingFeedback =
    floatingFeedbacks.find((feedback) => feedback.id === activeFeedbackId) ??
    floatingFeedbacks[0] ??
    null;

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

            <div className="stealth-scrollbar relative flex-1 overflow-y-auto overflow-x-hidden">
              <ConstellationView
                nodes={constellationNodes}
                edges={constellationEdges}
                activeNodeId={currentStep?.question.id ?? ""}
                onSelectNode={handleSelectNode}
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
              activeReferenceIds={activeReferenceIds}
              highlightedBlockId={highlightedBlockId}
              prefilledAnswer={currentDraftAnswer}
              showCustomComposer={
                selectedAngleId === "angle-custom-followup" &&
                discussionSteps.length === 0
              }
              customQuestionDraft={
                customQuestionDraftsByAngleId[selectedAngleId] ??
                activeAngleState?.customQuestion ??
                ""
              }
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

        </main>

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
