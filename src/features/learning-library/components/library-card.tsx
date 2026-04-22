import type {
  KeyboardEvent,
  MouseEvent,
  ChangeEvent,
  FocusEvent,
} from "react";
import { cn } from "@/lib/utils";
import type { LibraryCardModel } from "../types";
import { LibraryCardMenu } from "./library-card-menu";

type LibraryCardProps = {
  card: LibraryCardModel;
  isEditing: boolean;
  isMenuOpen: boolean;
  draftTitle: string;
  onOpen: () => void;
  onAskNew: () => void;
  onToggleMenu: () => void;
  onStartEditing: () => void;
  onDelete: () => void;
  onDraftTitleChange: (value: string) => void;
  onCommitTitle: () => void;
  onCancelEditing: () => void;
};

function getStatusClasses(status: LibraryCardModel["status"]) {
  if (status === "completed") {
    return {
      shell: "border-cyan-500/18 dark:border-cyan-300/16",
      progress: "bg-cyan-500/90 dark:bg-cyan-300/90",
      title: "text-slate-950 dark:text-slate-50",
      meta: "text-slate-500 dark:text-slate-400",
      progressText: "text-cyan-700/90 dark:text-cyan-300/90",
      ask: "text-cyan-700 hover:text-cyan-800 dark:text-cyan-300 dark:hover:text-cyan-200",
    };
  }

  if (status === "active") {
    return {
      shell: "border-sky-500/14 dark:border-sky-300/14",
      progress: "bg-sky-500/86 dark:bg-sky-300/86",
      title: "text-slate-950 dark:text-slate-50",
      meta: "text-slate-500 dark:text-slate-400",
      progressText: "text-sky-700/88 dark:text-sky-300/88",
      ask: "text-sky-700 hover:text-sky-800 dark:text-sky-300 dark:hover:text-sky-200",
    };
  }

  return {
    shell: "border-slate-200/65 dark:border-white/[0.08]",
    progress: "bg-slate-300 dark:bg-slate-600",
    title: "text-slate-900 dark:text-slate-100",
    meta: "text-slate-500 dark:text-slate-500",
    progressText: "text-slate-500 dark:text-slate-400",
    ask: "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200",
  };
}

export function LibraryCard({
  card,
  isEditing,
  isMenuOpen,
  draftTitle,
  onOpen,
  onAskNew,
  onToggleMenu,
  onStartEditing,
  onDelete,
  onDraftTitleChange,
  onCommitTitle,
  onCancelEditing,
}: LibraryCardProps) {
  const statusClasses = getStatusClasses(card.status);

  function handleContainerClick() {
    if (isEditing) {
      return;
    }

    onOpen();
  }

  function handleContainerKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (isEditing) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpen();
    }
  }

  function handleAskNewClick(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    onAskNew();
  }

  function handleMenuToggle(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    onToggleMenu();
  }

  function handleTitleChange(event: ChangeEvent<HTMLInputElement>) {
    onDraftTitleChange(event.target.value);
  }

  function handleTitleBlur(_event: FocusEvent<HTMLInputElement>) {
    onCommitTitle();
  }

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={handleContainerClick}
      onKeyDown={handleContainerKeyDown}
      className={cn(
        "group relative overflow-hidden border-t bg-transparent px-0 pb-4 pt-5 text-left transition-colors duration-300 ease-out outline-none",
        "hover:border-slate-300/85 hover:bg-transparent",
        "dark:hover:border-white/[0.14] dark:hover:bg-transparent",
        "focus-visible:border-cyan-500/40 dark:focus-visible:border-cyan-300/34",
        statusClasses.shell,
      )}
    >
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0 flex-1">
          {isEditing ? (
            <input
              value={draftTitle}
              autoFocus
              onChange={handleTitleChange}
              onBlur={handleTitleBlur}
              onClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => {
                event.stopPropagation();

                if (event.key === "Enter") {
                  onCommitTitle();
                }

                if (event.key === "Escape") {
                  onCancelEditing();
                }
              }}
              className="w-full border-0 border-b border-cyan-500/35 bg-transparent px-0 py-1 text-[22px] font-light tracking-tight text-slate-900 outline-none transition-colors focus:border-cyan-500/65 dark:border-cyan-400/26 dark:text-slate-100 dark:focus:border-cyan-400/45"
            />
          ) : (
            <div className="flex items-center gap-2">
              <h3
                className={cn(
                  "truncate text-[22px] font-light leading-[1.25] tracking-tight",
                  statusClasses.title,
                )}
              >
                {card.title}
              </h3>
              {card.status === "completed" ? (
                <span className="shrink-0 text-sm text-cyan-600/90 dark:text-cyan-300/90">
                  ✓
                </span>
              ) : null}
            </div>
          )}

          <div className={cn("mt-3 text-[12px] leading-6", statusClasses.meta)}>
            <span>{card.sourceBadges.join(" / ")}</span>
            {card.sourceFiles.length > card.sourceBadges.length ? (
              <span> +{card.sourceFiles.length - card.sourceBadges.length}</span>
            ) : null}
          </div>
        </div>

        <div className="relative flex shrink-0 flex-col items-end gap-2">
          <div
            className={cn(
              "text-[12px] font-normal tracking-[0.08em]",
              statusClasses.progressText,
            )}
          >
            {card.progress.label}
          </div>
          <button
            type="button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={handleMenuToggle}
            className="px-0 py-0 text-[11px] uppercase tracking-[0.18em] text-slate-400 transition-colors hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200"
          >
            More
          </button>
          <LibraryCardMenu
            open={isMenuOpen}
            onRename={onStartEditing}
            onDelete={onDelete}
          />
        </div>
      </div>

      <div className="mt-4 flex items-end justify-between gap-4">
        <div>
          <p className={cn("text-[12px] leading-6", statusClasses.meta)}>
            {card.relativeUpdatedAt}
          </p>
        </div>

        <button
          type="button"
          onClick={handleAskNewClick}
          className={cn(
            "px-0 py-0 text-[11px] uppercase tracking-[0.18em] transition-colors",
            statusClasses.ask,
          )}
        >
          Ask New
        </button>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-px overflow-hidden bg-transparent">
        <div
          className={cn("h-full transition-[width] duration-300", statusClasses.progress)}
          style={{ width: `${card.progress.percent}%` }}
        />
      </div>
    </article>
  );
}
