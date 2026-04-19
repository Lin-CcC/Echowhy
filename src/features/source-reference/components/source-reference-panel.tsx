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
      <p className="text-halo-light dark:text-halo-dark mb-6 flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600">
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
                  "relative isolate overflow-hidden rounded-2xl border bg-white/[0.025] p-4 backdrop-blur-[2px] transition-all duration-200 dark:bg-[#050814]/18",
                  kind === "preview"
                    ? "border-cyan-200/42 opacity-90 shadow-[0_18px_52px_-42px_rgba(8,145,178,0.22)] dark:border-cyan-700/26"
                    : "border-slate-200/46 shadow-[0_18px_60px_-48px_rgba(15,23,42,0.24)] dark:border-slate-700/38 dark:shadow-[0_18px_60px_-46px_rgba(0,0,0,0.62)]",
                )}
              >
                <div
                  className={cn(
                    "pointer-events-none absolute inset-0 z-0 rounded-2xl",
                    kind === "preview"
                      ? "bg-[radial-gradient(ellipse_at_35%_20%,rgba(236,254,255,0.38)_0%,rgba(236,254,255,0.16)_36%,rgba(236,254,255,0.035)_72%,transparent_100%)] dark:bg-[radial-gradient(ellipse_at_35%_20%,rgba(8,47,73,0.28)_0%,rgba(8,47,73,0.12)_42%,transparent_100%)]"
                      : "bg-[radial-gradient(ellipse_at_35%_20%,rgba(248,250,252,0.5)_0%,rgba(248,250,252,0.18)_42%,rgba(248,250,252,0.04)_76%,transparent_100%)] dark:bg-[radial-gradient(ellipse_at_35%_20%,rgba(15,23,42,0.42)_0%,rgba(15,23,42,0.18)_44%,transparent_100%)]",
                  )}
                />

                <div className="relative z-10 mb-4 flex items-start justify-between gap-3">
                  <div className="space-y-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                    <p className="text-halo-light dark:text-halo-dark">
                      {reference.label}
                    </p>
                    <p className="text-halo-light break-all text-slate-500 dark:text-halo-dark dark:text-slate-500">
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
                      [ x ]
                    </button>
                  ) : (
                    <span className="shrink-0 text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-500/80">
                      [ Preview ]
                    </span>
                  )}
                </div>

                <div className="text-halo-light dark:text-halo-dark relative z-10 font-mono text-[12px] leading-loose text-slate-600 dark:text-slate-400">
                  {reference.snippet.split("\n").map((line, index) => {
                    const highlighted = lineMatcher?.test(line) ?? false;

                    return (
                      <p
                        key={`${reference.id}-${index}`}
                        className={cn(
                          "relative inline-block w-full whitespace-pre-wrap border-l-[2px] pl-4 transition-all duration-200",
                          highlighted
                            ? "border-cyan-500 bg-gradient-to-r from-cyan-500/[0.055] via-cyan-500/[0.022] to-transparent text-cyan-700 shadow-[-4px_0_12px_rgba(6,182,212,0.08)] dark:border-cyan-400 dark:from-cyan-400/[0.09] dark:via-cyan-400/[0.025] dark:text-cyan-300"
                            : "border-transparent",
                        )}
                      >
                        {line || " "}
                      </p>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200/60 bg-white/[0.06] p-5 text-sm italic text-slate-400 backdrop-blur-[2px] dark:border-slate-800/70 dark:bg-[#050814]/24 dark:text-slate-500">
          <span className="text-halo-light dark:text-halo-dark">
            Hover a code identifier to preview it here, or click to pin multiple
            sources side by side.
          </span>
        </div>
      )}
    </aside>
  );
}
