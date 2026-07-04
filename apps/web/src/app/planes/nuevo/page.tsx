import { requireUser } from "@/lib/current-user";
import { PlanForm } from "@/components/plans/plan-form";
import { createPlanAction } from "@/app/planes/actions";

export default async function NewPlanPage() {
  await requireUser();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 py-6">
      <header>
        <p className="font-display text-2xl font-semibold">Nuevo plan</p>
        <p className="text-sm text-muted-foreground">Construye tu plantilla bloque a bloque.</p>
      </header>

      <PlanForm
        initialValues={{ name: "", description: "", blocks: [] }}
        initialExercises={{}}
        onSave={createPlanAction}
        submitLabel="Crear plan"
      />
    </div>
  );
}
