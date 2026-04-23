import { useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import { useThemeMode } from "@/app/theme/theme-provider";
import { cn } from "@/lib/utils";
import {
  formatTopicFeedbackScoreLabel,
  type TopicFeedbackLevel,
  type TopicFeedbackPreview,
  TopicSourceReference,
} from "@/features/topic-session";
import { ActiveFeedbackCard } from "./active-feedback-card";
import { SourceReferenceCard } from "./source-reference-card";
import type { FeedbackCardState, SourceDropTarget } from "../types";

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

const WORKBENCH_INSERT_MIME = "application/echowhy-workbench-card";
const WORKBENCH_ORDER_MIME = "application/echowhy-workbench-order";

const feedbackToneClasses: Record<
  TopicFeedbackPreview["level"],
  {
    badge: string;
    accent: string;
    shell: string;
    border: string;
    subtle: string;
  }
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
  const workbenchPanelRef = useRef<HTMLElement | null>(null);
  const workbenchAutoScrollFrameRef = useRef<number | null>(null);
  const workbenchAutoScrollStateRef = useRef<{
    clientY: number;
    lastSeenAt: number;
    currentVelocity: number;
    lastFrameAt: number;
  } | null>(null);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const scrollerRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const lineRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [fileModeById, setFileModeById] = useState<
    Record<string, "snippet" | "full">
  >({});
  const [loadingById, setLoadingById] = useState<Record<string, boolean>>({});
  const [flashReferenceId, setFlashReferenceId] = useState<string | null>(null);
  const [focusReferenceId, setFocusReferenceId] = useState<string | null>(null);
  const [sourceDropTarget, setSourceDropTarget] =
    useState<SourceDropTarget>(null);
  const [draggingWorkbenchKind, setDraggingWorkbenchKind] = useState<
    "feedback" | "source" | null
  >(null);
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

  const pinnedReferences = pinnedReferenceIds
    .map((referenceId) =>
      references.find((reference) => reference.id === referenceId),
    )
    .filter((reference): reference is TopicSourceReference =>
      Boolean(reference),
    );

  const previewReference =
    previewReferenceId && !pinnedReferenceIds.includes(previewReferenceId)
      ? (references.find((reference) => reference.id === previewReferenceId) ??
        null)
      : null;

  const displayedReferences = useMemo(
    () => [
      ...pinnedReferences.map((reference) => ({
        reference,
        kind: "pinned" as const,
      })),
      ...(previewReference
        ? [{ reference: previewReference, kind: "preview" as const }]
        : []),
    ],
    [pinnedReferences, previewReference],
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
  const stopWorkbenchAutoScroll = () => {
    if (workbenchAutoScrollFrameRef.current !== null) {
      window.cancelAnimationFrame(workbenchAutoScrollFrameRef.current);
      workbenchAutoScrollFrameRef.current = null;
    }

    workbenchAutoScrollStateRef.current = null;
  };

  const primeWorkbenchAutoScroll = (clientY: number) => {
    const panel = workbenchPanelRef.current;

    if (!panel) {
      stopWorkbenchAutoScroll();
      return;
    }

    workbenchAutoScrollStateRef.current = {
      clientY,
      lastSeenAt: performance.now(),
      currentVelocity:
        workbenchAutoScrollStateRef.current?.currentVelocity ?? 0,
      lastFrameAt: performance.now(),
    };

    if (workbenchAutoScrollFrameRef.current !== null) {
      return;
    }

    const tick = () => {
      const activePanel = workbenchPanelRef.current;
      const state = workbenchAutoScrollStateRef.current;

      if (!activePanel || !state) {
        workbenchAutoScrollFrameRef.current = null;
        return;
      }

      const now = performance.now();
      const frameDelta = Math.min((now - state.lastFrameAt) / 16.6667, 2.2);
      state.lastFrameAt = now;

      const bounds = activePanel.getBoundingClientRect();
      const edgeSize = 176;
      const maxSpeed = 52;
      const topDistance = state.clientY - bounds.top;
      const bottomDistance = bounds.bottom - state.clientY;
      let targetVelocity = 0;

      if (topDistance < edgeSize) {
        const intensity = 1 - Math.max(topDistance, 0) / edgeSize;
        targetVelocity = -(maxSpeed * intensity * intensity * intensity);
      } else if (bottomDistance < edgeSize) {
        const intensity = 1 - Math.max(bottomDistance, 0) / edgeSize;
        targetVelocity = maxSpeed * intensity * intensity * intensity;
      }

      if (now - state.lastSeenAt > 380) {
        targetVelocity = 0;
      }

      const ease = Math.min(0.26 * frameDelta, 0.42);
      state.currentVelocity += (targetVelocity - state.currentVelocity) * ease;

      if (Math.abs(state.currentVelocity) > 0.08) {
        activePanel.scrollTop += state.currentVelocity * frameDelta;
      }

      if (
        targetVelocity === 0 &&
        Math.abs(state.currentVelocity) <= 0.08 &&
        now - state.lastSeenAt > 520
      ) {
        stopWorkbenchAutoScroll();
        return;
      }

      workbenchAutoScrollFrameRef.current = window.requestAnimationFrame(tick);
    };

    workbenchAutoScrollFrameRef.current = window.requestAnimationFrame(tick);
  };

  const autoScrollWorkbenchPanel = (event: DragEvent<HTMLElement>) => {
    if (!draggingWorkbenchKind) {
      stopWorkbenchAutoScroll();
      return;
    }

    primeWorkbenchAutoScroll(event.clientY);
    event.preventDefault();
  };

  useEffect(() => stopWorkbenchAutoScroll, []);

  useEffect(() => {
    if (!draggingWorkbenchKind) {
      return;
    }

    const handleWindowDragOver = (event: globalThis.DragEvent) => {
      const panel = workbenchPanelRef.current;

      if (!panel) {
        return;
      }

      const bounds = panel.getBoundingClientRect();
      const withinHorizontalRange =
        event.clientX >= bounds.left - 24 && event.clientX <= bounds.right + 24;
      const withinVerticalRange =
        event.clientY >= bounds.top - 64 && event.clientY <= bounds.bottom + 64;

      if (!withinHorizontalRange || !withinVerticalRange) {
        stopWorkbenchAutoScroll();
        return;
      }

      event.preventDefault();
      primeWorkbenchAutoScroll(event.clientY);
    };

    window.addEventListener("dragover", handleWindowDragOver);

    return () => {
      window.removeEventListener("dragover", handleWindowDragOver);
    };
  }, [draggingWorkbenchKind]);

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

  const startWorkbenchDrag = (
    event: DragEvent<HTMLElement>,
    payload: {
      kind: "feedback" | "source";
      id: string;
      label: string;
      insertPrompt: string;
      feedbackLevel?: TopicFeedbackLevel;
      title?: string;
      subtitle?: string;
      body?: string;
      code?: string;
      meta?: string;
    },
  ) => {
    setDraggingWorkbenchKind(payload.kind);
    event.dataTransfer.effectAllowed = "copyMove";
    event.dataTransfer.setData("text/plain", payload.insertPrompt);
    event.dataTransfer.setData(WORKBENCH_INSERT_MIME, JSON.stringify(payload));
    event.dataTransfer.setData(
      WORKBENCH_ORDER_MIME,
      JSON.stringify({ kind: payload.kind, id: payload.id }),
    );
  };

  const readOrderPayload = (event: DragEvent<HTMLElement>) => {
    const rawPayload = event.dataTransfer.getData(WORKBENCH_ORDER_MIME);

    if (!rawPayload) {
      return null;
    }

    try {
      return JSON.parse(rawPayload) as {
        kind?: "feedback" | "source";
        id?: string;
      };
    } catch {
      return null;
    }
  };

  const handleSourceCardDrop = (
    event: DragEvent<HTMLDivElement>,
    targetReferenceId: string,
    position: "before" | "after",
  ) => {
    const payload = readOrderPayload(event);

    if (
      payload?.kind !== "source" ||
      !payload.id ||
      payload.id === targetReferenceId
    ) {
      setSourceDropTarget(null);
      return;
    }

    event.preventDefault();
    const nextPinnedReferences = pinnedReferenceIds.filter(
      (referenceId) => referenceId !== payload.id,
    );
    const targetIndex = nextPinnedReferences.indexOf(targetReferenceId);

    if (targetIndex < 0) {
      setSourceDropTarget(null);
      return;
    }

    const insertIndex = position === "after" ? targetIndex + 1 : targetIndex;
    nextPinnedReferences.splice(insertIndex, 0, payload.id);
    setSourceDropTarget(null);
    onReorderSources(nextPinnedReferences);
  };

  const handleSourceCardDragOver = (
    event: DragEvent<HTMLDivElement>,
    targetReferenceId: string,
    kind: "pinned" | "preview",
  ) => {
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
  };

  const clearSourceDropTarget = (targetReferenceId: string) => {
    setSourceDropTarget((current) =>
      current?.referenceId === targetReferenceId ? null : current,
    );
  };

  const handleFeedbackDrop = (
    event: DragEvent<HTMLDivElement>,
    targetFeedbackId: string,
  ) => {
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
  };

  return (
    <aside
      ref={workbenchPanelRef}
      onDragOver={autoScrollWorkbenchPanel}
      onDrop={stopWorkbenchAutoScroll}
      className="source-workbench-scrollbar relative hidden h-full w-[min(32rem,36vw)] min-w-[24rem] shrink-0 overflow-y-auto border-l border-slate-200/50 bg-transparent p-8 xl:block dark:border-cyan-800/30"
    >
      {activeFeedback && activeFeedbackTone ? (
        <ActiveFeedbackCard
          activeFeedback={activeFeedback}
          activeFeedbackIndex={activeFeedbackIndex}
          feedbackCards={feedbackCards}
          tone={activeFeedbackTone}
          onDismissFeedback={onDismissFeedback}
          onSelectFeedback={onSelectFeedback}
          onCycleFeedback={onCycleFeedback}
          onFocusQuestion={onFocusQuestion}
          onDragStart={(event) =>
            startWorkbenchDrag(event, {
              kind: "feedback",
              id: activeFeedback.id,
              label: activeFeedback.feedback.label,
              feedbackLevel: activeFeedback.feedback.level,
              title: formatTopicFeedbackScoreLabel(activeFeedback.feedback),
              subtitle: "Answer feedback",
              body: [
                activeFeedback.feedback.correctPoints.length
                  ? `What landed well:\n${activeFeedback.feedback.correctPoints
                      .map((point) => `- ${point}`)
                      .join("\n")}`
                  : "",
                activeFeedback.feedback.vaguePoints.length
                  ? `What feels unclear:\n${activeFeedback.feedback.vaguePoints
                      .map((point) => `- ${point}`)
                      .join("\n")}`
                  : "",
                activeFeedback.feedback.missingPoints.length
                  ? `What's still missing:\n${activeFeedback.feedback.missingPoints
                      .map((point) => `- ${point}`)
                      .join("\n")}`
                  : "",
                `A good next step:\n${activeFeedback.feedback.nextSuggestion}`,
              ]
                .filter(Boolean)
                .join("\n\n"),
              meta: `Question answer | ${activeFeedback.feedback.score}/100`,
              insertPrompt: `Review this feedback: ${activeFeedback.feedback.nextSuggestion}`,
            })
          }
          onDragEnd={() => {
            setDraggingWorkbenchKind(null);
            setSourceDropTarget(null);
            stopWorkbenchAutoScroll();
          }}
          onDragOver={(event) => {
            autoScrollWorkbenchPanel(event);

            if (feedbackCards.length > 1) {
              event.preventDefault();
            }
          }}
          onDrop={(event) => handleFeedbackDrop(event, activeFeedback.id)}
        />
      ) : null}

      <div
        className={cn(
          "mb-6 flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400 dark:text-slate-400",
          !isDark && "text-halo-light",
        )}
      >
        <span>Source Workbench</span>
        <div className="flex items-center gap-3">
          {pinnedReferenceIds.length ? (
            <button
              type="button"
              onClick={onClearAllSources}
              className="text-[10px] uppercase tracking-[0.2em] text-slate-400 transition-colors hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400"
            >
              [ Clear All ]
            </button>
          ) : null}
          <span className="text-slate-400">{displayedReferences.length}</span>
        </div>
      </div>

      {displayedReferences.length ? (
        <div className="space-y-6">
          {displayedReferences.map(({ reference, kind }) => {
            const isFullFile = fileModeById[reference.id] === "full";
            const isLoading = loadingById[reference.id];
            const fileLines = (
              reference.fullContent ?? reference.snippet
            ).split("\n");
            const snippetLines = reference.snippet.split("\n");
            const visibleLines = isFullFile ? fileLines : snippetLines;
            const sourceSubtitle = `${reference.referencePath}${
              reference.startLine
                ? ` : ${reference.startLine}-${reference.endLine}`
                : ""
            }`;
            const sourceCodePayload = visibleLines.join("\n");
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
                onDragStart={(event) =>
                  startWorkbenchDrag(event, {
                    kind: "source",
                    id: reference.id,
                    label: reference.label,
                    title: reference.label,
                    subtitle: sourceSubtitle,
                    code: sourceCodePayload,
                    meta: isFullFile ? "Full file excerpt" : "Source snippet",
                    insertPrompt: `How does ${reference.label} support this part?`,
                  })
                }
                onDragEnd={() => {
                  setDraggingWorkbenchKind(null);
                  setSourceDropTarget(null);
                  stopWorkbenchAutoScroll();
                }}
                onDragOver={(event) =>
                  handleSourceCardDragOver(event, reference.id, kind)
                }
                onDragLeave={(event) => {
                  if (
                    event.relatedTarget instanceof Node &&
                    event.currentTarget.contains(event.relatedTarget)
                  ) {
                    return;
                  }

                  clearSourceDropTarget(reference.id);
                }}
                onDrop={(event) =>
                  handleSourceCardDrop(
                    event,
                    reference.id,
                    sourceDropPosition ?? "before",
                  )
                }
                onUnpinSource={onUnpinSource}
                onFocusBlock={onFocusBlock}
                onToggleReferenceMode={toggleReferenceMode}
                setItemRef={(element) => {
                  itemRefs.current[reference.id] = element;
                }}
                setScrollerRef={(element) => {
                  scrollerRefs.current[reference.id] = element;
                }}
                setLineRef={(lineKey, element) => {
                  lineRefs.current[lineKey] = element;
                }}
              />
            );
          })}
        </div>
      ) : (
        <div
          className={cn(
            "rounded-2xl border border-dashed p-5 text-sm italic text-slate-400",
            isDark
              ? "border-cyan-500/24 bg-transparent text-slate-300"
              : "border-slate-200/60 bg-white/[0.06] backdrop-blur-[2px]",
          )}
        >
          <span className={cn(!isDark && "text-halo-light")}>
            Hover a code identifier to preview it here, or click to pin multiple
            sources side by side.
          </span>
        </div>
      )}
    </aside>
  );
}
