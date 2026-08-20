// ============================================================================
//  COMPOSANT HEADER — menu du haut
//  ----------------------------------------------------------------------------
//  EMPLACEMENT EXACT : components/Header.tsx
//
//  À QUOI SERT CE FICHIER ?
//  Ce composant affiche le menu principal du site sur toutes les pages.
//  Il adapte aussi les liens selon l’utilisateur connecté :
//  - visiteur non connecté : bouton Connexion
//  - cliente connectée : lien Mes commandes
//  - administratrice : lien Admin + Commandes reçues
//
//  OBJECTIF UX :
//  Éviter qu’une administratrice clique sur “Mes commandes” en pensant voir les
//  commandes clientes. Pour l’admin, on affiche directement “Commandes reçues”.
// ============================================================================

import { createSupabaseServer } from "@/lib/supabase-server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import PanierIcone from "@/components/PanierIcone";

const liensNav = [
  { href: "/#accueil", label: "Accueil" },
  { href: "/boutique", label: "Boutique" },
  { href: "/#creations", label: "Nos Créations" },
  { href: "/#contact", label: "Contact" },
];

export default async function Header() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const estAdmin = user?.email === process.env.ADMIN_EMAIL;

  // Pour une cliente, on affiche “Mes commandes” dès qu’elle a au moins
  // une commande payée. Pour l’admin, on affiche toujours “Commandes reçues”.
  let aHistoriqueClient = false;

  if (user && !estAdmin) {
    const admin = createSupabaseAdmin();

    const { count } = await admin
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("statut", "payee");

    aHistoriqueClient = (count ?? 0) >= 1;
  }

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-pink-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between h-20 md:h-24">
          <a href="/" className="flex flex-col">
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-[#B03052]">
              Créations artisanales
            </span>
            <span className="text-2xl sm:text-4xl font-serif text-[#B03052]">
              L'Arbre à Bisous
            </span>
          </a>

          <div className="flex items-center gap-4 md:gap-6">
            <nav className="hidden md:block">
              <ul className="flex items-center gap-6 text-lg font-medium">
                {liensNav.map((lien) => (
                  <li key={lien.href}>
                    <a href={lien.href} className="hover:text-[#B03052] transition-colors">
                      {lien.label}
                    </a>
                  </li>
                ))}

                {estAdmin && (
                  <li>
                    <a href="/admin/commandes" className="text-[#B03052] font-semibold hover:underline">
                      Commandes reçues
                    </a>
                  </li>
                )}

                {!estAdmin && aHistoriqueClient && (
                  <li>
                    <a href="/mes-commandes" className="text-[#B03052] hover:underline">
                      Mes commandes
                    </a>
                  </li>
                )}

                {estAdmin && (
                  <li>
                    <a href="/admin" className="text-[#B03052] font-semibold hover:underline">
                      Admin
                    </a>
                  </li>
                )}

                {user ? (
                  <>
                    <li className="hidden lg:block text-sm text-gray-500">{user.email}</li>
                    <li>
                      <form action="/auth/deconnexion" method="POST">
                        <button className="text-[#B03052] hover:underline">Déconnexion</button>
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

            <PanierIcone />

            <details className="md:hidden relative">
              <summary className="list-none cursor-pointer p-2 text-3xl text-[#B03052]">☰</summary>

              <ul className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl p-4 space-y-1 text-lg font-medium">
                {liensNav.map((lien) => (
                  <li key={lien.href}>
                    <a
                      href={lien.href}
                      className="block px-3 py-2 rounded-lg hover:bg-pink-50 hover:text-[#B03052]"
                    >
                      {lien.label}
                    </a>
                  </li>
                ))}

                {estAdmin && (
                  <li>
                    <a
                      href="/admin/commandes"
                      className="block px-3 py-2 rounded-lg font-semibold text-[#B03052] hover:bg-pink-50"
                    >
                      Commandes reçues
                    </a>
                  </li>
                )}

                {!estAdmin && aHistoriqueClient && (
                  <li>
                    <a
                      href="/mes-commandes"
                      className="block px-3 py-2 rounded-lg text-[#B03052] hover:bg-pink-50"
                    >
                      Mes commandes
                    </a>
                  </li>
                )}

                {estAdmin && (
                  <li>
                    <a
                      href="/admin"
                      className="block px-3 py-2 rounded-lg font-semibold text-[#B03052] hover:bg-pink-50"
                    >
                      Admin
                    </a>
                  </li>
                )}

                <li>
                  <hr className="my-2 border-pink-100" />
                </li>

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
      </div>
    </header>
  );
}