"use client";

import { cn } from "@/lib/cn";

const QUICK_VALUES = [6, 7, 8, 9, 10];

export function RpePicker({ value, onChange }: { value: number | null; onChange: (value: number | null) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted">RPE (esfuerzo percibido)</span>
        <span className="font-mono text-sm font-semibold text-brand-strong">{value === null ? "—" : value}</span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        step={0.5}
        value={value ?? 7}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label="RPE, de 1 a 10"
        aria-valuetext={value === null ? "sin definir" : String(value)}
        className="w-full accent-[var(--color-brand)]"
      />
      <div className="flex flex-wrap gap-1.5">
        {QUICK_VALUES.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={cn(
              "rounded-full border px-2.5 py-1 font-mono text-xs",
              value === v ? "border-brand bg-brand text-white" : "border-border bg-surface text-muted hover:border-brand",
            )}
          >
            {v}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onChange(null)}
          className={cn(
            "rounded-full border px-2.5 py-1 text-xs",
            value === null ? "border-accent bg-accent-tint text-accent-strong" : "border-border bg-surface text-muted",
          )}
        >
          Sin RPE
        </button>
      </div>
    </div>
  );
}
