// ============================================================================
//  Route API — Création d'une session Stripe Checkout
//  EMPLACEMENT dans ton projet : app/api/checkout/route.ts
//
//  RÔLE : quand un visiteur clique sur "Commander" (page d'accueil), ce fichier
//  reçoit l'id du produit, crée une session de paiement Stripe, puis redirige
//  le visiteur vers la page de paiement sécurisée hébergée par Stripe.
//
//  ⚠️ À FAIRE POUR QUE ÇA FONCTIONNE :
//   1) Installer la librairie :   npm install stripe
//   2) Créer un fichier .env.local (JAMAIS commité sur Git) avec TES clés :
//        STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxx
//        NEXT_PUBLIC_SITE_URL=http://localhost:3000
//   3) Remplacer les "price_XXXX" ci-dessous par tes vrais Price IDs Stripe
//      (créés dans ton tableau de bord Stripe → Produits → Tarifs).
//      Idéalement, ces prix viendront plus tard de ta base Supabase.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// On crée l'objet Stripe avec la CLÉ SECRÈTE, lue dans les variables
// d'environnement → elle n'est jamais visible côté navigateur.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// Petit catalogue temporaire : à chaque id de produit correspond un Price Stripe.
// TODO : remplace ces valeurs de démonstration par tes vrais Price IDs.
const CATALOGUE: Record<string, { priceId: string }> = {
  "bijoux-perso":    { priceId: "price_XXXXXXXXXXXX" },
  "carterie-albums": { priceId: "price_XXXXXXXXXXXX" },
  "couture-cadeaux": { priceId: "price_XXXXXXXXXXXX" },
};

// La fonction POST est appelée automatiquement quand le formulaire "Commander"
// est soumis (méthode POST vers /api/checkout).
export async function POST(request: NextRequest) {
  // 1) Lire l'id envoyé par le champ caché <input name="productId">.
  const formData = await request.formData();
  const productId = formData.get("productId") as string;

  // 2) Vérifier que le produit existe (sécurité : on ne fait pas confiance
  //    aveuglément à ce que le navigateur envoie).
  const produit = CATALOGUE[productId];
  if (!produit) {
    return NextResponse.json({ error: "Produit inconnu" }, { status: 400 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  // 3) Créer la session de paiement Stripe.
  const session = await stripe.checkout.sessions.create({
    mode: "payment", // paiement unique (pour un abonnement, on mettrait "subscription")
    line_items: [{ price: produit.priceId, quantity: 1 }],
    success_url: `${siteUrl}/merci?session_id={CHECKOUT_SESSION_ID}`, // après paiement réussi
    cancel_url: `${siteUrl}/#boutique`,                                // si le client annule
  });

  // 4) Rediriger le visiteur vers la page de paiement Stripe.
  //    Le code 303 indique au navigateur de suivre la redirection en GET.
  return NextResponse.redirect(session.url as string, { status: 303 });
}