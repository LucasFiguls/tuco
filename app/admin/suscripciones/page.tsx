import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { SuscripcionesManager } from "@/components/admin/SuscripcionesManager";

export const dynamic = "force-dynamic";

export default async function SuscripcionesPage() {
  const session = await getSession();
  if (!session) redirect("/admin");

  return (
    <AdminShell>
      <SuscripcionesManager />
    </AdminShell>
  );
}
