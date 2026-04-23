import { useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import { useThemeMode } from "@/app/theme/theme-provider";
import {
  type TopicFeedbackPreview,
  TopicSourceReference,
} from "@/features/topic-session";
import { SourceWorkbenchEmptyState } from "./source-workbench-empty-state";
import { SourceWorkbenchFeedbackSection } from "./source-workbench-feedback-section";
import { SourceWorkbenchHeader } from "./source-workbench-header";
import { SourceWorkbenchReferenceList } from "./source-workbench-reference-list";
import type {
  ActiveFeedbackTone,
  FeedbackCardState,
  SourceDropTarget,
  WorkbenchInsertPayload,
} from "../types";
import { buildSourceWorkbenchCardLayouts } from "../utils";
import { useSourceWorkbenchAutoScroll } from "../use-source-workbench-auto-scroll";
import { useSourceWorkbenchDnd } from "../use-source-workbench-dnd";

type SourceReferencePanelProps = {
  references: TopicSourceReference[];
  pinnedReferenceIds: string[];
  previewReferenceId: string | null;
  feedbackCards: FeedbackCardState[];
  activeFeedbackId: string | null;
  onDismissFeedback: (feedbackId: string) => void;
  onSelectFeedback: (feedbackId: string) => void;
  onCycleFeedback: (direction: "previous" | "next") => void;
  onReorderFeedbacks: (
    draggedFeedbackId: string,
    targetFeedbackId: string,
  ) => void;
  onReorderSources: (referenceIds: string[]) => void;
  onUnpinSource: (referenceId: string) => void;
  onClearAllSources: () => void;
  onFocusBlock: (blockId: string, questionId?: string) => void;
  onFocusQuestion: (questionId: string) => void;
};

const feedbackToneClasses: Record<
  TopicFeedbackPreview["level"],
  ActiveFeedbackTone
> = {
  weak: {
    badge:
      "border-rose-500/35 bg-transparent text-rose-700 dark:border-rose-400/40 dark:text-rose-300",
    accent: "text-rose-700 dark:text-rose-300",
    shell:
      "border-y border-r border-rose-500/8 bg-rose-500/[0.016] dark:border-y-rose-400/7 dark:border-r-rose-400/7 dark:bg-rose-400/[0.018]",
    border: "border-l border-l-rose-700/40 dark:border-l-rose-400/36",
    subtle: "text-rose-600 dark:text-rose-300",
  },
  partial: {
    badge:
      "border-amber-500/35 bg-transparent text-amber-700 dark:border-amber-400/40 dark:text-amber-300",
    accent: "text-amber-700 dark:text-amber-300",
    shell:
      "border-y border-r border-amber-500/8 bg-amber-500/[0.015] dark:border-y-amber-400/7 dark:border-r-amber-400/7 dark:bg-amber-400/[0.017]",
    border: "border-l border-l-amber-600/40 dark:border-l-amber-400/36",
    subtle: "text-amber-600 dark:text-amber-300",
  },
  good: {
    badge:
      "border-emerald-500/35 bg-transparent text-emerald-700 dark:border-emerald-400/40 dark:text-emerald-300",
    accent: "text-emerald-700 dark:text-emerald-300",
    shell:
      "border-y border-r border-emerald-500/8 bg-emerald-500/[0.015] dark:border-y-emerald-400/7 dark:border-r-emerald-400/7 dark:bg-emerald-400/[0.017]",
    border: "border-l border-l-emerald-700/40 dark:border-l-emerald-400/36",
    subtle: "text-emerald-600 dark:text-emerald-300",
  },
  strong: {
    badge:
      "border-emerald-500/35 bg-transparent text-emerald-800 dark:border-emerald-300/40 dark:text-emerald-200",
    accent: "text-emerald-800 dark:text-emerald-200",
    shell:
      "border-y border-r border-emerald-500/8 bg-emerald-500/[0.016] dark:border-y-emerald-300/7 dark:border-r-emerald-300/7 dark:bg-emerald-300/[0.02]",
    border: "border-l border-l-emerald-700/38 dark:border-l-emerald-300/34",
    subtle: "text-emerald-700 dark:text-emerald-200",
  },
};

export function SourceReferencePanel({
  references,
  pinnedReferenceIds,
  previewReferenceId,
  feedbackCards,
  activeFeedbackId,
  onDismissFeedback,
  onSelectFeedback,
  onCycleFeedback,
  onReorderFeedbacks,
  onReorderSources,
  onUnpinSource,
  onClearAllSources,
  onFocusBlock,
  onFocusQuestion,
}: SourceReferencePanelProps) {
  const { theme } = useThemeMode();
  const isDark = theme === "dark";
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const scrollerRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const lineRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [fileModeById, setFileModeById] = useState<
    Record<string, "snippet" | "full">
  >({});
  const [expandedReferenceIds, setExpandedReferenceIds] = useState<string[]>([]);
  const [loadingById, setLoadingById] = useState<Record<string, boolean>>({});
  const [flashReferenceId, setFlashReferenceId] = useState<string | null>(null);
  const [focusReferenceId, setFocusReferenceId] = useState<string | null>(null);
  const dndState = useSourceWorkbenchDnd({
    pinnedReferenceIds,
    onReorderSources,
    onReorderFeedbacks,
  });
  const sourceDropTarget: SourceDropTarget = dndState.sourceDropTarget;
  const draggingWorkbenchKind = dndState.draggingWorkbenchKind;
  const startWorkbenchDrag = (
    event: DragEvent<HTMLElement>,
    payload: WorkbenchInsertPayload,
  ) => {
    dndState.startWorkbenchDrag(event, payload);
  };
  const stopWorkbenchDrag = dndState.stopWorkbenchDrag;
  const handleSourceCardDrop = dndState.handleSourceCardDrop;
  const handleSourceCardDragOver = dndState.handleSourceCardDragOver;
  const clearSourceDropTarget = dndState.clearSourceDropTarget;
  const handleFeedbackDrop = dndState.handleFeedbackDrop;
  const {
    workbenchPanelRef,
    autoScrollWorkbenchPanel,
    stopWorkbenchAutoScroll,
  } = useSourceWorkbenchAutoScroll({
    draggingWorkbenchKind,
  });
  const activeFeedback =
    feedbackCards.find((feedback) => feedback.id === activeFeedbackId) ??
    feedbackCards[0] ??
    null;
  const activeFeedbackIndex = activeFeedback
    ? Math.max(
        feedbackCards.findIndex(
          (feedback) => feedback.id === activeFeedback.id,
        ),
        0,
      )
    : -1;
  const activeFeedbackTone = activeFeedback
    ? feedbackToneClasses[activeFeedback.feedback.level]
    : null;
  const fullFileReferenceIds = useMemo(
    () =>
      Object.entries(fileModeById)
        .filter(([, mode]) => mode === "full")
        .map(([referenceId]) => referenceId),
    [fileModeById],
  );

  const sourceCardLayouts = useMemo(
    () =>
      buildSourceWorkbenchCardLayouts({
        pinnedReferenceIds,
        previewReferenceId,
        expandedReferenceIds,
        fullFileReferenceIds,
      }),
    [
      expandedReferenceIds,
      fullFileReferenceIds,
      pinnedReferenceIds,
      previewReferenceId,
    ],
  );

  const displayedReferences = useMemo(
    () =>
      sourceCardLayouts
        .map((layout) => {
          const reference = references.find(
            (candidate) => candidate.id === layout.referenceId,
          );

          return reference
            ? {
                ...layout,
                reference,
              }
            : null;
        })
        .filter(
          (
            item,
          ): item is (typeof sourceCardLayouts)[number] & {
            reference: TopicSourceReference;
          } => Boolean(item),
        ),
    [references, sourceCardLayouts],
  );

  const sourceTone = {
    shell: isDark
      ? "border-y border-r border-indigo-400/7 bg-indigo-400/[0.03]"
      : "border-y border-r border-indigo-300/24 bg-indigo-500/[0.03] shadow-[0_18px_52px_-46px_rgba(79,70,229,0.12)]",
    border: isDark
      ? "border-l border-l-indigo-400/34"
      : "border-l border-l-indigo-600/36",
    label: isDark ? "text-indigo-300" : "text-indigo-700",
    title: isDark ? "text-slate-100" : "text-slate-700",
    meta: isDark ? "text-slate-300" : "text-slate-500",
    code: isDark
      ? "border-indigo-400/18 bg-transparent text-indigo-300"
      : "border-indigo-700/16 bg-transparent text-indigo-700",
  };

  useEffect(() => {
    const visibleReferenceIds = new Set([
      ...pinnedReferenceIds,
      ...(previewReferenceId ? [previewReferenceId] : []),
    ]);

    setExpandedReferenceIds((previous) => {
      const next = previous.filter((referenceId) =>
        visibleReferenceIds.has(referenceId),
      );

      return next.length === previous.length ? previous : next;
    });
  }, [pinnedReferenceIds, previewReferenceId]);

  useEffect(() => {
    if (!pinnedReferenceIds.length) {
      return;
    }

    const latestPinned = pinnedReferenceIds[pinnedReferenceIds.length - 1];
    itemRefs.current[latestPinned]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [pinnedReferenceIds]);

  useEffect(() => {
    const activeReferenceId =
      focusReferenceId ??
      previewReferenceId ??
      pinnedReferenceIds[pinnedReferenceIds.length - 1] ??
      null;

    if (!activeReferenceId || fileModeById[activeReferenceId] !== "full") {
      return;
    }

    const activeReference = references.find(
      (reference) => reference.id === activeReferenceId,
    );
    const targetLine = activeReference?.defaultHighlightLines?.[0];

    if (!targetLine) {
      return;
    }

    const lineKey = `${activeReferenceId}-${targetLine}`;
    window.setTimeout(() => {
      lineRefs.current[lineKey]?.scrollIntoView({
        block: "center",
        behavior: "smooth",
      });
    }, 0);
    setFlashReferenceId(activeReferenceId);

    const timeoutId = window.setTimeout(() => {
      setFlashReferenceId((previous) =>
        previous === activeReferenceId ? null : previous,
      );
    }, 720);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [
    fileModeById,
    focusReferenceId,
    pinnedReferenceIds,
    previewReferenceId,
    references,
  ]);

  const toggleReferenceMode = (reference: TopicSourceReference) => {
    const currentMode = fileModeById[reference.id] ?? "snippet";

    if (currentMode === "full") {
      setFileModeById((previous) => ({
        ...previous,
        [reference.id]: "snippet",
      }));
      setFocusReferenceId((previous) =>
        previous === reference.id ? null : previous,
      );
      return;
    }

    setLoadingById((previous) => ({ ...previous, [reference.id]: true }));

    window.setTimeout(() => {
      setLoadingById((previous) => ({ ...previous, [reference.id]: false }));
      setFileModeById((previous) => ({ ...previous, [reference.id]: "full" }));
      setFocusReferenceId(reference.id);
    }, 220);
  };

  const expandSourceCard = (referenceId: string) => {
    setExpandedReferenceIds((previous) =>
      previous.includes(referenceId) ? previous : [...previous, referenceId],
    );
  };

  return (
    <aside
      ref={workbenchPanelRef}
      onDragOver={autoScrollWorkbenchPanel}
      onDrop={stopWorkbenchAutoScroll}
      className="source-workbench-scrollbar relative hidden h-full w-[min(32rem,36vw)] min-w-[24rem] shrink-0 overflow-y-auto border-l border-slate-200/50 bg-transparent p-8 xl:block dark:border-cyan-800/30"
    >
      <SourceWorkbenchFeedbackSection
        activeFeedback={activeFeedback}
        activeFeedbackIndex={activeFeedbackIndex}
        feedbackCards={feedbackCards}
        tone={activeFeedbackTone}
        onDismissFeedback={onDismissFeedback}
        onSelectFeedback={onSelectFeedback}
        onCycleFeedback={onCycleFeedback}
        onFocusQuestion={onFocusQuestion}
        onStartWorkbenchDrag={startWorkbenchDrag}
        onStopWorkbenchDrag={() => stopWorkbenchDrag(stopWorkbenchAutoScroll)}
        onDragOver={(event) => {
          autoScrollWorkbenchPanel(event);

          if (feedbackCards.length > 1) {
            event.preventDefault();
          }
        }}
        onDrop={handleFeedbackDrop}
      />

      <SourceWorkbenchHeader
        isDark={isDark}
        displayedReferenceCount={displayedReferences.length}
        pinnedReferenceCount={pinnedReferenceIds.length}
        onClearAllSources={onClearAllSources}
      />

      {displayedReferences.length ? (
        <SourceWorkbenchReferenceList
          displayedReferences={displayedReferences}
          fileModeById={fileModeById}
          loadingById={loadingById}
          flashReferenceId={flashReferenceId}
          sourceDropTarget={sourceDropTarget}
          isDark={isDark}
          sourceTone={sourceTone}
          onStartWorkbenchDrag={startWorkbenchDrag}
          onStopWorkbenchDrag={() => stopWorkbenchDrag(stopWorkbenchAutoScroll)}
          onSourceCardDragOver={(event, targetReferenceId, kind) =>
            handleSourceCardDragOver(
              event,
              targetReferenceId,
              kind,
              autoScrollWorkbenchPanel,
            )
          }
          onClearSourceDropTarget={clearSourceDropTarget}
          onSourceCardDrop={handleSourceCardDrop}
          onUnpinSource={onUnpinSource}
          onExpandSourceCard={expandSourceCard}
          onFocusBlock={onFocusBlock}
          onToggleReferenceMode={toggleReferenceMode}
          setItemRef={(referenceId, element) => {
            itemRefs.current[referenceId] = element;
          }}
          setScrollerRef={(referenceId, element) => {
            scrollerRefs.current[referenceId] = element;
          }}
          setLineRef={(lineKey, element) => {
            lineRefs.current[lineKey] = element;
          }}
        />
      ) : (
        <SourceWorkbenchEmptyState isDark={isDark} />
      )}
    </aside>
  );
}
