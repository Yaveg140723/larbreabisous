// ============================================================================
//  Route API — Création d'une session Stripe Checkout
//  EMPLACEMENT dans ton projet : app/api/checkout/route.ts
//
//  ⭐ La personnalisation est maintenant saisie SUR TA FICHE PRODUIT (ton site),
//  plus sur la page Stripe → tu contrôles totalement son affichage. On la
//  transmet ensuite à Stripe : elle apparaît sur le récapitulatif de paiement
//  ET on la stocke (metadata) pour la page de confirmation.
//
//  ⚠️ .env.local : STRIPE_SECRET_KEY, NEXT_PUBLIC_SITE_URL (adresse -3000.app…)
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabase } from "@/lib/supabase"; // client Supabase (lecture publique)
import { createSupabaseServer } from "@/lib/supabase-server"; // pour vérifier la connexion

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(request: NextRequest) {
  // 🔒 SÉCURITÉ : achat RÉSERVÉ aux comptes connectés. Même si quelqu'un
  //    tentait d'envoyer une commande sans passer par le bouton du site, on
  //    refuse et on le renvoie vers la page de connexion.
  const authClient = await createSupabaseServer();
  const {
    data: { user },
  } = await authClient.auth.getUser();
  if (!user) {
    return new NextResponse(null, { status: 303, headers: { Location: "/connexion" } });
  }

  // 1) Lire l'id du produit envoyé par le bouton "Commander".
  const formData = await request.formData();
  const productId = formData.get("productId") as string;

  // 2) Lire le vrai produit dans Supabase (prix + stock + personnalisable).
  const { data: produit, error } = await supabase
    .from("products")
    .select("name, price, stock, customizable")
    .eq("id", productId)
    .single();

  if (error || !produit) {
    return NextResponse.json({ error: "Produit inconnu" }, { status: 400 });
  }

  // 🔒 Sécurité STOCK : refuser si plus de stock.
  if (produit.stock < 1) {
    return NextResponse.json({ error: "Produit en rupture de stock" }, { status: 400 });
  }

  // 3) Lire la personnalisation envoyée par la fiche produit.
  //    On ne la garde QUE si le produit est réellement personnalisable, et on
  //    coupe à 30 caractères par sécurité (au cas où le champ serait contourné).
  let personnalisation: string | null = null;
  if (produit.customizable) {
    const saisie = (formData.get("personnalisation") as string | null) ?? "";
    personnalisation = saisie.trim().slice(0, 30) || null;
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  // Stripe attend un montant en CENTIMES → euros × 100, arrondi.
  const montantCentimes = Math.round(Number(produit.price) * 100);

  // 4) Créer la session de paiement Stripe.
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: produit.name,
            // Si personnalisation : on l'affiche sous le produit sur Stripe.
            ...(personnalisation
              ? { description: `Personnalisation : ${personnalisation}` }
              : {}),
          },
          unit_amount: montantCentimes,
        },
        quantity: 1,
      },
    ],
    // On range la personnalisation dans "metadata" → la page de confirmation
    // pourra la relire à partir du session_id.
    metadata: personnalisation ? { personnalisation } : {},

    // {CHECKOUT_SESSION_ID} est remplacé par Stripe par l'id de la session.
    success_url: `${siteUrl}/commande-confirmee?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/#boutique`,
  });

  // 5) Rediriger vers la page de paiement Stripe.
  return NextResponse.redirect(session.url as string, { status: 303 });
}
