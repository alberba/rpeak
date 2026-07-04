import Link from "next/link";
import { Dumbbell, LogIn } from "lucide-react";
import type { UserProfile } from "@rpeak/domain";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { NavLinks } from "@/components/nav/nav-links";
import { buttonClasses } from "@/components/ui/button";

export function TopBar({ user, mode }: { user: UserProfile | null; mode: "demo" | "production" }) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-2 px-4 md:px-6">
        <Link href="/" className="mr-2 flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Dumbbell className="size-5" />
          </span>
          <span className="text-lg font-bold tracking-tight">RPeak</span>
        </Link>

        {mode === "demo" ? (
          <span className="hidden items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary sm:inline-flex">
            <span className="size-1.5 rounded-full bg-primary" />
            Modo demo
          </span>
        ) : null}

        <NavLinks />

        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />
          {user ? (
            <span className="flex items-center gap-2 rounded-full border border-border py-1 pl-1 pr-2.5 text-sm font-medium">
              <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {user.displayName
                  .split(" ")
                  .slice(0, 2)
                  .map((part) => part[0]?.toUpperCase())
                  .join("")}
              </span>
              <span className="hidden max-w-28 truncate sm:inline">{user.displayName}</span>
            </span>
          ) : (
            <Link href="/login" className={buttonClasses("primary", "sm")}>
              <LogIn className="size-4" /> Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
