import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// Solo se crea el cliente si las variables de entorno están configuradas.
// Asegurate de agregar NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY
// a .env.local (pueden tener el mismo valor que SUPABASE_URL y SUPABASE_ANON_KEY).
export const supabase = url && key ? createClient(url, key) : null;
