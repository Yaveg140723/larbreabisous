// ============================================================================
//  Route API — Synchroniser les inscrits vers Brevo
//  EMPLACEMENT dans ton projet : app/api/newsletter/sync-brevo/route.ts
//
//  🔒 Réservée à l'admin. Envoie tous les emails de newsletter_subscribers
//  vers ta liste Brevo (import de contacts).
//
//  ⚠️ .env.local doit contenir :
//    BREVO_API_KEY=xkeysib-...
//    BREVO_LIST_ID=3
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  // 1) Vérifier l'admin.
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  }

  // Vérifier que les clés Brevo sont bien chargées (sinon → il faut redémarrer).
  if (!process.env.BREVO_API_KEY || !process.env.BREVO_LIST_ID) {
    return NextResponse.json(
      { error: "Clés Brevo absentes. Vérifie .env.local PUIS redémarre le serveur (Ctrl+C puis npm run dev)." },
      { status: 500 }
    );
  }

  // 2) Lire tous les inscrits.
  const admin = createSupabaseAdmin();
  const { data: abonnes } = await admin.from("newsletter_subscribers").select("email");
  const contacts = (abonnes ?? []).map((a) => ({ email: a.email }));

  if (contacts.length === 0) {
    return NextResponse.json({ error: "Aucun inscrit à synchroniser." }, { status: 400 });
  }

  // 3) Envoyer les contacts à Brevo (import dans ta liste).
  const res = await fetch("https://api.brevo.com/v3/contacts/import", {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY as string,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      listIds: [Number(process.env.BREVO_LIST_ID)],
      updateExistingContacts: true, // met à jour si le contact existe déjà
      emptyContactsAttributes: false,
      jsonBody: contacts,
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(
      { error: `Brevo a répondu ${res.status} : ${data.message || data.code || "erreur inconnue"}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, count: contacts.length });
}

