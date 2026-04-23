import type {
  TopicAnswerAnalysisDimension,
  TopicNode,
} from "./types";

const causalMarkers = [
  "because",
  "therefore",
  "so that",
  "so ",
  "since ",
  "due to",
  "because of",
  "因为",
  "所以",
  "因此",
  "由于",
];

const hedgingMarkers = [
  "maybe",
  "probably",
  "perhaps",
  "i think",
  "might",
  "possibly",
  "可能",
  "也许",
  "大概",
  "我觉得",
  "好像",
];

function containsKeyword(normalizedAnswer: string, keyword: string) {
  return normalizedAnswer.includes(keyword.toLowerCase());
}

function hasAnyMarker(normalizedAnswer: string, markers: string[]) {
  return markers.some((marker) => normalizedAnswer.includes(marker));
}

export function countQuestionKeywordMatches(
  question: TopicNode,
  answer: string,
) {
  const normalizedAnswer = answer.trim().toLowerCase();
  const keywordGroups = question.keywordGroups ?? [];
  const bonusKeywords = question.bonusKeywords ?? [];

  return {
    matchedGroups: keywordGroups.filter((group) =>
      group.some((keyword) => containsKeyword(normalizedAnswer, keyword)),
    ).length,
    totalGroups: keywordGroups.length,
    matchedBonus: bonusKeywords.filter((keyword) =>
      containsKeyword(normalizedAnswer, keyword),
    ).length,
    totalBonus: bonusKeywords.length,
  };
}

export function inferTopicAnswerAnalysisDimensions({
  question,
  answer,
  score,
}: {
  question: TopicNode;
  answer: string;
  score: number;
}): TopicAnswerAnalysisDimension[] {
  const normalizedAnswer = answer.trim().toLowerCase();

  if (!normalizedAnswer) {
    return ["target-fit", "grounding"];
  }

  const keywordMatches = countQuestionKeywordMatches(question, normalizedAnswer);
  const dimensions: TopicAnswerAnalysisDimension[] = [];

  if (keywordMatches.totalGroups > 0 && keywordMatches.matchedGroups === 0) {
    dimensions.push("target-fit", "grounding");
  } else {
    const keywordCoverage =
      keywordMatches.totalGroups > 0
        ? keywordMatches.matchedGroups / keywordMatches.totalGroups
        : 1;

    if (score < 80 && keywordCoverage < 1) {
      dimensions.push("conceptual-accuracy");
    }

    if (
      score < 70 &&
      keywordMatches.matchedBonus === 0 &&
      keywordMatches.matchedGroups <= 1
    ) {
      dimensions.push("grounding");
    }
  }

  if (
    question.prompt.toLowerCase().includes("why") &&
    !hasAnyMarker(normalizedAnswer, causalMarkers) &&
    score < 90
  ) {
    dimensions.push("causal-link");
  }

  if (
    hasAnyMarker(normalizedAnswer, hedgingMarkers) ||
    (normalizedAnswer.length < 48 && score < 85)
  ) {
    dimensions.push("calibration");
  }

  return [...new Set(dimensions)];
}
