// ============================================================================
//  WEBHOOK STRIPE — Confirmation de paiement sécurisée
//  ----------------------------------------------------------------------------
//  EMPLACEMENT EXACT : app/api/webhooks/stripe/route.ts
//
//  À QUOI SERT CE FICHIER ?
//  Stripe appelle cette route automatiquement quand un paiement est terminé.
//  Cette route vérifie la signature Stripe, retrouve la commande concernée,
//  confirme qu’elle est payée, met à jour son statut, décrémente le stock,
//  puis envoie les emails de confirmation.
//
//  IMPORTANT SÉCURITÉ :
//  On ne confirme jamais une commande depuis la page de retour navigateur.
//  Seul ce webhook Stripe signé peut passer une commande en “payee”.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { envoyerEmailsConfirmation } from "@/lib/email";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY manquante.");
}

if (!stripeWebhookSecret) {
  throw new Error("STRIPE_WEBHOOK_SECRET manquante.");
}

const stripe = new Stripe(stripeSecretKey);

type ArticleCommande = {
  id: string;
  nom?: string;
  quantite: number;
};

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Signature Stripe manquante" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, stripeWebhookSecret);
  } catch {
    return NextResponse.json({ error: "Signature Stripe invalide" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (session.payment_status !== "paid") {
    return NextResponse.json({ received: true });
  }

  const orderId = session.metadata?.order_id ?? session.client_reference_id;

  if (!orderId) {
    return NextResponse.json({ error: "Commande introuvable dans Stripe" }, { status: 400 });
  }

  const admin = createSupabaseAdmin();

  const { data: commande, error: commandeError } = await admin
    .from("orders")
    .select("id, statut, articles, sous_total, frais_port, total, created_at")
    .eq("id", orderId)
    .single();

  if (commandeError || !commande) {
    return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
  }

  if (commande.statut === "payee") {
    return NextResponse.json({ received: true });
  }

  const { error: updateError } = await admin
    .from("orders")
    .update({
      statut: "payee",
      paid_at: new Date().toISOString(),
      stripe_payment_intent:
        typeof session.payment_intent === "string" ? session.payment_intent : null,
      email: session.customer_details?.email ?? null,
      nom_client: session.customer_details?.name ?? null,
      telephone: session.customer_details?.phone ?? null,
      adresse_livraison: session.customer_details?.address ?? null,
    })
    .eq("id", orderId)
    .neq("statut", "payee");

  if (updateError) {
    return NextResponse.json({ error: "Mise à jour commande impossible" }, { status: 500 });
  }

  const articles = (commande.articles ?? []) as ArticleCommande[];

  for (const article of articles) {
    if (!article.id || !Number.isFinite(article.quantite) || article.quantite <= 0) {
      continue;
    }

    const { data: produit } = await admin
      .from("products")
      .select("stock")
      .eq("id", article.id)
      .single();

    if (!produit) {
      continue;
    }

    // Nouveau stock après la vente.
    // On évite de descendre sous 0 par sécurité.
      const stockApresVente = Math.max(0, Number(produit.stock) - article.quantite);

    await admin
      .from("products")
      .update({ stock: stockApresVente })
      .eq("id", article.id);

    // Historique de stock : une ligne par produit vendu.
    // quantity_change est négatif car il s’agit d’une sortie de stock.
    await admin.from("stock_movements").insert({
      product_id: article.id,
      order_id: orderId,
      movement_type: "sale",
      quantity_change: -article.quantite,
      stock_after: stockApresVente,
      note: `Vente Stripe - commande ${orderId}`,
    });   
  }

  try {
    await envoyerEmailsConfirmation({
      id: orderId,
      createdAt: commande.created_at,
      emailClient: session.customer_details?.email ?? null,
      nomClient: session.customer_details?.name ?? null,
      telephone: session.customer_details?.phone ?? null,
      adresse: (session.customer_details?.address ?? null) as Record<string, string> | null,
      articles: commande.articles,
      sousTotal: commande.sous_total,
      fraisPort: commande.frais_port,
      total: commande.total,
    });
  } catch (error) {
    console.error("Envoi des emails de confirmation échoué:", error);
  }

  return NextResponse.json({ received: true });
}