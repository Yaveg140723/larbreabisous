// ============================================================================
//  LAYOUT RACINE — le "cadre" commun à toutes les pages du site
//  EMPLACEMENT dans ton projet : app/layout.tsx
//
//  RÔLE : ce fichier enveloppe TOUTES tes pages. Ce que tu mets ici apparaît
//  partout automatiquement. On l'utilise pour :
//    1) charger les polices (une fois, pour tout le site),
//    2) définir le <html> et le <body>,
//    3) renseigner le titre/description du site (SEO),
//    4) afficher le menu (Header) et le pied de page (Footer) sur CHAQUE page.
//
//  À RETENIR : {children} = "l'emplacement" où Next.js insère la page en cours
//  (ta page d'accueil, /boutique, /merci…). Le layout reste identique, seul
//  {children} change d'une page à l'autre.
// ============================================================================

import type { Metadata } from "next";
// next/font télécharge et optimise les polices Google automatiquement.
import { Playfair_Display, Nunito } from "next/font/google";
import "./globals.css"; // la feuille de style globale (Tailwind v4)

// Le "@/..." est un raccourci vers la racine du projet.
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CartProvider } from "@/components/CartProvider";

// --- POLICES ----------------------------------------------------------------
// Playfair Display (serif) → pour les titres.
// Nunito (sans-serif, ronde et douce) → pour le texte courant.
//
// "variable" crée une variable CSS qu'on branche ensuite dans globals.css
// (bloc @theme). ⚠️ On leur donne des noms DISTINCTS (--font-playfair /
// --font-nunito) pour éviter tout conflit avec les noms internes de Tailwind.
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap", // affiche un texte de secours le temps que la police charge
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

// --- MÉTADONNÉES (SEO) ------------------------------------------------------
// Next.js transforme cet objet en balises <title> et <meta description>.
export const metadata: Metadata = {
  title: "L'Arbre à Bisous — Créations artisanales personnalisées",
  description:
    "Couture, bijoux, carterie, créations Fimo, albums photos et cadeaux personnalisés, faits main avec soin.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode; // "n'importe quel contenu React" (ta page)
}) {
  return (
    // lang="fr" = important pour l'accessibilité et le SEO.
    // On accroche les 2 variables de police sur le <html> pour les rendre
    // disponibles partout ; le branchement final se fait dans globals.css.
    <html lang="fr" className={`${playfair.variable} ${nunito.variable}`}>
      {/* font-sans applique Nunito par défaut. Le FOND et la COULEUR du texte */}
      {/* sont désormais gérés dans globals.css (variable --page-bg), pour     */}
      {/* avoir un seul endroit à modifier. On ne les met donc plus ici.       */}
      <body className="font-sans">
        {/* CartProvider enveloppe tout → le panier est accessible partout   */}
        {/* (icône du menu, bouton Ajouter, page panier).                    */}
        <CartProvider>
          <Header />        {/* menu, affiché en haut de chaque page          */}
          {children}        {/* ← ici s'insère la page en cours                */}
          <Footer />        {/* pied de page, affiché en bas de chaque page    */}
        </CartProvider>
      </body>
    </html>
  );
}
