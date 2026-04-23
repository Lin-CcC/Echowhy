import { constellationTopic } from "@/mock/data/constellation-topic";
import type {
  LearningModuleChildRecord,
  LearningModuleRecord,
} from "@/features/topic-session/module-storage";

const importedSourcesStorageKey = "echowhy:start-imported-sources";
const pendingStartSourceStorageKey = "echowhy:start-pending-source";
const startWakeSessionKey = "echowhy:start-wake-played";

export type StartSourceChild = {
  id: string;
  label: string;
  topicId: string;
  angleId?: string;
  customQuestion?: string;
  kind?: "angle" | "my-own-why";
};

export type StartSource = {
  id: string;
  label: string;
  caption: string;
  kind: "project" | "folder" | "file" | "conceptual";
  children: StartSourceChild[];
  moduleTopicId?: string;
  sourceId?: string;
  sourceLabel?: string;
  sourceFiles?: string[];
};

export function createDefaultModuleChildren(
  moduleId: string,
  seedQuestion?: string,
): LearningModuleChildRecord[] {
  const now = new Date().toISOString();
  const angleChildren = constellationTopic.learningAngles
    .filter((angle) => !angle.isCustom)
    .map((angle) => ({
      id: `${moduleId}-${angle.id}`,
      label: angle.title,
      topicId: moduleId,
      angleId: angle.id,
      kind: "angle" as const,
      createdAt: now,
    }));

  if (!seedQuestion?.trim()) {
    return angleChildren;
  }

  return [
    ...angleChildren,
    {
      id: `${moduleId}-my-own-why-root`,
      label: seedQuestion.trim(),
      topicId: moduleId,
      angleId: "angle-custom-followup",
      customQuestion: seedQuestion.trim(),
      kind: "my-own-why",
      createdAt: now,
    },
  ];
}

export function createRecentSourceFromModule(
  module: LearningModuleRecord,
): StartSource {
  const children = module.children.length
    ? module.children
    : createDefaultModuleChildren(module.id, module.seedQuestion);

  return {
    id: `module-${module.id}`,
    label: module.title,
    caption: module.sourceLabel
      ? `Learning module - ${module.sourceLabel}`
      : "Learning module",
    kind: module.kind === "conceptual" ? "conceptual" : "project",
    moduleTopicId: module.id,
    sourceId: module.sourceId,
    sourceLabel: module.sourceLabel,
    sourceFiles: module.sourceFiles,
    children,
  };
}

export function createGeneratedWhyId(sourceId?: string) {
  const suffix = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  return sourceId ? `why-${sourceId}-${suffix}` : `why-conceptual-${suffix}`;
}

export function readImportedSources() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(importedSourcesStorageKey);

    if (!rawValue) {
      return [];
    }

    const parsedValue = JSON.parse(rawValue) as StartSource[];
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
  }
}

export function hasPlayedStartWake() {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return window.sessionStorage.getItem(startWakeSessionKey) === "true";
  } catch {
    return false;
  }
}

export function markStartWakePlayed() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(startWakeSessionKey, "true");
  } catch {
    // The animation is decorative; storage failure should not block the page.
  }
}

export function readPendingStartSource(): StartSource | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(pendingStartSourceStorageKey);

    if (!rawValue) {
      return null;
    }

    const parsedValue = JSON.parse(rawValue) as Partial<StartSource>;
    window.localStorage.removeItem(pendingStartSourceStorageKey);

    if (
      typeof parsedValue.id !== "string" ||
      typeof parsedValue.label !== "string" ||
      typeof parsedValue.caption !== "string"
    ) {
      return null;
    }

    return {
      id: parsedValue.id,
      label: parsedValue.label,
      caption: parsedValue.caption,
      kind:
        parsedValue.kind === "folder" ||
        parsedValue.kind === "file" ||
        parsedValue.kind === "conceptual"
          ? parsedValue.kind
          : "project",
      children: Array.isArray(parsedValue.children)
        ? parsedValue.children.filter(
            (child): child is StartSourceChild =>
              Boolean(child) &&
              typeof child.id === "string" &&
              typeof child.label === "string" &&
              typeof child.topicId === "string",
          )
        : [],
      moduleTopicId:
        typeof parsedValue.moduleTopicId === "string"
          ? parsedValue.moduleTopicId
          : undefined,
      sourceId:
        typeof parsedValue.sourceId === "string" ? parsedValue.sourceId : undefined,
      sourceLabel:
        typeof parsedValue.sourceLabel === "string"
          ? parsedValue.sourceLabel
          : undefined,
      sourceFiles: Array.isArray(parsedValue.sourceFiles)
        ? parsedValue.sourceFiles.filter(
            (sourceFile): sourceFile is string =>
              typeof sourceFile === "string" && Boolean(sourceFile.trim()),
          )
        : undefined,
    };
  } catch {
    return null;
  }
}

export function saveImportedSources(sources: StartSource[]) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(importedSourcesStorageKey, JSON.stringify(sources));
  } catch {
    // Keep the visual flow usable even if the browser refuses persistence.
  }
}

export function createImportedSource(
  files: FileList | File[],
  existingId?: string,
) {
  const fileArray = Array.from(files);
  const firstFile = fileArray[0];
  const folderName = firstFile?.webkitRelativePath?.split("/")?.[0]?.trim();
  const fileName = firstFile?.name?.replace(/\.[^/.]+$/, "").trim();
  const baseLabel = folderName || fileName || "Imported source";
  const label =
    fileArray.length > 1 ? `${baseLabel} + ${fileArray.length - 1}` : baseLabel;

  return {
    id: existingId ?? `source-local-${Date.now().toString(36)}`,
    label,
    caption: `${fileArray.length || 1} local file${fileArray.length === 1 ? "" : "s"}`,
    kind: fileArray.length > 1 ? "folder" : "file",
    sourceFiles: fileArray.map((file) => file.name),
    children: [] as StartSourceChild[],
  } satisfies StartSource;
}

export function getRecentSourcePoint(index: number, total: number) {
  if (total <= 1) {
    return { x: 82, y: 39 };
  }

  const yOffsets = [38, 56, 34, 53, 40];

  return {
    x: 30 + (index * 56) / Math.max(total - 1, 1),
    y: yOffsets[index % yOffsets.length],
  };
}

export const recentTrackStartPoint = { x: 9, y: 54 };
