import type { ReviewQueueStatus } from "./types";

const reviewStatusLabels: Record<ReviewQueueStatus, string> = {
  "answered-good": "Grounded",
  "answered-weak": "Needs work",
  unanswered: "Unanswered",
  skipped: "Skipped",
};

export function getReviewStatusLabel(status: ReviewQueueStatus) {
  return reviewStatusLabels[status];
}

export function formatReviewRelativeTime(
  value: string,
  options?: {
    now?: Date;
  },
) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "recently";
  }

  const now = options?.now ?? new Date();
  const diffInMilliseconds = now.getTime() - date.getTime();

  if (diffInMilliseconds < 0) {
    return "just now";
  }

  const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));

  if (diffInMinutes <= 0) {
    return "just now";
  }

  if (diffInMinutes === 1) {
    return "1 minute ago";
  }

  if (diffInMinutes < 60) {
    return `${diffInMinutes} minutes ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);

  if (diffInHours === 1) {
    return "1 hour ago";
  }

  if (diffInHours < 24) {
    return `${diffInHours} hours ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInDays === 1) {
    return "1 day ago";
  }

  if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(date);
}
