import type { ExerciseMuscle } from "@rpeak/domain";
import { MUSCLE_LABELS } from "@/lib/exercise-labels";
import type { MuscleIntensity } from "@/lib/muscle-load";
import { Surface } from "@/components/ui/surface";
import { bodyFront, bodyBack, FRONT_VIEWBOX, BACK_VIEWBOX, type BodyPart } from "./body-paths";

function partLevel(part: BodyPart, intensities: MuscleIntensity): number {
  return part.muscles.reduce((max, muscle) => Math.max(max, intensities[muscle] ?? 0), 0);
}

function Body({ parts, viewBox, intensities, label }: { parts: BodyPart[]; viewBox: string; intensities: MuscleIntensity; label: string }) {
  return (
    <figure className="min-w-0 flex-1 text-center">
      <svg viewBox={viewBox} role="img" aria-label={`Cuerpo humano, vista ${label.toLowerCase()}`} className="mx-auto h-auto w-full max-w-44">
        {parts.map((part, partIndex) => {
          const isMuscle = part.muscles.length > 0;
          const level = isMuscle ? partLevel(part, intensities) : 0;
          return (
            <g key={`${part.slug}-${partIndex}`} className={isMuscle ? `muscle-fill-${level}` : "muscle-base"}>
              {part.paths.map((d, index) => <path key={index} d={d} />)}
            </g>
          );
        })}
      </svg>
      <figcaption className="mt-1 text-xs font-medium text-muted-foreground">{label}</figcaption>
    </figure>
  );
}

export function MuscleMap({ intensities, title = "Mapa muscular", description }: { intensities: MuscleIntensity; title?: string; description?: string }) {
  const active = (Object.entries(intensities) as Array<[ExerciseMuscle, number]>).sort((a, b) => b[1] - a[1]);
  return (
    <Surface className="muscle-map flex flex-col gap-3 overflow-hidden">
      <div>
        <h2 className="font-display text-base font-semibold">{title}</h2>
        <p className="text-xs text-muted-foreground">{description ?? "Cuanto más intenso es el azul, mayor es el trabajo relativo."}</p>
      </div>
      <div className="flex items-end justify-center gap-2 sm:gap-6">
        <Body parts={bodyFront} viewBox={FRONT_VIEWBOX} intensities={intensities} label="Frontal" />
        <Body parts={bodyBack} viewBox={BACK_VIEWBOX} intensities={intensities} label="Posterior" />
      </div>
      <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground" aria-label="Escala de intensidad del 1 al 4">
        <span>Menor</span>
        {[1, 2, 3, 4].map((level) => <span key={level} className={`muscle-swatch-${level} h-2.5 w-6 rounded-full`} />)}
        <span>Mayor</span>
      </div>
      {active.length ? <p className="sr-only">Músculos trabajados: {active.map(([muscle, level]) => `${MUSCLE_LABELS[muscle]}, nivel ${level}`).join("; ")}</p> : <p className="text-center text-xs text-muted-foreground">Aún no hay series completadas.</p>}
    </Surface>
  );
}
