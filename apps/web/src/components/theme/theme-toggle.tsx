"use client";

import { useAppTheme } from "@/components/theme/theme-provider";

export function ThemeToggle() {
  const { theme, mounted, setTheme } = useAppTheme();

  if (!mounted) {
    return <div className="size-9 rounded-full border border-border" aria-hidden="true" />;
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
      className="flex size-9 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-brand-tint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <span aria-hidden="true">{isDark ? "☀" : "☾"}</span>
    </button>
  );
}
