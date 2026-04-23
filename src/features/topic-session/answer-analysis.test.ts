import { describe, expect, it } from "vitest";
import type { TopicNode } from "./types";
import {
  countQuestionKeywordMatches,
  inferTopicAnswerAnalysisDimensions,
} from "./answer-analysis";

function createQuestion(overrides: Partial<TopicNode> = {}): TopicNode {
  return {
    id: overrides.id ?? "q-1",
    label: overrides.label ?? "Question 1",
    prompt:
      overrides.prompt ??
      "Why does the backend validate username and password before issuing a JWT?",
    x: overrides.x ?? 0,
    y: overrides.y ?? 0,
    visualState: overrides.visualState ?? "dim",
    keywordGroups: overrides.keywordGroups ?? [
      ["backend", "server", "auth"],
      ["username", "password", "credentials"],
      ["jwt", "token"],
    ],
    bonusKeywords: overrides.bonusKeywords ?? ["because", "issued", "login"],
  };
}

describe("countQuestionKeywordMatches", () => {
  it("counts matched keyword groups and bonus keywords from the answer", () => {
    const result = countQuestionKeywordMatches(
      createQuestion(),
      "The backend checks username and password first because no JWT has been issued yet during login.",
    );

    expect(result).toEqual({
      matchedGroups: 3,
      totalGroups: 3,
      matchedBonus: 3,
      totalBonus: 3,
    });
  });
});

describe("inferTopicAnswerAnalysisDimensions", () => {
  it("flags off-target answers as target-fit and grounding issues", () => {
    const dimensions = inferTopicAnswerAnalysisDimensions({
      question: createQuestion(),
      answer: "It probably helps the system stay organized.",
      score: 28,
    });

    expect(dimensions).toEqual([
      "target-fit",
      "grounding",
      "causal-link",
      "calibration",
    ]);
  });

  it("flags partial but on-topic answers as conceptual accuracy gaps", () => {
    const dimensions = inferTopicAnswerAnalysisDimensions({
      question: createQuestion(),
      answer: "The backend checks credentials before moving forward.",
      score: 64,
    });

    expect(dimensions).toEqual(["conceptual-accuracy", "causal-link"]);
  });

  it("keeps grounded answers free of weak dimensions", () => {
    const dimensions = inferTopicAnswerAnalysisDimensions({
      question: createQuestion(),
      answer:
        "The backend must compare submitted credentials first because no JWT exists yet. Only after that successful login can the server issue a token for later protected requests.",
      score: 94,
    });

    expect(dimensions).toEqual([]);
  });
});
