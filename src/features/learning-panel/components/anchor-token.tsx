import { cn } from "@/lib/utils";

type AnchorTokenProps = {
  children: string;
  referenceId: string;
  isActive: boolean;
  isDark: boolean;
  onPreviewReference: (referenceId: string) => void;
  onClearPreviewReference: () => void;
  onPinSource: (referenceId: string) => void;
};

export function AnchorToken({
  children,
  referenceId,
  isActive,
  isDark,
  onPreviewReference,
  onClearPreviewReference,
  onPinSource,
}: AnchorTokenProps) {
  return (
    <button
      type="button"
      onMouseEnter={() => onPreviewReference(referenceId)}
      onMouseLeave={onClearPreviewReference}
      onClick={() => onPinSource(referenceId)}
      className={cn(
        "inline-block rounded-sm border-b px-1 font-mono transition-all",
        !isDark && "text-halo-light",
        isActive
          ? "border-cyan-500 bg-cyan-500/5 text-cyan-700 dark:border-cyan-400 dark:bg-cyan-400/8 dark:text-cyan-400"
          : "border-dashed border-cyan-500/60 text-cyan-700 hover:border-solid hover:bg-cyan-500/8 dark:border-cyan-400/70 dark:text-cyan-400",
      )}
    >
      {children}
    </button>
  );
}
