import { cn } from "@/lib/utils";

type SourceWorkbenchHeaderProps = {
  isDark: boolean;
  displayedReferenceCount: number;
  pinnedReferenceCount: number;
  onClearAllSources: () => void;
};

export function SourceWorkbenchHeader({
  isDark,
  displayedReferenceCount,
  pinnedReferenceCount,
  onClearAllSources,
}: SourceWorkbenchHeaderProps) {
  return (
    <div
      className={cn(
        "mb-6 flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400 dark:text-slate-400",
        !isDark && "text-halo-light",
      )}
    >
      <span>Source Workbench</span>
      <div className="flex items-center gap-3">
        {pinnedReferenceCount ? (
          <button
            type="button"
            onClick={onClearAllSources}
            className="text-[10px] uppercase tracking-[0.2em] text-slate-400 transition-colors hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400"
          >
            [ Clear All ]
          </button>
        ) : null}
        <span className="text-slate-400">{displayedReferenceCount}</span>
      </div>
    </div>
  );
}
