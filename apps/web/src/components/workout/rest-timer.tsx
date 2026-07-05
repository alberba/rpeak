"use client";

import { computeRestTimerState } from "@rpeak/domain";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";

function formatMMSS(totalSeconds: number): string {
  const sign = totalSeconds < 0 ? "-" : "";
  const abs = Math.abs(totalSeconds);
  const m = Math.floor(abs / 60);
  const s = abs % 60;
  return `${sign}${m}:${String(s).padStart(2, "0")}`;
}

/** Timbre sintetizado con Web Audio, sin necesidad de cargar un archivo de sonido. */
function playBell(): void {
  if (typeof window === "undefined") return;
  const AudioContextCtor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextCtor) return;
  const ctx = new AudioContextCtor();
  const now = ctx.currentTime;
  [880, 1320].forEach((freq, index) => {
    const start = now + index * 0.18;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.35, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.35);
    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start(start);
    oscillator.stop(start + 0.4);
  });
  setTimeout(() => ctx.close(), 1200);
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
  // Si el descanso ya venía cumplido al montar (p. ej. recarga de la página), no sonar.
  const wasDoneRef = useRef(computeRestTimerState({ restStartedAt, restSeconds, now }).isDone);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date().toISOString()), 250);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    wasDoneRef.current = false;
  }, [restStartedAt, restSeconds]);

  const state = computeRestTimerState({ restStartedAt, restSeconds, now });

  useEffect(() => {
    if (state.isDone && !wasDoneRef.current) {
      wasDoneRef.current = true;
      playBell();
    }
  }, [state.isDone]);

  return (
    <div
      role="timer"
      aria-live="polite"
      className={cn(
        "fixed inset-x-0 bottom-[calc(3.75rem+env(safe-area-inset-bottom))] z-10 md:bottom-0",
        "mx-auto flex w-full max-w-2xl flex-col items-center gap-3 border-t border-border bg-card/95 px-4 py-4 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] backdrop-blur-md",
        state.isDone && "border-primary/40",
      )}
    >
      <p className="text-sm font-medium text-muted-foreground">Descanso</p>
      <p className="font-mono text-5xl font-semibold tabular-nums text-primary">
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
