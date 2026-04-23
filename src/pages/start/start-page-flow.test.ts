import { describe, expect, it } from "vitest";
import { createGuidedLadderQuestionHandoff, createGuidedLadderSourceHandoff } from "@/features/guided-ladder";
import type { LearningModuleRecord } from "@/features/topic-session/module-storage";
import type { StartSource } from "./start-page-utils";
import {
  buildStartQuestionSubmissionPlan,
  type StartQuestionSubmissionPlan,
} from "./start-page-flow";

function createModule(
  overrides: Partial<LearningModuleRecord> = {},
): LearningModuleRecord {
  return {
    id: overrides.id ?? "module-jwt",
    title: overrides.title ?? "JWT module",
    kind: overrides.kind ?? "source-backed",
    createdAt: overrides.createdAt ?? "2026-04-23T00:00:00.000Z",
    updatedAt: overrides.updatedAt ?? "2026-04-23T00:00:00.000Z",
    children: overrides.children ?? [],
    seedQuestion: overrides.seedQuestion,
    sourceId: overrides.sourceId,
    sourceLabel: overrides.sourceLabel,
    sourceFiles: overrides.sourceFiles,
    parentModuleId: overrides.parentModuleId,
  };
}

function createSelectedSource(
  overrides: Partial<StartSource> = {},
): StartSource {
  return {
    id: overrides.id ?? "source-jwt",
    label: overrides.label ?? "JWT source",
    caption: overrides.caption ?? "RBAC source",
    kind: overrides.kind ?? "project",
    moduleTopicId: overrides.moduleTopicId,
    sourceId: overrides.sourceId,
    sourceLabel: overrides.sourceLabel,
    sourceFiles: overrides.sourceFiles,
    children: overrides.children ?? [],
  };
}

describe("buildStartQuestionSubmissionPlan", () => {
  it("routes source-only submission into guided ladder handoff", () => {
    const selectedSource = createSelectedSource({
      id: "source-jwt",
      label: "JWT source",
      sourceId: "source-jwt",
      sourceLabel: "JWT source",
    });

    const fallbackTopicId = "why-source-jwt";
    const expectedHandoff = createGuidedLadderSourceHandoff({
      selectedSource,
      fallbackModuleId: fallbackTopicId,
    });

    const plan = buildStartQuestionSubmissionPlan({
      question: "   ",
      selectedSource,
      learningModules: [],
      fallbackTopicId,
    });

    expect(plan).toEqual<StartQuestionSubmissionPlan>({
      kind: "guided-ladder-source",
      moduleId: expectedHandoff?.moduleId ?? fallbackTopicId,
      sourceId: expectedHandoff?.sourceId ?? "source-jwt",
      sourceLabel: expectedHandoff?.sourceLabel ?? "JWT source",
      moduleTitle: expectedHandoff?.moduleTitle ?? "JWT source",
      sourceFiles: selectedSource.sourceFiles,
      shouldCreateModule: expectedHandoff?.shouldCreateModule ?? true,
      shouldEnsureModuleChildren: false,
      targetTopicId: undefined,
      customQuestion: undefined,
      parentModuleId: undefined,
    });
  });

  it("creates a source-bound child why under the selected module when the user asks a question", () => {
    const selectedSource = createSelectedSource({
      id: "source-jwt",
      label: "JWT source",
      moduleTopicId: "module-parent",
      sourceId: "source-jwt",
      sourceLabel: "JWT source",
      sourceFiles: ["auth.java"],
    });
    const fallbackTopicId = "why-source-jwt";
    const expectedHandoff = createGuidedLadderQuestionHandoff({
      sourceId: "source-jwt",
      sourceLabel: "JWT source",
      moduleId: "module-parent",
      targetTopicId: fallbackTopicId,
      customQuestion: "Why is JWT useful after login?",
    });

    const plan = buildStartQuestionSubmissionPlan({
      question: " Why is JWT useful after login? ",
      selectedSource,
      learningModules: [createModule({ id: "module-parent", children: [] })],
      fallbackTopicId,
    });

    expect(plan).toEqual<StartQuestionSubmissionPlan>({
      kind: "guided-ladder-question",
      moduleId: "module-parent",
      sourceId: "source-jwt",
      sourceLabel: "JWT source",
      moduleTitle: "Why is JWT useful after login?",
      sourceFiles: ["auth.java"],
      shouldCreateModule: true,
      shouldEnsureModuleChildren: true,
      targetTopicId: expectedHandoff?.targetTopicId ?? fallbackTopicId,
      customQuestion: "Why is JWT useful after login?",
      parentModuleId: "module-parent",
    });
  });

  it("creates a conceptual module and opens topic directly when no source is bound", () => {
    const plan = buildStartQuestionSubmissionPlan({
      question: "How should I understand login timing?",
      selectedSource: null,
      learningModules: [],
      fallbackTopicId: "why-conceptual",
    });

    expect(plan).toEqual<StartQuestionSubmissionPlan>({
      kind: "topic",
      moduleId: "why-conceptual",
      sourceId: undefined,
      sourceLabel: undefined,
      moduleTitle: "How should I understand login timing?",
      sourceFiles: undefined,
      shouldCreateModule: true,
      shouldEnsureModuleChildren: false,
      targetTopicId: "why-conceptual",
      customQuestion: "How should I understand login timing?",
      parentModuleId: undefined,
    });
  });
});
