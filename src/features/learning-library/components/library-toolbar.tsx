import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { LibrarySortBy } from "../types";
import { getLibrarySortLabel, librarySortOptions } from "../presentation";

type LibraryToolbarProps = {
  query: string;
  sortBy: LibrarySortBy;
  onQueryChange: (value: string) => void;
  onSortByChange: (value: LibrarySortBy) => void;
};

export function LibraryToolbar({
  query,
  sortBy,
  onQueryChange,
  onSortByChange,
}: LibraryToolbarProps) {
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const sortMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sortMenuOpen) {
      return;
    }

    function handleWindowPointerDown(event: PointerEvent) {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      if (!sortMenuRef.current?.contains(target)) {
        setSortMenuOpen(false);
      }
    }

    function handleWindowKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSortMenuOpen(false);
      }
    }

    window.addEventListener("pointerdown", handleWindowPointerDown);
    window.addEventListener("keydown", handleWindowKeyDown);

    return () => {
      window.removeEventListener("pointerdown", handleWindowPointerDown);
      window.removeEventListener("keydown", handleWindowKeyDown);
    };
  }, [sortMenuOpen]);

  function handleQueryChange(event: ChangeEvent<HTMLInputElement>) {
    onQueryChange(event.target.value);
  }

  function handleSortOptionSelect(value: LibrarySortBy) {
    onSortByChange(value);
    setSortMenuOpen(false);
  }

  return (
    <div className="mt-6 pb-3">
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_13rem] sm:items-end">
        <div className="min-w-0 flex-1">
          <label
            htmlFor="library-search"
            className="mb-1.5 block text-[10px] uppercase tracking-[0.26em] text-slate-400 dark:text-slate-500"
          >
            Search
          </label>
          <Input
            id="library-search"
            value={query}
            onChange={handleQueryChange}
            placeholder="Search by module or source..."
            className={cn(
              "!h-9 !rounded-none !border-0 !border-b !border-slate-300/78 !bg-transparent !px-0 text-[13px] !text-slate-800 !shadow-none !backdrop-blur-none placeholder:!text-slate-400 focus:!border-cyan-600/42 focus:!bg-transparent",
              "dark:!border-white/[0.12] dark:!text-slate-100 dark:placeholder:!text-slate-500 dark:focus:!border-cyan-300/34",
            )}
          />
        </div>

        <div className="min-w-0">
          <label
            htmlFor="library-sort"
            className="mb-1.5 block text-[10px] uppercase tracking-[0.26em] text-slate-400 dark:text-slate-500"
          >
            Sort
          </label>
          <div ref={sortMenuRef} className="relative">
            <button
              id="library-sort"
              type="button"
              aria-haspopup="menu"
              aria-expanded={sortMenuOpen}
              onClick={() => setSortMenuOpen((current) => !current)}
              className={cn(
                "flex h-9 w-full items-center justify-between border-0 border-b border-slate-300/78 bg-transparent px-0 text-[13px] text-slate-700 outline-none transition-colors hover:text-slate-900 focus-visible:border-cyan-600/42 dark:border-white/[0.12] dark:text-slate-200 dark:hover:text-slate-50 dark:focus-visible:border-cyan-300/34",
              )}
            >
              <span>{getLibrarySortLabel(sortBy)}</span>
              <ChevronDown
                size={16}
                aria-hidden="true"
                className={cn(
                  "text-slate-500 transition-transform duration-200 dark:text-slate-400",
                  sortMenuOpen ? "translate-y-px rotate-180" : "",
                )}
              />
            </button>

            {sortMenuOpen ? (
              <div
                role="menu"
                aria-labelledby="library-sort"
                className={cn(
                  "absolute right-0 top-full z-20 mt-2 min-w-full border border-slate-200/78 bg-[rgba(248,250,252,0.84)] p-1.5 shadow-[0_18px_50px_-36px_rgba(15,23,42,0.28)] backdrop-blur-md",
                  "dark:border-white/[0.08] dark:bg-slate-950/90 dark:shadow-[0_18px_50px_-36px_rgba(8,47,73,0.42)]",
                )}
              >
                {librarySortOptions.map((option) => {
                  const selected = option.value === sortBy;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="menuitemradio"
                      aria-checked={selected}
                      onClick={() => handleSortOptionSelect(option.value)}
                      className={cn(
                        "group flex w-full items-center justify-between gap-4 px-3 py-2 text-left text-[13px] transition-colors",
                        selected
                          ? "text-slate-900 dark:text-slate-50"
                          : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-50",
                      )}
                    >
                      <span>{option.label}</span>
                      <span
                        aria-hidden="true"
                        className={cn(
                          "h-px w-4 transition-colors",
                          selected
                            ? "bg-cyan-600/42 dark:bg-cyan-300/34"
                            : "bg-transparent group-hover:bg-slate-300/90 dark:group-hover:bg-white/[0.14]",
                        )}
                      />
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
