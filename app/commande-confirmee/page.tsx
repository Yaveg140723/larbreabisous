// ============================================================================
//  PAGE DE CONFIRMATION DE COMMANDE
//  EMPLACEMENT dans ton projet : app/commande-confirmee/page.tsx
//
//  ⭐ NOUVEAUTÉ : on récupère la personnalisation saisie par l'acheteur sur
//  Stripe et on l'affiche ici (rappel + vérification), quand l'article est
//  personnalisable.
//
//  COMMENT ÇA MARCHE : après le paiement, Stripe nous renvoie ici avec un
//  "session_id" dans l'adresse. On demande alors à Stripe (côté serveur, avec
//  la clé secrète) les détails de cette session — qui contiennent le champ
//  personnalisé rempli par l'acheteur.
// ============================================================================

import Stripe from "stripe";

// Client Stripe (clé SECRÈTE, lue dans .env.local → côté serveur uniquement).
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// La page reçoit les paramètres d'URL (searchParams). En Next.js 16, c'est une
// "promesse" → on utilise "await" pour lire le session_id.
export default async function CommandeConfirmee({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  // On va chercher la personnalisation saisie sur Stripe (si elle existe).
  let personnalisation: string | null = null;
  if (session_id) {
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id);
      // La personnalisation a été rangée dans "metadata" par la route checkout.
      personnalisation = session.metadata?.personnalisation || null;
    } catch {
      // session_id absent/invalide (ex : page ouverte directement) → on ignore.
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-8 py-24 md:py-32 text-center">
      <div className="text-6xl mb-6">🎁</div>

      <h1 className="text-4xl md:text-6xl font-serif text-[#B03052] mb-6">
        Commande confirmée !
      </h1>

      <p className="text-lg md:text-2xl leading-relaxed mb-4">
        Merci pour votre commande 💕 Votre paiement a bien été reçu. Nous
        préparons votre création avec le plus grand soin.
      </p>

      {/* ── RAPPEL DE LA PERSONNALISATION ──                                  */}
      {/* Ce bloc ne s'affiche QUE si une personnalisation a été saisie.        */}
      {/* Le style (fond rosé + bordure + texte plus grand) le fait bien        */}
      {/* RESSORTIR du reste du texte de la page.                               */}
      {personnalisation && (
        <div className="mt-10 mb-10 bg-[#F5E6E8] border-2 border-[#B03052] rounded-2xl p-6">
          <p className="text-sm uppercase tracking-[0.15em] text-[#B03052] font-semibold mb-3">
            ✨ Votre personnalisation
          </p>
          <p className="text-2xl md:text-3xl font-serif text-[#2C2C2C]">
            « {personnalisation} »
          </p>
          <p className="text-sm text-gray-500 mt-3">
            Vérifiez bien ce texte : c'est lui qui sera réalisé sur votre création.
          </p>
        </div>
      )}

      <a
        href="/"
        className="inline-block bg-[#B03052] hover:bg-[#8d2742] text-white px-8 py-4 rounded-2xl text-lg shadow-lg transition-colors focus:outline-none focus:ring-4 focus:ring-[#B03052]/30"
      >
        Retour à l'accueil
      </a>
    </main>
  );
}
