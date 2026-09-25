import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { InsumosManager } from "@/components/admin/InsumosManager";

export const dynamic = "force-dynamic";

export default async function AdminInsumosPage() {
  const session = await getSession();
  if (!session) redirect("/admin");

  return (
    <AdminShell>
      <InsumosManager />
    </AdminShell>
  );
}
