import Link from "next/link";
import type { UserProfile } from "@rpeak/domain";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export function TopBar({ user, mode }: { user: UserProfile | null; mode: "demo" | "production" }) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-display text-lg font-semibold tracking-tight">
          RPeak
        </Link>
        <div className="flex items-center gap-2">
          {mode === "demo" ? <Badge tone="accent">Modo demo</Badge> : null}
          {user ? (
            <span className="hidden text-sm text-muted sm:inline">{user.displayName}</span>
          ) : (
            <Link href="/login" className="text-sm font-medium text-brand hover:underline">
              Iniciar sesión
            </Link>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
