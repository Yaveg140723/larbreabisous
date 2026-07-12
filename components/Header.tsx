// ============================================================================
//  COMPOSANT HEADER (menu du haut) — partagé sur toutes les pages
//  EMPLACEMENT dans ton projet : components/Header.tsx
//
//  ⭐ NOUVEAUTÉ (Phase 3d) : le menu affiche l'état de connexion.
//  Comme c'est un Server Component, il lit CÔTÉ SERVEUR qui est connecté
//  (via createSupabaseServer) et affiche soit "Connexion", soit l'email +
//  un bouton "Déconnexion".
// ============================================================================

import { createSupabaseServer } from "@/lib/supabase-server";

const liensNav = [
  { href: "/#accueil", label: "Accueil" },
  { href: "/#boutique", label: "Boutique" },
  { href: "/#creations", label: "Nos Créations" },
  { href: "/#contact", label: "Contact" },
];

// La fonction est "async" pour pouvoir ATTENDRE l'info de connexion.
export default async function Header() {
  // On récupère l'utilisateur connecté (ou null s'il ne l'est pas).
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // L'utilisateur est-il l'administratrice (ton épouse) ? On compare son email
  // à ADMIN_EMAIL (défini dans .env.local, côté serveur = sûr).
  const estAdmin = user?.email === process.env.ADMIN_EMAIL;

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-pink-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between h-20 md:h-24">

          {/* LOGO + NOM (cliquable → accueil) */}
          <a href="/" className="flex flex-col">
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-[#B03052]">
              Créations artisanales
            </span>
            <span className="text-2xl sm:text-4xl font-serif text-[#B03052]">
              L'Arbre à Bisous
            </span>
          </a>

          {/* MENU DESKTOP */}
          <nav className="hidden md:block">
            <ul className="flex items-center gap-6 text-lg font-medium">
              {liensNav.map((lien) => (
                <li key={lien.href}>
                  <a href={lien.href} className="hover:text-[#B03052] transition-colors">
                    {lien.label}
                  </a>
                </li>
              ))}

              {/* Lien Admin : visible UNIQUEMENT pour l'administratrice. */}
              {estAdmin && (
                <li>
                  <a href="/admin" className="text-[#B03052] font-semibold hover:underline">
                    Admin
                  </a>
                </li>
              )}

              {/* ── ZONE CONNEXION ──                                          */}
              {/* Si "user" existe → connecté ; sinon → déconnecté.             */}
              {user ? (
                <>
                  <li className="hidden lg:block text-sm text-gray-500">{user.email}</li>
                  <li>
                    {/* La déconnexion passe par une petite route serveur.      */}
                    <form action="/auth/deconnexion" method="POST">
                      <button className="text-[#B03052] hover:underline">
                        Déconnexion
                      </button>
                    </form>
                  </li>
                </>
              ) : (
                <li>
                  <a
                    href="/connexion"
                    className="bg-[#B03052] hover:bg-[#8d2742] text-white px-5 py-2 rounded-full text-base transition-colors"
                  >
                    Connexion
                  </a>
                </li>
              )}
            </ul>
          </nav>

          {/* MENU MOBILE (menu déroulant natif, sans JavaScript) */}
          <details className="md:hidden relative">
            <summary className="list-none cursor-pointer p-2 text-3xl text-[#B03052]">
              ☰
            </summary>
            <ul className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl p-4 space-y-1 text-lg font-medium">
              {liensNav.map((lien) => (
                <li key={lien.href}>
                  <a href={lien.href} className="block px-3 py-2 rounded-lg hover:bg-pink-50 hover:text-[#B03052]">
                    {lien.label}
                  </a>
                </li>
              ))}

              {estAdmin && (
                <li>
                  <a href="/admin" className="block px-3 py-2 rounded-lg font-semibold text-[#B03052] hover:bg-pink-50">
                    Admin
                  </a>
                </li>
              )}

              {/* Séparateur */}
              <li><hr className="my-2 border-pink-100" /></li>

              {user ? (
                <>
                  <li className="px-3 py-1 text-sm text-gray-500 break-all">{user.email}</li>
                  <li>
                    <form action="/auth/deconnexion" method="POST">
                      <button className="w-full text-left px-3 py-2 rounded-lg text-[#B03052] hover:bg-pink-50">
                        Déconnexion
                      </button>
                    </form>
                  </li>
                </>
              ) : (
                <li>
                  <a href="/connexion" className="block px-3 py-2 rounded-lg text-[#B03052] hover:bg-pink-50">
                    Connexion
                  </a>
                </li>
              )}
            </ul>
          </details>

        </div>
      </div>
    </header>
  );
}