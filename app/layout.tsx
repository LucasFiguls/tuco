import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/storefront/CartContext";

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tuco — Viandas caseras para llevar",
  description: "Comé rico, sin cocinar. Viandas artesanales con retiro en local o delivery.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${playfair.variable} ${dmSans.variable} h-full`}>
      <body className="min-h-full bg-brand-cream font-body antialiased">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
