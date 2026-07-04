"use client";

import { useEffect, useRef, useState } from "react";
import type { Range, SetKind } from "@rpeak/domain";
import { formatSeconds } from "@/lib/format";

export interface SetEntryValue {
  weight: number;
  actualReps: number | null;
  actualDurationSec: number | null;
  rpe: number | null;
}

export function SetEntryCard({
  setNumber,
  kind,
  targetReps,
  targetDurationSec,
  initialWeight,
  initialActualReps,
  initialActualDurationSec,
  initialRpe,
  onComplete,
  disabled,
}: {
  setNumber: number;
  kind: SetKind;
  targetReps: Range | null;
  targetDurationSec: Range | null;
  initialWeight: number;
  initialActualReps: number | null;
  initialActualDurationSec: number | null;
  initialRpe: number | null;
  onComplete: (value: SetEntryValue) => void;
  disabled?: boolean;
}) {
  const [weight, setWeight] = useState(initialWeight);
  const [reps, setReps] = useState(initialActualReps ?? targetReps?.max ?? targetReps?.min ?? 0);
  const [durationSec, setDurationSec] = useState(initialActualDurationSec ?? targetDurationSec?.min ?? 30);
  const [rpe, setRpe] = useState<number | null>(initialRpe);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => setDurationSec((s) => s + 1), 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const complete = () => {
    setRunning(false);
    onComplete({ weight, actualReps: kind === "reps" ? reps : null, actualDurationSec: kind === "time" ? durationSec : null, rpe });
  };

  return (
    <div className="grid grid-cols-[2.25rem_1fr_1fr_3.5rem_2.75rem] items-center gap-2 border-t border-border bg-primary/10 px-3 py-2.5">
      <span className="font-mono text-sm font-semibold text-primary">{setNumber}</span>
      <label>
        <span className="sr-only">Peso de la serie {setNumber}</span>
        <input className="h-10 w-full rounded-lg border border-border bg-card px-2 text-center font-mono text-sm" type="number" min={0} step={2.5} value={weight} onChange={(e) => setWeight(Number(e.target.value))} />
      </label>
      {kind === "reps" ? (
        <label>
          <span className="sr-only">Repeticiones de la serie {setNumber}</span>
          <input className="h-10 w-full rounded-lg border border-border bg-card px-2 text-center font-mono text-sm" type="number" min={0} value={reps} onChange={(e) => setReps(Number(e.target.value))} />
        </label>
      ) : (
        <button type="button" onClick={() => setRunning((value) => !value)} className="h-10 rounded-lg border border-border bg-card font-mono text-xs">
          {running ? "Pausa" : formatSeconds(durationSec)}
        </button>
      )}
      <label>
        <span className="sr-only">RPE de la serie {setNumber}</span>
        <select className="h-10 w-full rounded-lg border border-border bg-card px-1 text-center text-xs" value={rpe ?? ""} onChange={(e) => setRpe(e.target.value ? Number(e.target.value) : null)}>
          <option value="">—</option>{[6, 7, 7.5, 8, 8.5, 9, 9.5, 10].map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
      </label>
      <button type="button" disabled={disabled} onClick={complete} aria-label={`Completar serie ${setNumber}`} className="flex size-10 items-center justify-center rounded-lg bg-primary text-lg text-white transition-transform active:scale-95 disabled:opacity-40">✓</button>
    </div>
  );
}
