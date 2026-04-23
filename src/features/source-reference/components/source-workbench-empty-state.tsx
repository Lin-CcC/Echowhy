import { cn } from "@/lib/utils";

type SourceWorkbenchEmptyStateProps = {
  isDark: boolean;
};

export function SourceWorkbenchEmptyState({
  isDark,
}: SourceWorkbenchEmptyStateProps) {
  return (
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
  );
}
