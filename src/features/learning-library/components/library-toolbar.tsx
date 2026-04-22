import type { ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { LibrarySortBy } from "../types";

type LibraryToolbarProps = {
  query: string;
  sortBy: LibrarySortBy;
  onQueryChange: (value: string) => void;
  onSortByChange: (value: LibrarySortBy) => void;
};

const sortOptions: { label: string; value: LibrarySortBy }[] = [
  { label: "Recently opened", value: "recently-opened" },
  { label: "Created date", value: "created-date" },
  { label: "Progress", value: "progress" },
];

export function LibraryToolbar({
  query,
  sortBy,
  onQueryChange,
  onSortByChange,
}: LibraryToolbarProps) {
  function handleQueryChange(event: ChangeEvent<HTMLInputElement>) {
    onQueryChange(event.target.value);
  }

  function handleSortByChange(event: ChangeEvent<HTMLSelectElement>) {
    onSortByChange(event.target.value as LibrarySortBy);
  }

  return (
    <div className="mt-12 border-b border-slate-200/70 pb-5 dark:border-white/[0.08]">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 flex-1">
          <label
            htmlFor="library-search"
            className="mb-2 block text-[10px] uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500"
          >
            Search
          </label>
          <Input
            id="library-search"
            value={query}
            onChange={handleQueryChange}
            placeholder="Search by module or source..."
            className={cn(
              "h-11 rounded-none border-0 border-b border-slate-300/80 bg-transparent px-0 text-[15px] text-slate-800 shadow-none placeholder:text-slate-400 focus:border-cyan-600/45 focus:bg-transparent",
              "dark:border-white/[0.12] dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-cyan-300/34",
            )}
          />
        </div>

        <div className="sm:w-56">
          <label
            htmlFor="library-sort"
            className="mb-2 block text-[10px] uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500"
          >
            Sort
          </label>
          <select
            id="library-sort"
            value={sortBy}
            onChange={handleSortByChange}
            className={cn(
              "h-11 w-full rounded-none border-0 border-b border-slate-300/80 bg-transparent px-0 text-[14px] text-slate-700 outline-none transition-colors focus:border-cyan-600/45",
              "dark:border-white/[0.12] dark:text-slate-200 dark:focus:border-cyan-300/34",
            )}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
