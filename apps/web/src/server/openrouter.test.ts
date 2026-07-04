import { afterEach, describe, expect, it, vi } from "vitest";
import { getAnalysisAvailability, isOpenRouterConfigured, parseAnalysisContent } from "./openrouter";

describe("isOpenRouterConfigured / getAnalysisAvailability", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("is unavailable without OPENROUTER_API_KEY", () => {
    vi.stubEnv("OPENROUTER_API_KEY", "");
    expect(isOpenRouterConfigured()).toBe(false);
    const availability = getAnalysisAvailability();
    expect(availability.available).toBe(false);
    expect(availability.model).toBeNull();
    expect(availability.reason).toMatch(/OPENROUTER_API_KEY/);
  });

  it("is available once OPENROUTER_API_KEY is set, defaulting the model", () => {
    vi.stubEnv("OPENROUTER_API_KEY", "sk-test");
    vi.stubEnv("OPENROUTER_MODEL", "");
    expect(isOpenRouterConfigured()).toBe(true);
    const availability = getAnalysisAvailability();
    expect(availability).toEqual({ available: true, reason: null, model: "openrouter/free" });
  });

  it("uses OPENROUTER_MODEL when set", () => {
    vi.stubEnv("OPENROUTER_API_KEY", "sk-test");
    vi.stubEnv("OPENROUTER_MODEL", "anthropic/claude-3.5-haiku");
    expect(getAnalysisAvailability().model).toBe("anthropic/claude-3.5-haiku");
  });
});

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
