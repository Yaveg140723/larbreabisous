// ============================================================================
//  MIDDLEWARE — le "gardien" qui s'exécute avant chaque page
//  EMPLACEMENT dans ton projet : middleware.ts  (à la RACINE, à côté de app/)
//
//  RÔLE : à chaque requête, il rafraîchit la session de l'utilisateur connecté
//  (pour qu'il reste connecté et que le serveur sache qui il est). C'est une
//  brique standard et indispensable de l'authentification Supabase en Next.js.
// ============================================================================

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Réponse par défaut : on laisse passer la requête.
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // ⚠️ Ligne clé : rafraîchit la session (garde l'utilisateur connecté).
  await supabase.auth.getUser();

  return response;
}

// On applique le middleware à toutes les pages SAUF les fichiers statiques
// (images, icônes…) pour ne pas ralentir inutilement.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
