import { describe, expect, it } from "vitest";
import { parseAnalysisContent } from "./openrouter";

describe("parseAnalysisContent", () => {
  it("parses plain JSON content", () => {
    const content = JSON.stringify({
      summary: "Buena sesión",
      highlights: ["RPE controlado"],
      suggestions: ["Sube 2kg la próxima vez"],
      riskFlags: [],
    });
    expect(parseAnalysisContent(content)).toEqual({
      summary: "Buena sesión",
      highlights: ["RPE controlado"],
      suggestions: ["Sube 2kg la próxima vez"],
      riskFlags: [],
    });
  });

  it("strips a markdown json code fence some models add anyway", () => {
    const content = "```json\n" + JSON.stringify({ summary: "ok" }) + "\n```";
    expect(parseAnalysisContent(content)).toEqual({ summary: "ok", highlights: [], suggestions: [], riskFlags: [] });
  });

  it("throws ApiError(502) on invalid JSON", () => {
    expect(() => parseAnalysisContent("not json at all")).toThrow(/JSON válido/);
  });

  it("throws ApiError(502) when the shape doesn't match WorkoutAnalysisResultSchema", () => {
    expect(() => parseAnalysisContent(JSON.stringify({ summary: 123 }))).toThrow(/formato esperado/);
  });
});
