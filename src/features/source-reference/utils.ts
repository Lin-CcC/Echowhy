import {
  formatTopicFeedbackScoreLabel,
  type TopicFeedbackLevel,
  type TopicSourceReference,
} from "@/features/topic-session";
import type { FeedbackCardState } from "./types";

export type SourceWorkbenchCardLayout = {
  referenceId: string;
  kind: "pinned" | "preview";
  isCompressed: boolean;
};

export type SourceReferenceModeCopy = {
  buttonLabel: string;
  actionLabel: string;
  dragMeta: string;
};

export type SourceReferenceDragPayload = {
  id: string;
  label: string;
  title: string;
  subtitle: string;
  code: string;
  meta: string;
  insertPrompt: string;
};

export type FeedbackWorkbenchDragPayload = {
  id: string;
  label: string;
  feedbackLevel: TopicFeedbackLevel;
  title: string;
  subtitle: string;
  body: string;
  meta: string;
  insertPrompt: string;
};

export type WorkbenchOrderPayload = {
  kind?: "feedback" | "source";
  id?: string;
};

type BuildSourceWorkbenchCardLayoutsOptions = {
  pinnedReferenceIds: string[];
  previewReferenceId: string | null;
  expandedReferenceIds?: string[];
  fullFileReferenceIds?: string[];
  maxExpandedCards?: number;
};

function getUniqueIds(ids: string[]) {
  return ids.filter((id, index) => id && ids.indexOf(id) === index);
}

function formatSourceReferenceSubtitle(reference: TopicSourceReference) {
  return `${reference.referencePath}${
    reference.startLine ? ` : ${reference.startLine}-${reference.endLine}` : ""
  }`;
}

export function getSourceReferenceModeCopy(
  isFullFile: boolean,
): SourceReferenceModeCopy {
  if (isFullFile) {
    return {
      buttonLabel: "Back to excerpt",
      actionLabel: "Show referenced excerpt",
      dragMeta: "Full file context",
    };
  }

  return {
    buttonLabel: "Full file",
    actionLabel: "View full file",
    dragMeta: "Referenced excerpt",
  };
}

export function buildSourceReferenceDragPayload(
  reference: TopicSourceReference,
  isFullFile: boolean,
): SourceReferenceDragPayload {
  const modeCopy = getSourceReferenceModeCopy(isFullFile);
  const code = isFullFile
    ? reference.fullContent ?? reference.snippet
    : reference.snippet;

  return {
    id: reference.id,
    label: reference.label,
    title: reference.label,
    subtitle: formatSourceReferenceSubtitle(reference),
    code,
    meta: modeCopy.dragMeta,
    insertPrompt: `How does ${reference.label} support this part?`,
  };
}

export function buildFeedbackWorkbenchDragPayload(
  feedback: FeedbackCardState,
): FeedbackWorkbenchDragPayload {
  return {
    id: feedback.id,
    label: feedback.feedback.label,
    feedbackLevel: feedback.feedback.level,
    title: formatTopicFeedbackScoreLabel(feedback.feedback),
    subtitle: "Answer feedback",
    body: [
      feedback.feedback.correctPoints.length
        ? `What landed well:\n${feedback.feedback.correctPoints
            .map((point) => `- ${point}`)
            .join("\n")}`
        : "",
      feedback.feedback.vaguePoints.length
        ? `What feels unclear:\n${feedback.feedback.vaguePoints
            .map((point) => `- ${point}`)
            .join("\n")}`
        : "",
      feedback.feedback.missingPoints.length
        ? `What's still missing:\n${feedback.feedback.missingPoints
            .map((point) => `- ${point}`)
            .join("\n")}`
        : "",
      `A good next step:\n${feedback.feedback.nextSuggestion}`,
    ]
      .filter(Boolean)
      .join("\n\n"),
    meta: `Question answer | ${feedback.feedback.score}/100`,
    insertPrompt: `Review this feedback: ${feedback.feedback.nextSuggestion}`,
  };
}

export function parseWorkbenchOrderPayload(
  rawPayload: string,
): WorkbenchOrderPayload | null {
  if (!rawPayload) {
    return null;
  }

  try {
    return JSON.parse(rawPayload) as WorkbenchOrderPayload;
  } catch {
    return null;
  }
}

export function buildReorderedPinnedSources(
  pinnedReferenceIds: string[],
  draggedReferenceId: string,
  targetReferenceId: string,
  position: "before" | "after",
): string[] | null {
  const nextPinnedReferences = pinnedReferenceIds.filter(
    (referenceId) => referenceId !== draggedReferenceId,
  );
  const targetIndex = nextPinnedReferences.indexOf(targetReferenceId);

  if (targetIndex < 0) {
    return null;
  }

  const insertIndex = position === "after" ? targetIndex + 1 : targetIndex;
  nextPinnedReferences.splice(insertIndex, 0, draggedReferenceId);
  return nextPinnedReferences;
}

export function buildSourceWorkbenchCardLayouts({
  pinnedReferenceIds,
  previewReferenceId,
  expandedReferenceIds = [],
  fullFileReferenceIds = [],
  maxExpandedCards = 3,
}: BuildSourceWorkbenchCardLayoutsOptions): SourceWorkbenchCardLayout[] {
  const pinnedIds = getUniqueIds(pinnedReferenceIds);
  const layouts: SourceWorkbenchCardLayout[] = pinnedIds.map((referenceId) => ({
    referenceId,
    kind: "pinned",
    isCompressed: false,
  }));

  if (previewReferenceId && !pinnedIds.includes(previewReferenceId)) {
    layouts.push({
      referenceId: previewReferenceId,
      kind: "preview",
      isCompressed: false,
    });
  }

  const visibleIds = new Set(layouts.map((layout) => layout.referenceId));
  const requiredExpandedIds = new Set(
    getUniqueIds([
      previewReferenceId ?? "",
      ...expandedReferenceIds,
      ...fullFileReferenceIds,
    ]).filter((referenceId) => visibleIds.has(referenceId)),
  );
  const expandedIds = new Set(requiredExpandedIds);
  const remainingSlots = Math.max(maxExpandedCards - requiredExpandedIds.size, 0);

  layouts
    .filter((layout) => !requiredExpandedIds.has(layout.referenceId))
    .slice()
    .reverse()
    .slice(0, remainingSlots)
    .forEach((layout) => expandedIds.add(layout.referenceId));

  return layouts.map((layout) => ({
    ...layout,
    isCompressed: layout.kind === "pinned" && !expandedIds.has(layout.referenceId),
  }));
}
