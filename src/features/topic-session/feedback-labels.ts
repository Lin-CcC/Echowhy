import type { TopicFeedbackPreview } from "./types";

export function formatTopicFeedbackScoreLabel(
  feedback: Pick<TopicFeedbackPreview, "label" | "score">,
  options: { includeMax?: boolean } = {},
) {
  return `${feedback.label} | ${feedback.score}${options.includeMax ? "/100" : ""}`;
}
