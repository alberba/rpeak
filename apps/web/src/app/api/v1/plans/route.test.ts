import { describe, expect, it } from "vitest";
import { GET, POST } from "./route";

const validPlanBody = {
  name: "Plan de test",
  description: "",
  blocks: [
    {
      type: "single",
      id: "block-1",
      exercise: {
        id: "pe-1",
        exerciseId: "barbell-squat",
        notes: "",
        restBetweenSetsSec: 90,
        sets: [{ id: "set-1", kind: "reps", reps: { min: 8, max: 10 }, durationSec: null, weight: 40, targetRpe: null }],
      },
    },
  ],
};

describe("GET /api/v1/plans (modo demo)", () => {
  it("returns the demo user's seeded plans", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const plans = await res.json();
    expect(Array.isArray(plans)).toBe(true);
    expect(plans.some((p: { id: string }) => p.id === "demo-plan-fullbody")).toBe(true);
  });
});

describe("POST /api/v1/plans (modo demo)", () => {
  it("creates a plan and returns 201 with the persisted shape", async () => {
    const request = new Request("http://localhost/api/v1/plans", { method: "POST", body: JSON.stringify(validPlanBody) });
    const res = await POST(request);
    expect(res.status).toBe(201);
    const created = await res.json();
    expect(created.name).toBe("Plan de test");
    expect(created.id).toEqual(expect.any(String));
    expect(created.userId).toBe("demo-user");

    const list = await (await GET()).json();
    expect(list.some((p: { id: string }) => p.id === created.id)).toBe(true);
  });

  it("rejects an invalid body with 400", async () => {
    const request = new Request("http://localhost/api/v1/plans", { method: "POST", body: JSON.stringify({ name: "" }) });
    const res = await POST(request);
    expect(res.status).toBe(400);
  });
});
