// src/components/shared/AppShell.tsx
"use client";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppShell({ children, session }: { children: React.ReactNode; session: boolean }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar session={session} />
      <div className="flex flex-1 flex-col">
        <Topbar session={session} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
