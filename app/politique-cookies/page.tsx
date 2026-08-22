// ============================================================================
//  PAGE POLITIQUE COOKIES — information CNIL
//  ----------------------------------------------------------------------------
//  EMPLACEMENT EXACT : app/politique-cookies/page.tsx
//
//  À QUOI SERT CE FICHIER ?
//  Cette page explique quels cookies ou technologies similaires peuvent être
//  utilisés sur le site, et pourquoi.
//
//  IMPORTANT CNIL :
//  Le site n’utilise pas actuellement d’analytics ou de pixels marketing.
//  Les cookies mentionnés sont liés au fonctionnement normal du service.
// ============================================================================

const sections = [
  {
    titre: "Qu’est-ce qu’un cookie ?",
    texte:
      "Un cookie est un petit fichier enregistré sur votre appareil lors de la consultation d’un site. Il peut servir à faire fonctionner le site, mémoriser certaines informations ou sécuriser des échanges.",
  },
  {
    titre: "Cookies strictement nécessaires",
    texte:
      "Le site peut utiliser des cookies ou technologies similaires nécessaires à son fonctionnement : maintien de la session de connexion, gestion du panier, sécurisation des formulaires et traitement du paiement.",
  },
  {
    titre: "Authentification et compte client",
    texte:
      "Lorsque vous vous connectez, Supabase peut utiliser des informations techniques nécessaires pour maintenir votre session et vous permettre d’accéder à votre compte ou à vos commandes.",
  },
  {
    titre: "Panier",
    texte:
      "Le panier peut mémoriser les articles ajoutés afin que vous puissiez poursuivre votre navigation avant de finaliser votre commande.",
  },
  {
    titre: "Sécurité des formulaires",
    texte:
      "Le site utilise Cloudflare Turnstile pour protéger certains formulaires contre les usages automatisés ou abusifs.",
  },
  {
    titre: "Paiement",
    texte:
      "Le paiement est traité par Stripe. Certaines informations techniques peuvent être nécessaires pour sécuriser et finaliser la transaction.",
  },
  {
    titre: "Analytics et marketing",
    texte:
      "Le site n’utilise pas actuellement de cookies analytics non essentiels, ni de pixels publicitaires ou marketing. Si cela change, une information adaptée et un choix de consentement seront proposés.",
  },
  {
    titre: "Gestion de vos préférences",
    texte:
      "Comme seuls des cookies nécessaires au fonctionnement du site sont actuellement utilisés, aucune bannière de consentement n’est affichée. Vous pouvez toutefois configurer votre navigateur pour bloquer ou supprimer les cookies.",
  },
];

export default function PolitiqueCookiesPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-8 py-16">
      <h1 className="text-4xl md:text-5xl font-serif text-[#B03052] mb-4">
        Politique cookies
      </h1>

      <p className="text-gray-600 mb-10">
        Cette page explique l’utilisation des cookies et technologies similaires
        sur le site L’Arbre à Bisous.
      </p>

      <div className="space-y-4">
        {sections.map((section) => (
          <section key={section.titre} className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-[#B03052] mb-2">
              {section.titre}
            </h2>
            <p className="text-gray-700 leading-relaxed">{section.texte}</p>
          </section>
        ))}
      </div>
    </main>
  );
}