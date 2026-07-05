import { notFound, redirect } from "next/navigation";
import { flattenWorkoutExercises, type Exercise } from "@rpeak/domain";
import { requireUser } from "@/lib/current-user";
import { getRepositories } from "@/server/repositories";
import { WorkoutRunner } from "@/components/workout/workout-runner";
import { saveWorkoutBlocksAction, updateWorkoutNotesAction, finishWorkoutAction, applyExerciseSwapsAction } from "@/app/entrenar/[id]/actions";

export default async function ActiveWorkoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const { workouts, exercises } = getRepositories();
  const session = await workouts.getById(id, user.id);
  if (!session) notFound();
  if (session.finishedAt) redirect(`/historial/${id}`);

  const exerciseIds = [...new Set(flattenWorkoutExercises(session).map(({ exercise }) => exercise.exerciseId))];
  const resolved = await Promise.all(exerciseIds.map((exId) => exercises.getById(exId)));
  const exerciseNames = Object.fromEntries(resolved.filter((e): e is Exercise => e !== null).map((e) => [e.id, e.name]));

  return (
    <WorkoutRunner
      workoutId={session.id}
      planId={session.planId}
      initialSession={session}
      initialNow={new Date().toISOString()}
      exerciseNames={exerciseNames}
      saveBlocksAction={saveWorkoutBlocksAction}
      updateNotesAction={updateWorkoutNotesAction}
      finishWorkoutAction={finishWorkoutAction}
      applyExerciseSwapsAction={applyExerciseSwapsAction}
    />
  );
}
