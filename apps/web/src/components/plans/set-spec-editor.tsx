"use client";

import type { PlanSetSpec } from "@rpeak/domain";
import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createSetSpec } from "@/lib/plan-defaults";

export function SetSpecEditor({
  spec,
  index,
  onChange,
  onRemove,
  canRemove,
}: {
  spec: PlanSetSpec;
  index: number;
  onChange: (next: PlanSetSpec) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border p-2.5">
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs font-semibold text-muted-foreground">Serie {index + 1}</p>
        <div className="flex items-center gap-2">
          <div className="flex overflow-hidden rounded-md border border-border text-xs">
            <button
              type="button"
              onClick={() => spec.kind !== "reps" && onChange(createSetSpec("reps", spec))}
              className={`px-2 py-1 ${spec.kind === "reps" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"}`}
            >
              Reps
            </button>
            <button
              type="button"
              onClick={() => spec.kind !== "time" && onChange(createSetSpec("time", spec))}
              className={`px-2 py-1 ${spec.kind === "time" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"}`}
            >
              Tiempo
            </button>
          </div>
          {canRemove ? (
            <Button type="button" variant="ghost" size="sm" onClick={onRemove} aria-label={`Quitar serie ${index + 1}`}>
              ✕
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {spec.kind === "reps" ? (
          <>
            <Field label="Reps mín.">
              <Input
                type="number"
                min={0}
                value={spec.reps?.min ?? 0}
                onChange={(e) => onChange({ ...spec, reps: { min: Number(e.target.value) || 0, max: spec.reps?.max ?? 0 } })}
              />
            </Field>
            <Field label="Reps máx.">
              <Input
                type="number"
                min={0}
                value={spec.reps?.max ?? 0}
                onChange={(e) => onChange({ ...spec, reps: { min: spec.reps?.min ?? 0, max: Number(e.target.value) || 0 } })}
              />
            </Field>
          </>
        ) : (
          <>
            <Field label="Seg. mín.">
              <Input
                type="number"
                min={0}
                value={spec.durationSec?.min ?? 0}
                onChange={(e) =>
                  onChange({ ...spec, durationSec: { min: Number(e.target.value) || 0, max: spec.durationSec?.max ?? 0 } })
                }
              />
            </Field>
            <Field label="Seg. máx.">
              <Input
                type="number"
                min={0}
                value={spec.durationSec?.max ?? 0}
                onChange={(e) =>
                  onChange({ ...spec, durationSec: { min: spec.durationSec?.min ?? 0, max: Number(e.target.value) || 0 } })
                }
              />
            </Field>
          </>
        )}
        <Field label="Peso (kg)">
          <Input
            type="number"
            min={0}
            step={0.5}
            value={spec.weight}
            onChange={(e) => onChange({ ...spec, weight: Number(e.target.value) || 0 })}
          />
        </Field>
        <Field label="RPE objetivo">
          <Input
            type="number"
            min={1}
            max={10}
            step={0.5}
            value={spec.targetRpe ?? ""}
            placeholder="—"
            onChange={(e) => {
              const raw = e.target.value;
              onChange({ ...spec, targetRpe: raw === "" ? null : Number(raw) });
            }}
          />
        </Field>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
