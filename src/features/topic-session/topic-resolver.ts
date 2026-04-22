import type { TopicSession } from "./types";
import {
  constellationTopic,
  getConstellationTopicById,
  getSourceImportById,
} from "@/mock/data/constellation-topic";

type GeneratedTopicOptions = {
  topicId: string;
  seedQuestion?: string;
  sourceId?: string;
  sourceLabel?: string;
};

export function createGeneratedTopicSession({
  topicId,
  seedQuestion,
  sourceId,
  sourceLabel,
}: GeneratedTopicOptions): TopicSession {
  const sourceImport = sourceId ? getSourceImportById(sourceId) : undefined;
  const sourceName =
    sourceImport?.projectName ??
    sourceLabel?.trim() ??
    (sourceId ? "Imported source" : "Conceptual source");
  const moduleTitle = seedQuestion || sourceName;
  const moduleRootQuestion =
    seedQuestion || `What is worth understanding first in ${sourceName}?`;

  return {
    ...constellationTopic,
    id: topicId,
    title: moduleTitle,
    rootQuestion: moduleRootQuestion,
    goal: seedQuestion
      ? `Build a grounded learning path around "${seedQuestion}".`
      : `Build a grounded learning path from ${sourceName}.`,
    overview: seedQuestion
      ? `This generated module starts from the learner's question, then asks Echowhy to organize useful angles from the available source material.`
      : `This generated module starts from the selected source material and lets Echowhy propose useful learning angles before the learner adds their own why.`,
    learningAngles: constellationTopic.learningAngles.map((angle) => {
      if (angle.isCustom) {
        return { ...angle };
      }

      if (angle.id === "angle-request-flow") {
        return {
          ...angle,
          rootQuestion: seedQuestion
            ? `What source flow is most useful for answering: ${seedQuestion}`
            : `What is the first useful flow to understand in ${sourceName}?`,
        };
      }

      if (angle.id === "angle-responsibility") {
        return {
          ...angle,
          rootQuestion: seedQuestion
            ? `Which responsibility boundary matters most for: ${seedQuestion}`
            : `Which responsibility boundary in ${sourceName} is easiest to misunderstand?`,
        };
      }

      if (angle.id === "angle-jwt-timing") {
        return {
          ...angle,
          rootQuestion: seedQuestion
            ? `What timing or sequence detail changes the answer to: ${seedQuestion}`
            : `What sequence or timing detail should be learned from ${sourceName}?`,
        };
      }

      return { ...angle };
    }),
    sourceImport: {
      ...(sourceImport ?? constellationTopic.sourceImport),
      id: sourceId ?? "source-conceptual-search",
      projectName: sourceName,
    },
  };
}

export function resolveTopicSession({
  topicId,
  seedQuestion,
  sourceId,
  sourceLabel,
}: GeneratedTopicOptions) {
  return (
    getConstellationTopicById(topicId) ??
    createGeneratedTopicSession({
      topicId,
      seedQuestion,
      sourceId,
      sourceLabel,
    })
  );
}
