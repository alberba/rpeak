import Link from "next/link";
import { notFound } from "next/navigation";
import { flattenPlanExercises, type Exercise } from "@rpeak/domain";
import { requireUser } from "@/lib/current-user";
import { getRepositories } from "@/server/repositories";
import { PlanForm } from "@/components/plans/plan-form";
import { updatePlanAction, deletePlanAction } from "@/app/planes/actions";
import { buttonClasses } from "@/components/ui/button";
import { MuscleMap } from "@/components/muscles/muscle-map";
import { planMuscleIntensity } from "@/lib/muscle-load";

export default async function PlanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const { plans, exercises } = getRepositories();
  const plan = await plans.getById(id, user.id);
  if (!plan) notFound();

  const exerciseIds = [...new Set(flattenPlanExercises(plan).map(({ exercise }) => exercise.exerciseId))];
  const resolved = await Promise.all(exerciseIds.map((exId) => exercises.getById(exId)));
  const initialExercises = Object.fromEntries(
    resolved.filter((e): e is Exercise => e !== null).map((e) => [e.id, { id: e.id, name: e.name }]),
  );
  const exerciseMap = new Map(resolved.filter((e): e is Exercise => e !== null).map((e) => [e.id, e]));

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 py-6">
      <header className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="font-display text-2xl font-semibold">{plan.name}</p>
          <p className="text-sm text-muted-foreground">Editar plan</p>
        </div>
        <Link href={`/entrenar?planId=${plan.id}`} className={buttonClasses("primary", "sm")}>
          Empezar
        </Link>
      </header>

      <MuscleMap
        intensities={planMuscleIntensity(plan, exerciseMap)}
        title="Distribución muscular del plan"
        description="Calculada según las series previstas y el papel principal o secundario de cada músculo."
      />

      <PlanForm
        initialValues={{ name: plan.name, description: plan.description, blocks: plan.blocks }}
        initialExercises={initialExercises}
        onSave={updatePlanAction.bind(null, plan.id)}
        onDelete={deletePlanAction.bind(null, plan.id)}
        submitLabel="Guardar cambios"
      />
    </div>
  );
}
