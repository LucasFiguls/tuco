import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { PedidosKanban } from "@/components/admin/PedidosKanban";

export const dynamic = "force-dynamic";

export default async function PedidosPage() {
  const session = await getSession();
  if (!session) redirect("/admin");

  return (
    <AdminShell>
      <PedidosKanban />
    </AdminShell>
  );
}
