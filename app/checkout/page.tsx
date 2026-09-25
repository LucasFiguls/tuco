import { getConfig } from "@/lib/config";
import { getVacioConfig, modoVacio } from "@/lib/vacio";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const config = await getConfig();
  return <CheckoutClient vacio={getVacioConfig(config)} vouchersVisibles={!modoVacio(config)} />;
}
