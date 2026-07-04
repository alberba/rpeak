import { cn } from "@/lib/cn";
import type { HTMLAttributes } from "react";

type Tone = "neutral" | "brand" | "accent" | "success" | "danger";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-muted text-muted-foreground",
  brand: "bg-primary/12 text-primary",
  accent: "bg-primary/12 text-primary",
  success: "bg-success/15 text-success",
  danger: "bg-destructive/15 text-destructive",
};

export function Badge({ tone = "neutral", className, ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}
