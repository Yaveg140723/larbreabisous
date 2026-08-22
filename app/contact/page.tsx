// ============================================================================
//  PAGE CONTACT — accès au formulaire de contact
//  ----------------------------------------------------------------------------
//  EMPLACEMENT EXACT : app/contact/page.tsx
//
//  À QUOI SERT CE FICHIER ?
//  Cette page permet d’avoir une vraie URL /contact.
//  Elle renvoie vers le formulaire de contact principal présent sur la page
//  d’accueil, sans dupliquer le formulaire.
//
//  SEO :
//  Les métadonnées donnent à Google et aux partages sociaux un titre et une
//  description adaptés à la page Contact.
// ============================================================================

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contactez L'Arbre à Bisous pour une question sur une création artisanale, une commande personnalisée ou un service après-vente.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact — L'Arbre à Bisous",
    description:
      "Une question sur une création, une commande personnalisée ou un SAV ? Contactez L'Arbre à Bisous.",
    url: "/contact",
  },
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold mb-6">Contact</h1>

      <p className="mb-6">
        Une question sur une création, une commande personnalisée ou un service après-vente ?
        Contactez-nous via le formulaire.
      </p>

      <Link
        href="/#contact"
        className="inline-flex rounded-lg bg-pink-600 px-5 py-3 font-semibold text-white hover:bg-pink-700"
      >
        Accéder au formulaire de contact
      </Link>
    </main>
  );
}