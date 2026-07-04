"use client";

import { useEffect, useState, useTransition } from "react";
import type { Exercise } from "@rpeak/domain";
import { searchExercisesAction } from "@/app/ejercicios/actions";
import { Input } from "@/components/ui/input";
import { Surface } from "@/components/ui/surface";
import { Button } from "@/components/ui/button";
import { CATEGORY_LABELS } from "@/lib/exercise-labels";

export function ExercisePicker({ onSelect, onClose }: { onSelect: (exercise: Exercise) => void; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Exercise[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const handle = setTimeout(() => {
      startTransition(async () => {
        const found = await searchExercisesAction(query.trim() ? { query: query.trim() } : {});
        setResults(found);
      });
    }, 250);
    return () => clearTimeout(handle);
  }, [query]);

  return (
    <Surface className="flex flex-col gap-3 border-brand">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold">Añadir ejercicio</p>
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          Cerrar
        </Button>
      </div>
      <Input
        autoFocus
        type="search"
        placeholder="Buscar por nombre…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Buscar ejercicio para añadir"
      />
      <ul className="flex max-h-72 flex-col gap-1.5 overflow-y-auto" aria-live="polite">
        {isPending ? <li className="px-1 py-2 text-sm text-muted">Buscando…</li> : null}
        {!isPending && results.length === 0 ? <li className="px-1 py-2 text-sm text-muted">Sin resultados.</li> : null}
        {results.map((exercise) => (
          <li key={exercise.id}>
            <button
              type="button"
              onClick={() => onSelect(exercise)}
              className="flex w-full flex-col rounded-lg border border-border px-3 py-2 text-left text-sm hover:border-brand hover:bg-brand-tint"
            >
              <span className="font-medium">{exercise.name}</span>
              <span className="text-xs text-muted">{CATEGORY_LABELS[exercise.category]}</span>
            </button>
          </li>
        ))}
      </ul>
    </Surface>
  );
}
