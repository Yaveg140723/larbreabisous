// ============================================================================
//  Route API — Supprimer un produit (depuis l'admin)
//  EMPLACEMENT dans ton projet : app/api/admin/delete-product/route.ts
//
//  🔒 Revérifie que c'est bien l'admin avant de supprimer.
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
    return new NextResponse(null, { status: 303, headers: { Location: "/" } });
  }

  // 2) Supprimer le produit correspondant à l'id envoyé.
  const formData = await request.formData();
  const id = formData.get("id") as string;

  const admin = createSupabaseAdmin();
  await admin.from("products").delete().eq("id", id);

  // 3) Retour à la page admin.
  return new NextResponse(null, { status: 303, headers: { Location: "/admin" } });
}
