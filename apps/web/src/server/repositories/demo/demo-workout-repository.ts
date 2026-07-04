import type { WorkoutCreateInput, WorkoutFilter, WorkoutRepository, WorkoutSession, WorkoutUpdateInput } from "@rpeak/domain";
import { seedWorkouts } from "./seed";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

const store = new Map<string, WorkoutSession>(seedWorkouts.map((w) => [w.id, clone(w)]));

export class DemoWorkoutRepository implements WorkoutRepository {
  async list(userId: string, filter?: WorkoutFilter): Promise<WorkoutSession[]> {
    let results = [...store.values()].filter((w) => w.userId === userId);
    if (filter?.planId) results = results.filter((w) => w.planId === filter.planId);
    if (filter?.from) results = results.filter((w) => w.startedAt >= filter.from!);
    if (filter?.to) results = results.filter((w) => w.startedAt <= filter.to!);
    results = results.sort((a, b) => b.startedAt.localeCompare(a.startedAt));
    const limit = filter?.limit ?? 50;
    return results.slice(0, limit).map(clone);
  }

  async getById(id: string, userId: string): Promise<WorkoutSession | null> {
    const session = store.get(id);
    if (!session || session.userId !== userId) return null;
    return clone(session);
  }

  async create(userId: string, input: WorkoutCreateInput): Promise<WorkoutSession> {
    const session: WorkoutSession = { ...clone(input), id: crypto.randomUUID(), userId };
    store.set(session.id, session);
    return clone(session);
  }

  async update(id: string, userId: string, input: WorkoutUpdateInput): Promise<WorkoutSession | null> {
    const existing = store.get(id);
    if (!existing || existing.userId !== userId) return null;
    const updated: WorkoutSession = { ...existing, ...clone(input), id, userId };
    store.set(id, updated);
    return clone(updated);
  }

  async remove(id: string, userId: string): Promise<boolean> {
    const existing = store.get(id);
    if (!existing || existing.userId !== userId) return false;
    return store.delete(id);
  }
}
