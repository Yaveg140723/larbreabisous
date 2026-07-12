// ============================================================================
//  Client Supabase ADMIN (clé service_role / secrète)
//  EMPLACEMENT dans ton projet : lib/supabase-admin.ts
//
//  ⚠️ Ce client utilise ta clé SECRÈTE (SUPABASE_SERVICE_ROLE_KEY) qui CONTOURNE
//  le RLS → il peut écrire dans la base. À utiliser UNIQUEMENT côté serveur, et
//  SEULEMENT après avoir vérifié que l'utilisateur est bien l'admin.
//  JAMAIS dans un composant navigateur.
// ============================================================================

import { createClient } from "@supabase/supabase-js";

export function createSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } } // pas de session : c'est un client "machine"
  );
}