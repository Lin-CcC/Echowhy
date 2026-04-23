import { describe, expect, it } from "vitest";
import { buildSourceWorkbenchCardLayouts } from "./utils";

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
