import { getRepositories } from "@/server/repositories";
import { parseExerciseFilter } from "@/lib/parse-exercise-filter";
import { ExerciseFilters } from "@/components/exercises/exercise-filters";
import { ExerciseCard } from "@/components/exercises/exercise-card";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonClasses } from "@/components/ui/button";
import { pluralize } from "@/lib/format";

const PAGE_SIZE = 24;

export default async function ExercisesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const rawParams = await searchParams;
  const filter = parseExerciseFilter(rawParams);
  const page = Math.max(1, Number(Array.isArray(rawParams.page) ? rawParams.page[0] : rawParams.page) || 1);

  const { exercises } = getRepositories();
  const all = await exercises.list(filter);
  const totalPages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
  const pageItems = all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const baseParams = new URLSearchParams();
  if (filter.query) baseParams.set("q", filter.query);
  if (filter.category) baseParams.set("category", filter.category);
  if (filter.equipment) baseParams.set("equipment", filter.equipment);
  if (filter.muscle) baseParams.set("muscle", filter.muscle);
  if (filter.level) baseParams.set("level", filter.level);

  function pageHref(target: number) {
    const params = new URLSearchParams(baseParams);
    params.set("page", String(target));
    return `/ejercicios?${params.toString()}`;
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 py-6">
      <header>
        <p className="font-display text-2xl font-semibold">Ejercicios</p>
        <p className="text-sm text-muted-foreground">{pluralize(all.length, "ejercicio encontrado", "ejercicios encontrados")}</p>
      </header>

      <ExerciseFilters
        action="/ejercicios"
        defaultValues={{
          query: filter.query,
          category: filter.category,
          equipment: filter.equipment,
          muscle: filter.muscle,
          level: filter.level,
        }}
      />

      {pageItems.length === 0 ? (
        <EmptyState title="No hay ejercicios con esos filtros" description="Prueba a cambiar la búsqueda o quitar algún filtro." />
      ) : (
        <ul className="flex flex-col gap-2 pb-4">
          {pageItems.map((exercise) => (
            <ExerciseCard key={exercise.id} exercise={exercise} href={`/ejercicios/${exercise.id}`} />
          ))}
        </ul>
      )}

      {totalPages > 1 ? (
        <nav aria-label="Paginación de ejercicios" className="flex items-center justify-between pb-4 text-sm">
          {page > 1 ? (
            <a href={pageHref(page - 1)} className={buttonClasses("ghost", "sm")}>
              Anterior
            </a>
          ) : (
            <span />
          )}
          <span className="text-muted-foreground">
            Página {page} de {totalPages}
          </span>
          {page < totalPages ? (
            <a href={pageHref(page + 1)} className={buttonClasses("ghost", "sm")}>
              Siguiente
            </a>
          ) : (
            <span />
          )}
        </nav>
      ) : null}
    </div>
  );
}
