"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactElement } from "react";
import { cn } from "@/lib/cn";

const ICONS: Record<string, ReactElement> = {
  home: (
    <path d="M3 10.5 12 4l9 6.5M5.5 9.5V20h13V9.5" strokeLinecap="round" strokeLinejoin="round" />
  ),
  book: <path d="M4 5.5c0-1 .8-1.5 2-1.5h5v16H6c-1.2 0-2 .5-2 1.5v-16Zm16 0c0-1-.8-1.5-2-1.5h-5v16h5c1.2 0 2 .5 2 1.5v-16Z" strokeLinecap="round" strokeLinejoin="round" />,
  dumbbell: (
    <path
      d="M6 8v8M4 9.5v5M18 8v8M20 9.5v5M8 12h8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  history: (
    <path
      d="M4 12a8 8 0 1 0 2.5-5.8M4 4v4h4M12 8v4l3 2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
};

const ITEMS: Array<{ href: string; label: string; icon: keyof typeof ICONS; match: (p: string) => boolean }> = [
  { href: "/", label: "Inicio", icon: "home", match: (p) => p === "/" },
  { href: "/planes", label: "Planes", icon: "book", match: (p) => p.startsWith("/planes") },
  { href: "/entrenar", label: "Entrenar", icon: "dumbbell", match: (p) => p.startsWith("/entrenar") },
  { href: "/historial", label: "Historial", icon: "history", match: (p) => p.startsWith("/historial") },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegación principal"
      className="sticky bottom-0 z-20 border-t border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto grid w-full max-w-2xl grid-cols-4">
        {ITEMS.map((item) => {
          const active = item.match(pathname);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors",
                  active ? "text-brand-strong" : "text-muted hover:text-foreground",
                )}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.6} className="size-5" aria-hidden="true">
                  {ICONS[item.icon]}
                </svg>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
