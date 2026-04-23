import { describe, expect, it } from "vitest";
import type { TopicSourceReference } from "@/features/topic-session";
import {
  buildFeedbackWorkbenchDragPayload,
  buildReorderedPinnedSources,
  buildSourceReferenceDragPayload,
  buildSourceWorkbenchCardLayouts,
  getSourceReferenceModeCopy,
  parseWorkbenchOrderPayload,
} from "./utils";
import type { FeedbackCardState } from "./types";

describe("buildSourceWorkbenchCardLayouts", () => {
  it("compresses older pinned source cards when the workbench gets dense", () => {
    const layouts = buildSourceWorkbenchCardLayouts({
      pinnedReferenceIds: ["auth", "jwt", "filter", "controller"],
      previewReferenceId: null,
    });

    expect(layouts).toEqual([
      { referenceId: "auth", kind: "pinned", isCompressed: true },
      { referenceId: "jwt", kind: "pinned", isCompressed: false },
      { referenceId: "filter", kind: "pinned", isCompressed: false },
      { referenceId: "controller", kind: "pinned", isCompressed: false },
    ]);
  });

  it("keeps preview visible and lets it count as the current expanded card", () => {
    const layouts = buildSourceWorkbenchCardLayouts({
      pinnedReferenceIds: ["auth", "jwt", "filter"],
      previewReferenceId: "controller",
    });

    expect(layouts).toEqual([
      { referenceId: "auth", kind: "pinned", isCompressed: true },
      { referenceId: "jwt", kind: "pinned", isCompressed: false },
      { referenceId: "filter", kind: "pinned", isCompressed: false },
      { referenceId: "controller", kind: "preview", isCompressed: false },
    ]);
  });

  it("keeps manually expanded and full-file source cards open", () => {
    const layouts = buildSourceWorkbenchCardLayouts({
      pinnedReferenceIds: ["auth", "jwt", "filter", "controller"],
      previewReferenceId: null,
      expandedReferenceIds: ["auth"],
      fullFileReferenceIds: ["jwt"],
    });

    expect(layouts).toEqual([
      { referenceId: "auth", kind: "pinned", isCompressed: false },
      { referenceId: "jwt", kind: "pinned", isCompressed: false },
      { referenceId: "filter", kind: "pinned", isCompressed: true },
      { referenceId: "controller", kind: "pinned", isCompressed: false },
    ]);
  });

  it("does not duplicate a preview source that is already pinned", () => {
    const layouts = buildSourceWorkbenchCardLayouts({
      pinnedReferenceIds: ["auth", "jwt"],
      previewReferenceId: "jwt",
    });

    expect(layouts).toEqual([
      { referenceId: "auth", kind: "pinned", isCompressed: false },
      { referenceId: "jwt", kind: "pinned", isCompressed: false },
    ]);
  });
});

describe("getSourceReferenceModeCopy", () => {
  it("keeps full-file mode explicitly reversible back to the excerpt", () => {
    expect(getSourceReferenceModeCopy(false)).toEqual({
      buttonLabel: "Full file",
      actionLabel: "View full file",
      dragMeta: "Referenced excerpt",
    });

    expect(getSourceReferenceModeCopy(true)).toEqual({
      buttonLabel: "Back to excerpt",
      actionLabel: "Show referenced excerpt",
      dragMeta: "Full file context",
    });
  });
});

describe("buildSourceReferenceDragPayload", () => {
  it("builds a snippet-first drag payload for the referenced excerpt", () => {
    const reference: TopicSourceReference = {
      id: "jwt-service",
      label: "JwtService token generation",
      referencePath: "server/src/auth/JwtService.java",
      snippet: "String token = issueToken(user);",
      startLine: 13,
      endLine: 18,
      fullContent: [
        "class JwtService {",
        "  String token = issueToken(user);",
        "}",
      ].join("\n"),
      linkedBlockId: "block-jwt",
      linkedQuestionId: "question-jwt",
      defaultHighlightLines: [13],
    };

    expect(buildSourceReferenceDragPayload(reference, false)).toEqual({
      id: "jwt-service",
      label: "JwtService token generation",
      title: "JwtService token generation",
      subtitle: "server/src/auth/JwtService.java : 13-18",
      code: "String token = issueToken(user);",
      meta: "Referenced excerpt",
      insertPrompt: "How does JwtService token generation support this part?",
    });
  });

  it("switches drag payload copy when the full file is open", () => {
    const reference: TopicSourceReference = {
      id: "jwt-service",
      label: "JwtService token generation",
      referencePath: "server/src/auth/JwtService.java",
      snippet: "String token = issueToken(user);",
      fullContent: [
        "class JwtService {",
        "  String token = issueToken(user);",
        "}",
      ].join("\n"),
    };

    expect(buildSourceReferenceDragPayload(reference, true)).toEqual({
      id: "jwt-service",
      label: "JwtService token generation",
      title: "JwtService token generation",
      subtitle: "server/src/auth/JwtService.java",
      code: ["class JwtService {", "  String token = issueToken(user);", "}"].join(
        "\n",
      ),
      meta: "Full file context",
      insertPrompt: "How does JwtService token generation support this part?",
    });
  });
});

describe("buildFeedbackWorkbenchDragPayload", () => {
  it("formats the feedback card payload for drag insertion", () => {
    const feedback: FeedbackCardState = {
      id: "feedback-1",
      angleId: "angle-main",
      questionId: "question-jwt",
      answer: "The server issues the token after checking credentials.",
      revealedAnswerUsed: false,
      feedback: {
        score: 82,
        level: "good",
        label: "Strong path",
        correctPoints: ["It ties JWT issuance to a successful credential check."],
        vaguePoints: ["It does not mention why no token exists before login."],
        missingPoints: ["It skips the trust boundary between login and later requests."],
        nextSuggestion:
          "Connect issuance timing with why later protected requests can trust the token.",
        analysisDimensions: [],
      },
    };

    expect(buildFeedbackWorkbenchDragPayload(feedback)).toEqual({
      id: "feedback-1",
      label: "Strong path",
      feedbackLevel: "good",
      title: "Strong path | 82",
      subtitle: "Answer feedback",
      body: [
        "What landed well:",
        "- It ties JWT issuance to a successful credential check.",
        "",
        "What feels unclear:",
        "- It does not mention why no token exists before login.",
        "",
        "What's still missing:",
        "- It skips the trust boundary between login and later requests.",
        "",
        "A good next step:",
        "Connect issuance timing with why later protected requests can trust the token.",
      ].join("\n"),
      meta: "Question answer | 82/100",
      insertPrompt:
        "Review this feedback: Connect issuance timing with why later protected requests can trust the token.",
    });
  });
});

describe("parseWorkbenchOrderPayload", () => {
  it("parses valid workbench order payloads", () => {
    expect(
      parseWorkbenchOrderPayload('{"kind":"source","id":"jwt-service"}'),
    ).toEqual({
      kind: "source",
      id: "jwt-service",
    });
  });

  it("returns null for invalid payloads", () => {
    expect(parseWorkbenchOrderPayload("")).toBeNull();
    expect(parseWorkbenchOrderPayload("{not-json")).toBeNull();
  });
});

describe("buildReorderedPinnedSources", () => {
  it("moves the dragged source before the target source", () => {
    expect(
      buildReorderedPinnedSources(
        ["auth", "jwt", "filter", "controller"],
        "controller",
        "jwt",
        "before",
      ),
    ).toEqual(["auth", "controller", "jwt", "filter"]);
  });

  it("moves the dragged source after the target source", () => {
    expect(
      buildReorderedPinnedSources(
        ["auth", "jwt", "filter", "controller"],
        "auth",
        "filter",
        "after",
      ),
    ).toEqual(["jwt", "filter", "auth", "controller"]);
  });

  it("returns null when the target source cannot be found", () => {
    expect(
      buildReorderedPinnedSources(
        ["auth", "jwt"],
        "auth",
        "missing",
        "before",
      ),
    ).toBeNull();
  });
});
