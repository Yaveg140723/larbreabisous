// ============================================================================
//  WEBHOOK STRIPE — commande payée : mise à jour + stock + EMAILS (n° + date)
//  EMPLACEMENT EXACT :  app/api/webhooks/stripe/route.ts
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { envoyerEmailsConfirmation } from "@/lib/email";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature") as string;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET as string);
  } catch {
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.order_id ?? session.client_reference_id;

    if (orderId) {
      const admin = createSupabaseAdmin();

      const { data: commande } = await admin
        .from("orders")
        .select("statut, articles, sous_total, frais_port, total, created_at")
        .eq("id", orderId)
        .single();

      if (commande && commande.statut !== "payee") {
        await admin.from("orders").update({
          statut: "payee",
          email: session.customer_details?.email ?? null,
          nom_client: session.customer_details?.name ?? null,
          telephone: session.customer_details?.phone ?? null,
          adresse_livraison: session.customer_details?.address ?? null,
        }).eq("id", orderId);

        const articles = (commande.articles ?? []) as { id: string; quantite: number }[];
        for (const a of articles) {
          const { data: p } = await admin.from("products").select("stock").eq("id", a.id).single();
          if (p) {
            await admin.from("products").update({ stock: Math.max(0, p.stock - a.quantite) }).eq("id", a.id);
          }
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
        } catch (e) {
          console.error("Envoi des emails de confirmation échoué:", e);
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}