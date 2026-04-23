import { describe, expect, it } from "vitest";
import type { TopicFeedbackPreview } from "./types";
import { formatTopicFeedbackScoreLabel } from "./feedback-labels";

function createFeedback(): TopicFeedbackPreview {
  return {
    score: 82,
    level: "good",
    label: "Good!",
    correctPoints: [],
    vaguePoints: [],
    missingPoints: [],
    nextSuggestion: "Keep going.",
    analysisDimensions: [],
  };
}

describe("formatTopicFeedbackScoreLabel", () => {
  it("uses a clean ASCII divider for compact feedback labels", () => {
    expect(formatTopicFeedbackScoreLabel(createFeedback())).toBe("Good! | 82");
  });

  it("can include the 100-point scale when the context needs a score scale", () => {
    expect(formatTopicFeedbackScoreLabel(createFeedback(), { includeMax: true })).toBe(
      "Good! | 82/100",
    );
  });
});
