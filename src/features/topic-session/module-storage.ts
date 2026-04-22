export type LearningModuleKind = "source-backed" | "conceptual";

export type LearningModuleChildKind = "angle" | "my-own-why";

export type LearningModuleChildRecord = {
  id: string;
  label: string;
  topicId: string;
  angleId?: string;
  customQuestion?: string;
  kind: LearningModuleChildKind;
  createdAt: string;
};

export type LearningModuleRecord = {
  id: string;
  title: string;
  sourceId?: string;
  sourceLabel?: string;
  sourceFiles?: string[];
  seedQuestion?: string;
  parentModuleId?: string;
  children: LearningModuleChildRecord[];
  kind: LearningModuleKind;
  createdAt: string;
  updatedAt: string;
};

const LEARNING_MODULES_STORAGE_KEY = "echowhy:learning-modules";

function normalizeLearningModuleChildRecord(
  value: Partial<LearningModuleChildRecord> | null,
): LearningModuleChildRecord | null {
  if (
    !value ||
    typeof value.id !== "string" ||
    typeof value.label !== "string" ||
    typeof value.topicId !== "string"
  ) {
    return null;
  }

  return {
    id: value.id,
    label: value.label.trim() || "Untitled child module",
    topicId: value.topicId,
    angleId: typeof value.angleId === "string" ? value.angleId : undefined,
    customQuestion:
      typeof value.customQuestion === "string" && value.customQuestion.trim()
        ? value.customQuestion.trim()
        : undefined,
    kind: value.kind === "my-own-why" ? "my-own-why" : "angle",
    createdAt:
      typeof value.createdAt === "string"
        ? value.createdAt
        : new Date().toISOString(),
  };
}

function normalizeLearningModuleRecord(
  value: Partial<LearningModuleRecord> | null,
): LearningModuleRecord | null {
  if (!value || typeof value.id !== "string" || typeof value.title !== "string") {
    return null;
  }

  const now = new Date().toISOString();

  return {
    id: value.id,
    title: value.title.trim() || "Untitled learning module",
    sourceId: typeof value.sourceId === "string" ? value.sourceId : undefined,
    sourceLabel:
      typeof value.sourceLabel === "string" ? value.sourceLabel : undefined,
    sourceFiles: Array.isArray(value.sourceFiles)
      ? value.sourceFiles.filter(
          (sourceFile): sourceFile is string =>
            typeof sourceFile === "string" && Boolean(sourceFile.trim()),
        )
      : undefined,
    seedQuestion:
      typeof value.seedQuestion === "string" && value.seedQuestion.trim()
        ? value.seedQuestion.trim()
        : undefined,
    parentModuleId:
      typeof value.parentModuleId === "string" ? value.parentModuleId : undefined,
    children: Array.isArray(value.children)
      ? value.children
          .map((child) =>
            normalizeLearningModuleChildRecord(
              child as Partial<LearningModuleChildRecord>,
            ),
          )
          .filter((child): child is LearningModuleChildRecord => Boolean(child))
      : [],
    kind: value.kind === "source-backed" ? "source-backed" : "conceptual",
    createdAt: typeof value.createdAt === "string" ? value.createdAt : now,
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : now,
  };
}

export function loadLearningModules() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(LEARNING_MODULES_STORAGE_KEY);

    if (!rawValue) {
      return [];
    }

    const parsedValue = JSON.parse(rawValue) as unknown;

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue
      .map((value) =>
        normalizeLearningModuleRecord(value as Partial<LearningModuleRecord>),
      )
      .filter((value): value is LearningModuleRecord => Boolean(value))
      .sort(
        (left, right) =>
          new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
      );
  } catch {
    return [];
  }
}

export function saveLearningModules(modules: LearningModuleRecord[]) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      LEARNING_MODULES_STORAGE_KEY,
      JSON.stringify(modules),
    );
  } catch {
    // Keep the live learning flow usable even if persistence is unavailable.
  }
}

export function getLearningModuleById(moduleId: string) {
  return loadLearningModules().find((module) => module.id === moduleId) ?? null;
}

export function upsertLearningModule(
  input: Omit<LearningModuleRecord, "children" | "createdAt" | "updatedAt"> &
    Partial<Pick<LearningModuleRecord, "children" | "createdAt" | "updatedAt">>,
) {
  const now = new Date().toISOString();
  const existingModules = loadLearningModules();
  const existingModule = existingModules.find((module) => module.id === input.id);
  const nextModule = normalizeLearningModuleRecord({
    ...existingModule,
    ...input,
    createdAt: existingModule?.createdAt ?? input.createdAt ?? now,
    updatedAt: now,
  });

  if (!nextModule) {
    return existingModule ?? null;
  }

  const nextModules = [
    nextModule,
    ...existingModules.filter((module) => module.id !== nextModule.id),
  ].sort(
    (left, right) =>
      new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
  );

  saveLearningModules(nextModules);

  return nextModule;
}

export function appendLearningModuleChild(
  moduleId: string,
  child: Omit<LearningModuleChildRecord, "createdAt"> &
    Partial<Pick<LearningModuleChildRecord, "createdAt">>,
) {
  const existingModule = getLearningModuleById(moduleId);

  if (!existingModule) {
    return null;
  }

  const normalizedChild = normalizeLearningModuleChildRecord({
    ...child,
    createdAt: child.createdAt ?? new Date().toISOString(),
  });

  if (!normalizedChild) {
    return existingModule;
  }

  return upsertLearningModule({
    ...existingModule,
    children: [
      ...existingModule.children.filter(
        (existingChild) =>
          existingChild.id !== normalizedChild.id &&
          existingChild.topicId !== normalizedChild.topicId,
      ),
      normalizedChild,
    ],
  });
}

export function deleteLearningModule(moduleId: string) {
  const existingModules = loadLearningModules();
  const nextModules = existingModules.filter(
    (module) => module.id !== moduleId && module.parentModuleId !== moduleId,
  );

  saveLearningModules(nextModules);
}
