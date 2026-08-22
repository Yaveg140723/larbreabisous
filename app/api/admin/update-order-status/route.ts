// ============================================================================
//  ROUTE API — Modifier le suivi de traitement d’une commande
//  ----------------------------------------------------------------------------
//  EMPLACEMENT EXACT : app/api/admin/update-order-status/route.ts
//
//  À QUOI SERT CE FICHIER ?
//  Cette route est appelée depuis la page admin des commandes.
//  Elle permet à l’administratrice de :
//  - changer le statut de traitement : à préparer, préparée, expédiée
//  - ajouter/modifier un numéro de suivi transport
//  - ajouter/modifier une note interne admin
//
//  IMPORTANT SÉCURITÉ :
//  La route revérifie toujours que la personne connectée est bien l’admin.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

const STATUTS_AUTORISES = ["a_preparer", "preparee", "expediee"] as const;

type StatutTraitement = (typeof STATUTS_AUTORISES)[number];

function estStatutTraitement(value: unknown): value is StatutTraitement {
  return typeof value === "string" && STATUTS_AUTORISES.includes(value as StatutTraitement);
}

function texteOptionnel(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return null;

  const texte = value.trim();

  return texte.length > 0 ? texte.slice(0, 200) : null;
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return new NextResponse(null, { status: 303, headers: { Location: "/" } });
  }

  const formData = await request.formData();

  const orderId = formData.get("order_id");
  const statutTraitement = formData.get("statut_traitement");
  const trackingNumber = texteOptionnel(formData.get("tracking_number"));
  const adminNote = texteOptionnel(formData.get("admin_note"));

  if (typeof orderId !== "string" || !orderId) {
    return NextResponse.json({ error: "Commande invalide" }, { status: 400 });
  }

  if (!estStatutTraitement(statutTraitement)) {
    return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
  }

  const updates: Record<string, string | null> = {
    statut_traitement: statutTraitement,
    tracking_number: trackingNumber,
    admin_note: adminNote,
  };

  if (statutTraitement === "a_preparer") {
    updates.prepared_at = null;
    updates.shipped_at = null;
  }

  if (statutTraitement === "preparee") {
    updates.prepared_at = new Date().toISOString();
    updates.shipped_at = null;
  }

  if (statutTraitement === "expediee") {
    updates.shipped_at = new Date().toISOString();
  }

  const admin = createSupabaseAdmin();

  await admin.from("orders").update(updates).eq("id", orderId);

  return new NextResponse(null, {
    status: 303,
    headers: { Location: "/admin/commandes" },
  });
}