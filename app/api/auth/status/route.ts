// ============================================================================
//  ROUTE API — Statut de connexion
//  ----------------------------------------------------------------------------
//  EMPLACEMENT EXACT : app/api/auth/status/route.ts
//
//  Sert à dire au panier si la cliente est connectée ou non.
// ============================================================================

import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";

export async function GET() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return NextResponse.json({
    estConnecte: Boolean(user),
    email: user?.email ?? null,
  });
}