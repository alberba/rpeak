"use client";

import { cn } from "@/lib/cn";

export function NumberStepper({
  label,
  value,
  onChange,
  step = 1,
  min = 0,
  max,
  suffix,
  id,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  max?: number;
  suffix?: string;
  id?: string;
}) {
  const clamp = (n: number) => {
    let next = Math.round(n / step) * step;
    if (next < min) next = min;
    if (max !== undefined && next > max) next = max;
    return next;
  };

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          aria-label={`Restar ${step}${suffix ?? ""} a ${label}`}
          onClick={() => onChange(clamp(value - step))}
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-lg font-medium",
            "hover:bg-primary/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          )}
        >
          −
        </button>
        <input
          id={id}
          type="number"
          inputMode="decimal"
          value={Number.isFinite(value) ? value : 0}
          step={step}
          min={min}
          max={max}
          onChange={(e) => {
            const parsed = Number(e.target.value);
            if (Number.isFinite(parsed)) onChange(clamp(parsed));
          }}
          className="h-9 w-full min-w-0 rounded-lg border border-border bg-card px-2 text-center font-mono text-base tabular-nums focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        />
        {suffix ? <span className="shrink-0 text-xs text-muted-foreground">{suffix}</span> : null}
        <button
          type="button"
          aria-label={`Sumar ${step}${suffix ?? ""} a ${label}`}
          onClick={() => onChange(clamp(value + step))}
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-lg font-medium",
            "hover:bg-primary/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          )}
        >
          +
        </button>
      </div>
    </div>
  );
}
