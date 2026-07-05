export interface StoredRestState {
  startedAt: string;
  totalSec: number;
}

export interface StoredPauseState {
  /** Marca de tiempo de la pausa actual, o null si el entrenamiento está en marcha. */
  pausedSince: string | null;
  /** Milisegundos ya acumulados en pausas anteriores (no cuenta la pausa en curso). */
  totalPausedMs: number;
}

export interface StoredExerciseSwap {
  planExerciseId: string;
  exerciseId: string;
}

function key(workoutId: string): string {
  return `rpeak:rest:${workoutId}`;
}

function pauseKey(workoutId: string): string {
  return `rpeak:pause:${workoutId}`;
}

function swapsKey(workoutId: string): string {
  return `rpeak:swaps:${workoutId}`;
}

/**
 * Persistencia local de los ejercicios reemplazados durante el entrenamiento, para
 * poder seguir ofreciendo actualizar el plan al finalizar aunque se recargue la app.
 */
export function saveSwapsState(workoutId: string, swaps: StoredExerciseSwap[]): void {
  if (typeof window === "undefined") return;
  if (swaps.length > 0) window.localStorage.setItem(swapsKey(workoutId), JSON.stringify(swaps));
  else window.localStorage.removeItem(swapsKey(workoutId));
}

export function loadSwapsState(workoutId: string): StoredExerciseSwap[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(swapsKey(workoutId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredExerciseSwap[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Persistencia local de la pausa en curso, para sobrevivir a cerrar/reabrir la app. */
export function savePauseState(workoutId: string, state: StoredPauseState | null): void {
  if (typeof window === "undefined") return;
  if (state && (state.pausedSince !== null || state.totalPausedMs > 0)) window.localStorage.setItem(pauseKey(workoutId), JSON.stringify(state));
  else window.localStorage.removeItem(pauseKey(workoutId));
}

export function loadPauseState(workoutId: string): StoredPauseState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(pauseKey(workoutId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredPauseState;
    if (typeof parsed.totalPausedMs !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Persistencia local del descanso en curso, para sobrevivir a cerrar/reabrir la app. */
export function saveRestState(workoutId: string, state: StoredRestState | null): void {
  if (typeof window === "undefined") return;
  if (state) window.localStorage.setItem(key(workoutId), JSON.stringify(state));
  else window.localStorage.removeItem(key(workoutId));
}

export function loadRestState(workoutId: string): StoredRestState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key(workoutId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredRestState;
    if (typeof parsed.startedAt !== "string" || typeof parsed.totalSec !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}
