import type { ExerciseCategory, ExerciseEquipment, ExerciseLevel, ExerciseMuscle } from "@rpeak/domain";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { buttonClasses } from "@/components/ui/button";
import { CATEGORY_LABELS, EQUIPMENT_LABELS, LEVEL_LABELS, MUSCLE_LABELS } from "@/lib/exercise-labels";

const CATEGORIES = Object.keys(CATEGORY_LABELS) as ExerciseCategory[];
const EQUIPMENT = Object.keys(EQUIPMENT_LABELS) as ExerciseEquipment[];
const MUSCLES = Object.keys(MUSCLE_LABELS) as ExerciseMuscle[];
const LEVELS = Object.keys(LEVEL_LABELS) as ExerciseLevel[];

export function ExerciseFilters({
  action,
  defaultValues,
}: {
  action: string;
  defaultValues: { query?: string; category?: string; equipment?: string; muscle?: string; level?: string };
}) {
  return (
    <form action={action} method="get" className="flex flex-col gap-3">
      <Input type="search" name="q" placeholder="Buscar ejercicio…" defaultValue={defaultValues.query} aria-label="Buscar ejercicio" />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Select name="category" defaultValue={defaultValues.category ?? ""} aria-label="Categoría">
          <option value="">Categoría</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c]}
            </option>
          ))}
        </Select>
        <Select name="equipment" defaultValue={defaultValues.equipment ?? ""} aria-label="Equipo">
          <option value="">Equipo</option>
          {EQUIPMENT.map((e) => (
            <option key={e} value={e}>
              {EQUIPMENT_LABELS[e]}
            </option>
          ))}
        </Select>
        <Select name="muscle" defaultValue={defaultValues.muscle ?? ""} aria-label="Músculo">
          <option value="">Músculo</option>
          {MUSCLES.map((m) => (
            <option key={m} value={m}>
              {MUSCLE_LABELS[m]}
            </option>
          ))}
        </Select>
        <Select name="level" defaultValue={defaultValues.level ?? ""} aria-label="Nivel">
          <option value="">Nivel</option>
          {LEVELS.map((l) => (
            <option key={l} value={l}>
              {LEVEL_LABELS[l]}
            </option>
          ))}
        </Select>
      </div>
      <div className="flex gap-2">
        <button type="submit" className={buttonClasses("primary", "sm")}>
          Filtrar
        </button>
        <a href={action} className={buttonClasses("ghost", "sm")}>
          Limpiar
        </a>
      </div>
    </form>
  );
}
