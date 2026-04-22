import type { DragEventHandler, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ReadingLine } from "./reading-line";

type LearningInsertSlotProps = {
  targetId: string;
  isActive: boolean;
  isComposing: boolean;
  isDark: boolean;
  useLightShield: boolean;
  insertQuestionDraft: string;
  onDragOver: DragEventHandler<HTMLDivElement>;
  onDrop: DragEventHandler<HTMLDivElement>;
  onDraftChange: (nextValue: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  onCancel: () => void;
  onSubmit: () => void;
  children: ReactNode;
};

export function LearningInsertSlot({
  targetId,
  isActive,
  isComposing,
  isDark,
  useLightShield,
  insertQuestionDraft,
  onDragOver,
  onDrop,
  onDraftChange,
  onFocus,
  onBlur,
  onCancel,
  onSubmit,
  children,
}: LearningInsertSlotProps) {
  const shellClass = cn(
    "overflow-hidden bg-transparent transition-all duration-200",
    isDark ? "bg-cyan-500/[0.02]" : "bg-cyan-500/[0.03]",
  );
  const titleClass = cn(
    "text-[10px] font-mono uppercase tracking-[0.24em]",
    isDark ? "text-cyan-400" : "text-cyan-700",
  );
  const textareaClass = cn(
    "w-full min-h-[2.15rem] resize-none border-b bg-transparent pb-1 leading-7 transition-colors [field-sizing:content] placeholder:italic focus:outline-none focus:ring-0",
    isDark
      ? "border-cyan-800/50 text-slate-200 placeholder:text-slate-400 focus:border-cyan-400"
      : "border-cyan-200 text-slate-800 placeholder:text-slate-400 focus:border-cyan-500",
  );
  const secondaryActionClass = cn(
    "text-[11px] font-mono uppercase tracking-[0.16em] transition-colors",
    isDark
      ? "text-slate-500 hover:text-cyan-400"
      : "text-slate-400 hover:text-cyan-700",
  );
  const primaryActionClass = cn(
    "border border-transparent px-0 py-0 text-[11px] font-mono uppercase tracking-[0.16em] transition-colors",
    isDark
      ? "text-cyan-400 hover:text-cyan-300"
      : "text-cyan-700 hover:text-cyan-600",
  );

  return (
    <>
      <div className="relative h-0">
        <div
          data-insert-target-id={targetId}
          className={cn(
            "absolute inset-x-0 top-1/2 z-20 -translate-y-1/2",
            isActive || isComposing ? "h-6" : "h-4",
          )}
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          <div
            className={cn(
              "pointer-events-none absolute left-0 right-0 top-1/2 z-10 -translate-y-1/2 transition-all duration-200",
              isActive
                ? "h-[2px] bg-cyan-300/95 shadow-[0_0_18px_rgba(34,211,238,0.38)]"
                : "h-px bg-transparent",
            )}
          />
        </div>
      </div>

      {isComposing ? (
        <form
          className={shellClass}
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          <div className="border-l-[3px] border-cyan-500 pl-4 py-1.5 dark:border-cyan-400">
            <div className="mb-1.5 flex items-center justify-between gap-4">
              <p className={titleClass}>
                <ReadingLine shield={useLightShield}>My question</ReadingLine>
              </p>
            </div>
            <textarea
              autoFocus
              rows={1}
              value={insertQuestionDraft}
              onChange={(event) => onDraftChange(event.target.value)}
              onFocus={onFocus}
              onBlur={onBlur}
              placeholder="Drop one sharp why here..."
              className={textareaClass}
            />
            <div className="mt-1.5 flex items-center justify-end gap-6">
              <button type="button" onClick={onCancel} className={secondaryActionClass}>
                [ cancel ]
              </button>
              <button type="submit" className={primaryActionClass}>
                [ insert ]
              </button>
            </div>
          </div>
        </form>
      ) : null}

      {children}
    </>
  );
}
