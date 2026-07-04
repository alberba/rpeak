import type { Range } from "@rpeak/domain";

export function formatRange(range: Range | null): string {
  if (!range) return "—";
  if (range.min === range.max) return String(range.min);
  return `${range.min}-${range.max}`;
}

export function formatWeight(kg: number): string {
  if (kg === 0) return "Peso corporal";
  const rounded = Math.round(kg * 100) / 100;
  return `${rounded} kg`;
}

export function formatRpe(rpe: number | null): string {
  return rpe === null ? "—" : `RPE ${rpe}`;
}

export function formatSeconds(totalSeconds: number): string {
  const sign = totalSeconds < 0 ? "-" : "";
  const abs = Math.round(Math.abs(totalSeconds));
  const m = Math.floor(abs / 60);
  const s = abs % 60;
  if (m === 0) return `${sign}${s} s`;
  return `${sign}${m}:${String(s).padStart(2, "0")}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("es-ES", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function formatDurationBetween(startIso: string, endIso: string | null): string {
  const end = endIso ? new Date(endIso).getTime() : Date.now();
  const start = new Date(startIso).getTime();
  return formatSeconds(Math.max(0, Math.floor((end - start) / 1000)));
}

export function pluralize(count: number, singular: string, plural: string): string {
  return count === 1 ? `${count} ${singular}` : `${count} ${plural}`;
}
