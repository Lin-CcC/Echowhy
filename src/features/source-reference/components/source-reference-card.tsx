import type { DragEvent } from "react";
import { cn } from "@/lib/utils";
import type { TopicSourceReference } from "@/features/topic-session";
import { getSourceReferenceModeCopy } from "../utils";

export type SourceTone = {
  shell: string;
  border: string;
  label: string;
  title: string;
  meta: string;
  code: string;
};

type SourceReferenceCardProps = {
  reference: TopicSourceReference;
  kind: "pinned" | "preview";
  isDark: boolean;
  tone: SourceTone;
  isFullFile: boolean;
  isLoading: boolean;
  isFlashing: boolean;
  sourceDropPosition: "before" | "after" | null;
  isCompressed: boolean;
  onDragStart: (event: DragEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
  onDragOver: (event: DragEvent<HTMLDivElement>) => void;
  onDragLeave: (event: DragEvent<HTMLDivElement>) => void;
  onDrop: (event: DragEvent<HTMLDivElement>) => void;
  onUnpinSource: (referenceId: string) => void;
  onExpandCompressed: () => void;
  onFocusBlock: (blockId: string, questionId?: string) => void;
  onToggleReferenceMode: (reference: TopicSourceReference) => void;
  setItemRef: (element: HTMLDivElement | null) => void;
  setScrollerRef: (element: HTMLDivElement | null) => void;
  setLineRef: (lineKey: string, element: HTMLButtonElement | null) => void;
};

function getSourceCardShellClass(
  tone: SourceTone,
  kind: "pinned" | "preview",
) {
  return cn(
    "relative isolate cursor-grab overflow-hidden rounded-2xl backdrop-blur-md transition-all duration-200 active:cursor-grabbing",
    tone.shell,
    tone.border,
    kind === "preview" && "opacity-90",
  );
}

export function SourceReferenceCard({
  reference,
  kind,
  isDark,
  tone,
  isFullFile,
  isLoading,
  isFlashing,
  sourceDropPosition,
  isCompressed,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  onUnpinSource,
  onExpandCompressed,
  onFocusBlock,
  onToggleReferenceMode,
  setItemRef,
  setScrollerRef,
  setLineRef,
}: SourceReferenceCardProps) {
  const modeCopy = getSourceReferenceModeCopy(isFullFile);
  const fileLines = (reference.fullContent ?? reference.snippet).split("\n");
  const snippetLines = reference.snippet.split("\n");
  const visibleLines = isFullFile ? fileLines : snippetLines;
  const lineNumberOffset = isFullFile ? 1 : (reference.startLine ?? 1);
  const compactSnippet =
    snippetLines.find((line) => line.trim())?.trim() ?? "Source snippet";

  if (isCompressed) {
    return (
      <div
        ref={setItemRef}
        draggable
        role="button"
        tabIndex={0}
        onClick={onExpandCompressed}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onExpandCompressed();
          }
        }}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={cn(
          getSourceCardShellClass(tone, kind),
          "p-3 outline-none focus-visible:ring-1 focus-visible:ring-cyan-400/45",
        )}
      >
        {sourceDropPosition ? (
          <div
            className={cn(
              "pointer-events-none absolute left-3 right-3 z-30 h-px bg-cyan-300/85 shadow-[0_0_14px_rgba(34,211,238,0.28)] transition-opacity",
              sourceDropPosition === "before" ? "top-0" : "bottom-0",
            )}
          />
        ) : null}

        <div className="relative z-10 flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <p
              className={cn(
                "text-[9px] font-mono uppercase tracking-[0.2em]",
                tone.label,
                !isDark && "text-halo-light",
              )}
            >
              Source ref
            </p>
            <p
              className={cn(
                "truncate text-sm font-medium",
                tone.title,
                !isDark && "text-halo-light",
              )}
            >
              {reference.label}
            </p>
            <p
              className={cn(
                "truncate text-[11px]",
                tone.meta,
                !isDark && "text-halo-light",
              )}
            >
              {reference.referencePath}
              {reference.startLine
                ? ` : ${reference.startLine}-${reference.endLine}`
                : ""}
            </p>
            <p
              className={cn(
                "truncate font-mono text-[11px]",
                isDark ? "text-slate-400" : "text-slate-500",
              )}
            >
              {compactSnippet}
            </p>
          </div>

          <div className="flex shrink-0 items-center">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onUnpinSource(reference.id);
              }}
              className="text-xs text-slate-400 transition-colors hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200"
            >
              [ x ]
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setItemRef}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={cn(getSourceCardShellClass(tone, kind), "p-4")}
    >
      {!isDark ? (
        <div
          className={cn(
            "pointer-events-none absolute inset-0 z-0 rounded-2xl",
            kind === "preview"
              ? "bg-[radial-gradient(ellipse_at_35%_20%,rgba(224,231,255,0.34)_0%,rgba(224,231,255,0.13)_36%,rgba(224,231,255,0.03)_72%,transparent_100%)]"
              : "bg-[radial-gradient(ellipse_at_35%_20%,rgba(238,242,255,0.44)_0%,rgba(238,242,255,0.16)_42%,rgba(238,242,255,0.035)_76%,transparent_100%)]",
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
        <div className="space-y-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          <p
            className={cn(
              "text-[10px] font-mono uppercase tracking-[0.22em]",
              tone.label,
              !isDark && "text-halo-light",
            )}
          >
            {kind === "preview" ? "Source preview" : "Source ref"}
          </p>
          <p className={cn(tone.title, !isDark && "text-halo-light")}>
            {reference.label}
          </p>
          <p
            className={cn(
              "break-all",
              tone.meta,
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
          <span
            className={cn(
              "shrink-0 text-[10px] font-mono uppercase tracking-[0.2em]",
              tone.label,
            )}
          >
            [ Preview ]
          </span>
        )}
      </div>

      <div
        ref={setScrollerRef}
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

              return (
                <button
                  key={`${reference.id}-${lineNumber}`}
                  ref={(element) =>
                    setLineRef(`${reference.id}-${lineNumber}`, element)
                  }
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
                      ? "border-indigo-600/24 bg-gradient-to-r from-indigo-500/[0.018] via-indigo-500/[0.006] to-transparent text-indigo-700 shadow-[-1px_0_6px_rgba(79,70,229,0.02)] dark:border-indigo-400/26 dark:from-indigo-400/[0.022] dark:via-indigo-400/[0.008] dark:text-indigo-300"
                      : "border-transparent",
                    isFlashing &&
                      isHighlighted &&
                      "bg-indigo-500/[0.05] dark:bg-indigo-400/[0.07]",
                  )}
                >
                  {isFullFile ? (
                    <span className="w-8 shrink-0 text-right text-slate-400 dark:text-slate-400">
                      {lineNumber}
                    </span>
                  ) : null}
                  <span className="min-w-0 flex-1 whitespace-pre-wrap">
                    {line || " "}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="relative z-10 mt-4">
        <button
          type="button"
          onClick={() => onToggleReferenceMode(reference)}
          className={cn(
            "text-[9px] uppercase tracking-[0.18em] text-slate-400 transition-colors dark:text-slate-500",
            isDark ? "hover:text-indigo-300" : "hover:text-indigo-700",
          )}
          aria-label={modeCopy.actionLabel}
          title={modeCopy.actionLabel}
        >
          [ {modeCopy.buttonLabel} ]
        </button>
      </div>
    </div>
  );
}
