import { useState, type DragEvent } from "react";
import type { SourceDropTarget, WorkbenchInsertPayload } from "./types";
import {
  buildReorderedPinnedSources,
  parseWorkbenchOrderPayload,
} from "./utils";

const WORKBENCH_INSERT_MIME = "application/echowhy-workbench-card";
const WORKBENCH_ORDER_MIME = "application/echowhy-workbench-order";

type UseSourceWorkbenchDndOptions = {
  pinnedReferenceIds: string[];
  onReorderSources: (referenceIds: string[]) => void;
  onReorderFeedbacks: (
    draggedFeedbackId: string,
    targetFeedbackId: string,
  ) => void;
};

export function useSourceWorkbenchDnd({
  pinnedReferenceIds,
  onReorderSources,
  onReorderFeedbacks,
}: UseSourceWorkbenchDndOptions) {
  const [sourceDropTarget, setSourceDropTarget] =
    useState<SourceDropTarget>(null);
  const [draggingWorkbenchKind, setDraggingWorkbenchKind] = useState<
    "feedback" | "source" | null
  >(null);

  function stopWorkbenchDrag(stopWorkbenchAutoScroll: () => void) {
    setDraggingWorkbenchKind(null);
    setSourceDropTarget(null);
    stopWorkbenchAutoScroll();
  }

  function startWorkbenchDrag(
    event: DragEvent<HTMLElement>,
    payload: WorkbenchInsertPayload,
  ) {
    setDraggingWorkbenchKind(payload.kind);
    event.dataTransfer.effectAllowed = "copyMove";
    event.dataTransfer.setData("text/plain", payload.insertPrompt);
    event.dataTransfer.setData(WORKBENCH_INSERT_MIME, JSON.stringify(payload));
    event.dataTransfer.setData(
      WORKBENCH_ORDER_MIME,
      JSON.stringify({ kind: payload.kind, id: payload.id }),
    );
  }

  function readOrderPayload(event: DragEvent<HTMLElement>) {
    return parseWorkbenchOrderPayload(
      event.dataTransfer.getData(WORKBENCH_ORDER_MIME),
    );
  }

  function handleSourceCardDrop(
    event: DragEvent<HTMLDivElement>,
    targetReferenceId: string,
    position: "before" | "after",
  ) {
    const payload = readOrderPayload(event);

    if (
      payload?.kind !== "source" ||
      !payload.id ||
      payload.id === targetReferenceId
    ) {
      setSourceDropTarget(null);
      return;
    }

    const nextPinnedReferences = buildReorderedPinnedSources(
      pinnedReferenceIds,
      payload.id,
      targetReferenceId,
      position,
    );

    if (!nextPinnedReferences) {
      setSourceDropTarget(null);
      return;
    }

    event.preventDefault();
    setSourceDropTarget(null);
    onReorderSources(nextPinnedReferences);
  }

  function handleSourceCardDragOver(
    event: DragEvent<HTMLDivElement>,
    targetReferenceId: string,
    kind: "pinned" | "preview",
    autoScrollWorkbenchPanel: (event: DragEvent<HTMLElement>) => void,
  ) {
    autoScrollWorkbenchPanel(event);

    if (kind !== "pinned" || draggingWorkbenchKind !== "source") {
      return;
    }

    const hasSourcePayload = Array.from(event.dataTransfer.types).includes(
      WORKBENCH_ORDER_MIME,
    );

    if (!hasSourcePayload) {
      return;
    }

    event.preventDefault();
    const bounds = event.currentTarget.getBoundingClientRect();
    const position =
      event.clientY - bounds.top > bounds.height / 2 ? "after" : "before";

    setSourceDropTarget((current) => {
      if (
        current?.referenceId === targetReferenceId &&
        current.position === position
      ) {
        return current;
      }

      return { referenceId: targetReferenceId, position };
    });
  }

  function clearSourceDropTarget(targetReferenceId: string) {
    setSourceDropTarget((current) =>
      current?.referenceId === targetReferenceId ? null : current,
    );
  }

  function handleFeedbackDrop(
    event: DragEvent<HTMLDivElement>,
    targetFeedbackId: string,
  ) {
    const payload = readOrderPayload(event);

    if (
      payload?.kind !== "feedback" ||
      !payload.id ||
      payload.id === targetFeedbackId
    ) {
      return;
    }

    event.preventDefault();
    onReorderFeedbacks(payload.id, targetFeedbackId);
  }

  return {
    sourceDropTarget,
    draggingWorkbenchKind,
    startWorkbenchDrag,
    stopWorkbenchDrag,
    handleSourceCardDrop,
    handleSourceCardDragOver,
    clearSourceDropTarget,
    handleFeedbackDrop,
  };
}
