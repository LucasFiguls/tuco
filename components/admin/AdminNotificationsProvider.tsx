"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
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
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Pre-calienta el AudioContext en la primera interacción del usuario
  // para evitar el bloqueo de autoplay del browser
  const resumeAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
      console.log("[audio] AudioContext creado, state:", audioCtxRef.current.state);
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume().then(() => {
        console.log("[audio] AudioContext resumido, state:", audioCtxRef.current?.state);
      });
    }
  }, []);

  // Intenta crear el AudioContext al montar (puede quedar suspended hasta primer click)
  useEffect(() => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();
        console.log("[audio] AudioContext init en mount, state:", audioCtxRef.current.state);
      }
    } catch {}
  }, []);

  // Mantiene la ref actualizada para que el callback de Realtime no capture pathname stale
  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  // Registra listeners para pre-calentar el AudioContext en la primera interacción
  useEffect(() => {
    document.addEventListener("click", resumeAudio);
    document.addEventListener("keydown", resumeAudio);
    return () => {
      document.removeEventListener("click", resumeAudio);
      document.removeEventListener("keydown", resumeAudio);
    };
  }, [resumeAudio]);

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
          console.log("[realtime] INSERT recibido, pathname:", pathnameRef.current);
          if (pathnameRef.current.startsWith("/admin/pedidos")) {
            setReloadTrigger((t) => t + 1);
            playBeep(audioCtxRef.current);
          } else {
            setUnseenCount((c) => c + 1);
            playBeep(audioCtxRef.current);
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

function playBeep(ctx: AudioContext | null) {
  const visible = document.visibilityState !== "hidden";
  console.log("[audio] playBeep — visible:", visible, "| ctx state:", ctx?.state ?? "null");
  if (!ctx || !visible) return;

  const doPlay = () => {
    console.log("[audio] reproduciendo beep");
    try {
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
    } catch (e) {
      console.log("[audio] error al reproducir:", e);
    }
  };

  if (ctx.state === "suspended") {
    ctx.resume().then(doPlay).catch((e) => console.log("[audio] resume error:", e));
  } else {
    doPlay();
  }
}
