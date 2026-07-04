"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { PlanCreateInputSchema, type Exercise, type PlanBlock, type PlanCreateInput, type PlanExercise } from "@rpeak/domain";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { ExercisePicker } from "@/components/plans/exercise-picker";
import { ExerciseBlockEditor } from "@/components/plans/exercise-block-editor";
import { createExercise, createSingleBlock, createSupersetBlock } from "@/lib/plan-defaults";

type ExerciseMap = Record<string, Pick<Exercise, "id" | "name">>;

type PickerTarget = { kind: "new-single" } | { kind: "new-superset" } | { kind: "add-to-superset"; blockId: string };

export interface PlanFormValues {
  name: string;
  description: string;
  blocks: PlanBlock[];
}

export function PlanForm({
  initialValues,
  initialExercises,
  onSave,
  onDelete,
  submitLabel,
}: {
  initialValues: PlanFormValues;
  initialExercises: ExerciseMap;
  onSave: (input: PlanCreateInput) => Promise<void>;
  onDelete?: () => Promise<void>;
  submitLabel: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialValues.name);
  const [description, setDescription] = useState(initialValues.description);
  const [blocks, setBlocks] = useState<PlanBlock[]>(initialValues.blocks);
  const [exerciseMap, setExerciseMap] = useState<ExerciseMap>(initialExercises);
  const [pickerTarget, setPickerTarget] = useState<PickerTarget | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function rememberExercise(exercise: Exercise) {
    setExerciseMap((prev) => ({ ...prev, [exercise.id]: { id: exercise.id, name: exercise.name } }));
  }

  function handlePick(exercise: Exercise) {
    rememberExercise(exercise);
    if (pickerTarget?.kind === "new-single") {
      setBlocks((prev) => [...prev, createSingleBlock(exercise.id)]);
    } else if (pickerTarget?.kind === "new-superset") {
      setBlocks((prev) => [...prev, createSupersetBlock(exercise.id)]);
    } else if (pickerTarget?.kind === "add-to-superset") {
      setBlocks((prev) =>
        prev.map((block) =>
          block.type === "superset" && block.id === pickerTarget.blockId
            ? { ...block, exercises: [...block.exercises, createExercise(exercise.id)] }
            : block,
        ),
      );
    }
    setPickerTarget(null);
  }

  function moveBlock(index: number, direction: -1 | 1) {
    setBlocks((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      const [item] = next.splice(index, 1);
      if (!item) return prev;
      next.splice(target, 0, item);
      return next;
    });
  }

  function removeBlock(index: number) {
    setBlocks((prev) => prev.filter((_, i) => i !== index));
  }

  function updateBlock(index: number, next: PlanBlock) {
    setBlocks((prev) => prev.map((b, i) => (i === index ? next : b)));
  }

  function exerciseName(exerciseId: string): string {
    return exerciseMap[exerciseId]?.name ?? "Ejercicio";
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const invalidSuperset = blocks.some((b) => b.type === "superset" && b.exercises.length < 2);
    if (invalidSuperset) {
      setError("Cada superserie necesita al menos 2 ejercicios. Añade otro o elimina el bloque.");
      return;
    }

    const candidate: PlanCreateInput = { name, description, blocks };
    const parsed = PlanCreateInputSchema.safeParse(candidate);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Revisa los datos del plan.");
      return;
    }

    startTransition(async () => {
      try {
        await onSave(parsed.data);
      } catch {
        setError("No se pudo guardar el plan. Inténtalo de nuevo.");
      }
    });
  }

  function handleDelete() {
    if (!onDelete) return;
    if (!window.confirm("¿Eliminar este plan? Esta acción no se puede deshacer.")) return;
    startTransition(async () => {
      try {
        await onDelete();
      } catch {
        setError("No se pudo eliminar el plan.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 pb-10">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Nombre del plan</span>
        <Input value={name} onChange={(e) => setName(e.target.value)} required maxLength={120} placeholder="Ej. Full body — Lunes" />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Descripción</span>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={2000} rows={2} placeholder="Notas generales del plan (opcional)" />
      </label>

      <div className="flex flex-col gap-3">
        <h2 className="font-display text-lg font-semibold">Bloques</h2>

        {blocks.length === 0 ? <p className="text-sm text-muted-foreground">Añade tu primer ejercicio para empezar a construir el plan.</p> : null}

        {blocks.map((block, index) => (
          <Surface key={block.id} className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {block.type === "single" ? "Ejercicio" : "Superserie"}
              </p>
              <div className="flex items-center gap-1">
                <Button type="button" variant="ghost" size="sm" onClick={() => moveBlock(index, -1)} disabled={index === 0} aria-label="Subir bloque">
                  ↑
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => moveBlock(index, 1)}
                  disabled={index === blocks.length - 1}
                  aria-label="Bajar bloque"
                >
                  ↓
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => removeBlock(index)}>
                  Eliminar bloque
                </Button>
              </div>
            </div>

            {block.type === "single" ? (
              <ExerciseBlockEditor
                exercise={block.exercise}
                exerciseName={exerciseName(block.exercise.exerciseId)}
                showRestBetweenSets
                onChange={(next: PlanExercise) => updateBlock(index, { ...block, exercise: next })}
              />
            ) : (
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-muted-foreground">Descanso entre ejercicios (s)</span>
                    <Input
                      type="number"
                      min={0}
                      value={block.restBetweenExercisesSec}
                      onChange={(e) => updateBlock(index, { ...block, restBetweenExercisesSec: Number(e.target.value) || 0 })}
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-muted-foreground">Descanso entre rondas (s)</span>
                    <Input
                      type="number"
                      min={0}
                      value={block.restBetweenRoundsSec}
                      onChange={(e) => updateBlock(index, { ...block, restBetweenRoundsSec: Number(e.target.value) || 0 })}
                    />
                  </label>
                </div>

                {block.exercises.map((exercise, exIndex) => (
                  <ExerciseBlockEditor
                    key={exercise.id}
                    exercise={exercise}
                    exerciseName={exerciseName(exercise.exerciseId)}
                    showRestBetweenSets={false}
                    onRemove={
                      block.exercises.length > 2
                        ? () => updateBlock(index, { ...block, exercises: block.exercises.filter((_, i) => i !== exIndex) })
                        : undefined
                    }
                    onChange={(next) =>
                      updateBlock(index, {
                        ...block,
                        exercises: block.exercises.map((ex, i) => (i === exIndex ? next : ex)),
                      })
                    }
                  />
                ))}

                <Button type="button" variant="secondary" size="sm" onClick={() => setPickerTarget({ kind: "add-to-superset", blockId: block.id })}>
                  + Añadir ejercicio a la superserie
                </Button>
              </div>
            )}
          </Surface>
        ))}

        {pickerTarget ? (
          <ExercisePicker onSelect={handlePick} onClose={() => setPickerTarget(null)} />
        ) : (
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={() => setPickerTarget({ kind: "new-single" })}>
              + Ejercicio individual
            </Button>
            <Button type="button" variant="secondary" onClick={() => setPickerTarget({ kind: "new-superset" })}>
              + Superserie
            </Button>
          </div>
        )}
      </div>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Guardando…" : submitLabel}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Cancelar
        </Button>
        {onDelete ? (
          <Button type="button" variant="danger" className="ml-auto" onClick={handleDelete} disabled={isPending}>
            Eliminar plan
          </Button>
        ) : null}
      </div>
    </form>
  );
}
