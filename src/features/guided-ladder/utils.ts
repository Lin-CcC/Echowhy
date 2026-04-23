import type {
  LearningModuleRecord,
  TopicGuidedEntry,
  TopicProjectTreeItem,
  TopicSourceImport,
} from "@/features/topic-session";

type GuidedLadderSelectableSource = {
  id: string;
  label: string;
  moduleTopicId?: string;
  sourceId?: string;
  sourceLabel?: string;
  sourceFiles?: string[];
};

export type GuidedLadderSourceHandoff = {
  moduleId: string;
  moduleTitle: string;
  sourceId: string;
  sourceLabel?: string;
  sourceFiles?: string[];
  shouldCreateModule: boolean;
};

export type GuidedLadderQuestionHandoff = {
  sourceId: string;
  sourceLabel?: string;
  moduleId: string;
  targetTopicId: string;
  customQuestion: string;
};

function getPrimaryTopicId(module: LearningModuleRecord) {
  return module.children[0]?.topicId ?? module.id;
}

function getPrimaryAngleId(module: LearningModuleRecord) {
  return module.children[0]?.angleId;
}

function buildModuleGuidedQuestions(
  module: LearningModuleRecord,
): TopicGuidedEntry[] {
  if (module.children.length > 0) {
    return module.children.map((child) => ({
      id: child.id,
      label: child.label,
      topicId: child.topicId,
      angleId: child.angleId,
      customQuestion: child.customQuestion,
    }));
  }

  return [
    {
      id: `${module.id}-main-thread`,
      label: "Open the main learning thread",
      topicId: module.id,
    },
  ];
}

function buildModuleFileTree(module: LearningModuleRecord): TopicProjectTreeItem[] {
  const primaryTopicId = getPrimaryTopicId(module);
  const primaryAngleId = getPrimaryAngleId(module);

  if (module.sourceFiles?.length) {
    return module.sourceFiles.map((sourceFile, index) => ({
      id: `${module.id}-file-${index}`,
      label: sourceFile,
      kind: "file",
      topicId: primaryTopicId,
      angleId: primaryAngleId,
    }));
  }

  return [
    {
      id: `${module.id}-source`,
      label: module.sourceLabel ?? module.title,
      kind: "directory",
      topicId: primaryTopicId,
      angleId: primaryAngleId,
    },
  ];
}

function getSourceOverview(module: LearningModuleRecord) {
  const fileCount = module.sourceFiles?.length ?? 0;
  const fileDescription =
    fileCount > 0
      ? `${fileCount} attached file${fileCount === 1 ? "" : "s"}`
      : "the saved learning module";

  return [
    `This source cold-start is built from ${fileDescription}. Pick one guided path to enter the learning chain, or ask your own why from the same source context.`,
    "The goal here is not to archive the source. It is to choose a first useful ladder, then let Topic carry the deeper question-driven work.",
  ];
}

export function buildGuidedLadderSourceFromModule(
  module: LearningModuleRecord,
): TopicSourceImport {
  return {
    id: module.sourceId ?? module.id,
    projectName: module.sourceLabel ?? module.title,
    overview: getSourceOverview(module),
    guidedQuestions: buildModuleGuidedQuestions(module),
    fileTree: buildModuleFileTree(module),
  };
}

export function resolveGuidedLadderSource({
  sourceId,
  moduleId,
  modules,
  getStaticSourceImport,
}: {
  sourceId: string;
  moduleId?: string;
  modules: LearningModuleRecord[];
  getStaticSourceImport: (sourceId: string) => TopicSourceImport | undefined;
}) {
  const staticSource = getStaticSourceImport(sourceId);

  if (staticSource) {
    return staticSource;
  }

  const module =
    modules.find((candidate) => candidate.id === moduleId) ??
    modules.find((candidate) => candidate.sourceId === sourceId) ??
    modules.find((candidate) => candidate.id === sourceId);

  return module ? buildGuidedLadderSourceFromModule(module) : null;
}

export function createGuidedLadderSourceHandoff({
  selectedSource,
  fallbackModuleId,
}: {
  selectedSource: GuidedLadderSelectableSource | null;
  fallbackModuleId: string;
}): GuidedLadderSourceHandoff | null {
  if (!selectedSource) {
    return null;
  }

  const sourceId = selectedSource.sourceId ?? selectedSource.id;
  const sourceLabel = selectedSource.sourceLabel ?? selectedSource.label;

  return {
    moduleId: selectedSource.moduleTopicId ?? fallbackModuleId,
    moduleTitle: selectedSource.label || sourceLabel || "New learning module",
    sourceId,
    sourceLabel,
    sourceFiles: selectedSource.sourceFiles,
    shouldCreateModule: !selectedSource.moduleTopicId,
  };
}

export function createGuidedLadderQuestionHandoff({
  sourceId,
  sourceLabel,
  moduleId,
  targetTopicId,
  customQuestion,
}: {
  sourceId: string | undefined;
  sourceLabel?: string;
  moduleId: string;
  targetTopicId: string;
  customQuestion: string;
}): GuidedLadderQuestionHandoff | null {
  const trimmedQuestion = customQuestion.trim();

  if (!sourceId || !trimmedQuestion) {
    return null;
  }

  return {
    sourceId,
    sourceLabel,
    moduleId,
    targetTopicId,
    customQuestion: trimmedQuestion,
  };
}
