// ============================================================================
//  Route API — Inscription à la newsletter
//  EMPLACEMENT dans ton projet : app/api/newsletter/subscribe/route.ts
//
//  Reçoit un email (envoyé par le composant NewsletterForm) et l'enregistre
//  dans la table newsletter_subscribers. Grâce à la contrainte "unique" sur
//  l'email, s'inscrire deux fois ne crée pas de doublon.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  // Lire l'email envoyé.
  let email = "";
  try {
    const body = await request.json();
    email = String(body.email || "").trim().toLowerCase();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  // Validation simple.
  if (!email.includes("@") || !email.includes(".")) {
    return NextResponse.json({ error: "Adresse email invalide." }, { status: 400 });
  }

  // upsert : ajoute l'email, ou ne fait rien s'il existe déjà (pas de doublon).
  const admin = createSupabaseAdmin();
  const { error } = await admin
    .from("newsletter_subscribers")
    .upsert({ email }, { onConflict: "email" });

  if (error) {
    return NextResponse.json({ error: "Inscription impossible." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
