import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { EmpresasAdmin } from "@/components/admin/EmpresasAdmin";

export const dynamic = "force-dynamic";

export default async function EmpresasAdminPage() {
  const session = await getSession();
  if (!session) redirect("/admin");

  return (
    <AdminShell>
      <EmpresasAdmin />
    </AdminShell>
  );
}
