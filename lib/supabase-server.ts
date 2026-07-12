// ============================================================================
//  Client Supabase pour le SERVEUR
//  EMPLACEMENT dans ton projet : lib/supabase-server.ts
//
//  À utiliser dans les Server Components et les routes serveur quand on a
//  besoin de savoir QUI est connecté. Il lit les cookies de session.
//  (On l'utilisera dès la Phase 3d pour afficher l'état connecté dans le menu.)
// ============================================================================

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createSupabaseServer() {
  // En Next.js 16, cookies() est asynchrone → on utilise "await".
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Appelé depuis un Server Component → sans effet (c'est le
            // middleware qui rafraîchit réellement les sessions). Ignorable.
          }
        },
      },
    }
  );
}