"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase-client";

interface NotifContextValue {
  unseenCount: number;
  reloadTrigger: number;
}

const NotifContext = createContext<NotifContextValue>({ unseenCount: 0, reloadTrigger: 0 });

export function useAdminNotifications() {
  return useContext(NotifContext);
}

export function AdminNotificationsProvider({ children }: { children: React.ReactNode }) {
  const [unseenCount, setUnseenCount] = useState(0);
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  const router = useRouter();

  // Mantiene la ref actualizada para que el callback de Realtime no capture pathname stale
  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  // Carga el badge inicial al montar el layout
  useEffect(() => {
    fetch("/api/admin/pedidos/marcar-vistos")
      .then((r) => r.json())
      .then((d) => setUnseenCount(d.count ?? 0))
      .catch(() => {});
  }, []);

  // Cuando el admin entra a /admin/pedidos: resetea el badge y marca todos como vistos
  useEffect(() => {
    if (pathname.startsWith("/admin/pedidos")) {
      setUnseenCount(0);
      toast.dismiss();
      fetch("/api/admin/pedidos/marcar-vistos", { method: "PATCH" }).catch(() => {});
    }
  }, [pathname]);

  // Suscripción a Supabase Realtime
  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel("pedidos-nuevos")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "pedidos" },
        () => {
          if (pathnameRef.current.startsWith("/admin/pedidos")) {
            // Ya está en la página de pedidos: solo recarga la lista
            setReloadTrigger((t) => t + 1);
            playBeep();
          } else {
            // Está en otra sección: incrementa badge y muestra toast
            setUnseenCount((c) => c + 1);
            playBeep();
            toast("🔔 Nuevo pedido recibido", {
              description: "Entrá a Pedidos para verlo.",
              action: {
                label: "Ver pedidos",
                onClick: () => router.push("/admin/pedidos"),
              },
              duration: Infinity,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  }, [router]);

  return (
    <NotifContext.Provider value={{ unseenCount, reloadTrigger }}>
      {children}
    </NotifContext.Provider>
  );
}

function playBeep() {
  if (!document.hasFocus()) return;
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } catch {}
}
