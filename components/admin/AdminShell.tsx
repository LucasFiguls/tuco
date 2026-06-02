"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAdminNotifications } from "./AdminNotificationsProvider";

const NAV = [
  { href: "/admin/pedidos", label: "Pedidos", icon: "📋" },
  { href: "/admin/menu", label: "Menú", icon: "🍽️" },
  { href: "/admin/configuracion", label: "Configuración", icon: "⚙️" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { unseenCount } = useAdminNotifications();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="text-lg font-bold text-orange-500">Tuco Admin</span>
            <nav className="hidden sm:flex gap-1">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    pathname.startsWith(item.href)
                      ? "bg-orange-50 text-orange-600"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {item.icon} {item.label}
                  {item.href === "/admin/pedidos" && unseenCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                      {unseenCount > 9 ? "9+" : unseenCount}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </div>
          <button
            onClick={logout}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Salir
          </button>
        </div>
      </header>

      {/* Nav móvil */}
      <nav className="sm:hidden bg-white border-t flex">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`relative flex-1 py-3 text-xs font-medium text-center transition-colors ${
              pathname.startsWith(item.href)
                ? "text-orange-600 border-t-2 border-orange-500"
                : "text-gray-500"
            }`}
          >
            <span className="block text-lg">{item.icon}</span>
            {item.label}
            {item.href === "/admin/pedidos" && unseenCount > 0 && (
              <span className="absolute top-1 right-[calc(50%-16px)] bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                {unseenCount > 9 ? "9+" : unseenCount}
              </span>
            )}
          </Link>
        ))}
      </nav>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
