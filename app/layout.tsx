import type { Metadata } from "next";
import { Instrument_Sans } from "next/font/google";
import { CartProvider } from "@/lib/cart-context";
import QuickView from "@/components/QuickView";
import CartDrawer from "@/components/CartDrawer";
import "./globals.css";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Shaby Wurld",
  description: "Beauty that feels like you.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
    return (
      <html lang="en" className={instrumentSans.variable}>
        <body className="font-body antialiased">
          <CartProvider>
            {children}
            {/* Overlays live here, above the provider, so they mount once
                for the whole app rather than per page. */}
            <QuickView />
            <CartDrawer />
          </CartProvider>
        </body>
    </html>
  )
}
