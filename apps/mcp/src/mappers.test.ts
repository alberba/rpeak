import { describe, expect, it } from "vitest";
import { planFromRow, workoutFromRow, type PlanRow, type WorkoutSessionRow } from "./mappers";

describe("planFromRow", () => {
  it("maps a DB row (snake_case) to the domain Plan shape", () => {
    const row: PlanRow = {
      id: "plan-1",
      user_id: "user-1",
      name: "Full body",
      description: "",
      blocks: [],
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
    };
    expect(planFromRow(row)).toEqual({
      id: "plan-1",
      userId: "user-1",
      name: "Full body",
      description: "",
      blocks: [],
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
  });

  it("rejects a row with malformed blocks (defense in depth vs a corrupted DB row)", () => {
    const row = {
      id: "plan-1",
      user_id: "user-1",
      name: "Full body",
      description: "",
      blocks: [{ type: "not-a-real-type" }],
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
    } as PlanRow;
    expect(() => planFromRow(row)).toThrow();
  });
});

describe("workoutFromRow", () => {
  it("maps a DB row (snake_case) to the domain WorkoutSession shape", () => {
    const row: WorkoutSessionRow = {
      id: "workout-1",
      user_id: "user-1",
      plan_id: null,
      name: "Libre",
      notes: "",
      blocks: [],
      started_at: "2026-01-01T10:00:00.000Z",
      finished_at: null,
    };
    expect(workoutFromRow(row)).toEqual({
      id: "workout-1",
      userId: "user-1",
      planId: null,
      name: "Libre",
      notes: "",
      blocks: [],
      startedAt: "2026-01-01T10:00:00.000Z",
      finishedAt: null,
    });
  });
});
