import { cn } from "@/lib/cn";
import type { HTMLAttributes } from "react";

type Tone = "neutral" | "brand" | "accent" | "success" | "danger";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-border/60 text-foreground",
  brand: "bg-brand-tint text-brand-strong dark:text-foreground",
  accent: "bg-accent-tint text-accent-strong",
  success: "bg-success/15 text-success",
  danger: "bg-danger/15 text-danger",
};

export function Badge({ tone = "neutral", className, ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}
