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
      shell:
        "border-cyan-500/42 dark:border-cyan-400/24",
      progress:
        "bg-cyan-500 dark:bg-cyan-400",
      glow:
        "group-hover:shadow-[0_12px_34px_rgba(34,211,238,0.16)] dark:group-hover:shadow-[0_12px_34px_rgba(34,211,238,0.12)]",
      progressText:
        "text-cyan-700 dark:text-cyan-300",
    };
  }

  if (status === "active") {
    return {
      shell:
        "border-sky-500/35 dark:border-sky-400/22",
      progress:
        "bg-sky-500 dark:bg-sky-400",
      glow:
        "group-hover:shadow-[0_12px_34px_rgba(56,189,248,0.16)] dark:group-hover:shadow-[0_12px_34px_rgba(56,189,248,0.12)]",
      progressText:
        "text-sky-700 dark:text-sky-300",
    };
  }

  return {
    shell:
      "border-slate-200/70 dark:border-white/[0.055]",
    progress:
      "bg-slate-300 dark:bg-slate-700",
    glow:
      "group-hover:shadow-[0_12px_34px_rgba(34,211,238,0.12)] dark:group-hover:shadow-[0_12px_34px_rgba(34,211,238,0.1)]",
    progressText:
      "text-slate-500 dark:text-slate-400",
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
        "group relative overflow-hidden rounded-[28px] border bg-white/20 p-5 text-left backdrop-blur-xl transition-all duration-300 ease-out",
        "hover:-translate-y-1 hover:border-cyan-500/35 hover:bg-white/26",
        "dark:bg-slate-950/18 dark:hover:border-cyan-400/26 dark:hover:bg-slate-900/24",
        statusClasses.shell,
        statusClasses.glow,
      )}
    >
      <div className="flex items-start justify-between gap-4">
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
              className="w-full rounded-2xl border border-cyan-500/35 bg-white/60 px-3 py-2 text-base font-medium text-slate-900 outline-none transition-colors focus:border-cyan-500/65 dark:border-cyan-400/26 dark:bg-slate-950/35 dark:text-slate-100 dark:focus:border-cyan-400/45"
            />
          ) : (
            <div className="flex items-center gap-2">
              <h3 className="truncate text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                {card.title}
              </h3>
              {card.status === "completed" ? (
                <span className="shrink-0 text-sm text-cyan-600 dark:text-cyan-300">
                  ✓
                </span>
              ) : null}
            </div>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            {card.sourceBadges.map((badge) => (
              <span
                key={badge}
                className="max-w-full truncate rounded-full border border-slate-200/75 bg-slate-100/75 px-2.5 py-1 text-[11px] text-slate-600 dark:border-white/[0.06] dark:bg-slate-900/55 dark:text-slate-300"
              >
                {badge}
              </span>
            ))}
            {card.sourceFiles.length > card.sourceBadges.length ? (
              <span className="rounded-full border border-slate-200/75 bg-slate-100/75 px-2.5 py-1 text-[11px] text-slate-500 dark:border-white/[0.06] dark:bg-slate-900/55 dark:text-slate-400">
                +{card.sourceFiles.length - card.sourceBadges.length}
              </span>
            ) : null}
          </div>
        </div>

        <div className="relative flex shrink-0 flex-col items-end gap-3">
          <div className={cn("text-sm font-medium", statusClasses.progressText)}>
            {card.progress.label}
          </div>
          <button
            type="button"
            onClick={handleMenuToggle}
            className="rounded-full border border-slate-200/75 bg-white/55 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-500 transition-colors hover:border-cyan-500/35 hover:text-cyan-700 dark:border-white/[0.06] dark:bg-slate-950/35 dark:text-slate-400 dark:hover:border-cyan-400/24 dark:hover:text-cyan-300"
          >
            Menu
          </button>
          <LibraryCardMenu
            open={isMenuOpen}
            onRename={onStartEditing}
            onDelete={onDelete}
          />
        </div>
      </div>

      <div className="mt-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
            Last studied
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {card.relativeUpdatedAt}
          </p>
        </div>

        <button
          type="button"
          onClick={handleAskNewClick}
          className="rounded-full border border-cyan-500/35 bg-cyan-500/8 px-3.5 py-2 text-xs font-medium uppercase tracking-[0.16em] text-cyan-700 transition-colors hover:border-cyan-500/55 hover:bg-cyan-500/12 dark:border-cyan-400/26 dark:bg-cyan-400/10 dark:text-cyan-300 dark:hover:border-cyan-400/38 dark:hover:bg-cyan-400/14"
        >
          Ask New
        </button>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-1 overflow-hidden rounded-b-[28px] bg-transparent">
        <div
          className={cn("h-full rounded-b-[28px] transition-[width] duration-300", statusClasses.progress)}
          style={{ width: `${card.progress.percent}%` }}
        />
      </div>
    </article>
  );
}
