// ============================================================================
//  Client Supabase pour le NAVIGATEUR
//  EMPLACEMENT dans ton projet : lib/supabase-browser.ts
//
//  À utiliser dans les composants "use client" (formulaires de connexion,
//  d'inscription, bouton de déconnexion…). Contrairement à ton ancien
//  lib/supabase.ts, celui-ci mémorise la session dans des COOKIES → le serveur
//  peut ainsi savoir qui est connecté.
// ============================================================================

import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}