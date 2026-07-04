"use client";

import { useState } from "react";
import Link from "next/link";
import type { WorkoutAnalysisResult } from "@rpeak/domain";
import { ArrowUpRight, Check, LoaderCircle, RefreshCw, Sparkles, TriangleAlert } from "lucide-react";
import { Button, buttonClasses } from "@/components/ui/button";

interface WorkoutAnalysisCardProps {
  workoutId: string;
  configured: boolean;
  model: string;
}

interface AnalysisError {
  error?: string;
}

export function WorkoutAnalysisCard({ workoutId, configured, model }: WorkoutAnalysisCardProps) {
  const [analysis, setAnalysis] = useState<WorkoutAnalysisResult | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function requestAnalysis() {
    setState("loading");
    setError(null);

    try {
      const response = await fetch("/api/v1/analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workoutId }),
      });
      const body = (await response.json().catch(() => ({}))) as WorkoutAnalysisResult & AnalysisError;
      if (!response.ok) throw new Error(body.error ?? "No se pudo analizar el entrenamiento");
      setAnalysis(body);
      setState("idle");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo analizar el entrenamiento");
      setState("error");
    }
  }

  if (!configured) {
    return (
      <section className="overflow-hidden rounded-2xl border border-primary/25 bg-card shadow-sm">
        <div className="flex gap-3 p-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sparkles className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-display font-semibold">Valoración del entrenador IA</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Añade tu clave personal de OpenRouter para valorar volumen, esfuerzo y posibles ajustes.
            </p>
            <Link href="/configuracion" className={buttonClasses("secondary", "sm", "mt-3")}>
              Configurar OpenRouter <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-primary/30 bg-card shadow-sm" aria-live="polite">
      <div className="flex items-center gap-3 border-b border-primary/15 bg-primary/[0.045] px-4 py-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Sparkles className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-display font-semibold">Valoración del entrenador IA</h2>
          <p className="truncate font-mono text-[11px] text-muted-foreground">{model}</p>
        </div>
        {analysis ? (
          <Button type="button" variant="ghost" size="sm" onClick={requestAnalysis} disabled={state === "loading"} aria-label="Repetir análisis">
            <RefreshCw className="size-4" />
          </Button>
        ) : null}
      </div>

      {analysis ? (
        <div className="relative p-4 pl-7 before:absolute before:inset-y-4 before:left-4 before:w-0.5 before:rounded-full before:bg-primary/35">
          <p className="text-sm font-medium leading-relaxed">{analysis.summary}</p>

          {analysis.highlights.length > 0 ? (
            <AnalysisList title="Lo que ha ido bien" items={analysis.highlights} icon="check" />
          ) : null}
          {analysis.suggestions.length > 0 ? (
            <AnalysisList title="Para la próxima sesión" items={analysis.suggestions} icon="arrow" />
          ) : null}
          {analysis.riskFlags.length > 0 ? (
            <AnalysisList title="Presta atención" items={analysis.riskFlags} icon="warning" />
          ) : null}

          <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
            Orientación automática basada en tu registro; no sustituye el criterio de un profesional sanitario o deportivo.
          </p>
        </div>
      ) : (
        <div className="p-4">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Revisará las series completadas, el RPE, el volumen y tus notas para proponerte ajustes concretos.
          </p>
          <Button type="button" className="mt-3 w-full sm:w-auto" onClick={requestAnalysis} disabled={state === "loading"}>
            {state === "loading" ? <LoaderCircle className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            {state === "loading" ? "Analizando entrenamiento…" : "Analizar entrenamiento"}
          </Button>
        </div>
      )}

      {error ? (
        <div className="border-t border-destructive/20 bg-destructive/5 px-4 py-3">
          <p className="text-sm text-destructive" role="alert">{error}</p>
          <Button type="button" variant="ghost" size="sm" className="mt-1" onClick={requestAnalysis}>
            Reintentar
          </Button>
        </div>
      ) : null}
    </section>
  );
}

function AnalysisList({ title, items, icon }: { title: string; items: string[]; icon: "check" | "arrow" | "warning" }) {
  const Icon = icon === "check" ? Check : icon === "arrow" ? ArrowUpRight : TriangleAlert;
  const iconClass = icon === "warning" ? "text-amber-600 dark:text-amber-400" : "text-primary";

  return (
    <div className="mt-4">
      <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{title}</h3>
      <ul className="mt-2 space-y-2">
        {items.map((item, index) => (
          <li key={`${index}-${item}`} className="flex gap-2 text-sm leading-relaxed">
            <Icon className={`mt-0.5 size-4 shrink-0 ${iconClass}`} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
