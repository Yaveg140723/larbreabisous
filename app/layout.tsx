// ============================================================================
//  LAYOUT RACINE — cadre commun + métadonnées SEO globales
//  ----------------------------------------------------------------------------
//  EMPLACEMENT EXACT : app/layout.tsx
//
//  À QUOI SERT CE FICHIER ?
//  Ce fichier enveloppe toutes les pages du site.
//  Il charge les polices, définit la langue du site, ajoute les métadonnées SEO
//  principales, puis affiche le Header, le contenu de page et le Footer.
//
//  IMPORTANT SEO :
//  Les métadonnées globales servent de base. Chaque page pourra ensuite avoir
//  ses propres métadonnées plus spécifiques si besoin.
// ============================================================================

import type { Metadata } from "next";
import { Playfair_Display, Nunito } from "next/font/google";
import "./globals.css";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CartProvider } from "@/components/CartProvider";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://preprod.larbreabisous.fr";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "L'Arbre à Bisous — Créations artisanales personnalisées",
    template: "%s — L'Arbre à Bisous",
  },
  description:
    "Créations artisanales personnalisées : couture, bijoux, carterie, créations Fimo, albums photos et cadeaux personnalisés.",
  keywords: [
    "créations artisanales",
    "cadeaux personnalisés",
    "bijoux personnalisés",
    "couture artisanale",
    "carterie",
    "albums photos",
    "créations Fimo",
    "L'Arbre à Bisous",
  ],
  authors: [{ name: "L'Arbre à Bisous" }],
  creator: "L'Arbre à Bisous",
  publisher: "L'Arbre à Bisous",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "/",
    siteName: "L'Arbre à Bisous",
    title: "L'Arbre à Bisous — Créations artisanales personnalisées",
    description:
      "Couture, bijoux, carterie, créations Fimo, albums photos et cadeaux personnalisés, faits main avec soin.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${playfair.variable} ${nunito.variable}`}>
      <body className="font-sans">
        <CartProvider>
          <Header />
          {children}
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}