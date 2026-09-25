import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { RecetasManager } from "@/components/admin/RecetasManager";

export const dynamic = "force-dynamic";

export default async function AdminRecetasPage() {
  const session = await getSession();
  if (!session) redirect("/admin");

  return (
    <AdminShell>
      <RecetasManager />
    </AdminShell>
  );
}
