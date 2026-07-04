"use client";

import type { PlanExercise } from "@rpeak/domain";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SetSpecEditor } from "@/components/plans/set-spec-editor";
import { createSetSpec } from "@/lib/plan-defaults";

export function ExerciseBlockEditor({
  exercise,
  exerciseName,
  onChange,
  onRemove,
  showRestBetweenSets,
}: {
  exercise: PlanExercise;
  exerciseName: string;
  onChange: (next: PlanExercise) => void;
  onRemove?: () => void;
  showRestBetweenSets: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg bg-primary/10 p-3">
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium">{exerciseName}</p>
        {onRemove ? (
          <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
            Quitar
          </Button>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {showRestBetweenSets ? (
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">Descanso entre series (s)</span>
            <Input
              type="number"
              min={0}
              value={exercise.restBetweenSetsSec}
              onChange={(e) => onChange({ ...exercise, restBetweenSetsSec: Number(e.target.value) || 0 })}
            />
          </label>
        ) : null}
        <label className="flex flex-col gap-1 sm:col-span-2">
          <span className="text-xs font-medium text-muted-foreground">Notas</span>
          <Textarea
            rows={2}
            value={exercise.notes}
            placeholder="Consejos, calentamiento, técnica…"
            onChange={(e) => onChange({ ...exercise, notes: e.target.value })}
          />
        </label>
      </div>

      <div className="flex flex-col gap-2">
        {exercise.sets.map((spec, index) => (
          <SetSpecEditor
            key={spec.id}
            spec={spec}
            index={index}
            canRemove={exercise.sets.length > 1}
            onChange={(next) => {
              const sets = [...exercise.sets];
              sets[index] = next;
              onChange({ ...exercise, sets });
            }}
            onRemove={() => onChange({ ...exercise, sets: exercise.sets.filter((_, i) => i !== index) })}
          />
        ))}
      </div>

      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => {
          const last = exercise.sets[exercise.sets.length - 1];
          onChange({ ...exercise, sets: [...exercise.sets, createSetSpec(last?.kind ?? "reps", last)] });
        }}
      >
        + Añadir serie
      </Button>
    </div>
  );
}
