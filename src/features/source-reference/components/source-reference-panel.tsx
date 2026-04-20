import { useEffect, useMemo, useRef, useState } from "react";
import { useThemeMode } from "@/app/theme/theme-provider";
import { cn } from "@/lib/utils";
import type { TopicFeedbackPreview, TopicSourceReference } from "@/features/topic-session";

type FeedbackCardState = {
  angleId: string;
  questionId: string;
  answer: string;
  feedback: TopicFeedbackPreview;
  revealedAnswerUsed: boolean;
};

type SourceReferencePanelProps = {
  references: TopicSourceReference[];
  pinnedReferenceIds: string[];
  previewReferenceId: string | null;
  floatingFeedback: FeedbackCardState | null;
  onDismissFeedback: () => void;
  onUnpinSource: (referenceId: string) => void;
  onClearAllSources: () => void;
  onFocusBlock: (blockId: string, questionId?: string) => void;
};

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
  floatingFeedback,
  onDismissFeedback,
  onUnpinSource,
  onClearAllSources,
  onFocusBlock,
}: SourceReferencePanelProps) {
  const { theme } = useThemeMode();
  const isDark = theme === "dark";
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const scrollerRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const lineRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [fileModeById, setFileModeById] = useState<Record<string, "snippet" | "full">>({});
  const [loadingById, setLoadingById] = useState<Record<string, boolean>>({});
  const [flashReferenceId, setFlashReferenceId] = useState<string | null>(null);

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
      previewReferenceId ?? pinnedReferenceIds[pinnedReferenceIds.length - 1] ?? null;

    if (!activeReferenceId || fileModeById[activeReferenceId] !== "full") {
      return;
    }

    const activeReference = references.find((reference) => reference.id === activeReferenceId);
    const targetLine = activeReference?.defaultHighlightLines?.[0];

    if (!targetLine) {
      return;
    }

    const lineKey = `${activeReferenceId}-${targetLine}`;
    lineRefs.current[lineKey]?.scrollIntoView({ block: "center", behavior: "smooth" });
    setFlashReferenceId(activeReferenceId);

    const timeoutId = window.setTimeout(() => {
      setFlashReferenceId((previous) => (previous === activeReferenceId ? null : previous));
    }, 2000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [fileModeById, pinnedReferenceIds, previewReferenceId, references]);

  const toggleReferenceMode = (reference: TopicSourceReference) => {
    const currentMode = fileModeById[reference.id] ?? "snippet";

    if (currentMode === "full") {
      setFileModeById((previous) => ({ ...previous, [reference.id]: "snippet" }));
      return;
    }

    setLoadingById((previous) => ({ ...previous, [reference.id]: true }));

    window.setTimeout(() => {
      setLoadingById((previous) => ({ ...previous, [reference.id]: false }));
      setFileModeById((previous) => ({ ...previous, [reference.id]: "full" }));
    }, 220);
  };

  return (
    <aside className="source-workbench-scrollbar relative hidden h-full w-[min(32rem,36vw)] min-w-[24rem] shrink-0 overflow-y-auto border-l border-slate-200/50 bg-transparent p-8 scroll-smooth xl:block dark:border-cyan-800/30">
      {floatingFeedback ? (
        <div className="relative z-20 mb-8">
          <div
            className={cn(
              "rounded-2xl border p-5",
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
                    feedbackToneClasses[floatingFeedback.feedback.level].badge,
                  )}
                >
                  {floatingFeedback.feedback.label} · {floatingFeedback.feedback.score}
                </span>
              </div>

              <button
                type="button"
                onClick={onDismissFeedback}
                className="text-xs text-slate-400 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                [ x ]
              </button>
            </div>

            <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
              <div>
                <p className={cn("mb-2 font-medium", feedbackToneClasses[floatingFeedback.feedback.level].accent)}>
                  👍 What landed well:
                </p>
                <ul className="space-y-1">
                  {floatingFeedback.feedback.correctPoints.map((point) => (
                    <li key={point}>- {point}</li>
                  ))}
                </ul>
              </div>

              {floatingFeedback.feedback.vaguePoints.length ? (
                <div>
                  <p className="mb-2 font-medium text-slate-500 dark:text-slate-400">
                    ⚠️ What feels unclear:
                  </p>
                  <ul className="space-y-1">
                    {floatingFeedback.feedback.vaguePoints.map((point) => (
                      <li key={point}>- {point}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {floatingFeedback.feedback.missingPoints.length ? (
                <div>
                  <p className="mb-2 font-medium text-slate-500 dark:text-slate-400">
                    ❌ What's still missing:
                  </p>
                  <ul className="space-y-1">
                    {floatingFeedback.feedback.missingPoints.map((point) => (
                      <li key={point}>- {point}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div>
                <p className="mb-2 font-medium text-cyan-600 dark:text-cyan-400">
                  💡 A good next step:
                </p>
                <p>{floatingFeedback.feedback.nextSuggestion}</p>
              </div>
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

            return (
              <div
                key={`${kind}-${reference.id}`}
                ref={(element) => {
                  itemRefs.current[reference.id] = element;
                }}
                className={cn(
                  "relative isolate overflow-hidden rounded-2xl border p-4 transition-all duration-200",
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
                              "group relative flex w-full items-start gap-3 border-l-[2px] pl-3 text-left transition-all duration-200",
                              isFullFile
                                ? "cursor-pointer border-transparent hover:border-cyan-500/35"
                                : "cursor-pointer",
                              isHighlighted
                                ? "border-cyan-500 bg-gradient-to-r from-cyan-500/[0.055] via-cyan-500/[0.022] to-transparent text-cyan-700 shadow-[-4px_0_12px_rgba(6,182,212,0.08)] dark:border-cyan-400 dark:from-cyan-400/[0.08] dark:via-cyan-400/[0.018] dark:text-cyan-400"
                                : "border-transparent",
                              isFlashing &&
                                "bg-cyan-500/[0.08] dark:bg-cyan-400/[0.1]",
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
                    className="text-xs text-slate-400 transition-colors hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400"
                  >
                    {isFullFile ? "📄 Show snippet" : "📂 View full file"}
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
