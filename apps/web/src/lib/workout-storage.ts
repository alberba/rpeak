export interface StoredRestState {
  startedAt: string;
  totalSec: number;
}

function key(workoutId: string): string {
  return `rpeak:rest:${workoutId}`;
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
