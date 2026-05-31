import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { PedidosList } from "@/components/admin/PedidosList";

export const dynamic = "force-dynamic";

export default async function PedidosPage() {
  const session = await getSession();
  if (!session) redirect("/admin");

  return (
    <AdminShell>
      <PedidosList />
    </AdminShell>
  );
}
