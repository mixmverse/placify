// src/app/dashboard/layout.tsx
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardShell } from "@/components/shared/DashboardShell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Artists without a profile need onboarding
  if (session.user.isArtist && !session.user.hasArtistProfile) {
    redirect("/onboarding");
  }

  return <DashboardShell>{children}</DashboardShell>;
}
