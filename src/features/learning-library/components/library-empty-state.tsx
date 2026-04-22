import { Button } from "@/components/ui/button";

type LibraryEmptyStateProps = {
  hasQuery: boolean;
  onGoToStart: () => void;
};

export function LibraryEmptyState({
  hasQuery,
  onGoToStart,
}: LibraryEmptyStateProps) {
  return (
    <div className="mt-12 border-t border-slate-200/70 px-0 py-12 text-left dark:border-white/[0.08]">
      <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
        Learning Library
      </p>
      <h3 className="mt-4 text-3xl font-light tracking-tight text-slate-900 dark:text-white/90">
        {hasQuery ? "No modules match this search yet" : "No learning modules yet"}
      </h3>
      <p className="mt-4 max-w-xl text-sm leading-8 text-slate-500 dark:text-slate-400">
        {hasQuery
          ? "Try another keyword, or go back to Start and create a new learning path from a source or a fresh why-question."
          : "Go to Start and attach your first source or ask your first why-question. Echowhy will grow the library from there."}
      </p>
      <div className="mt-8">
        <Button
          onClick={onGoToStart}
          className="rounded-none bg-transparent px-0 text-cyan-700 shadow-none hover:bg-transparent hover:text-cyan-800 dark:text-cyan-300 dark:hover:bg-transparent dark:hover:text-cyan-200"
        >
          Go to Start
        </Button>
      </div>
    </div>
  );
}
