import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("GET /api/v1/workouts (modo demo)", () => {
  it("returns the demo user's seeded workouts", async () => {
    const res = await GET(new Request("http://localhost/api/v1/workouts"));
    expect(res.status).toBe(200);
    const workouts = await res.json();
    expect(Array.isArray(workouts)).toBe(true);
    expect(workouts.some((w: { id: string }) => w.id === "demo-workout-1")).toBe(true);
  });

  it("filters by planId", async () => {
    const res = await GET(new Request("http://localhost/api/v1/workouts?planId=demo-plan-superset"));
    const workouts = await res.json();
    expect(workouts.every((w: { planId: string }) => w.planId === "demo-plan-superset")).toBe(true);
    expect(workouts.length).toBeGreaterThan(0);
  });

  it("rejects an invalid limit with 400", async () => {
    const res = await GET(new Request("http://localhost/api/v1/workouts?limit=not-a-number"));
    expect(res.status).toBe(400);
  });
});
