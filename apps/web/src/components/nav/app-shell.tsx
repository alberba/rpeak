import type { ReactNode } from "react";
import type { UserProfile } from "@rpeak/domain";
import { TopBar } from "@/components/nav/top-bar";
import { BottomNav } from "@/components/nav/bottom-nav";

export function AppShell({
  user,
  mode,
  children,
}: {
  user: UserProfile | null;
  mode: "demo" | "production";
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <TopBar user={user} mode={mode} />
      <main className="flex flex-1 flex-col">{children}</main>
      <BottomNav />
    </div>
  );
}
