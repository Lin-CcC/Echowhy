import type { DragEvent } from "react";
import type { TopicSourceReference } from "@/features/topic-session";
import { SourceReferenceCard, type SourceTone } from "./source-reference-card";
import { buildSourceReferenceDragPayload } from "../utils";
import type { SourceDropTarget, WorkbenchInsertPayload } from "../types";

type DisplayedReference = {
  reference: TopicSourceReference;
  kind: "pinned" | "preview";
  isCompressed: boolean;
};

type SourceWorkbenchReferenceListProps = {
  displayedReferences: DisplayedReference[];
  fileModeById: Record<string, "snippet" | "full">;
  loadingById: Record<string, boolean>;
  flashReferenceId: string | null;
  sourceDropTarget: SourceDropTarget;
  isDark: boolean;
  sourceTone: SourceTone;
  onStartWorkbenchDrag: (
    event: DragEvent<HTMLDivElement>,
    payload: WorkbenchInsertPayload,
  ) => void;
  onStopWorkbenchDrag: () => void;
  onSourceCardDragOver: (
    event: DragEvent<HTMLDivElement>,
    targetReferenceId: string,
    kind: "pinned" | "preview",
  ) => void;
  onClearSourceDropTarget: (targetReferenceId: string) => void;
  onSourceCardDrop: (
    event: DragEvent<HTMLDivElement>,
    targetReferenceId: string,
    position: "before" | "after",
  ) => void;
  onUnpinSource: (referenceId: string) => void;
  onExpandSourceCard: (referenceId: string) => void;
  onFocusBlock: (blockId: string, questionId?: string) => void;
  onToggleReferenceMode: (reference: TopicSourceReference) => void;
  setItemRef: (referenceId: string, element: HTMLDivElement | null) => void;
  setScrollerRef: (referenceId: string, element: HTMLDivElement | null) => void;
  setLineRef: (
    lineKey: string,
    element: HTMLButtonElement | null,
  ) => void;
};

export function SourceWorkbenchReferenceList({
  displayedReferences,
  fileModeById,
  loadingById,
  flashReferenceId,
  sourceDropTarget,
  isDark,
  sourceTone,
  onStartWorkbenchDrag,
  onStopWorkbenchDrag,
  onSourceCardDragOver,
  onClearSourceDropTarget,
  onSourceCardDrop,
  onUnpinSource,
  onExpandSourceCard,
  onFocusBlock,
  onToggleReferenceMode,
  setItemRef,
  setScrollerRef,
  setLineRef,
}: SourceWorkbenchReferenceListProps) {
  return (
    <div className="space-y-6">
      {displayedReferences.map(({ reference, kind, isCompressed }) => {
        const isFullFile = fileModeById[reference.id] === "full";
        const isLoading = loadingById[reference.id];
        const dragPayload = buildSourceReferenceDragPayload(reference, isFullFile);
        const sourceDropPosition =
          sourceDropTarget?.referenceId === reference.id
            ? sourceDropTarget.position
            : null;

        return (
          <SourceReferenceCard
            key={`${kind}-${reference.id}`}
            reference={reference}
            kind={kind}
            isDark={isDark}
            tone={sourceTone}
            isFullFile={isFullFile}
            isLoading={isLoading}
            isFlashing={flashReferenceId === reference.id}
            sourceDropPosition={sourceDropPosition}
            isCompressed={isCompressed}
            onDragStart={(event) =>
              onStartWorkbenchDrag(event, {
                kind: "source",
                ...dragPayload,
              })
            }
            onDragEnd={onStopWorkbenchDrag}
            onDragOver={(event) =>
              onSourceCardDragOver(event, reference.id, kind)
            }
            onDragLeave={(event) => {
              if (
                event.relatedTarget instanceof Node &&
                event.currentTarget.contains(event.relatedTarget)
              ) {
                return;
              }

              onClearSourceDropTarget(reference.id);
            }}
            onDrop={(event) =>
              onSourceCardDrop(
                event,
                reference.id,
                sourceDropPosition ?? "before",
              )
            }
            onUnpinSource={onUnpinSource}
            onExpandCompressed={() => onExpandSourceCard(reference.id)}
            onFocusBlock={onFocusBlock}
            onToggleReferenceMode={onToggleReferenceMode}
            setItemRef={(element) => {
              setItemRef(reference.id, element);
            }}
            setScrollerRef={(element) => {
              setScrollerRef(reference.id, element);
            }}
            setLineRef={setLineRef}
          />
        );
      })}
    </div>
  );
}
