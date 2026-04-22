export type LibraryCardStatus = "idle" | "active" | "completed";

export type LibrarySortBy = "recently-opened" | "created-date" | "progress";

export type LibraryCardModel = {
  id: string;
  title: string;
  sourceLabel: string;
  sourceBadges: string[];
  sourceFiles: string[];
  status: LibraryCardStatus;
  updatedAt: string;
  createdAt: string;
  relativeUpdatedAt: string;
  progress: {
    totalCount: number;
    completedCount: number;
    percent: number;
    label: string;
  };
};

export type BuildLibraryCardModelOptions = {
  completedChildIds?: string[];
  now?: Date;
};

export type FilterAndSortLibraryCardsOptions = {
  query: string;
  sortBy: LibrarySortBy;
};
