import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  loadLearningModules,
  type LearningModuleRecord,
} from "@/features/topic-session/module-storage";
import { cn } from "@/lib/utils";

function formatModuleDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "recently";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function LearningLibraryPage() {
  const navigate = useNavigate();
  const [modules, setModules] = useState<LearningModuleRecord[]>([]);

  useEffect(() => {
    setModules(loadLearningModules());
  }, []);

  return (
    <section className="min-h-[calc(100vh-5rem)] px-6 pb-16 pt-12 text-slate-800 dark:text-slate-100 sm:px-10">
      <div className="mx-auto w-full max-w-5xl">
        <p className="text-[10px] uppercase tracking-[0.32em] text-slate-500 dark:text-slate-400">
          Learning Library
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-light tracking-tight text-slate-900 dark:text-white/90">
              Your source-born learning modules
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500 dark:text-slate-400">
              Every question started from Start becomes an independent parent
              module here, with its own source, progress, answers, and pinned
              references.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void navigate({ to: "/" })}
            className="self-start rounded-full border border-slate-300/70 px-4 py-2 text-xs uppercase tracking-[0.22em] text-slate-500 transition-colors hover:text-slate-900 dark:border-white/12 dark:text-slate-400 dark:hover:text-slate-100 sm:self-auto"
          >
            Start new
          </button>
        </div>

        {modules.length ? (
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {modules.map((module) => (
              <button
                key={module.id}
                type="button"
                onClick={() =>
                  void navigate({
                    to: "/topic/$id",
                    params: { id: module.id },
                  })
                }
                className={cn(
                  "group border p-5 text-left backdrop-blur-xl transition-colors",
                  "border-slate-200/70 bg-white/18 hover:border-cyan-400/50 hover:bg-white/24",
                  "dark:border-white/[0.055] dark:bg-slate-950/16 dark:hover:border-cyan-400/28 dark:hover:bg-slate-900/24",
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-base font-medium text-slate-900 dark:text-slate-100">
                      {module.title}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                      {module.sourceLabel ?? "Conceptual source"}
                    </p>
                  </div>
                  <span className="shrink-0 text-[10px] uppercase tracking-[0.2em] text-cyan-600/80 dark:text-cyan-400/80">
                    {module.kind === "source-backed" ? "source" : "search"}
                  </span>
                </div>

                {module.seedQuestion ? (
                  <p className="mt-5 line-clamp-2 text-sm italic leading-6 text-slate-600 dark:text-slate-300/90">
                    {module.seedQuestion}
                  </p>
                ) : (
                  <p className="mt-5 text-sm leading-6 text-slate-500 dark:text-slate-500">
                    This module was created from a source first. My Own Why is
                    still empty.
                  </p>
                )}

                <div className="mt-5 flex items-center justify-between border-t border-slate-200/60 pt-4 text-[10px] uppercase tracking-[0.2em] text-slate-400 dark:border-white/[0.055] dark:text-slate-500">
                  <span>{formatModuleDate(module.updatedAt)}</span>
                  <span className="transition-colors group-hover:text-cyan-600 dark:group-hover:text-cyan-400">
                    Open
                  </span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-10 border border-dashed border-slate-300/70 bg-white/12 p-8 text-sm leading-7 text-slate-500 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/12 dark:text-slate-400">
            No parent modules yet. Start with a question or attach a source, and
            Echowhy will create the first one.
          </div>
        )}
      </div>
    </section>
  );
}
