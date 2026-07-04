import type { ReactNode } from "react";
import { Surface } from "@/components/ui/surface";

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <Surface className="flex flex-col items-center gap-2 border-dashed py-8 text-center">
      <p className="font-medium text-foreground">{title}</p>
      {description ? <p className="max-w-xs text-sm text-muted">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </Surface>
  );
}
