import { useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import { useThemeMode } from "@/app/theme/theme-provider";
import { cn } from "@/lib/utils";
import type { TopicFeedbackPreview, TopicSourceReference } from "@/features/topic-session";

type FeedbackCardState = {
  id: string;
  angleId: string;
  questionId: string;
  answer: string;
  feedback: TopicFeedbackPreview;
  revealedAnswerUsed: boolean;
};

type SourceDropTarget = {
  referenceId: string;
  position: "before" | "after";
} | null;

type SourceReferencePanelProps = {
  references: TopicSourceReference[];
  pinnedReferenceIds: string[];
  previewReferenceId: string | null;
  feedbackCards: FeedbackCardState[];
  activeFeedbackId: string | null;
  onDismissFeedback: (feedbackId: string) => void;
  onSelectFeedback: (feedbackId: string) => void;
  onCycleFeedback: (direction: "previous" | "next") => void;
  onReorderFeedbacks: (draggedFeedbackId: string, targetFeedbackId: string) => void;
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
  { badge: string; accent: string }
> = {
  weak: {
    badge:
      "border-rose-500/35 bg-rose-500/8 text-rose-600 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-300",
    accent: "text-rose-500 dark:text-rose-300",
  },
  partial: {
    badge:
      "border-amber-500/35 bg-amber-500/8 text-amber-600 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-300",
    accent: "text-amber-500 dark:text-amber-300",
  },
  good: {
    badge:
      "border-emerald-500/35 bg-emerald-500/8 text-emerald-600 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-300",
    accent: "text-emerald-500 dark:text-emerald-300",
  },
  strong: {
    badge:
      "border-emerald-500/35 bg-emerald-500/8 text-emerald-700 dark:border-emerald-300/35 dark:bg-emerald-300/10 dark:text-emerald-200",
    accent: "text-emerald-600 dark:text-emerald-200",
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
  const [fileModeById, setFileModeById] = useState<Record<string, "snippet" | "full">>({});
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
        feedbackCards.findIndex((feedback) => feedback.id === activeFeedback.id),
        0,
      )
    : -1;

  const pinnedReferences = pinnedReferenceIds
    .map((referenceId) => references.find((reference) => reference.id === referenceId))
    .filter((reference): reference is TopicSourceReference => Boolean(reference));

  const previewReference =
    previewReferenceId && !pinnedReferenceIds.includes(previewReferenceId)
      ? references.find((reference) => reference.id === previewReferenceId) ?? null
      : null;

  const displayedReferences = useMemo(
    () => [
      ...pinnedReferences.map((reference) => ({ reference, kind: "pinned" as const })),
      ...(previewReference ? [{ reference: previewReference, kind: "preview" as const }] : []),
    ],
    [pinnedReferences, previewReference],
  );

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
      currentVelocity: workbenchAutoScrollStateRef.current?.currentVelocity ?? 0,
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

      if (targetVelocity === 0 && Math.abs(state.currentVelocity) <= 0.08 && now - state.lastSeenAt > 520) {
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

    const activeReference = references.find((reference) => reference.id === activeReferenceId);
    const targetLine = activeReference?.defaultHighlightLines?.[0];

    if (!targetLine) {
      return;
    }

    const lineKey = `${activeReferenceId}-${targetLine}`;
    window.setTimeout(() => {
      lineRefs.current[lineKey]?.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 0);
    setFlashReferenceId(activeReferenceId);

    const timeoutId = window.setTimeout(() => {
      setFlashReferenceId((previous) => (previous === activeReferenceId ? null : previous));
    }, 720);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [fileModeById, focusReferenceId, pinnedReferenceIds, previewReferenceId, references]);

  const toggleReferenceMode = (reference: TopicSourceReference) => {
    const currentMode = fileModeById[reference.id] ?? "snippet";

    if (currentMode === "full") {
      setFileModeById((previous) => ({ ...previous, [reference.id]: "snippet" }));
      setFocusReferenceId((previous) => (previous === reference.id ? null : previous));
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
      return JSON.parse(rawPayload) as { kind?: "feedback" | "source"; id?: string };
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

    if (payload?.kind !== "source" || !payload.id || payload.id === targetReferenceId) {
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

  const handleFeedbackDrop = (event: DragEvent<HTMLDivElement>, targetFeedbackId: string) => {
    const payload = readOrderPayload(event);

    if (payload?.kind !== "feedback" || !payload.id || payload.id === targetFeedbackId) {
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
      {activeFeedback ? (
        <div className="relative z-20 mb-8">
          <div
            draggable
            onDragEnd={() => {
              setDraggingWorkbenchKind(null);
              setSourceDropTarget(null);
              stopWorkbenchAutoScroll();
            }}
            onWheel={(event) => {
              if (feedbackCards.length <= 1 || Math.abs(event.deltaX) < 16) {
                return;
              }

              event.preventDefault();
              onCycleFeedback(event.deltaX > 0 ? "next" : "previous");
            }}
            onDragStart={(event) =>
              startWorkbenchDrag(event, {
                kind: "feedback",
                id: activeFeedback.id,
                label: activeFeedback.feedback.label,
                title: `${activeFeedback.feedback.label} 路 ${activeFeedback.feedback.score}`,
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
                meta: `Question answer · ${activeFeedback.feedback.score}/100`,
                insertPrompt: `Review this feedback: ${activeFeedback.feedback.nextSuggestion}`,
              })
            }
            onDragOver={(event) => {
              autoScrollWorkbenchPanel(event);

              if (feedbackCards.length > 1) {
                event.preventDefault();
              }
            }}
            onDrop={(event) => handleFeedbackDrop(event, activeFeedback.id)}
            className={cn(
              "cursor-grab rounded-2xl border p-5 active:cursor-grabbing",
              isDark
                ? "border-cyan-500/18 bg-transparent"
                : "border-slate-200/46 bg-white/[0.025] backdrop-blur-[2px]",
            )}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "rounded-full border px-3 py-1 text-[10px] font-mono uppercase tracking-[0.2em]",
                    feedbackToneClasses[activeFeedback.feedback.level].badge,
                  )}
                >
                  {activeFeedback.feedback.label} · {activeFeedback.feedback.score}
                </span>
              </div>

              <button
                type="button"
                onClick={() => onDismissFeedback(activeFeedback.id)}
                className="text-xs text-slate-400 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                [ x ]
              </button>
            </div>

            <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
              <div>
                <p className={cn("mb-2 font-medium", feedbackToneClasses[activeFeedback.feedback.level].accent)}>
                  👍 What landed well:
                </p>
                <ul className="space-y-1">
                  {activeFeedback.feedback.correctPoints.map((point) => (
                    <li key={point}>- {point}</li>
                  ))}
                </ul>
              </div>

              {activeFeedback.feedback.vaguePoints.length ? (
                <div>
                  <p className="mb-2 font-medium text-slate-500 dark:text-slate-400">
                    ⚠️ What feels unclear:
                  </p>
                  <ul className="space-y-1">
                    {activeFeedback.feedback.vaguePoints.map((point) => (
                      <li key={point}>- {point}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {activeFeedback.feedback.missingPoints.length ? (
                <div>
                  <p className="mb-2 font-medium text-slate-500 dark:text-slate-400">
                    ❌ What's still missing:
                  </p>
                  <ul className="space-y-1">
                    {activeFeedback.feedback.missingPoints.map((point) => (
                      <li key={point}>- {point}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div>
                <p className="mb-2 font-medium text-cyan-600 dark:text-cyan-400">
                  💡 A good next step:
                </p>
                <p>{activeFeedback.feedback.nextSuggestion}</p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-slate-200/30 pt-3 text-[10px] font-mono uppercase tracking-[0.18em] text-slate-400 dark:border-cyan-900/30">
              <button
                type="button"
                onClick={() => onFocusQuestion(activeFeedback.questionId)}
                className="transition-colors hover:text-cyan-600 dark:hover:text-cyan-400"
              >
                [ locate ]
              </button>
              {feedbackCards.length > 1 ? (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onCycleFeedback("previous")}
                    className="transition-colors hover:text-cyan-600 dark:hover:text-cyan-400"
                  >
                    prev
                  </button>
                  <span className="rounded-full bg-slate-500/10 px-2 py-0.5">
                    {activeFeedbackIndex + 1}/{feedbackCards.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => onCycleFeedback("next")}
                    className="transition-colors hover:text-cyan-600 dark:hover:text-cyan-400"
                  >
                    next
                  </button>
                  <span className="flex items-center gap-1">
                    {feedbackCards.map((feedback, index) => (
                      <button
                        key={feedback.id}
                        type="button"
                        onClick={() => onSelectFeedback(feedback.id)}
                        className={cn(
                          "h-1.5 w-1.5 rounded-full transition-colors",
                          index === activeFeedbackIndex
                            ? "bg-cyan-500"
                            : "bg-slate-500/35 hover:bg-cyan-500/70",
                        )}
                        aria-label={`Show feedback ${index + 1}`}
                      />
                    ))}
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
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
            const fileLines = (reference.fullContent ?? reference.snippet).split("\n");
            const snippetLines = reference.snippet.split("\n");
            const visibleLines = isFullFile ? fileLines : snippetLines;
            const lineNumberOffset = isFullFile ? 1 : reference.startLine ?? 1;
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
              <div
                key={`${kind}-${reference.id}`}
                ref={(element) => {
                  itemRefs.current[reference.id] = element;
                }}
                draggable
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
                className={cn(
                  "relative isolate cursor-grab overflow-hidden rounded-2xl border p-4 transition-all duration-200 active:cursor-grabbing",
                  isDark
                    ? "border-cyan-500/18 bg-transparent"
                    : "bg-white/[0.025] backdrop-blur-[2px]",
                  kind === "preview"
                    ? "border-cyan-200/42 opacity-90 shadow-[0_18px_52px_-42px_rgba(8,145,178,0.22)] dark:border-cyan-500/24"
                    : "border-slate-200/46 shadow-[0_18px_60px_-48px_rgba(15,23,42,0.24)] dark:border-cyan-500/18",
                )}
              >
                {!isDark ? (
                  <div
                    className={cn(
                      "pointer-events-none absolute inset-0 z-0 rounded-2xl",
                      kind === "preview"
                        ? "bg-[radial-gradient(ellipse_at_35%_20%,rgba(236,254,255,0.38)_0%,rgba(236,254,255,0.16)_36%,rgba(236,254,255,0.035)_72%,transparent_100%)]"
                        : "bg-[radial-gradient(ellipse_at_35%_20%,rgba(248,250,252,0.5)_0%,rgba(248,250,252,0.18)_42%,rgba(248,250,252,0.04)_76%,transparent_100%)]",
                    )}
                  />
                ) : null}

                {sourceDropPosition ? (
                  <div
                    className={cn(
                      "pointer-events-none absolute left-4 right-4 z-30 h-px bg-cyan-300/85 shadow-[0_0_14px_rgba(34,211,238,0.28)] transition-opacity",
                      sourceDropPosition === "before" ? "top-0" : "bottom-0",
                    )}
                  />
                ) : null}

                <div className="relative z-10 mb-4 flex items-start justify-between gap-3">
                  <div className="space-y-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                    <p className={cn("dark:text-slate-100", !isDark && "text-halo-light")}>
                      {reference.label}
                    </p>
                    <p
                      className={cn(
                        "break-all text-slate-500 dark:text-slate-300",
                        !isDark && "text-halo-light",
                      )}
                    >
                      {reference.referencePath}
                      {reference.startLine
                        ? ` : ${reference.startLine}-${reference.endLine}`
                        : ""}
                    </p>
                  </div>

                  {kind === "pinned" ? (
                    <button
                      type="button"
                      onClick={() => onUnpinSource(reference.id)}
                      className="shrink-0 text-xs text-slate-400 transition-colors hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200"
                    >
                      [ x ]
                    </button>
                  ) : (
                    <span className="shrink-0 text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-500/80 dark:text-cyan-400">
                      [ Preview ]
                    </span>
                  )}
                </div>

                <div
                  ref={(element) => {
                    scrollerRefs.current[reference.id] = element;
                  }}
                  className="source-workbench-scrollbar relative z-10 max-h-96 overflow-y-auto pr-1"
                >
                  {isLoading ? (
                    <div className="py-4 font-mono text-xs text-slate-400 dark:text-slate-400">
                      Loading file...
                    </div>
                  ) : (
                    <div className="font-mono text-[12px] leading-loose text-slate-600 dark:text-slate-300">
                      {visibleLines.map((line, index) => {
                        const lineNumber = lineNumberOffset + index;
                        const isHighlighted =
                          reference.defaultHighlightLines?.includes(lineNumber) ?? false;
                        const isFlashing = flashReferenceId === reference.id && isHighlighted;

                        return (
                          <button
                            key={`${reference.id}-${lineNumber}`}
                            ref={(element) => {
                              lineRefs.current[`${reference.id}-${lineNumber}`] = element;
                            }}
                            type="button"
                            onClick={() =>
                              onFocusBlock(
                                reference.linkedBlockId ?? "",
                                reference.linkedQuestionId,
                              )
                            }
                            className={cn(
                              "group relative flex w-full items-start gap-3 border-l-[2px] pl-3 text-left transition-all duration-150 focus:outline-none focus-visible:outline-none",
                              isFullFile
                                ? "cursor-pointer border-transparent hover:border-cyan-500/35"
                                : "cursor-pointer",
                              isHighlighted
                                ? "border-cyan-500 bg-gradient-to-r from-cyan-500/[0.035] via-cyan-500/[0.012] to-transparent text-cyan-700 shadow-[-3px_0_10px_rgba(6,182,212,0.05)] dark:border-cyan-400 dark:from-cyan-400/[0.045] dark:via-cyan-400/[0.012] dark:text-cyan-400"
                                : "border-transparent",
                              isFlashing &&
                                "bg-cyan-500/[0.045] dark:bg-cyan-400/[0.06]",
                            )}
                          >
                            {isFullFile ? (
                              <span className="w-8 shrink-0 text-right text-slate-400 dark:text-slate-400">
                                {lineNumber}
                              </span>
                            ) : null}
                            <span className="min-w-0 flex-1 whitespace-pre-wrap">{line || " "}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="relative z-10 mt-4">
                  <button
                    type="button"
                    onClick={() => toggleReferenceMode(reference)}
                    className="text-[9px] uppercase tracking-[0.18em] text-slate-400 transition-colors hover:text-cyan-600 dark:text-slate-500 dark:hover:text-cyan-400"
                    aria-label={isFullFile ? "Show snippet" : "View full file"}
                    title={isFullFile ? "Show snippet" : "View full file"}
                  >
                    [ {isFullFile ? "Snippet" : "Full file"} ]
                  </button>
                </div>
              </div>
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
