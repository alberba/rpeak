/**
 * Cálculo puro del temporizador de descanso. Se basa en marcas de tiempo reales
 * (completedAt de la serie anterior) en lugar de un contador manual, para que el
 * descanso se pueda reanudar tras cerrar/reabrir la app.
 */
export interface RestTimerState {
  /** Segundos de descanso objetivo. */
  totalSec: number;
  /** Segundos restantes (puede ser negativo si ya se cumplió el descanso). */
  remainingSec: number;
  /** true si el descanso ya se completó. */
  isDone: boolean;
}

export function computeRestTimerState(params: { restStartedAt: string; restSeconds: number; now: string }): RestTimerState {
  const { restStartedAt, restSeconds, now } = params;
  const elapsedMs = new Date(now).getTime() - new Date(restStartedAt).getTime();
  const elapsedSec = Math.max(0, Math.floor(elapsedMs / 1000));
  const remainingSec = restSeconds - elapsedSec;
  return {
    totalSec: restSeconds,
    remainingSec,
    isDone: remainingSec <= 0,
  };
}

export type RestContext =
  | { kind: "between-sets"; restBetweenSetsSec: number }
  | { kind: "between-exercises"; restBetweenExercisesSec: number }
  | { kind: "between-rounds"; restBetweenRoundsSec: number }
  | { kind: "none" };

export function restDurationFor(context: RestContext): number {
  switch (context.kind) {
    case "between-sets":
      return context.restBetweenSetsSec;
    case "between-exercises":
      return context.restBetweenExercisesSec;
    case "between-rounds":
      return context.restBetweenRoundsSec;
    case "none":
      return 0;
  }
}
