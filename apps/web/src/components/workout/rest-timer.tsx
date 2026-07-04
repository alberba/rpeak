"use client";

import { computeRestTimerState } from "@rpeak/domain";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";

function formatMMSS(totalSeconds: number): string {
  const sign = totalSeconds < 0 ? "-" : "";
  const abs = Math.abs(totalSeconds);
  const m = Math.floor(abs / 60);
  const s = abs % 60;
  return `${sign}${m}:${String(s).padStart(2, "0")}`;
}

export function RestTimer({
  restStartedAt,
  restSeconds,
  onSkip,
  onAddSeconds,
}: {
  restStartedAt: string;
  restSeconds: number;
  onSkip: () => void;
  onAddSeconds: (seconds: number) => void;
}) {
  const [now, setNow] = useState(() => new Date().toISOString());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date().toISOString()), 250);
    return () => clearInterval(id);
  }, []);

  const state = computeRestTimerState({ restStartedAt, restSeconds, now });

  return (
    <div
      role="timer"
      aria-live="polite"
      className={cn(
        "flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-6",
        state.isDone && "border-primary/40",
      )}
    >
      <p className="text-sm font-medium text-muted-foreground">Descanso</p>
      <p
        className={cn(
          "font-mono text-5xl font-semibold tabular-nums",
          state.isDone ? "text-primary" : "text-primary",
        )}
      >
        {state.isDone ? "Listo" : formatMMSS(state.remainingSec)}
      </p>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" onClick={() => onAddSeconds(15)}>
          +15 s
        </Button>
        <Button variant="ghost" size="sm" onClick={onSkip}>
          Saltar descanso
        </Button>
      </div>
    </div>
  );
}
