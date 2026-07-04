import type { ExerciseCategory, ExerciseEquipment, ExerciseForce, ExerciseLevel, ExerciseMechanic, ExerciseMuscle } from "@rpeak/domain";

/**
 * El dataset de ejercicios (free-exercise-db) viene en inglés. Traducimos aquí
 * las etiquetas de la interfaz (categorías, músculos, equipo...); las
 * instrucciones detalladas de cada ejercicio se dejan en el idioma original
 * del dataset porque traducir 873 fichas de forma fiable excede el alcance
 * de este trabajo de frontend.
 */

export const CATEGORY_LABELS: Record<ExerciseCategory, string> = {
  strength: "Fuerza",
  stretching: "Estiramiento",
  plyometrics: "Pliometría",
  powerlifting: "Powerlifting",
  "olympic weightlifting": "Halterofilia",
  strongman: "Strongman",
  cardio: "Cardio",
};

export const EQUIPMENT_LABELS: Record<ExerciseEquipment, string> = {
  barbell: "Barra",
  dumbbell: "Mancuernas",
  other: "Otro",
  "body only": "Peso corporal",
  cable: "Polea",
  machine: "Máquina",
  kettlebells: "Kettlebell",
  bands: "Bandas",
  "medicine ball": "Balón medicinal",
  "exercise ball": "Fitball",
  "foam roll": "Foam roller",
  "e-z curl bar": "Barra Z",
};

export const MUSCLE_LABELS: Record<ExerciseMuscle, string> = {
  abdominals: "Abdominales",
  abductors: "Abductores",
  adductors: "Aductores",
  biceps: "Bíceps",
  calves: "Gemelos",
  chest: "Pecho",
  forearms: "Antebrazos",
  glutes: "Glúteos",
  hamstrings: "Isquiotibiales",
  lats: "Dorsales",
  "lower back": "Lumbar",
  "middle back": "Espalda media",
  neck: "Cuello",
  quadriceps: "Cuádriceps",
  shoulders: "Hombros",
  traps: "Trapecios",
  triceps: "Tríceps",
};

export const LEVEL_LABELS: Record<ExerciseLevel, string> = {
  beginner: "Principiante",
  intermediate: "Intermedio",
  expert: "Experto",
};

export const FORCE_LABELS: Record<ExerciseForce, string> = {
  push: "Empuje",
  pull: "Tracción",
  static: "Estático",
};

export const MECHANIC_LABELS: Record<ExerciseMechanic, string> = {
  compound: "Compuesto",
  isolation: "Aislamiento",
};
