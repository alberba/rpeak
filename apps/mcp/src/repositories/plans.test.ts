import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { PlanCreateInput } from "@rpeak/domain";
import { createPlan } from "./plans";

const input: PlanCreateInput = {
  name: "Full body básico",
  description: "Plan de prueba",
  blocks: [
    {
      type: "single",
      id: "bloque-1",
      exercise: {
        id: "ejercicio-plan-1",
        exerciseId: "sentadilla-inventada",
        notes: "",
        restBetweenSetsSec: 90,
        sets: [
          {
            id: "serie-1",
            kind: "reps",
            reps: { min: 8, max: 12 },
            durationSec: null,
            weight: 0,
            targetRpe: 7,
          },
        ],
      },
    },
  ],
};

describe("createPlan", () => {
  it("rechaza IDs de ejercicios que no pertenecen al catálogo", async () => {
    const orFilter = vi.fn().mockResolvedValue({ data: [], error: null });
    const inFilter = vi.fn().mockReturnValue({ or: orFilter });
    const from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({ in: inFilter }),
    });

    await expect(createPlan({ from } as unknown as SupabaseClient, "usuario-1", input)).rejects.toThrow(
      /sentadilla-inventada.*inglés.*pregunta al usuario/,
    );
    expect(from).toHaveBeenCalledOnce();
    expect(from).toHaveBeenCalledWith("exercises");
    expect(inFilter).toHaveBeenCalledWith("id", ["sentadilla-inventada"]);
    expect(orFilter).toHaveBeenCalledWith("user_id.is.null,user_id.eq.usuario-1");
  });
});
