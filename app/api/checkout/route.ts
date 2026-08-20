// ============================================================================
//  Route API — PAIEMENT DU PANIER COMPLET sécurisé
//  ----------------------------------------------------------------------------
//  EMPLACEMENT EXACT : app/api/checkout/route.ts
//
//  À QUOI SERT CE FICHIER ?
//  Quand la cliente clique sur le bouton de paiement depuis app/panier/page.tsx,
//  cette route serveur reçoit le panier, vérifie qu’il est valide, relit les
//  vrais produits dans Supabase, recalcule les prix et frais de port côté serveur,
//  crée une commande en attente, puis génère une session Stripe.
//
//  IMPORTANT SÉCURITÉ :
//  On ne fait jamais confiance aux prix, poids, stocks ou totaux envoyés par le
//  navigateur. Le navigateur envoie seulement les IDs produits, les quantités,
//  les personnalisations et l’acceptation des CGV.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabase } from "@/lib/supabase";
import { createSupabaseServer } from "@/lib/supabase-server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { calculerFraisDePort } from "@/lib/livraison";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY manquante.");
}

const stripe = new Stripe(stripeSecretKey);

// Limites de sécurité côté serveur.
const MAX_LIGNES_PANIER = 20;
const MAX_QUANTITE_PAR_LIGNE = 20;
const MAX_PERSONNALISATION = 30;

// Forme d’un article envoyé par le panier.
type ArticlePanier = {
  id: string;
  quantity: number;
  personnalisation: string | null;
};

type CheckoutBody = {
  items?: ArticlePanier[];
  conditionsAcceptees?: boolean;
};

export async function POST(request: NextRequest) {
  // 🔒 1) Vérifier que la cliente est connectée.
  const authClient = await createSupabaseServer();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "connexion" }, { status: 401 });
  }

  // 🔒 2) Lire et valider le contenu envoyé par le panier.
  let body: CheckoutBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Panier illisible" }, { status: 400 });
  }

  if (body.conditionsAcceptees !== true) {
    return NextResponse.json(
      { error: "Veuillez accepter les CGV avant de continuer." },
      { status: 400 }
    );
  }

  const items = Array.isArray(body.items) ? body.items : [];

  if (items.length === 0) {
    return NextResponse.json({ error: "Panier vide" }, { status: 400 });
  }

  if (items.length > MAX_LIGNES_PANIER) {
    return NextResponse.json(
      { error: "Le panier contient trop d’articles différents." },
      { status: 400 }
    );
  }

  // 3) Normaliser le panier.
  // Objectif :
  // - garder uniquement des IDs valides,
  // - forcer les quantités à des entiers,
  // - limiter les quantités,
  // - nettoyer la personnalisation,
  // - fusionner les doublons produit + personnalisation.
  const panierNormalise = new Map<string, ArticlePanier>();

  for (const item of items) {
    if (!item || typeof item.id !== "string" || item.id.trim() === "") {
      return NextResponse.json({ error: "Produit invalide dans le panier" }, { status: 400 });
    }

    const quantity = Number(item.quantity);

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITE_PAR_LIGNE) {
      return NextResponse.json(
        { error: "Quantité invalide dans le panier" },
        { status: 400 }
      );
    }

    const personnalisation =
      typeof item.personnalisation === "string"
        ? item.personnalisation.trim().slice(0, MAX_PERSONNALISATION)
        : null;

    const key = `${item.id}::${personnalisation ?? ""}`;
    const existant = panierNormalise.get(key);

    panierNormalise.set(key, {
      id: item.id,
      quantity: (existant?.quantity ?? 0) + quantity,
      personnalisation: personnalisation || null,
    });
  }

  const panier = [...panierNormalise.values()];

  for (const item of panier) {
    if (item.quantity > MAX_QUANTITE_PAR_LIGNE) {
      return NextResponse.json(
        { error: "Quantité trop élevée pour un produit." },
        { status: 400 }
      );
    }
  }

  // 4) Relire les vrais produits dans Supabase.
  const ids = [...new Set(panier.map((item) => item.id))];

  const { data: produits, error } = await supabase
    .from("products")
    .select("id, name, price, stock, weight, customizable")
    .in("id", ids);

  if (error || !produits) {
    return NextResponse.json(
      { error: "Lecture des produits impossible" },
      { status: 500 }
    );
  }

  if (produits.length !== ids.length) {
    return NextResponse.json(
      { error: "Un produit du panier n’existe plus." },
      { status: 400 }
    );
  }

  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  const articlesCommande: {
    id: string;
    nom: string;
    quantite: number;
    prix_unitaire: number;
    personnalisation: string | null;
  }[] = [];

  let sousTotalCentimes = 0;
  let poidsTotal = 0;

  // 5) Recalculer prix, stock, poids et lignes Stripe côté serveur.
  for (const item of panier) {
    const produit = produits.find((p) => p.id === item.id);

    if (!produit) {
      return NextResponse.json(
        { error: "Produit inconnu dans le panier" },
        { status: 400 }
      );
    }

    const prix = Number(produit.price);
    const stock = Number(produit.stock);
    const poids = Number(produit.weight);

    if (!Number.isFinite(prix) || prix <= 0) {
      return NextResponse.json(
        { error: `Prix invalide pour le produit : ${produit.name}` },
        { status: 400 }
      );
    }

    if (!Number.isFinite(stock) || stock < item.quantity) {
      return NextResponse.json(
        { error: `Stock insuffisant : ${produit.name}` },
        { status: 409 }
      );
    }

    if (!Number.isFinite(poids) || poids < 0) {
      return NextResponse.json(
        { error: `Poids invalide pour le produit : ${produit.name}` },
        { status: 400 }
      );
    }

    // Si le produit n’est pas personnalisable, on ignore toute personnalisation.
    const personnalisation = produit.customizable ? item.personnalisation : null;

    const prixUnitaireCentimes = Math.round(prix * 100);
    sousTotalCentimes += prixUnitaireCentimes * item.quantity;
    poidsTotal += poids * item.quantity;

    line_items.push({
      quantity: item.quantity,
      price_data: {
        currency: "eur",
        unit_amount: prixUnitaireCentimes,
        product_data: {
          name: produit.name,
          ...(personnalisation
            ? { description: `Personnalisation : ${personnalisation}` }
            : {}),
        },
      },
    });

    articlesCommande.push({
      id: produit.id,
      nom: produit.name,
      quantite: item.quantity,
      prix_unitaire: prix,
      personnalisation,
    });
  }

  // 6) Calculer les frais de port côté serveur.
  const sousTotalEuros = sousTotalCentimes / 100;
  const fraisPortEuros = calculerFraisDePort(poidsTotal, sousTotalEuros);
  const fraisPortCentimes = Math.round(fraisPortEuros * 100);
  const totalEuros = sousTotalEuros + fraisPortEuros;

  if (!Number.isFinite(fraisPortEuros) || fraisPortEuros < 0) {
    return NextResponse.json(
      { error: "Calcul des frais de port impossible" },
      { status: 500 }
    );
  }

  // 7) Enregistrer la commande avant paiement.
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
      conditions_acceptees: true,
      conditions_acceptees_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (errCmd || !commande) {
    console.error("Erreur insertion commande:", errCmd);
    return NextResponse.json(
      { error: "Création de la commande impossible" },
      { status: 500 }
    );
  }

  // 8) Créer la session Stripe.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items,
    customer_email: user.email,
    phone_number_collection: { enabled: true },
    shipping_address_collection: {
      allowed_countries: ["FR", "BE", "LU", "CH", "MC"],
    },
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: { amount: fraisPortCentimes, currency: "eur" },
          display_name:
            fraisPortCentimes === 0
              ? "Livraison offerte 🎁"
              : "Chronopost Shop2Shop (point relais)",
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

  // 9) Mémoriser l’identifiant Stripe sur la commande.
  await admin
    .from("orders")
    .update({ stripe_session_id: session.id })
    .eq("id", commande.id);

  // 10) Renvoyer l’adresse de paiement au navigateur.
  return NextResponse.json({ url: session.url });
}