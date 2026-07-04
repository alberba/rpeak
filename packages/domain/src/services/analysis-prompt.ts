import type { WorkoutAnalysisRequest } from "../schemas/analysis";

const SYSTEM_PROMPT = `Eres un entrenador experto en fuerza e hipertrofia. Analizas un entrenamiento ya
registrado y devuelves SIEMPRE un único objeto JSON, sin texto adicional ni bloques de código,
con exactamente estas claves:
{
  "summary": string (1-2 frases en español, tono directo y motivador),
  "highlights": string[] (puntos positivos concretos, basados en los datos),
  "suggestions": string[] (sugerencias accionables para la próxima sesión),
  "riskFlags": string[] (señales de posible fatiga excesiva, RPE alto sostenido, series incompletas; vacío si no hay ninguna)
}
No inventes datos que no estén en el entrenamiento. Si faltan datos relevantes, dilo en summary.`;

export function buildWorkoutAnalysisPrompt(request: WorkoutAnalysisRequest): { system: string; user: string } {
  const lines: string[] = [];
  lines.push(`Entrenamiento: ${request.workoutName}`);
  lines.push(`Inicio: ${request.startedAt}`);
  lines.push(`Fin: ${request.finishedAt ?? "en curso"}`);
  if (request.notes) lines.push(`Notas del usuario: ${request.notes}`);
  lines.push("");
  lines.push("Ejercicios:");
  for (const exercise of request.exercises) {
    lines.push(`- ${exercise.name}`);
    exercise.sets.forEach((set, index) => {
      const perf =
        set.kind === "reps"
          ? `${set.actualReps ?? "?"} reps`
          : `${set.actualDurationSec ?? "?"} s`;
      const rpe = set.rpe !== null ? `, RPE ${set.rpe}` : "";
      const status = set.completed ? "completada" : "no completada";
      lines.push(`  Serie ${index + 1}: ${set.weight} kg x ${perf}${rpe} (${status})`);
    });
  }
  return { system: SYSTEM_PROMPT, user: lines.join("\n") };
}
