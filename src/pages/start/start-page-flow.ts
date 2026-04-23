import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  createGuidedLadderSourceHandoff,
} from "@/features/guided-ladder";
import {
  appendLearningModuleChild,
  loadLearningModules,
  upsertLearningModule,
  type LearningModuleRecord,
} from "@/features/topic-session/module-storage";
import {
  createDefaultModuleChildren,
  createGeneratedWhyId,
  createImportedSource,
  createRecentSourceFromModule,
  getRecentSourcePoint,
  hasPlayedStartWake,
  markStartWakePlayed,
  readImportedSources,
  readPendingStartSource,
  recentTrackStartPoint,
  saveImportedSources,
  type StartSource,
} from "./start-page-utils";

export type StartMode = "ask" | "recent";

export type StartQuestionSubmissionPlan =
  | {
      kind: "guided-ladder-source";
      moduleId: string;
      sourceId: string;
      sourceLabel?: string;
      moduleTitle: string;
      sourceFiles?: string[];
      shouldCreateModule: boolean;
      shouldEnsureModuleChildren: boolean;
      targetTopicId?: undefined;
      customQuestion?: undefined;
      parentModuleId?: undefined;
    }
  | {
      kind: "guided-ladder-question";
      moduleId: string;
      sourceId?: string;
      sourceLabel?: string;
      moduleTitle: string;
      sourceFiles?: string[];
      shouldCreateModule: true;
      shouldEnsureModuleChildren: boolean;
      targetTopicId: string;
      customQuestion: string;
      parentModuleId?: string;
    }
  | {
      kind: "topic";
      moduleId: string;
      sourceId?: string;
      sourceLabel?: string;
      moduleTitle: string;
      sourceFiles?: string[];
      shouldCreateModule: true;
      shouldEnsureModuleChildren: false;
      targetTopicId: string;
      customQuestion?: string;
      parentModuleId?: undefined;
    };

type BuildStartQuestionSubmissionPlanOptions = {
  question: string;
  selectedSource: StartSource | null;
  learningModules: LearningModuleRecord[];
  fallbackTopicId: string;
};

type UseStartPageFlowOptions = {
  seedRecentSources: StartSource[];
};

function buildRecentSources({
  learningModules,
  importedSources,
  seedRecentSources,
}: {
  learningModules: LearningModuleRecord[];
  importedSources: StartSource[];
  seedRecentSources: StartSource[];
}) {
  const recentModuleSources = learningModules
    .filter((module) => !module.parentModuleId)
    .slice(0, 5)
    .map(createRecentSourceFromModule);

  const recentSources = [
    ...recentModuleSources,
    ...importedSources,
    ...seedRecentSources.filter(
      (source) =>
        !importedSources.some((importedSource) => importedSource.id === source.id) &&
        !recentModuleSources.some((moduleSource) => moduleSource.sourceId === source.id),
    ),
  ].slice(0, 5);

  return { recentModuleSources, recentSources };
}

export function buildStartQuestionSubmissionPlan({
  question,
  selectedSource,
  learningModules,
  fallbackTopicId,
}: BuildStartQuestionSubmissionPlanOptions): StartQuestionSubmissionPlan | null {
  const trimmedQuestion = question.trim();
  const parentModuleId = selectedSource?.moduleTopicId;
  const sourceId = selectedSource?.sourceId ?? selectedSource?.id;
  const sourceLabel = selectedSource?.sourceLabel ?? selectedSource?.label;
  const sourceFiles = selectedSource?.sourceFiles;
  const moduleTitle = trimmedQuestion || sourceLabel || "New learning module";

  if (selectedSource && !trimmedQuestion) {
    const handoff = createGuidedLadderSourceHandoff({
      selectedSource,
      fallbackModuleId: fallbackTopicId,
    });

    if (!handoff) {
      return null;
    }

    const existingModule = learningModules.find(
      (module) => module.id === handoff.moduleId,
    );

    return {
      kind: "guided-ladder-source",
      moduleId: handoff.moduleId,
      sourceId: handoff.sourceId,
      sourceLabel: handoff.sourceLabel,
      moduleTitle: handoff.moduleTitle,
      sourceFiles: handoff.sourceFiles,
      shouldCreateModule: handoff.shouldCreateModule,
      shouldEnsureModuleChildren:
        !handoff.shouldCreateModule && Boolean(existingModule && !existingModule.children.length),
    };
  }

  if (parentModuleId && trimmedQuestion) {
    const existingParentModule = learningModules.find(
      (module) => module.id === parentModuleId,
    );

    return {
      kind: "guided-ladder-question",
      moduleId: parentModuleId,
      sourceId,
      sourceLabel,
      moduleTitle: trimmedQuestion,
      sourceFiles,
      shouldCreateModule: true,
      shouldEnsureModuleChildren: Boolean(
        existingParentModule && !existingParentModule.children.length,
      ),
      targetTopicId: fallbackTopicId,
      customQuestion: trimmedQuestion,
      parentModuleId,
    };
  }

  if (selectedSource && trimmedQuestion) {
    return {
      kind: "guided-ladder-question",
      moduleId: fallbackTopicId,
      sourceId,
      sourceLabel,
      moduleTitle,
      sourceFiles,
      shouldCreateModule: true,
      shouldEnsureModuleChildren: false,
      targetTopicId: fallbackTopicId,
      customQuestion: trimmedQuestion,
    };
  }

  return {
    kind: "topic",
    moduleId: fallbackTopicId,
    sourceId,
    sourceLabel,
    moduleTitle,
    sourceFiles,
    shouldCreateModule: true,
    shouldEnsureModuleChildren: false,
    targetTopicId: fallbackTopicId,
    customQuestion: trimmedQuestion || undefined,
  };
}

export function useStartPageFlow({
  seedRecentSources,
}: UseStartPageFlowOptions) {
  const navigate = useNavigate();
  const sourceSelectionTimerRef = useRef<number | null>(null);
  const trackPulseTimerRef = useRef<number | null>(null);
  const [isAwake, setIsAwake] = useState(() => hasPlayedStartWake());
  const [textVisible, setTextVisible] = useState(() => !hasPlayedStartWake());
  const [startMode, setStartMode] = useState<StartMode>("ask");
  const [selectedSource, setSelectedSource] = useState<StartSource | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isSourceLensOpen, setIsSourceLensOpen] = useState(false);
  const [sourceLensIndex, setSourceLensIndex] = useState(0);
  const [importedSources, setImportedSources] = useState<StartSource[]>([]);
  const [learningModules, setLearningModules] = useState<LearningModuleRecord[]>([]);
  const [hoveredSourceId, setHoveredSourceId] = useState<string | null>(null);
  const [selectingSourceId, setSelectingSourceId] = useState<string | null>(null);
  const [trackPulseKey, setTrackPulseKey] = useState(0);
  const [isTrackPulseActive, setIsTrackPulseActive] = useState(false);

  const { recentModuleSources, recentSources } = useMemo(
    () =>
      buildRecentSources({
        learningModules,
        importedSources,
        seedRecentSources,
      }),
    [importedSources, learningModules, seedRecentSources],
  );
  const activeHeading =
    startMode === "recent"
      ? "Which source are you looking for?"
      : "What are you trying to understand?";
  const recentSourcePoints = useMemo(
    () => recentSources.map((_, index) => getRecentSourcePoint(index, recentSources.length)),
    [recentSources],
  );
  const recentTrackPoints = useMemo(
    () => [recentTrackStartPoint, ...recentSourcePoints],
    [recentSourcePoints],
  );
  const recentSourcePath = recentTrackPoints
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
  const selectingSourceIndex = selectingSourceId
    ? recentSources.findIndex((source) => source.id === selectingSourceId)
    : -1;
  const selectingSourcePath =
    selectingSourceIndex >= 0
      ? recentTrackPoints
          .slice(0, selectingSourceIndex + 2)
          .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
          .join(" ")
      : "";

  useEffect(() => {
    if (hasPlayedStartWake()) {
      setTextVisible(false);
      setIsAwake(true);
      return;
    }

    const textTimer = window.setTimeout(() => {
      setTextVisible(false);
    }, 2800);

    const awakeTimer = window.setTimeout(() => {
      setIsAwake(true);
      markStartWakePlayed();
    }, 2850);

    return () => {
      window.clearTimeout(textTimer);
      window.clearTimeout(awakeTimer);
    };
  }, []);

  useEffect(() => {
    setImportedSources(readImportedSources());
    setLearningModules(loadLearningModules());

    const pendingSource = readPendingStartSource();

    if (pendingSource) {
      setSelectedSource(pendingSource);
      setStartMode("ask");
    }
  }, []);

  useEffect(
    () => () => {
      if (sourceSelectionTimerRef.current) {
        window.clearTimeout(sourceSelectionTimerRef.current);
      }

      if (trackPulseTimerRef.current) {
        window.clearTimeout(trackPulseTimerRef.current);
      }
    },
    [],
  );

  function persistImportedSources(sources: StartSource[]) {
    setImportedSources(sources);
    saveImportedSources(sources);
  }

  function goToTopic(
    topicId: string,
    angleId?: string,
    customQuestion?: string,
    sourceId?: string,
    sourceLabel?: string,
  ) {
    const search: {
      angle?: string;
      customQuestion?: string;
      sourceId?: string;
      sourceLabel?: string;
    } = {};

    if (angleId) {
      search.angle = angleId;
    }

    if (customQuestion?.trim()) {
      search.customQuestion = customQuestion.trim();
    }

    if (sourceId) {
      search.sourceId = sourceId;
    }

    if (sourceLabel?.trim()) {
      search.sourceLabel = sourceLabel.trim();
    }

    void navigate({
      to: "/topic/$id",
      params: { id: topicId },
      search,
    });
  }

  function goToGuidedLadder({
    sourceId,
    moduleId,
    sourceLabel,
    customQuestion,
    targetTopicId,
  }: {
    sourceId: string;
    moduleId: string;
    sourceLabel?: string;
    customQuestion?: string;
    targetTopicId?: string;
  }) {
    const search: {
      moduleId?: string;
      sourceLabel?: string;
      customQuestion?: string;
      targetTopicId?: string;
    } = {
      moduleId,
    };

    if (sourceLabel?.trim()) {
      search.sourceLabel = sourceLabel.trim();
    }

    if (customQuestion?.trim()) {
      search.customQuestion = customQuestion.trim();
    }

    if (targetTopicId?.trim()) {
      search.targetTopicId = targetTopicId.trim();
    }

    void navigate({
      to: "/ladder/$sourceId",
      params: { sourceId },
      search,
    });
  }

  function createWhyFromQuestion(question: string) {
    const fallbackTopicId = createGeneratedWhyId(
      selectedSource?.moduleTopicId ?? selectedSource?.id,
    );
    const plan = buildStartQuestionSubmissionPlan({
      question,
      selectedSource,
      learningModules,
      fallbackTopicId,
    });

    if (!plan) {
      return;
    }

    if (plan.kind === "guided-ladder-source") {
      const existingModule =
        learningModules.find((module) => module.id === plan.moduleId) ??
        loadLearningModules().find((module) => module.id === plan.moduleId);

      const savedModule = plan.shouldCreateModule
        ? upsertLearningModule({
            id: plan.moduleId,
            title: plan.moduleTitle,
            sourceId: plan.sourceId,
            sourceLabel: plan.sourceLabel,
            sourceFiles: plan.sourceFiles,
            kind: "source-backed",
            children: createDefaultModuleChildren(plan.moduleId),
          })
        : plan.shouldEnsureModuleChildren && existingModule
          ? upsertLearningModule({
              ...existingModule,
              children: createDefaultModuleChildren(
                existingModule.id,
                existingModule.seedQuestion,
              ),
            })
          : existingModule;

      if (savedModule) {
        setLearningModules(loadLearningModules());
      }

      goToGuidedLadder({
        sourceId: plan.sourceId,
        moduleId: plan.moduleId,
        sourceLabel: plan.sourceLabel,
      });
      return;
    }

    if (plan.parentModuleId) {
      const existingParentModule =
        learningModules.find((module) => module.id === plan.parentModuleId) ??
        loadLearningModules().find((module) => module.id === plan.parentModuleId);

      if (
        existingParentModule &&
        plan.shouldEnsureModuleChildren &&
        !existingParentModule.children.length
      ) {
        upsertLearningModule({
          ...existingParentModule,
          children: createDefaultModuleChildren(
            existingParentModule.id,
            existingParentModule.seedQuestion,
          ),
        });
      }

      const savedChildModule = upsertLearningModule({
        id: plan.targetTopicId,
        title: plan.moduleTitle,
        seedQuestion: plan.customQuestion,
        sourceId: plan.sourceId,
        sourceLabel: plan.sourceLabel,
        sourceFiles: plan.sourceFiles,
        parentModuleId: plan.parentModuleId,
        kind: "source-backed",
        children: createDefaultModuleChildren(plan.targetTopicId, plan.customQuestion),
      });

      appendLearningModuleChild(plan.parentModuleId, {
        id: `${plan.parentModuleId}-my-own-why-${plan.targetTopicId}`,
        label: plan.customQuestion,
        topicId: plan.targetTopicId,
        customQuestion: plan.customQuestion,
        kind: "my-own-why",
      });

      if (savedChildModule) {
        setLearningModules(loadLearningModules());
      }

      goToGuidedLadder({
        sourceId: plan.sourceId ?? plan.moduleId,
        sourceLabel: plan.sourceLabel,
        moduleId: plan.moduleId,
        targetTopicId: plan.targetTopicId,
        customQuestion: plan.customQuestion,
      });
      return;
    }

    const savedModule = upsertLearningModule({
      id: plan.moduleId,
      title: plan.moduleTitle,
      seedQuestion: plan.customQuestion,
      sourceId: plan.sourceId,
      sourceLabel: plan.sourceLabel,
      sourceFiles: plan.sourceFiles,
      kind: plan.sourceId ? "source-backed" : "conceptual",
      children: createDefaultModuleChildren(plan.moduleId, plan.customQuestion),
    });

    if (savedModule) {
      setLearningModules(loadLearningModules());
    }

    if (plan.kind === "guided-ladder-question") {
      goToGuidedLadder({
        sourceId: plan.sourceId ?? plan.moduleId,
        sourceLabel: plan.sourceLabel,
        moduleId: savedModule?.id ?? plan.moduleId,
        targetTopicId: plan.targetTopicId,
        customQuestion: plan.customQuestion,
      });
      return;
    }

    goToTopic(
      plan.targetTopicId,
      undefined,
      plan.customQuestion,
      plan.sourceId,
      plan.sourceLabel,
    );
  }

  function clearSelectedSource() {
    setSelectedSource(null);
    setAttachedFiles([]);
    setSourceLensIndex(0);
    setIsSourceLensOpen(false);
  }

  function handleFilesSelected(files: FileList | File[]) {
    const fileArray = Array.from(files);

    if (!fileArray.length) {
      return;
    }

    const isExtendingLocalSource = selectedSource?.id.startsWith("source-local-");
    const mergedFiles = [
      ...(isExtendingLocalSource ? attachedFiles : []),
      ...fileArray,
    ].filter(
      (file, index, allFiles) =>
        allFiles.findIndex(
          (candidate) =>
            candidate.name === file.name &&
            candidate.size === file.size &&
            candidate.lastModified === file.lastModified,
        ) === index,
    );
    const nextSource = createImportedSource(
      mergedFiles,
      isExtendingLocalSource ? selectedSource?.id : undefined,
    );
    const nextImportedSources = [
      nextSource,
      ...importedSources.filter(
        (source) => source.id !== nextSource.id && source.label !== nextSource.label,
      ),
    ].slice(0, 8);

    persistImportedSources(nextImportedSources);
    setSelectedSource(nextSource);
    setAttachedFiles(mergedFiles);
    setSourceLensIndex(Math.max(0, mergedFiles.length - fileArray.length));
    setStartMode("ask");
  }

  function handleSelectRecentSource(source: StartSource) {
    setHoveredSourceId(null);
    setIsTrackPulseActive(false);
    setSelectingSourceId(source.id);

    if (sourceSelectionTimerRef.current) {
      window.clearTimeout(sourceSelectionTimerRef.current);
    }

    sourceSelectionTimerRef.current = window.setTimeout(() => {
      setSelectedSource(source);
      setAttachedFiles([]);
      setSourceLensIndex(0);
      setIsSourceLensOpen(false);
      setSelectingSourceId(null);
      setStartMode("ask");
    }, 780);
  }

  function handlePulseRecentTrack() {
    setHoveredSourceId(null);
    setSelectingSourceId(null);
    setTrackPulseKey((currentKey) => currentKey + 1);
    setIsTrackPulseActive(true);

    if (sourceSelectionTimerRef.current) {
      window.clearTimeout(sourceSelectionTimerRef.current);
    }

    if (trackPulseTimerRef.current) {
      window.clearTimeout(trackPulseTimerRef.current);
    }

    trackPulseTimerRef.current = window.setTimeout(() => {
      setIsTrackPulseActive(false);
    }, 2400);
  }

  return {
    isAwake,
    textVisible,
    startMode,
    setStartMode,
    selectedSource,
    attachedFiles,
    isSourceLensOpen,
    setIsSourceLensOpen,
    sourceLensIndex,
    setSourceLensIndex,
    hoveredSourceId,
    setHoveredSourceId,
    selectingSourceId,
    trackPulseKey,
    isTrackPulseActive,
    activeHeading,
    recentModuleSources,
    recentSources,
    recentSourcePoints,
    recentTrackPoints,
    recentSourcePath,
    selectingSourceIndex,
    selectingSourcePath,
    goToTopic,
    createWhyFromQuestion,
    clearSelectedSource,
    handleFilesSelected,
    handleSelectRecentSource,
    handlePulseRecentTrack,
  };
}
