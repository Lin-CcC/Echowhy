import { describe, expect, it } from "vitest";
import type { LearningModuleRecord, TopicSourceImport } from "@/features/topic-session";
import {
  buildGuidedLadderSourceFromModule,
  createGuidedLadderQuestionHandoff,
  createGuidedLadderSourceHandoff,
  resolveGuidedLadderSource,
} from "./utils";

function createModule(overrides: Partial<LearningModuleRecord> = {}): LearningModuleRecord {
  return {
    id: overrides.id ?? "module-local",
    title: overrides.title ?? "Local auth source",
    sourceId: overrides.sourceId ?? "source-local-auth",
    sourceLabel: overrides.sourceLabel ?? "Auth files",
    sourceFiles: overrides.sourceFiles ?? ["AuthService.java", "JwtService.java"],
    seedQuestion: overrides.seedQuestion,
    parentModuleId: overrides.parentModuleId,
    children: overrides.children ?? [
      {
        id: "child-request",
        label: "Request flow",
        topicId: "topic-local-auth",
        angleId: "angle-request-flow",
        kind: "angle",
        createdAt: "2026-04-23T09:00:00.000Z",
      },
    ],
    kind: overrides.kind ?? "source-backed",
    createdAt: overrides.createdAt ?? "2026-04-23T08:00:00.000Z",
    updatedAt: overrides.updatedAt ?? "2026-04-23T09:00:00.000Z",
  };
}

describe("buildGuidedLadderSourceFromModule", () => {
  it("turns a learning module into a source cold-start ladder model", () => {
    const source = buildGuidedLadderSourceFromModule(createModule());

    expect(source).toMatchObject({
      id: "source-local-auth",
      projectName: "Auth files",
      guidedQuestions: [
        expect.objectContaining({
          id: "child-request",
          label: "Request flow",
          topicId: "topic-local-auth",
          angleId: "angle-request-flow",
        }),
      ],
    });
    expect(source.fileTree[0]).toMatchObject({
      id: "module-local-file-0",
      label: "AuthService.java",
      kind: "file",
      topicId: "topic-local-auth",
    });
    expect(source.fileTree[1]).toMatchObject({
      id: "module-local-file-1",
      label: "JwtService.java",
      kind: "file",
      topicId: "topic-local-auth",
    });
    expect(source.overview[0]).toContain("2 attached files");
  });

  it("still offers a main-thread entry when the module has no children yet", () => {
    const source = buildGuidedLadderSourceFromModule(
      createModule({
        children: [],
        sourceFiles: [],
      }),
    );

    expect(source.guidedQuestions).toEqual([
      expect.objectContaining({
        id: "module-local-main-thread",
        label: "Open the main learning thread",
        topicId: "module-local",
      }),
    ]);
    expect(source.fileTree).toEqual([
      expect.objectContaining({
        id: "module-local-source",
        label: "Auth files",
        kind: "directory",
      }),
    ]);
  });
});

describe("resolveGuidedLadderSource", () => {
  it("prefers a static source import when the source id is known", () => {
    const staticSource: TopicSourceImport = {
      id: "source-static",
      projectName: "Static source",
      overview: ["Static overview"],
      guidedQuestions: [],
      fileTree: [],
    };

    const resolved = resolveGuidedLadderSource({
      sourceId: "source-static",
      modules: [createModule({ sourceId: "source-static" })],
      getStaticSourceImport: () => staticSource,
    });

    expect(resolved).toBe(staticSource);
  });

  it("falls back to the matching learning module for imported or library sources", () => {
    const module = createModule();
    const resolved = resolveGuidedLadderSource({
      sourceId: "source-local-auth",
      moduleId: "module-local",
      modules: [module],
      getStaticSourceImport: () => undefined,
    });

    expect(resolved?.projectName).toBe("Auth files");
  });
});

describe("createGuidedLadderSourceHandoff", () => {
  it("creates a new module handoff for a freshly attached source", () => {
    const handoff = createGuidedLadderSourceHandoff({
      selectedSource: {
        id: "source-local-auth",
        label: "Auth files",
        sourceFiles: ["AuthService.java"],
      },
      fallbackModuleId: "why-source-local-auth-abc",
    });

    expect(handoff).toEqual({
      moduleId: "why-source-local-auth-abc",
      moduleTitle: "Auth files",
      sourceId: "source-local-auth",
      sourceLabel: "Auth files",
      sourceFiles: ["AuthService.java"],
      shouldCreateModule: true,
    });
  });

  it("reuses the existing module when a library module source is selected", () => {
    const handoff = createGuidedLadderSourceHandoff({
      selectedSource: {
        id: "module-module-local",
        label: "JWT learning module",
        sourceId: "source-local-auth",
        sourceLabel: "Auth files",
        moduleTopicId: "module-local",
      },
      fallbackModuleId: "why-source-local-auth-abc",
    });

    expect(handoff).toEqual({
      moduleId: "module-local",
      moduleTitle: "JWT learning module",
      sourceId: "source-local-auth",
      sourceLabel: "Auth files",
      sourceFiles: undefined,
      shouldCreateModule: false,
    });
  });

  it("does not create a handoff without a selected source", () => {
    expect(
      createGuidedLadderSourceHandoff({
        selectedSource: null,
        fallbackModuleId: "why-conceptual-abc",
      }),
    ).toBeNull();
  });
});

describe("createGuidedLadderQuestionHandoff", () => {
  it("keeps a source-bound question as a lightweight ladder handoff", () => {
    const handoff = createGuidedLadderQuestionHandoff({
      sourceId: "source-local-auth",
      sourceLabel: "Auth files",
      moduleId: "why-source-local-auth-abc",
      targetTopicId: "why-source-local-auth-abc",
      customQuestion: "  Why is JWT signed after the credential check?  ",
    });

    expect(handoff).toEqual({
      sourceId: "source-local-auth",
      sourceLabel: "Auth files",
      moduleId: "why-source-local-auth-abc",
      targetTopicId: "why-source-local-auth-abc",
      customQuestion: "Why is JWT signed after the credential check?",
    });
  });

  it("does not create a question handoff without a real question", () => {
    expect(
      createGuidedLadderQuestionHandoff({
        sourceId: "source-local-auth",
        moduleId: "why-source-local-auth-abc",
        targetTopicId: "why-source-local-auth-abc",
        customQuestion: "   ",
      }),
    ).toBeNull();
  });
});
