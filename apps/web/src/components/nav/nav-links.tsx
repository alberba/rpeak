"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const ITEMS: Array<{ href: string; label: string; exact?: boolean }> = [
  { href: "/", label: "Inicio", exact: true },
  { href: "/planes", label: "Planes" },
  { href: "/entrenar", label: "Entrenar" },
  { href: "/historial", label: "Historial" },
  { href: "/ejercicios", label: "Ejercicios" },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="mx-auto hidden items-center gap-1 md:flex" aria-label="Navegación principal">
      {ITEMS.map((item) => {
        const active = isActive(pathname, item.href, item.exact);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              active ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
