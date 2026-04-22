import { cn } from "@/lib/utils";

type LibraryCardMenuProps = {
  open: boolean;
  onRename: () => void;
  onDelete: () => void;
};

export function LibraryCardMenu({
  open,
  onRename,
  onDelete,
}: LibraryCardMenuProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      onClick={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
      className={cn(
        "absolute right-0 top-7 z-20 min-w-32 border border-slate-200/70 bg-white/92 p-1.5 shadow-[0_24px_70px_-48px_rgba(15,23,42,0.35)] backdrop-blur-md",
        "dark:border-white/[0.08] dark:bg-slate-950/92 dark:shadow-[0_24px_70px_-48px_rgba(8,47,73,0.42)]",
      )}
    >
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onRename();
        }}
        className="block w-full px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-white/[0.04] dark:hover:text-slate-50"
      >
        Rename
      </button>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onDelete();
        }}
        className="mt-1 block w-full px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-rose-50/90 hover:text-rose-700 dark:text-slate-200 dark:hover:bg-rose-400/10 dark:hover:text-rose-300"
      >
        Delete
      </button>
    </div>
  );
}
