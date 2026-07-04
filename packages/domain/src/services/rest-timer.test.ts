import { describe, expect, it } from "vitest";
import { computeRestTimerState, restDurationFor } from "./rest-timer";

describe("computeRestTimerState", () => {
  it("counts down remaining seconds from a real timestamp", () => {
    const state = computeRestTimerState({
      restStartedAt: "2026-01-01T00:00:00.000Z",
      restSeconds: 90,
      now: "2026-01-01T00:00:30.000Z",
    });
    expect(state.remainingSec).toBe(60);
    expect(state.isDone).toBe(false);
  });

  it("marks as done once elapsed time passes the target", () => {
    const state = computeRestTimerState({
      restStartedAt: "2026-01-01T00:00:00.000Z",
      restSeconds: 30,
      now: "2026-01-01T00:01:00.000Z",
    });
    expect(state.isDone).toBe(true);
    expect(state.remainingSec).toBeLessThanOrEqual(0);
  });
});

describe("restDurationFor", () => {
  it("resolves the correct field for each rest kind", () => {
    expect(restDurationFor({ kind: "between-sets", restBetweenSetsSec: 90 })).toBe(90);
    expect(restDurationFor({ kind: "between-exercises", restBetweenExercisesSec: 15 })).toBe(15);
    expect(restDurationFor({ kind: "between-rounds", restBetweenRoundsSec: 60 })).toBe(60);
    expect(restDurationFor({ kind: "none" })).toBe(0);
  });
});
