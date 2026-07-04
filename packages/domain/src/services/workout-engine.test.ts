import { describe, expect, it } from "vitest";
import type { WorkoutSession, WorkoutSet } from "../schemas/workout";
import { findNextPointer, isWorkoutComplete, restContextAfterCompleting } from "./workout-engine";

function set(overrides: Partial<WorkoutSet> = {}): WorkoutSet {
  return {
    id: crypto.randomUUID(),
    planSetId: null,
    kind: "reps",
    targetReps: { min: 8, max: 12 },
    targetDurationSec: null,
    weight: 20,
    actualReps: null,
    actualDurationSec: null,
    rpe: null,
    completed: false,
    startedAt: null,
    completedAt: null,
    ...overrides,
  };
}

function baseSession(blocks: WorkoutSession["blocks"]): Pick<WorkoutSession, "blocks"> {
  return { blocks };
}

describe("findNextPointer / single block", () => {
  it("points to the first incomplete set", () => {
    const session = baseSession([
      {
        type: "single",
        id: "b1",
        exercise: {
          id: "e1",
          planExerciseId: null,
          exerciseId: "squat",
          notes: "",
          restBetweenSetsSec: 90,
          sets: [set({ completed: true }), set(), set()],
        },
      },
    ]);
    expect(findNextPointer(session)).toEqual({ blockIndex: 0, exerciseIndexInBlock: 0, setIndex: 1 });
  });

  it("returns null when everything is complete", () => {
    const session = baseSession([
      {
        type: "single",
        id: "b1",
        exercise: {
          id: "e1",
          planExerciseId: null,
          exerciseId: "squat",
          notes: "",
          restBetweenSetsSec: 90,
          sets: [set({ completed: true }), set({ completed: true })],
        },
      },
    ]);
    expect(findNextPointer(session)).toBeNull();
    expect(isWorkoutComplete(session)).toBe(true);
  });

  it("rest between sets applies within the same exercise", () => {
    const session = baseSession([
      {
        type: "single",
        id: "b1",
        exercise: {
          id: "e1",
          planExerciseId: null,
          exerciseId: "squat",
          notes: "",
          restBetweenSetsSec: 90,
          sets: [set(), set(), set()],
        },
      },
    ]);
    const pointer = findNextPointer(session)!;
    session.blocks[0]!.type === "single" && (session.blocks[0]!.exercise.sets[0]!.completed = true);
    expect(restContextAfterCompleting(session, pointer)).toEqual({ kind: "between-sets", restBetweenSetsSec: 90 });
  });
});

describe("findNextPointer / superset block, round-robin order", () => {
  function supersetSession(): Pick<WorkoutSession, "blocks"> {
    return baseSession([
      {
        type: "superset",
        id: "b1",
        restBetweenExercisesSec: 15,
        restBetweenRoundsSec: 60,
        exercises: [
          { id: "e1", planExerciseId: null, exerciseId: "bench", notes: "", restBetweenSetsSec: 0, sets: [set(), set()] },
          { id: "e2", planExerciseId: null, exerciseId: "row", notes: "", restBetweenSetsSec: 0, sets: [set(), set()] },
        ],
      },
    ]);
  }

  it("visits round 0 of both exercises before round 1", () => {
    const session = supersetSession();
    expect(findNextPointer(session)).toEqual({ blockIndex: 0, exerciseIndexInBlock: 0, setIndex: 0 });

    (session.blocks[0] as any).exercises[0].sets[0].completed = true;
    expect(findNextPointer(session)).toEqual({ blockIndex: 0, exerciseIndexInBlock: 1, setIndex: 0 });
  });

  it("uses between-exercises rest inside a round, between-rounds rest across rounds", () => {
    const session = supersetSession();
    const p1 = findNextPointer(session)!;
    (session.blocks[0] as any).exercises[0].sets[0].completed = true;
    expect(restContextAfterCompleting(session, p1)).toEqual({ kind: "between-exercises", restBetweenExercisesSec: 15 });

    const p2 = findNextPointer(session)!;
    (session.blocks[0] as any).exercises[1].sets[0].completed = true;
    expect(restContextAfterCompleting(session, p2)).toEqual({ kind: "between-rounds", restBetweenRoundsSec: 60 });
  });

  it("returns none rest context after the very last set", () => {
    const session = supersetSession();
    for (const exercise of (session.blocks[0] as any).exercises) {
      for (const s of exercise.sets) s.completed = true;
    }
    const lastPointer = { blockIndex: 0, exerciseIndexInBlock: 1, setIndex: 1 };
    expect(restContextAfterCompleting(session, lastPointer)).toEqual({ kind: "none" });
    expect(isWorkoutComplete(session)).toBe(true);
  });
});
