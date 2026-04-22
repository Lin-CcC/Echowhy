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
      className={cn(
        "absolute right-0 top-8 z-20 min-w-40 rounded-[20px] border border-slate-200/70 bg-white/80 p-2 shadow-[0_24px_70px_-48px_rgba(15,23,42,0.52)] backdrop-blur-xl",
        "dark:border-white/[0.06] dark:bg-slate-950/78 dark:shadow-[0_24px_70px_-48px_rgba(8,47,73,0.55)]",
      )}
    >
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onRename();
        }}
        className="block w-full rounded-2xl px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-cyan-50 hover:text-cyan-700 dark:text-slate-200 dark:hover:bg-cyan-400/10 dark:hover:text-cyan-300"
      >
        Rename
      </button>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onDelete();
        }}
        className="mt-1 block w-full rounded-2xl px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-rose-50 hover:text-rose-700 dark:text-slate-200 dark:hover:bg-rose-400/10 dark:hover:text-rose-300"
      >
        Delete
      </button>
    </div>
  );
}
