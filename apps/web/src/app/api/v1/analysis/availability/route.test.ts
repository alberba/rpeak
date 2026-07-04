import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

describe("GET /api/v1/analysis/availability", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("reports unavailable when OPENROUTER_API_KEY is not set", async () => {
    vi.stubEnv("OPENROUTER_API_KEY", "");
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      available: false,
      reason: "Falta configurar OPENROUTER_API_KEY en el servidor",
      model: null,
    });
  });

  it("reports available with the configured model", async () => {
    vi.stubEnv("OPENROUTER_API_KEY", "sk-test");
    vi.stubEnv("OPENROUTER_MODEL", "openai/gpt-4o-mini");
    const res = await GET();
    expect(await res.json()).toEqual({ available: true, reason: null, model: "openai/gpt-4o-mini" });
  });
});
