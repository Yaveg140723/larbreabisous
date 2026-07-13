// ============================================================================
//  Route API — Webhook Stripe (décrément du stock après un paiement réussi)
//  EMPLACEMENT dans ton projet : app/api/webhooks/stripe/route.ts
//
//  Stripe appelle CETTE route automatiquement à chaque paiement. On vérifie
//  que l'appel vient bien de Stripe (signature), puis on baisse le stock du
//  produit acheté.
//
//  ⚠️ .env.local doit contenir :
//    STRIPE_WEBHOOK_SECRET=whsec_...   (donné par Stripe quand tu crées le webhook)
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(request: NextRequest) {
  // 1) Lire le corps BRUT + la signature Stripe (indispensable pour vérifier).
  const body = await request.text();
  const signature = request.headers.get("stripe-signature") as string;

  // 2) Vérifier que l'événement vient VRAIMENT de Stripe (sécurité anti-fraude).
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch {
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  // 3) On ne réagit qu'aux paiements RÉUSSIS.
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const productId = session.metadata?.productId;

    if (productId) {
      const admin = createSupabaseAdmin();

      // Lire le stock actuel, puis le baisser de 1 (jamais en dessous de 0).
      const { data: produit } = await admin
        .from("products")
        .select("stock")
        .eq("id", productId)
        .single();

      if (produit && produit.stock > 0) {
        await admin
          .from("products")
          .update({ stock: produit.stock - 1 })
          .eq("id", productId);
      }
    }
  }

  // 4) Toujours répondre 200 à Stripe (sinon il considère l'envoi en échec et
  //    réessaiera).
  return NextResponse.json({ received: true });
}