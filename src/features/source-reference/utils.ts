export type SourceWorkbenchCardLayout = {
  referenceId: string;
  kind: "pinned" | "preview";
  isCompressed: boolean;
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
