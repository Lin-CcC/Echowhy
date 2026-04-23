import type {
  KeyboardEvent,
  MouseEvent,
  ChangeEvent,
  FocusEvent,
} from "react";
import { cn } from "@/lib/utils";
import type { LibraryCardModel } from "../types";
import { buildLibraryMetaSummary } from "../presentation";
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
      title: "text-slate-800/95 dark:text-slate-50",
      meta: "text-slate-500/88 dark:text-slate-400/88",
      progressText: "text-cyan-700/72 dark:text-cyan-300/74",
      ask: "text-cyan-700/78 hover:text-cyan-800 dark:text-cyan-300/84 dark:hover:text-cyan-200",
    };
  }

  if (status === "active") {
    return {
      shell: "border-sky-500/14 dark:border-sky-300/14",
      progress: "bg-sky-500/86 dark:bg-sky-300/86",
      title: "text-slate-800/95 dark:text-slate-50",
      meta: "text-slate-500/88 dark:text-slate-400/88",
      progressText: "text-sky-700/72 dark:text-sky-300/74",
      ask: "text-sky-700/78 hover:text-sky-800 dark:text-sky-300/84 dark:hover:text-sky-200",
    };
  }

  return {
    shell: "border-slate-200/65 dark:border-white/[0.08]",
    progress: "bg-slate-300 dark:bg-slate-600",
    title: "text-slate-800/92 dark:text-slate-100",
    meta: "text-slate-500/84 dark:text-slate-500",
    progressText: "text-slate-500/72 dark:text-slate-400/78",
    ask: "text-slate-500/82 hover:text-slate-700 dark:text-slate-400/82 dark:hover:text-slate-200",
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
  const metaSummary = buildLibraryMetaSummary({
    sourceBadges: card.sourceBadges,
    sourceFiles: card.sourceFiles,
  });

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

  function handleOpenClick(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    onOpen();
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
        "group relative overflow-hidden border-t bg-transparent px-0 pb-2.5 pt-3.5 text-left transition-colors duration-300 ease-out outline-none",
        "hover:border-slate-300/85 hover:bg-[linear-gradient(90deg,rgba(241,245,249,0.22),rgba(241,245,249,0))]",
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
              className="w-full border-0 border-b border-cyan-500/35 bg-transparent px-0 py-1 text-[18px] font-normal tracking-[-0.01em] text-slate-800 outline-none transition-colors focus:border-cyan-500/65 dark:border-cyan-400/26 dark:text-slate-100 dark:focus:border-cyan-400/45"
            />
          ) : (
            <div className="flex items-center gap-2">
              <h3
                className={cn(
                  "truncate text-[17px] font-normal leading-[1.24] tracking-[-0.01em] sm:text-[18px]",
                  statusClasses.title,
                )}
              >
                {card.title}
              </h3>
              {card.status === "completed" ? (
                <span className="shrink-0 text-[10px] tracking-[0.04em] text-cyan-600/76 dark:text-cyan-300/82">
                  Done
                </span>
              ) : null}
              {card.bookmarkedQuestionCount > 0 ? (
                <span className="shrink-0 text-[10px] tracking-[0.04em] text-slate-400/90 dark:text-slate-500">
                  {card.bookmarkedQuestionCount} saved question
                  {card.bookmarkedQuestionCount === 1 ? "" : "s"}
                </span>
              ) : null}
            </div>
          )}

          <div
            className={cn(
              "mt-1.5 truncate text-[11px] leading-[1.8] tracking-[0.005em] sm:text-[12px]",
              statusClasses.meta,
            )}
          >
            <span>{metaSummary}</span>
          </div>
        </div>

        <div className="relative flex w-[6.2rem] shrink-0 flex-col items-end gap-2 pt-0.5 text-right">
          <div
            className={cn(
              "text-[10px] font-normal tracking-[0.04em]",
              statusClasses.progressText,
            )}
          >
            {card.progress.label}
          </div>
          <button
            type="button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={handleMenuToggle}
            className="px-0 py-0 text-[10px] tracking-[0.08em] text-slate-400/92 transition-colors hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200"
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

      <div className="mt-2.5 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p
            className={cn(
              "text-[10px] leading-5 tracking-[0.01em] text-slate-400/82 dark:text-slate-500",
            )}
          >
            {card.relativeUpdatedAt}
          </p>
          <div className="mt-1.5 flex items-center gap-3.5">
            <button
              type="button"
              onClick={handleAskNewClick}
              className={cn(
                "px-0 py-0 text-[11px] tracking-[0.08em] transition-colors",
                statusClasses.ask,
              )}
            >
              Ask new
            </button>
            <span
              className="h-3 w-px bg-slate-200/72 dark:bg-white/[0.08]"
              aria-hidden="true"
            />
            <button
              type="button"
              onClick={handleOpenClick}
              className="px-0 py-0 text-[11px] tracking-[0.08em] text-slate-400/90 transition-colors hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200"
            >
              Open
            </button>
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-px overflow-hidden bg-transparent">
        <div className="absolute inset-0 bg-slate-200/70 dark:bg-white/[0.06]" />
        <div
          className={cn(
            "absolute left-0 top-0 h-full transition-[width,opacity] duration-300 opacity-28 group-hover:opacity-90 group-focus-visible:opacity-90",
            statusClasses.progress,
          )}
          style={{ width: `${card.progress.percent}%` }}
        />
      </div>
    </article>
  );
}
