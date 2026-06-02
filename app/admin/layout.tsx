import { Toaster } from "sonner";
import { AdminNotificationsProvider } from "@/components/admin/AdminNotificationsProvider";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminNotificationsProvider>
      {children}
      <Toaster position="top-right" richColors closeButton />
    </AdminNotificationsProvider>
  );
}

export async function generateMetadata() {
  return { title: "Admin — Tuco" };
}
