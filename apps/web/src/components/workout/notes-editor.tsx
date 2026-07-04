"use client";

import { useState, useTransition } from "react";
import { Textarea } from "@/components/ui/textarea";

export function NotesEditor({
  workoutId,
  initialNotes,
  action,
}: {
  workoutId: string;
  initialNotes: string;
  action: (workoutId: string, notes: string) => Promise<void>;
}) {
  const [notes, setNotes] = useState(initialNotes);
  const [saved, setSaved] = useState(true);
  const [, startTransition] = useTransition();

  function handleBlur() {
    if (notes === initialNotes) return;
    setSaved(false);
    startTransition(() => {
      action(workoutId, notes).then(() => setSaved(true));
    });
  }

  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-muted">Notas</span>
      <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} onBlur={handleBlur} rows={3} placeholder="Sin notas" />
      {!saved ? <span className="text-xs text-muted">Guardando…</span> : null}
    </label>
  );
}
