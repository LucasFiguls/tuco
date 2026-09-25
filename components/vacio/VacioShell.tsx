import { Navbar } from "@/components/storefront/Navbar";
import { Footer } from "@/components/storefront/Footer";

/** Layout de las páginas de la línea al vacío. `hero` = la página arranca con un hero bajo el navbar. */
export function VacioShell({
  children,
  whatsapp,
  hero = false,
}: {
  children: React.ReactNode;
  whatsapp?: string;
  hero?: boolean;
}) {
  return (
    <>
      <Navbar variant="vacio" solid={!hero} />
      <main>{children}</main>
      <Footer variant="vacio" whatsapp={whatsapp} />
    </>
  );
}
