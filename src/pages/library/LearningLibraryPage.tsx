import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  loadLearningModules,
  upsertLearningModule,
  type LearningModuleRecord,
} from "@/features/topic-session/module-storage";
import { cn } from "@/lib/utils";

const pendingStartSourceStorageKey = "echowhy:start-pending-source";

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

function loadParentModules() {
  return loadLearningModules().filter((module) => !module.parentModuleId);
}

function getSourceFiles(module: LearningModuleRecord) {
  if (module.sourceFiles?.length) {
    return module.sourceFiles;
  }

  return module.sourceLabel ? [module.sourceLabel] : [];
}

function createStartSourcePayload(module: LearningModuleRecord) {
  return {
    id: `module-${module.id}`,
    label: module.title,
    caption: module.sourceLabel
      ? `Learning module - ${module.sourceLabel}`
      : "Learning module",
    kind: module.kind === "conceptual" ? "conceptual" : "project",
    moduleTopicId: module.id,
    sourceId: module.sourceId,
    sourceLabel: module.sourceLabel,
    sourceFiles: module.sourceFiles,
    children: module.children,
  };
}

export function LearningLibraryPage() {
  const navigate = useNavigate();
  const [modules, setModules] = useState<LearningModuleRecord[]>([]);
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [hoveredSourceId, setHoveredSourceId] = useState<string | null>(null);

  useEffect(() => {
    setModules(loadParentModules());
  }, []);

  const refreshModules = () => {
    setModules(loadParentModules());
  };

  const startEditingTitle = (module: LearningModuleRecord) => {
    setEditingModuleId(module.id);
    setDraftTitle(module.title);
  };

  const commitTitle = (module: LearningModuleRecord) => {
    const nextTitle = draftTitle.trim();

    if (!nextTitle || nextTitle === module.title) {
      setEditingModuleId(null);
      return;
    }

    upsertLearningModule({
      ...module,
      title: nextTitle,
    });
    setEditingModuleId(null);
    refreshModules();
  };

  const bindSourceToStart = (module: LearningModuleRecord) => {
    try {
      window.localStorage.setItem(
        pendingStartSourceStorageKey,
        JSON.stringify(createStartSourcePayload(module)),
      );
    } catch {
      // Navigating still keeps the user moving even if persistence is blocked.
    }

    void navigate({ to: "/" });
  };

  return (
    <section className="fixed inset-x-0 bottom-0 top-20 overflow-y-auto px-6 pb-16 pt-10 text-slate-800 dark:text-slate-100 sm:px-10 sm:pt-12">
      <div className="mx-auto w-full max-w-5xl">
        <p className="text-[10px] uppercase tracking-[0.32em] text-slate-500 dark:text-slate-400">
          Learning Library
        </p>
        <div className="mt-4 max-w-3xl">
          <h2 className="text-3xl font-light tracking-tight text-slate-900 dark:text-white/90">
            Your source-born learning modules
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500 dark:text-slate-400">
            Every question started from Start becomes an independent parent
            module here, with its own source, progress, answers, and pinned
            references.
          </p>
        </div>

        {modules.length ? (
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {modules.map((module) => {
              const sourceFiles = getSourceFiles(module);
              const sourceLabel = module.sourceLabel ?? "Conceptual source";
              const isEditing = editingModuleId === module.id;

              return (
                <article
                  key={module.id}
                  className={cn(
                    "group border p-5 text-left backdrop-blur-xl transition-colors",
                    "border-slate-200/70 bg-white/18 hover:border-cyan-400/50 hover:bg-white/24",
                    "dark:border-white/[0.055] dark:bg-slate-950/16 dark:hover:border-cyan-400/28 dark:hover:bg-slate-900/24",
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      {isEditing ? (
                        <input
                          value={draftTitle}
                          autoFocus
                          onChange={(event) => setDraftTitle(event.target.value)}
                          onBlur={() => commitTitle(module)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              commitTitle(module);
                            }

                            if (event.key === "Escape") {
                              setEditingModuleId(null);
                            }
                          }}
                          className="w-full border border-cyan-500/35 bg-white/20 px-2 py-1 text-base font-medium text-slate-900 outline-none backdrop-blur-md transition-colors [text-shadow:0_0_10px_#f8fafc] focus:border-cyan-500/70 dark:border-cyan-400/30 dark:bg-slate-950/22 dark:text-slate-100 dark:[text-shadow:0_0_12px_#0a0f1a]"
                        />
                      ) : (
                        <button
                          type="button"
                          onDoubleClick={() => startEditingTitle(module)}
                          title="Double click to rename"
                          className="block w-full truncate bg-transparent text-left text-base font-medium text-slate-900 transition-colors hover:text-cyan-700 dark:text-slate-100 dark:hover:text-cyan-300"
                        >
                          {module.title}
                        </button>
                      )}

                      <div
                        className="relative mt-2 inline-flex max-w-full"
                        onMouseEnter={() => setHoveredSourceId(module.id)}
                        onMouseLeave={() => setHoveredSourceId(null)}
                      >
                        <button
                          type="button"
                          onClick={() => bindSourceToStart(module)}
                          className="max-w-full truncate text-xs leading-5 text-slate-500 transition-colors hover:text-cyan-700 dark:text-slate-400 dark:hover:text-cyan-300"
                        >
                          {sourceLabel}
                        </button>

                        {sourceFiles.length > 0 && hoveredSourceId === module.id ? (
                          <div className="absolute left-full top-1/2 z-50 ml-4 min-w-64 -translate-y-1/2 border border-slate-200/60 bg-white/36 p-3 text-left text-[11px] leading-5 text-slate-600 shadow-[0_16px_52px_-44px_rgba(15,23,42,0.45)] backdrop-blur-xl dark:border-white/[0.055] dark:bg-slate-950/40 dark:text-slate-300">
                            <p className="mb-2 text-[9px] uppercase tracking-[0.24em] text-cyan-600/80 dark:text-cyan-400/80">
                              Source files
                            </p>
                            <div className="space-y-1">
                              {sourceFiles.slice(0, 6).map((sourceFile) => (
                                <p key={sourceFile} className="truncate">
                                  {sourceFile}
                                </p>
                              ))}
                              {sourceFiles.length > 6 ? (
                                <p className="text-slate-500">
                                  + {sourceFiles.length - 6} more
                                </p>
                              ) : null}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => bindSourceToStart(module)}
                      className="shrink-0 text-[10px] uppercase tracking-[0.2em] text-cyan-600/80 transition-colors hover:text-cyan-700 dark:text-cyan-400/80 dark:hover:text-cyan-300"
                    >
                      Source
                    </button>
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
                    <button
                      type="button"
                      onClick={() =>
                        void navigate({
                          to: "/topic/$id",
                          params: { id: module.id },
                        })
                      }
                      className="transition-colors hover:text-cyan-600 dark:hover:text-cyan-400"
                    >
                      Open
                    </button>
                  </div>
                </article>
              );
            })}
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
