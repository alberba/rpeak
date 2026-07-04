import type { Plan, PlanCreateInput, PlanRepository, PlanUpdateInput } from "@rpeak/domain";
import { DEMO_USER_ID, seedPlans } from "./seed";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

// Estado en memoria del proceso: suficiente para evaluar la app sin credenciales,
// pero no persiste entre despliegues/instancias. En producción se usa Supabase.
const store = new Map<string, Plan>(seedPlans.map((plan) => [plan.id, clone(plan)]));

export class DemoPlanRepository implements PlanRepository {
  async list(userId: string): Promise<Plan[]> {
    return [...store.values()].filter((p) => p.userId === userId).map(clone);
  }

  async getById(id: string, userId: string): Promise<Plan | null> {
    const plan = store.get(id);
    if (!plan || plan.userId !== userId) return null;
    return clone(plan);
  }

  async create(userId: string, input: PlanCreateInput): Promise<Plan> {
    const now = new Date().toISOString();
    const plan: Plan = { ...clone(input), id: crypto.randomUUID(), userId, createdAt: now, updatedAt: now };
    store.set(plan.id, plan);
    return clone(plan);
  }

  async update(id: string, userId: string, input: PlanUpdateInput): Promise<Plan | null> {
    const existing = store.get(id);
    if (!existing || existing.userId !== userId) return null;
    const updated: Plan = { ...existing, ...clone(input), id, userId, updatedAt: new Date().toISOString() };
    store.set(id, updated);
    return clone(updated);
  }

  async remove(id: string, userId: string): Promise<boolean> {
    const existing = store.get(id);
    if (!existing || existing.userId !== userId) return false;
    return store.delete(id);
  }
}

export const DEMO_PLAN_USER_ID = DEMO_USER_ID;
