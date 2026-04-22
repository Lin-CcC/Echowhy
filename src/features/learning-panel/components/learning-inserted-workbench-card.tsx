import { cn } from "@/lib/utils";
import { ReadingLine } from "./reading-line";

type InsertedWorkbenchBlockLike = {
  id: string;
  kind: "feedback" | "source";
  title: string;
  subtitle?: string;
  body?: string;
  code?: string;
  meta?: string;
};

type LearningInsertedWorkbenchCardVisual = {
  shell: string;
  accent: string;
  label: string;
  title: string;
  body: string;
  meta: string;
  code?: string;
};

type LearningInsertedWorkbenchCardProps = {
  block: InsertedWorkbenchBlockLike;
  visual: LearningInsertedWorkbenchCardVisual;
  useLightShield: boolean;
  onRemove: () => void;
};

export function LearningInsertedWorkbenchCard({
  block,
  visual,
  useLightShield,
  onRemove,
}: LearningInsertedWorkbenchCardProps) {
  return (
    <article data-insert-disabled="true" className={cn("w-full max-w-full", visual.shell)}>
      <div className={cn("border-l-[3px] pl-5 py-0.5", visual.accent)}>
        <div className="mb-1 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p
              className={cn(
                "mb-0.5 text-[10px] font-mono uppercase tracking-[0.22em]",
                visual.label,
              )}
            >
              <ReadingLine shield={useLightShield}>
                {block.kind === "source" ? "Source ref" : "AI feedback"}
              </ReadingLine>
            </p>
            <h4 className={cn("break-words text-sm font-medium", visual.title)}>
              <ReadingLine shield={useLightShield}>{block.title}</ReadingLine>
            </h4>
            {block.subtitle ? (
              <p className={cn("mt-0.5 break-all text-xs", visual.meta)}>
                <ReadingLine shield={useLightShield}>{block.subtitle}</ReadingLine>
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="shrink-0 font-mono text-[10px] tracking-[0.16em] text-slate-400 transition-colors hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-300"
            aria-label="Remove inserted content"
          >
            [x]
          </button>
        </div>

        {block.body ? (
          <p className={cn("whitespace-pre-wrap break-words text-sm leading-relaxed", visual.body)}>
            <ReadingLine shield={useLightShield}>{block.body}</ReadingLine>
          </p>
        ) : null}

        {block.code ? (
          <pre
            className={cn(
              "source-workbench-scrollbar mt-1 max-h-72 w-full overflow-auto border-l-[2px] pl-4 py-1 text-[12px] leading-relaxed",
              visual.code,
            )}
          >
            <code className="whitespace-pre-wrap break-words">{block.code}</code>
          </pre>
        ) : null}

        {block.meta ? (
          <p className={cn("mt-1 text-[10px] font-mono uppercase tracking-[0.16em]", visual.meta)}>
            <ReadingLine shield={useLightShield}>{block.meta}</ReadingLine>
          </p>
        ) : null}
      </div>
    </article>
  );
}
