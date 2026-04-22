import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  DeleteModuleDialog,
  LibraryCard,
  LibraryEmptyState,
  LibraryToolbar,
  buildLibraryCardModel,
  filterAndSortLibraryCardModels,
  getCompletedChildIds,
  type LibrarySortBy,
} from "@/features/learning-library";
import {
  deleteLearningModule,
  loadLearningModules,
  upsertLearningModule,
  type LearningModuleRecord,
} from "@/features/topic-session";

const pendingStartSourceStorageKey = "echowhy:start-pending-source";

function loadParentModules() {
  return loadLearningModules().filter((module) => !module.parentModuleId);
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
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<LibrarySortBy>("recently-opened");
  const [openMenuModuleId, setOpenMenuModuleId] = useState<string | null>(null);
  const [pendingDeleteModuleId, setPendingDeleteModuleId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    setModules(loadParentModules());
  }, []);

  useEffect(() => {
    function handleWindowPointerDown() {
      setOpenMenuModuleId(null);
    }

    function handleWindowKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenMenuModuleId(null);
      }
    }

    window.addEventListener("pointerdown", handleWindowPointerDown);
    window.addEventListener("keydown", handleWindowKeyDown);

    return () => {
      window.removeEventListener("pointerdown", handleWindowPointerDown);
      window.removeEventListener("keydown", handleWindowKeyDown);
    };
  }, []);

  function refreshModules() {
    setModules(loadParentModules());
  }

  function startEditingTitle(module: LearningModuleRecord) {
    setEditingModuleId(module.id);
    setDraftTitle(module.title);
    setOpenMenuModuleId(null);
  }

  function cancelEditingTitle() {
    setEditingModuleId(null);
    setDraftTitle("");
  }

  function commitTitle(module: LearningModuleRecord) {
    const nextTitle = draftTitle.trim();

    if (!nextTitle) {
      cancelEditingTitle();
      return;
    }

    if (nextTitle !== module.title) {
      upsertLearningModule({
        ...module,
        title: nextTitle,
      });
      refreshModules();
    }

    cancelEditingTitle();
  }

  function bindSourceToStart(module: LearningModuleRecord) {
    try {
      window.localStorage.setItem(
        pendingStartSourceStorageKey,
        JSON.stringify(createStartSourcePayload(module)),
      );
    } catch {
      // Navigating still keeps the user moving even if persistence is blocked.
    }

    void navigate({ to: "/" });
  }

  function openModule(moduleId: string) {
    void navigate({
      to: "/topic/$id",
      params: { id: moduleId },
    });
  }

  function requestDeleteModule(moduleId: string) {
    setPendingDeleteModuleId(moduleId);
    setOpenMenuModuleId(null);
  }

  function confirmDeleteModule() {
    if (!pendingDeleteModuleId) {
      return;
    }

    deleteLearningModule(pendingDeleteModuleId);
    setPendingDeleteModuleId(null);
    setEditingModuleId((current) =>
      current === pendingDeleteModuleId ? null : current,
    );
    refreshModules();
  }

  const cards = useMemo(() => {
    return modules.map((module) =>
      buildLibraryCardModel(module, {
        completedChildIds: getCompletedChildIds(module),
      }),
    );
  }, [modules]);

  const visibleCards = useMemo(
    () => filterAndSortLibraryCardModels(cards, { query, sortBy }),
    [cards, query, sortBy],
  );

  const visibleModulesById = useMemo(
    () =>
      new Map(
        modules.map((module) => [module.id, module] satisfies [string, LearningModuleRecord]),
      ),
    [modules],
  );

  const pendingDeleteModule = pendingDeleteModuleId
    ? visibleModulesById.get(pendingDeleteModuleId) ??
      modules.find((module) => module.id === pendingDeleteModuleId) ??
      null
    : null;

  return (
    <section className="fixed inset-x-0 bottom-0 top-20 overflow-y-auto px-6 pb-24 pt-12 text-slate-800 dark:text-slate-100 sm:px-10 sm:pt-14">
      <div className="mx-auto w-full max-w-4xl">
        <p className="text-[10px] uppercase tracking-[0.32em] text-slate-500 dark:text-slate-400">
          Learning Library
        </p>
        <div className="mt-5 max-w-2xl">
          <h2 className="text-[40px] font-light leading-[1.08] tracking-tight text-slate-900 dark:text-white/90">
            Your source-born learning modules
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-8 text-slate-500 dark:text-slate-400">
            Reopen a thread, continue from the same source, or ask a sharper why
            from the same foundation. The page should feel closer to an index of
            living questions than a wall of components.
          </p>
        </div>

        <LibraryToolbar
          query={query}
          sortBy={sortBy}
          onQueryChange={setQuery}
          onSortByChange={setSortBy}
        />

        {visibleCards.length ? (
          <div className="mt-5 grid gap-0">
            {visibleCards.map((card) => {
              const module = visibleModulesById.get(card.id);

              if (!module) {
                return null;
              }

              return (
                <LibraryCard
                  key={card.id}
                  card={card}
                  isEditing={editingModuleId === module.id}
                  isMenuOpen={openMenuModuleId === module.id}
                  draftTitle={editingModuleId === module.id ? draftTitle : module.title}
                  onOpen={() => openModule(module.id)}
                  onAskNew={() => bindSourceToStart(module)}
                  onToggleMenu={() =>
                    setOpenMenuModuleId((current) =>
                      current === module.id ? null : module.id,
                    )
                  }
                  onStartEditing={() => startEditingTitle(module)}
                  onDelete={() => requestDeleteModule(module.id)}
                  onDraftTitleChange={setDraftTitle}
                  onCommitTitle={() => commitTitle(module)}
                  onCancelEditing={cancelEditingTitle}
                />
              );
            })}
          </div>
        ) : (
          <LibraryEmptyState
            hasQuery={Boolean(query.trim())}
            onGoToStart={() => void navigate({ to: "/" })}
          />
        )}
      </div>

      <DeleteModuleDialog
        open={Boolean(pendingDeleteModule)}
        title={pendingDeleteModule?.title ?? "this module"}
        onCancel={() => setPendingDeleteModuleId(null)}
        onConfirm={confirmDeleteModule}
      />
    </section>
  );
}
