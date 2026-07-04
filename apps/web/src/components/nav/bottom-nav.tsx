"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dumbbell, History, Home, ListChecks, Play } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

const ITEMS: Array<{ href: string; label: string; icon: LucideIcon; match: (p: string) => boolean }> = [
  { href: "/", label: "Inicio", icon: Home, match: (p) => p === "/" },
  { href: "/planes", label: "Planes", icon: ListChecks, match: (p) => p.startsWith("/planes") },
  { href: "/entrenar", label: "Entrenar", icon: Play, match: (p) => p.startsWith("/entrenar") },
  { href: "/historial", label: "Historial", icon: History, match: (p) => p.startsWith("/historial") },
  { href: "/ejercicios", label: "Ejercicios", icon: Dumbbell, match: (p) => p.startsWith("/ejercicios") },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegación principal"
      className="sticky bottom-0 z-20 border-t border-border bg-background/95 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto grid w-full max-w-2xl grid-cols-5">
        {ITEMS.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex touch-manipulation flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="size-5" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
