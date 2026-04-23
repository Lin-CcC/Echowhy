import { useCallback, useEffect, useMemo, useState } from "react";
import type { FeedbackCardState } from "@/features/source-reference";
import type {
  InsertedQuestionRecord,
  TopicAngleProgressState,
  TopicBehaviorSignalCounts,
  TopicQuestionReviewState,
} from "@/features/topic-session";
import {
  areTopicChapterSummaryStatesEqual,
  buildDiscussionSteps,
  createEmptyBehaviorSignalCounts,
  createTopicChapterSummaryState,
  createInitialAngleProgress,
  getFirstIncompleteAngleId,
  getTopicChapterClosureState,
  loadPersistedTopicSessionState,
  mergePersistedAngleProgress,
  normalizePinnedSourcesByAngle,
  resolveCurrentDiscussionStepIndex,
  resolveTopicSession,
  savePersistedTopicSessionState,
} from "@/features/topic-session";
import {
  getLearningModuleById,
  upsertLearningModule,
} from "@/features/topic-session/module-storage";
import { getConstellationTopicById } from "@/mock/data/constellation-topic";

type UseLearningTopicSessionParams = {
  topicId: string;
  routeAngleId?: string;
  routeCustomQuestion?: string;
  routeSourceId?: string;
  routeSourceLabel?: string;
};

export function useLearningTopicSession({
  topicId,
  routeAngleId,
  routeCustomQuestion,
  routeSourceId,
  routeSourceLabel,
}: UseLearningTopicSessionParams) {
  const knownTopic = getConstellationTopicById(topicId);
  const storedModule = getLearningModuleById(topicId);
  const generatedQuestionTitle =
    routeCustomQuestion?.trim() || storedModule?.seedQuestion;
  const generatedSourceId = routeSourceId ?? storedModule?.sourceId;
  const generatedSourceLabel =
    routeSourceLabel ?? storedModule?.sourceLabel ?? storedModule?.title;
  const topic = useMemo(
    () =>
      resolveTopicSession({
        topicId,
        seedQuestion: generatedQuestionTitle,
        sourceId: generatedSourceId,
        sourceLabel: generatedSourceLabel,
      }),
    [generatedQuestionTitle, generatedSourceId, generatedSourceLabel, topicId],
  );
  const defaultAngleId =
    topic.learningAngles.find((angle) => !angle.isCustom)?.id ??
    topic.learningAngles[0]?.id ??
    "";

  const [selectedAngleId, setSelectedAngleId] = useState(
    topic.learningAngles.some((angle) => angle.id === routeAngleId)
      ? (routeAngleId ?? defaultAngleId)
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
  const [floatingFeedbacks, setFloatingFeedbacks] = useState<FeedbackCardState[]>([]);
  const [activeFeedbackId, setActiveFeedbackId] = useState<string | null>(null);
  const [draftAnswersByQuestionId, setDraftAnswersByQuestionId] = useState<
    Record<string, string>
  >({});
  const [customQuestionDraftsByAngleId, setCustomQuestionDraftsByAngleId] =
    useState<Record<string, string>>({});
  const [revealedQuestionIds, setRevealedQuestionIds] = useState<
    Record<string, boolean>
  >({});
  const [insertedQuestionsByAngleId, setInsertedQuestionsByAngleId] = useState<
    Record<string, InsertedQuestionRecord[]>
  >({});
  const [questionReviewStateById, setQuestionReviewStateById] = useState<
    Record<string, TopicQuestionReviewState | undefined>
  >({});
  const [focusedQuestionIdByAngleId, setFocusedQuestionIdByAngleId] = useState<
    Record<string, string | null | undefined>
  >({});
  const [behaviorSignalCounts, setBehaviorSignalCounts] = useState<
    TopicBehaviorSignalCounts
  >(createEmptyBehaviorSignalCounts());

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
      (angle) => angle.id === routeAngleId,
    );
    const normalizedRouteAngleId = hasRouteAngle ? (routeAngleId ?? defaultAngleId) : defaultAngleId;
    const persistedState = loadPersistedTopicSessionState(topic.id);
    const initialProgress = mergePersistedAngleProgress(
      topic,
      persistedState?.angleStateById,
    );
    const persistedAngleId = persistedState?.selectedAngleId;
    const shouldStartFromGeneratedAngles =
      Boolean(routeCustomQuestion?.trim()) && !routeAngleId && !knownTopic;
    const initialAngleId = hasRouteAngle
      ? normalizedRouteAngleId
      : shouldStartFromGeneratedAngles
        ? defaultAngleId
        : topic.learningAngles.some((angle) => angle.id === persistedAngleId)
          ? (persistedAngleId ?? defaultAngleId)
          : defaultAngleId;

    if (routeCustomQuestion?.trim()) {
      initialProgress["angle-custom-followup"] = {
        ...initialProgress["angle-custom-followup"],
        answerStateByQuestionId: {},
        attemptRecordsByQuestionId: {},
        customQuestion: routeCustomQuestion.trim(),
        generatedDiscussionSteps: [],
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
        topic.learningAngles.reduce<Record<string, string>>((accumulator, angle) => {
          accumulator[angle.id] = initialProgress[angle.id]?.customQuestion ?? "";
          return accumulator;
        }, {}),
    );
    setRevealedQuestionIds(persistedState?.revealedQuestionIds ?? {});
    setInsertedQuestionsByAngleId(persistedState?.insertedQuestionsByAngleId ?? {});
    setQuestionReviewStateById(persistedState?.questionReviewStateById ?? {});
    setFocusedQuestionIdByAngleId({});
    setBehaviorSignalCounts(
      persistedState?.behaviorSignalCounts ?? createEmptyBehaviorSignalCounts(),
    );
    setRestoredTopicId(topic.id);
  }, [defaultAngleId, knownTopic, routeAngleId, routeCustomQuestion, topic]);

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
      questionReviewStateById,
      behaviorSignalCounts,
    });
  }, [
    angleStateById,
    behaviorSignalCounts,
    customQuestionDraftsByAngleId,
    draftAnswersByQuestionId,
    insertedQuestionsByAngleId,
    pinnedSourcesByAngleId,
    questionReviewStateById,
    revealedQuestionIds,
    restoredTopicId,
    selectedAngleId,
    topic.id,
  ]);

  useEffect(() => {
    setPreviewSource(null);
    setFloatingFeedbacks([]);
    setActiveFeedbackId(null);
  }, [selectedAngleId]);

  const activeAngle =
    topic.learningAngles.find((angle) => angle.id === selectedAngleId) ??
    topic.learningAngles[0];
  const activeAngleState =
    angleStateById[selectedAngleId] ??
    createInitialAngleProgress(topic)[selectedAngleId];
  const pinnedSources = pinnedSourcesByAngleId[selectedAngleId] ?? [];
  const insertedQuestions = insertedQuestionsByAngleId[selectedAngleId] ?? [];
  const focusedQuestionId = focusedQuestionIdByAngleId[selectedAngleId] ?? null;

  const discussionSteps = useMemo(
    () =>
      buildDiscussionSteps(
        topic,
        selectedAngleId,
        activeAngleState?.customQuestion,
        activeAngleState?.generatedDiscussionSteps,
      ),
    [
      activeAngleState?.customQuestion,
      activeAngleState?.generatedDiscussionSteps,
      selectedAngleId,
      topic,
    ],
  );

  const visibleStepCount =
    selectedAngleId === "angle-custom-followup" &&
    !activeAngleState?.customQuestion
      ? 0
      : Math.min(
          activeAngleState?.unlockedStepCount ?? 1,
          discussionSteps.length,
        );

  const currentStepIndex = resolveCurrentDiscussionStepIndex({
    discussionSteps,
    visibleStepCount,
    focusedQuestionId,
  });
  const currentStep =
    currentStepIndex >= 0 ? discussionSteps[currentStepIndex] : null;
  const currentDraftAnswer = currentStep
    ? draftAnswersByQuestionId[currentStep.question.id]
    : "";

  const focusQuestion = useCallback(
    (questionId: string) => {
      setFocusedQuestionIdByAngleId((previous) => ({
        ...previous,
        [selectedAngleId]: questionId,
      }));
    },
    [selectedAngleId],
  );

  const clearFocusedQuestion = useCallback(() => {
    setFocusedQuestionIdByAngleId((previous) => {
      if (!previous[selectedAngleId]) {
        return previous;
      }

      return {
        ...previous,
        [selectedAngleId]: null,
      };
    });
  }, [selectedAngleId]);

  const completedAngleIds = useMemo(
    () =>
      topic.learningAngles
        .filter((angle) => !angle.isCustom)
        .filter((angle) => {
          const steps = buildDiscussionSteps(
            topic,
            angle.id,
            angleStateById[angle.id]?.customQuestion,
            angleStateById[angle.id]?.generatedDiscussionSteps,
          );

          return (
            steps.length > 0 &&
            getTopicChapterClosureState({
              discussionSteps: steps,
              angleState: angleStateById[angle.id],
              questionReviewStateById,
            }).canMoveOn
          );
        })
        .map((angle) => angle.id),
    [angleStateById, questionReviewStateById, topic],
  );

  const chapterSummaryStateByAngleId = useMemo(
    () =>
      topic.learningAngles.reduce<Record<string, TopicAngleProgressState["chapterSummaryState"]>>(
        (accumulator, angle) => {
          const angleState = angleStateById[angle.id];
          if (!angleState) {
            accumulator[angle.id] = undefined;
            return accumulator;
          }

          const steps = buildDiscussionSteps(
            topic,
            angle.id,
            angleState.customQuestion,
            angleState.generatedDiscussionSteps,
          );

          if (steps.length <= 0) {
            accumulator[angle.id] = undefined;
            return accumulator;
          }

          accumulator[angle.id] = createTopicChapterSummaryState({
            closureState: getTopicChapterClosureState({
              discussionSteps: steps,
              angleState,
              questionReviewStateById,
            }),
            previousState: angleState.chapterSummaryState,
          });

          return accumulator;
        },
        {},
      ),
    [angleStateById, questionReviewStateById, topic],
  );

  useEffect(() => {
    setAngleStateById((previous) => {
      let changed = false;
      const nextStateById = { ...previous };

      for (const angle of topic.learningAngles) {
        const angleState = previous[angle.id];

        if (!angleState) {
          continue;
        }

        const nextSummaryState = chapterSummaryStateByAngleId[angle.id];

        if (
          areTopicChapterSummaryStatesEqual(
            angleState.chapterSummaryState,
            nextSummaryState,
          )
        ) {
          continue;
        }

        changed = true;
        nextStateById[angle.id] = {
          ...angleState,
          chapterSummaryState: nextSummaryState,
        };
      }

      return changed ? nextStateById : previous;
    });
  }, [chapterSummaryStateByAngleId, topic.learningAngles]);

  const chapterSummaryState =
    activeAngleState?.chapterSummaryState ??
    chapterSummaryStateByAngleId[selectedAngleId];

  const showCompletionCard =
    discussionSteps.length > 0 && chapterSummaryState?.status !== "unsettled";

  const nextAngleId = getFirstIncompleteAngleId(topic, completedAngleIds);
  const canExploreAnotherAngle = Boolean(
    nextAngleId && nextAngleId !== selectedAngleId,
  );
  const showCustomComposer =
    selectedAngleId === "angle-custom-followup" && discussionSteps.length === 0;
  const currentCustomQuestionDraft =
    customQuestionDraftsByAngleId[selectedAngleId] ??
    activeAngleState?.customQuestion ??
    "";
  const activeReferenceIds = [
    ...new Set([...pinnedSources, ...(previewSource ? [previewSource] : [])]),
  ];
  const activeFloatingFeedback =
    floatingFeedbacks.find((feedback) => feedback.id === activeFeedbackId) ??
    floatingFeedbacks[0] ??
    null;
  const activeAngleLabel = activeAngle?.title ?? "Request flow";

  return {
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
    focusedQuestionId,
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
  };
}
