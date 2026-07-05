import type { AnalysisRepository, WorkoutAnalysisCreateInput, WorkoutAnalysisRecord } from "@rpeak/domain";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

const store = new Map<string, WorkoutAnalysisRecord>();

export class DemoAnalysisRepository implements AnalysisRepository {
  async getByWorkoutId(workoutId: string, userId: string): Promise<WorkoutAnalysisRecord | null> {
    const record = store.get(workoutId);
    if (!record || record.userId !== userId) return null;
    return clone(record);
  }

  async upsert(userId: string, input: WorkoutAnalysisCreateInput): Promise<WorkoutAnalysisRecord> {
    const existing = store.get(input.workoutId);
    const record: WorkoutAnalysisRecord = {
      id: existing?.id ?? crypto.randomUUID(),
      workoutId: input.workoutId,
      userId,
      model: input.model,
      summary: input.summary,
      highlights: input.highlights,
      suggestions: input.suggestions,
      riskFlags: input.riskFlags,
      createdAt: new Date().toISOString(),
    };
    store.set(input.workoutId, record);
    return clone(record);
  }
}
