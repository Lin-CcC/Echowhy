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
    <div className="mt-10 rounded-[32px] border border-dashed border-slate-300/70 bg-white/14 px-8 py-12 text-center backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/14">
      <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
        Learning Library
      </p>
      <h3 className="mt-4 text-2xl font-light tracking-tight text-slate-900 dark:text-white/90">
        {hasQuery ? "No modules match this search yet" : "No learning modules yet"}
      </h3>
      <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-500 dark:text-slate-400">
        {hasQuery
          ? "Try another keyword, or go back to Start and create a new learning path from a source or a fresh why-question."
          : "Go to Start and attach your first source or ask your first why-question. Echowhy will grow the library from there."}
      </p>
      <div className="mt-8">
        <Button onClick={onGoToStart} className="rounded-full px-5">
          Go to Start
        </Button>
      </div>
    </div>
  );
}
