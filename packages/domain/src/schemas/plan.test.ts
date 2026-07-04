import { describe, expect, it } from "vitest";
import { PlanSetSpecSchema } from "./plan";

describe("PlanSetSpecSchema", () => {
  const base = { id: "s1", weight: 20, targetRpe: null };

  it("accepts a reps-kind set with reps and no duration", () => {
    const result = PlanSetSpecSchema.safeParse({ ...base, kind: "reps", reps: { min: 8, max: 12 }, durationSec: null });
    expect(result.success).toBe(true);
  });

  it("accepts a time-kind set with duration and no reps", () => {
    const result = PlanSetSpecSchema.safeParse({ ...base, kind: "time", reps: null, durationSec: { min: 30, max: 45 } });
    expect(result.success).toBe(true);
  });

  it("rejects a reps-kind set that also carries a duration", () => {
    const result = PlanSetSpecSchema.safeParse({
      ...base,
      kind: "reps",
      reps: { min: 8, max: 12 },
      durationSec: { min: 30, max: 45 },
    });
    expect(result.success).toBe(false);
  });

  it("rejects a reps-kind set missing reps", () => {
    const result = PlanSetSpecSchema.safeParse({ ...base, kind: "reps", reps: null, durationSec: null });
    expect(result.success).toBe(false);
  });

  it("accepts weight 0 as bodyweight", () => {
    const result = PlanSetSpecSchema.safeParse({
      id: "s1",
      weight: 0,
      targetRpe: 8.5,
      kind: "reps",
      reps: { min: 10, max: 15 },
      durationSec: null,
    });
    expect(result.success).toBe(true);
  });
});
