import type { Metadata } from "next";
import { Cormorant_Garamond, Nunito_Sans } from "next/font/google";
import { FloatingCallButton } from "@/components/FloatingCallButton";
import { Header } from "@/components/Header";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["300", "400", "600"],
});

const body = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Yele Food Lounge — Forcément c'est doux",
  description:
    "Yele Food Lounge — Cocody Angré. Spectacles, restauration, espace VIP et réservations.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${display.variable} ${body.variable}`}>
      <body className="font-body">
        <Header />
        <main>{children}</main>
        <FloatingCallButton />
        <footer className="mt-8 border-t border-yele-orange/10 bg-yele-cream py-12 px-4 text-center text-sm text-gray-600">
          <p className="luxury-title text-2xl text-yele-charcoal">Yele Food Lounge</p>
          <p className="mt-2 font-display text-lg italic text-yele-orange">
            Forcément c&apos;est doux !
          </p>
          <p className="mt-4 tracking-wide">
            Cocody ANGRE, Abidjan — Gestoci Nouveau CHU
          </p>
          <p className="mt-2">
            <a
              href="mailto:fataouyelelatifaakissikan@gmail.com"
              className="text-yele-orange hover:underline"
            >
              fataouyelelatifaakissikan@gmail.com
            </a>
          </p>
          <p className="mt-6 text-xs text-gray-400">
            © {new Date().getFullYear()} Yele Food Lounge
          </p>
        </footer>
      </body>
    </html>
  );
}
