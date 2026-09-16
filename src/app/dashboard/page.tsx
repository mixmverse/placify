// src/app/dashboard/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.isCurator) redirect("/dashboard/curator");
  redirect("/dashboard/artist");
}
