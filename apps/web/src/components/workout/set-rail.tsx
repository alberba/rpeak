import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export type SetRailState = "pending" | "active" | "completed" | "skipped";

export interface SetRailNode {
  id: string;
  title: string;
  subtitle?: string;
  state: SetRailState;
}

/**
 * Firma visual de RPeak: un raíl vertical que conecta las series de un ejercicio
 * (o una ronda de superserie) como un cuaderno en vivo. El segmento recorrido se
 * pinta de coral al completarse; el nodo activo pulsa en azul mineral.
 */
export function SetRail({
  nodes,
  renderTrailing,
}: {
  nodes: SetRailNode[];
  renderTrailing?: (node: SetRailNode, index: number) => ReactNode;
}) {
  return (
    <ol className="relative flex flex-col">
      {nodes.map((node, index) => {
        const isLast = index === nodes.length - 1;
        return (
          <li key={node.id} className="relative flex gap-3 pb-6 last:pb-0">
            {!isLast && (
              <span
                aria-hidden="true"
                className={cn(
                  "absolute top-5 left-[9px] -bottom-1 w-px",
                  node.state === "completed" ? "bg-primary/15" : "bg-border",
                )}
              />
            )}
            <span
              aria-hidden="true"
              className={cn(
                "relative z-10 mt-1 flex size-[19px] shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                node.state === "completed" && "border-primary/40 bg-primary/15 text-white",
                node.state === "active" && "border-primary bg-primary text-primary-foreground motion-safe:animate-pulse",
                node.state === "pending" && "border-border bg-card",
                node.state === "skipped" && "border-border bg-border/60",
              )}
            >
              {node.state === "completed" ? (
                <svg viewBox="0 0 12 12" className="size-2.5" fill="none" aria-hidden="true">
                  <path d="M2 6.2 4.8 9 10 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : null}
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p
                    className={cn(
                      "font-mono text-sm font-medium",
                      node.state === "pending" ? "text-muted-foreground" : "text-foreground",
                    )}
                  >
                    {node.title}
                  </p>
                  {node.subtitle ? <p className="truncate text-xs text-muted-foreground">{node.subtitle}</p> : null}
                </div>
                {renderTrailing ? <div className="shrink-0">{renderTrailing(node, index)}</div> : null}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
