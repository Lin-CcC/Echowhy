import type { LibrarySortBy } from "./types";

export const librarySortOptions: ReadonlyArray<{
  label: string;
  value: LibrarySortBy;
}> = [
  { label: "Recently opened", value: "recently-opened" },
  { label: "Created date", value: "created-date" },
  { label: "Progress", value: "progress" },
];

const trailingDocExtensionPattern =
  /\.(md|mdx|txt|pdf|doc|docx|ppt|pptx|pages|html?)$/i;
const trailingAssistantSuffixPattern =
  /[_-](gemini|claude|doubao|gpt|chatgpt|draft|final)$/i;
const trailingMetaParenPattern = /\s+\(([A-Z]{2,6})\)$/;
const compactSummaryThreshold = 52;
const singleLabelThreshold = 28;

function normalizeSourceBadge(label: string) {
  return label
    .trim()
    .replace(trailingDocExtensionPattern, "")
    .replace(trailingAssistantSuffixPattern, "")
    .replace(trailingMetaParenPattern, "")
    .trim();
}

function truncateSourceBadge(label: string, maxLength: number) {
  return label.length > maxLength ? `${label.slice(0, maxLength).trimEnd()}...` : label;
}

export function buildLibraryMetaSummary({
  sourceBadges,
  sourceFiles,
}: {
  sourceBadges: string[];
  sourceFiles: string[];
}) {
  const badges = sourceBadges
    .map(normalizeSourceBadge)
    .filter((badge) => badge.trim().length > 0);

  if (badges.length === 0) {
    return "Conceptual source";
  }

  const remainingCount = Math.max(sourceFiles.length - badges.length, 0);
  const firstLabel = badges[0];
  const summary = badges.join(" / ");

  if (
    sourceFiles.length > 1 &&
    (firstLabel.length > singleLabelThreshold || summary.length > compactSummaryThreshold)
  ) {
    const compactFirstLabel = truncateSourceBadge(firstLabel, singleLabelThreshold);
    const needsEllipsis = compactFirstLabel === firstLabel;

    return `${compactFirstLabel}${needsEllipsis ? "..." : ""} +${sourceFiles.length - 1}`;
  }

  return remainingCount > 0 ? `${summary} +${remainingCount}` : summary;
}

export function getLibrarySortLabel(sortBy: LibrarySortBy) {
  return (
    librarySortOptions.find((option) => option.value === sortBy)?.label ??
    "Recently opened"
  );
}
