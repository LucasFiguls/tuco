import type { Metadata } from "next";
import { getConfig } from "@/lib/config";
import { getSession } from "@/lib/auth";
import { getVacioConfig, modoVacio } from "@/lib/vacio";

/** Contexto común de las páginas al vacío: config, flag y vista previa de admin. */
export async function getVacioPageContext() {
  const [config, session] = await Promise.all([getConfig(), getSession()]);
  return {
    config,
    activo: modoVacio(config),
    preview: !!session,
    vacio: getVacioConfig(config),
  };
}

/** Mientras el flag esté apagado, las páginas al vacío no se indexan. */
export async function vacioMetadata(meta: Metadata): Promise<Metadata> {
  const config = await getConfig();
  return modoVacio(config) ? meta : { ...meta, robots: { index: false, follow: false } };
}
