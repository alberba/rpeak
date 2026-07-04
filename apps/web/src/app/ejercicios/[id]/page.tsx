import Link from "next/link";
import { notFound } from "next/navigation";
import { buildYoutubeSearchUrl } from "@rpeak/domain";
import { getRepositories } from "@/server/repositories";
import { Surface } from "@/components/ui/surface";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import {
  CATEGORY_LABELS,
  EQUIPMENT_LABELS,
  FORCE_LABELS,
  LEVEL_LABELS,
  MECHANIC_LABELS,
  MUSCLE_LABELS,
} from "@/lib/exercise-labels";

export default async function ExerciseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { exercises } = getRepositories();
  const exercise = await exercises.getById(id);
  if (!exercise) notFound();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 py-6 pb-10">
      <Link href="/ejercicios" className="text-sm font-medium text-primary hover:underline">
        ← Ejercicios
      </Link>

      <header className="flex flex-col gap-2">
        <h1 className="font-display text-2xl font-semibold">{exercise.name}</h1>
        <div className="flex flex-wrap gap-1.5">
          <Badge tone="brand">{CATEGORY_LABELS[exercise.category]}</Badge>
          <Badge tone="neutral">{LEVEL_LABELS[exercise.level]}</Badge>
          {exercise.equipment ? <Badge tone="neutral">{EQUIPMENT_LABELS[exercise.equipment]}</Badge> : null}
          {exercise.force ? <Badge tone="neutral">{FORCE_LABELS[exercise.force]}</Badge> : null}
          {exercise.mechanic ? <Badge tone="neutral">{MECHANIC_LABELS[exercise.mechanic]}</Badge> : null}
        </div>
      </header>

      <Surface className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-muted-foreground">Músculos principales</h2>
        <div className="flex flex-wrap gap-1.5">
          {exercise.primaryMuscles.map((m) => (
            <Badge key={m} tone="accent">
              {MUSCLE_LABELS[m]}
            </Badge>
          ))}
        </div>
        {exercise.secondaryMuscles.length > 0 ? (
          <>
            <h2 className="mt-2 text-sm font-semibold text-muted-foreground">Músculos secundarios</h2>
            <div className="flex flex-wrap gap-1.5">
              {exercise.secondaryMuscles.map((m) => (
                <Badge key={m} tone="neutral">
                  {MUSCLE_LABELS[m]}
                </Badge>
              ))}
            </div>
          </>
        ) : null}
      </Surface>

      {exercise.instructions.length > 0 ? (
        <Surface className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-muted-foreground">Instrucciones</h2>
          <p className="text-xs text-muted-foreground">Texto original del catálogo de ejercicios (en inglés).</p>
          <ol className="flex list-decimal flex-col gap-2 pl-4 text-sm">
            {exercise.instructions.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </Surface>
      ) : null}

      <a
        href={buildYoutubeSearchUrl(exercise.name)}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClasses("secondary")}
      >
        Ver técnica en YouTube
      </a>
    </div>
  );
}
