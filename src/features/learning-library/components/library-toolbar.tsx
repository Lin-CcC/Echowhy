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
    <div className="mt-10 flex flex-col gap-4 rounded-[28px] border border-slate-200/70 bg-white/16 p-4 backdrop-blur-xl dark:border-white/[0.055] dark:bg-slate-950/18 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex-1">
        <label
          htmlFor="library-search"
          className="mb-2 block text-[10px] uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400"
        >
          Search
        </label>
        <Input
          id="library-search"
          value={query}
          onChange={handleQueryChange}
          placeholder="Search by module or source..."
          className={cn(
            "h-12 rounded-[20px] border-slate-200/75 bg-white/55 px-4 text-sm text-slate-900 shadow-none placeholder:text-slate-400 focus:border-cyan-500/45 focus:bg-white/70",
            "dark:border-white/[0.06] dark:bg-slate-950/22 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-cyan-400/38 dark:focus:bg-slate-950/28",
          )}
        />
      </div>

      <div className="sm:w-56">
        <label
          htmlFor="library-sort"
          className="mb-2 block text-[10px] uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400"
        >
          Sort by
        </label>
        <select
          id="library-sort"
          value={sortBy}
          onChange={handleSortByChange}
          className={cn(
            "h-12 w-full rounded-[20px] border border-slate-200/75 bg-white/60 px-4 text-sm text-slate-700 outline-none transition-colors focus:border-cyan-500/45",
            "dark:border-white/[0.06] dark:bg-slate-950/22 dark:text-slate-200 dark:focus:border-cyan-400/38",
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
  );
}
