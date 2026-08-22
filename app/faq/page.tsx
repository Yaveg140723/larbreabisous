// ============================================================================
//  PAGE FAQ — Questions fréquentes
//  ----------------------------------------------------------------------------
//  EMPLACEMENT EXACT : app/faq/page.tsx
//
//  À QUOI SERT CE FICHIER ?
//  Cette page répond aux questions fréquentes des clientes : personnalisation,
//  délais de fabrication, livraison, retours, paiement et contact.
//
//  OBJECTIF :
//  Rassurer les clientes, réduire les questions répétitives et améliorer le SEO.
// ============================================================================

const questions = [
  {
    question: "Quels types de créations propose L'Arbre à Bisous ?",
    reponse:
      "L'Arbre à Bisous propose des créations artisanales personnalisées : couture, bijoux, carterie, créations Fimo, albums photos et cadeaux personnalisés.",
  },
  {
    question: "Les produits sont-ils personnalisables ?",
    reponse:
      "Certains produits sont personnalisables. Lorsqu’un produit peut être personnalisé, une mention apparaît sur sa fiche et un champ permet d’indiquer votre souhait avant l’ajout au panier.",
  },
  {
    question: "Quels sont les délais de fabrication ?",
    reponse:
      "Les créations sont préparées avec soin. Les délais peuvent varier selon le produit, la personnalisation demandée et la charge de commandes. Les informations importantes sont indiquées sur les fiches produit.",
  },
  {
    question: "Comment se passe la livraison ?",
    reponse:
      "La livraison se fait en point relais via Chronopost Shop2Shop. Les frais de livraison sont affichés dans le panier avant paiement. La livraison est offerte dès 80 € d’achat.",
  },
  {
    question: "Puis-je retourner un produit ?",
    reponse:
      "Les produits non personnalisés peuvent bénéficier du droit de rétractation légal. Les produits personnalisés ou réalisés selon vos indications ne sont pas repris, sauf défaut ou non-conformité.",
  },
  {
    question: "Le paiement est-il sécurisé ?",
    reponse:
      "Oui, le paiement est sécurisé via Stripe. L'Arbre à Bisous ne stocke pas vos informations bancaires.",
  },
  {
    question: "Comment suivre ma commande ?",
    reponse:
      "Après connexion, vous pouvez retrouver vos commandes dans la page Mes commandes. Lorsque la commande est expédiée, le numéro de suivi peut y être affiché.",
  },
  {
    question: "Comment contacter L'Arbre à Bisous ?",
    reponse:
      "Vous pouvez utiliser le formulaire de contact du site pour toute question liée à une création, une commande personnalisée ou un service après-vente.",
  },
];

export default function FAQPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-8 py-16">
      <h1 className="text-4xl md:text-5xl font-serif text-[#B03052] mb-4">
        Questions fréquentes
      </h1>

      <p className="text-gray-600 mb-10">
        Retrouvez ici les réponses aux questions les plus courantes sur les créations,
        la personnalisation, la livraison, les retours et le paiement.
      </p>

      <div className="space-y-4">
        {questions.map((item) => (
          <section key={item.question} className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-[#B03052] mb-2">
              {item.question}
            </h2>
            <p className="text-gray-700 leading-relaxed">{item.reponse}</p>
          </section>
        ))}
      </div>
    </main>
  );
}