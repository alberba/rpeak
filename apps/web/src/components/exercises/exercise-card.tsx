import Link from "next/link";
import type { Exercise } from "@rpeak/domain";
import { Surface } from "@/components/ui/surface";
import { Badge } from "@/components/ui/badge";
import { CATEGORY_LABELS, EQUIPMENT_LABELS, LEVEL_LABELS, MUSCLE_LABELS } from "@/lib/exercise-labels";

export function ExerciseCard({ exercise, href }: { exercise: Exercise; href: string }) {
  return (
    <li>
      <Link href={href} className="block">
        <Surface className="flex flex-col gap-2 transition-colors hover:border-brand">
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium">{exercise.name}</p>
            <Badge tone="neutral">{LEVEL_LABELS[exercise.level]}</Badge>
          </div>
          <div className="flex flex-wrap gap-1.5 text-xs text-muted">
            <Badge tone="brand">{CATEGORY_LABELS[exercise.category]}</Badge>
            {exercise.equipment ? <Badge tone="neutral">{EQUIPMENT_LABELS[exercise.equipment]}</Badge> : null}
            {exercise.primaryMuscles.slice(0, 3).map((muscle) => (
              <Badge key={muscle} tone="neutral">
                {MUSCLE_LABELS[muscle]}
              </Badge>
            ))}
          </div>
        </Surface>
      </Link>
    </li>
  );
}
