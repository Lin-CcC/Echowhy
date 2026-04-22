import { describe, expect, it } from "vitest";
import { buildLibraryMetaSummary, getLibrarySortLabel } from "./presentation";

describe("buildLibraryMetaSummary", () => {
  it("joins source badges into a compact metadata line", () => {
    expect(
      buildLibraryMetaSummary({
        sourceBadges: ["RBAC Project", "AuthService.java", "Security flow"],
        sourceFiles: ["RBAC Project", "AuthService.java", "Security flow"],
      }),
    ).toBe("RBAC Project / AuthService.java / Security flow");
  });

  it("appends the remaining file count when more files exist than visible badges", () => {
    expect(
      buildLibraryMetaSummary({
        sourceBadges: ["RBAC Project", "AuthService.java"],
        sourceFiles: [
          "RBAC Project",
          "AuthService.java",
          "Security flow",
          "JwtService.java",
        ],
      }),
    ).toBe("RBAC Project / AuthService.java +2");
  });

  it("compacts long source names so the metadata line stays quiet", () => {
    expect(
      buildLibraryMetaSummary({
        sourceBadges: [
          "Echowhy V1.5 插入式卡片 UIUX 规范 (PRD)_gemini.md",
          "Echowhy V1.5 问题卡片体系统一 PRD.md",
          "动态支架.md",
        ],
        sourceFiles: [
          "Echowhy V1.5 插入式卡片 UIUX 规范 (PRD)_gemini.md",
          "Echowhy V1.5 问题卡片体系统一 PRD.md",
          "动态支架.md",
        ],
      }),
    ).toBe("Echowhy V1.5 插入式卡片 UIUX 规范... +2");
  });

  it("falls back to a quiet empty label when there is no visible source badge", () => {
    expect(
      buildLibraryMetaSummary({
        sourceBadges: [],
        sourceFiles: [],
      }),
    ).toBe("Conceptual source");
  });
});

describe("getLibrarySortLabel", () => {
  it("returns the quiet label for each supported library sort option", () => {
    expect(getLibrarySortLabel("recently-opened")).toBe("Recently opened");
    expect(getLibrarySortLabel("created-date")).toBe("Created date");
    expect(getLibrarySortLabel("progress")).toBe("Progress");
  });
});
