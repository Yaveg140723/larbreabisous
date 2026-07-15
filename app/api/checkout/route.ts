// ============================================================================
//  Route API — PAIEMENT DU PANIER COMPLET (plusieurs articles + frais de port)
//  ----------------------------------------------------------------------------
//  EMPLACEMENT EXACT :  app/api/checkout/route.ts
//
//  Quand la cliente clique « Payer » (page /panier), ce code :
//   1. vérifie qu'elle est connectée,
//   2. relit les VRAIS prix des produits dans Supabase (jamais ceux du navigateur),
//   3. calcule les frais de port (barème Shop2Shop),
//   4. enregistre la commande (statut « en_attente »),
//   5. crée la page de paiement Stripe et renvoie son adresse.
//  ⚠️ .env.local : STRIPE_SECRET_KEY, NEXT_PUBLIC_SITE_URL, SUPABASE_SERVICE_ROLE_KEY
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabase } from "@/lib/supabase";                    // lecture publique des produits
import { createSupabaseServer } from "@/lib/supabase-server"; // qui est connecté ?
import { createSupabaseAdmin } from "@/lib/supabase-admin";   // écrire la commande
import { calculerFraisDePort } from "@/lib/livraison";        // ton calcul de frais de port

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// Forme d'un article envoyé par le panier : id produit + quantité + perso éventuelle.
type ArticlePanier = { id: string; quantity: number; personnalisation: string | null };

export async function POST(request: NextRequest) {
  // 🔒 1) L'acheteuse est-elle connectée ?
  const authClient = await createSupabaseServer();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) {
    // 401 = non autorisée → le bouton du panier redirigera vers /connexion.
    return NextResponse.json({ error: "connexion" }, { status: 401 });
  }

  // 2) Lire le panier envoyé par le bouton « Payer ».
  let items: ArticlePanier[] = [];
  try {
    const body = await request.json();
    items = Array.isArray(body.items) ? body.items : [];
  } catch {
    return NextResponse.json({ error: "Panier illisible" }, { status: 400 });
  }
  if (items.length === 0) {
    return NextResponse.json({ error: "Panier vide" }, { status: 400 });
  }

  // 3) Relire les VRAIS produits dans Supabase (prix, stock, poids, perso).
  const ids = [...new Set(items.map((i) => i.id))]; // liste des id, sans doublon
  const { data: produits, error } = await supabase
    .from("products")
    .select("id, name, price, stock, weight, customizable")
    .in("id", ids);

  if (error || !produits) {
    return NextResponse.json({ error: "Lecture des produits impossible" }, { status: 500 });
  }

  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  const articlesCommande: {
    id: string; nom: string; quantite: number; prix_unitaire: number; personnalisation: string | null;
  }[] = [];
  let sousTotalCentimes = 0;
  let poidsTotal = 0;

  // On parcourt chaque article du panier.
  for (const item of items) {
    const p = produits.find((x) => x.id === item.id);
    if (!p) {
      return NextResponse.json({ error: "Produit inconnu dans le panier" }, { status: 400 });
    }

    const quantite = Math.max(1, Math.min(Number(item.quantity) || 1, 99)); // quantité bornée 1→99

    // 🔒 Stock : on refuse si la quantité dépasse le stock.
    if (p.stock < quantite) {
      return NextResponse.json({ error: `Stock insuffisant : ${p.name}` }, { status: 409 });
    }

    // Personnalisation gardée uniquement si le produit est personnalisable (≤30 car.).
    let perso: string | null = null;
    if (p.customizable) {
      perso = (item.personnalisation ?? "").trim().slice(0, 30) || null;
    }

    const prixUnitaireCentimes = Math.round(Number(p.price) * 100); // euros → centimes
    sousTotalCentimes += prixUnitaireCentimes * quantite;
    poidsTotal += Number(p.weight) * quantite;

    line_items.push({
      quantity: quantite,
      price_data: {
        currency: "eur",
        unit_amount: prixUnitaireCentimes,
        product_data: {
          name: p.name,
          ...(perso ? { description: `Personnalisation : ${perso}` } : {}),
        },
      },
    });

    articlesCommande.push({
      id: p.id, nom: p.name, quantite, prix_unitaire: Number(p.price), personnalisation: perso,
    });
  }

  // 4) Frais de port (barème Shop2Shop + livraison offerte dès 80 €).
  const sousTotalEuros = sousTotalCentimes / 100;
  const fraisPortEuros = calculerFraisDePort(poidsTotal, sousTotalEuros);
  const fraisPortCentimes = Math.round(fraisPortEuros * 100);
  const totalEuros = sousTotalEuros + fraisPortEuros;

  // 5) Enregistrer la commande AVANT le paiement (statut « en_attente »).
  const admin = createSupabaseAdmin();
  const { data: commande, error: errCmd } = await admin
    .from("orders")
    .insert({
      statut: "en_attente",
      user_id: user.id,
      email: user.email,
      articles: articlesCommande,
      poids_total: poidsTotal,
      sous_total: sousTotalEuros,
      frais_port: fraisPortEuros,
      total: totalEuros,
    })
    .select("id")
    .single();

  if (errCmd || !commande) {
    return NextResponse.json({ error: "Création de la commande impossible" }, { status: 500 });
  }

  // 6) Créer la page de paiement Stripe.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items,
    customer_email: user.email,
    phone_number_collection: { enabled: true },
    shipping_address_collection: { allowed_countries: ["FR", "BE", "LU", "CH", "MC"] },
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: { amount: fraisPortCentimes, currency: "eur" },
          display_name: fraisPortCentimes === 0 ? "Livraison offerte 🎁" : "Chronopost Shop2Shop (point relais)",
          delivery_estimate: {
            minimum: { unit: "business_day", value: 2 },
            maximum: { unit: "business_day", value: 4 },
          },
        },
      },
    ],
    client_reference_id: commande.id,
    metadata: { order_id: commande.id },
    success_url: `${siteUrl}/commande-confirmee?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/panier`,
  });

  // 7) Mémoriser le numéro de session Stripe sur la commande.
  await admin.from("orders").update({ stripe_session_id: session.id }).eq("id", commande.id);

  // 8) Renvoyer l'adresse de paiement au bouton (qui redirige le navigateur).
  return NextResponse.json({ url: session.url });
}