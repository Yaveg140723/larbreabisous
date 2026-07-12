// ============================================================================
//  Route API — Déconnexion
//  EMPLACEMENT dans ton projet : app/auth/deconnexion/route.ts
//  (nouveau dossier "auth" dans app/, puis un sous-dossier "deconnexion",
//   avec un fichier nommé route.ts)
//
//  RÔLE : le bouton "Déconnexion" du menu envoie ici (POST). On demande à
//  Supabase de fermer la session, puis on renvoie l'utilisateur à l'accueil.
// ============================================================================

import { createSupabaseServer } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = await createSupabaseServer();

  // Ferme la session (efface les cookies de connexion).
  await supabase.auth.signOut();

  // Redirection RELATIVE vers l'accueil → fonctionne partout (Codespaces,
  // Vercel…) sans souci de domaine ni de port.
  return new NextResponse(null, {
    status: 303,
    headers: { Location: "/" },
  });
}