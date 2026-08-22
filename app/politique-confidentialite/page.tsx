// ============================================================================
//  PAGE POLITIQUE DE CONFIDENTIALITÉ — données personnelles
//  ----------------------------------------------------------------------------
//  EMPLACEMENT EXACT : app/politique-confidentialite/page.tsx
//
//  À QUOI SERT CE FICHIER ?
//  Cette page explique quelles données personnelles peuvent être collectées,
//  pourquoi elles sont utilisées, combien de temps elles sont conservées et
//  comment exercer ses droits.
//
//  CONFORMITÉ RGPD :
//  Cette page contribue à l’information obligatoire des utilisateurs.
// ============================================================================

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Découvrez comment L'Arbre à Bisous collecte, utilise et protège vos données personnelles dans le cadre des commandes, contacts et newsletters.",
  alternates: {
    canonical: "/politique-confidentialite",
  },
  openGraph: {
    title: "Politique de confidentialité — L'Arbre à Bisous",
    description:
      "Informations RGPD sur les données collectées, les finalités, la conservation, les sous-traitants et les droits des utilisateurs.",
    url: "/politique-confidentialite",
  },
};

export default function PolitiqueConfidentialitePage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold mb-6">Politique de confidentialité</h1>

      <p>
        L’Arbre à Bisous collecte certaines données personnelles afin d’assurer le
        fonctionnement du site, le traitement des commandes et la gestion des
        demandes de contact.
      </p>

      <h2 className="text-xl font-semibold mt-6">Données collectées</h2>
      <p>
        Les données pouvant être collectées sont notamment : nom, prénom, adresse
        email, téléphone, adresse de livraison, informations de commande et messages
        envoyés via le formulaire de contact.
      </p>

      <h2 className="text-xl font-semibold mt-6">Finalités</h2>
      <p>
        Les données sont utilisées pour traiter les commandes, gérer la relation
        client, répondre aux demandes, envoyer la newsletter lorsque l’utilisateur
        y consent, et assurer la sécurité du site.
      </p>

      <h2 className="text-xl font-semibold mt-6">Base légale</h2>
      <p>
        Les traitements reposent selon les cas sur l’exécution d’un contrat, le
        consentement de l’utilisateur, le respect d’une obligation légale ou
        l’intérêt légitime du site.
      </p>

      <h2 className="text-xl font-semibold mt-6">Durée de conservation</h2>
      <p>
        Les données sont conservées pendant la durée nécessaire aux finalités pour
        lesquelles elles ont été collectées, puis archivées ou supprimées selon les
        obligations légales applicables.
      </p>

      <h2 className="text-xl font-semibold mt-6">Sous-traitants</h2>
      <p>
        Le site peut utiliser des services tiers pour son fonctionnement, notamment
        Vercel pour l’hébergement, Supabase pour la base de données et Cloudflare
        Turnstile pour la protection anti-spam.
      </p>

      <h2 className="text-xl font-semibold mt-6">Newsletter</h2>
      <p>
        L’inscription à la newsletter repose sur le consentement. L’utilisateur peut
        se désinscrire à tout moment via le lien prévu à cet effet ou en contactant
        le site.
      </p>

      <h2 className="text-xl font-semibold mt-6">Droits des utilisateurs</h2>
      <p>
        Conformément au RGPD, vous pouvez demander l’accès, la rectification,
        l’effacement, la limitation ou l’opposition au traitement de vos données.
      </p>

      <h2 className="text-xl font-semibold mt-6">Contact</h2>
      <p>
        Pour exercer vos droits ou poser une question sur vos données personnelles,
        contactez-nous à : contact@larbreabisous.fr.
      </p>
    </main>
  );
}