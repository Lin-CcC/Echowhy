import { useEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";
import type { TopicSourceReference } from "@/features/topic-session";

type SourceReferencePanelProps = {
  references: TopicSourceReference[];
  pinnedReferenceIds: string[];
  previewReferenceId: string | null;
  onUnpinSource: (referenceId: string) => void;
};

const activeLineMatchers: Record<string, RegExp> = {
  "ref-auth-controller": /authService\.login/,
  "ref-auth-service": /InvalidCredentialsException|jwtService\.generateToken/,
  "ref-jwt-service": /subject\(|claim\("userId"|claim\("nickname"/,
};

export function SourceReferencePanel({
  references,
  pinnedReferenceIds,
  previewReferenceId,
  onUnpinSource,
}: SourceReferencePanelProps) {
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

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

  return (
    <aside className="relative hidden h-full w-[min(32rem,36vw)] min-w-[24rem] shrink-0 overflow-y-auto border-l border-slate-200/50 bg-transparent p-8 scroll-smooth xl:block dark:border-slate-800/50">
      <p className="mb-6 flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600">
        <span>Source Workbench</span>
        <span className="text-slate-400/70">{displayedReferences.length}</span>
      </p>

      {displayedReferences.length ? (
        <div className="space-y-6">
          {displayedReferences.map(({ reference, kind }) => {
            const lineMatcher = activeLineMatchers[reference.id];

            return (
              <div
                key={`${kind}-${reference.id}`}
                ref={(element) => {
                  itemRefs.current[reference.id] = element;
                }}
                className={cn(
                  "rounded-2xl border p-4 transition-all duration-200",
                  kind === "preview"
                    ? "border-cyan-200/50 bg-cyan-50/20 opacity-80 dark:border-cyan-800/30 dark:bg-cyan-950/12"
                    : "border-slate-200/60 bg-white/20 dark:border-slate-800/60 dark:bg-slate-900/16",
                )}
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="space-y-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                    <p>{reference.label}</p>
                    <p className="break-all text-slate-500">
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
                      className="shrink-0 text-xs text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      [ ✕ ]
                    </button>
                  ) : (
                    <span className="shrink-0 text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-500/80">
                      [ Preview ]
                    </span>
                  )}
                </div>

                <div className="font-mono text-[12px] leading-loose text-slate-500 dark:text-slate-500">
                  {reference.snippet.split("\n").map((line, index) => {
                    const highlighted = lineMatcher?.test(line) ?? false;

                    return (
                      <p
                        key={`${reference.id}-${index}`}
                        className={cn(
                          "relative inline-block w-full border-l-[2px] pl-4 transition-all duration-200",
                          highlighted
                            ? "border-cyan-500 bg-cyan-500/5 text-cyan-700 shadow-[-4px_0_12px_rgba(6,182,212,0.08)] dark:border-cyan-400 dark:bg-cyan-400/8 dark:text-cyan-300"
                            : "border-transparent",
                        )}
                      >
                        {line}
                      </p>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200/70 bg-white/10 p-5 text-sm italic text-slate-400 dark:border-slate-800/70 dark:bg-slate-900/10 dark:text-slate-500">
          Hover a code identifier to preview it here, or click to pin multiple
          sources side by side.
        </div>
      )}
    </aside>
  );
}
