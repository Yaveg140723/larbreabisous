// ============================================================================
//  COMPOSANT HEADER (le menu du haut) — partagé sur toutes les pages
//  EMPLACEMENT dans ton projet : components/Header.tsx
//
//  POURQUOI un fichier séparé ?
//  Avant, le menu était écrit à l'intérieur de page.tsx → il n'existait que sur
//  la page d'accueil. En le sortant dans son propre composant et en l'appelant
//  depuis le layout, il s'affiche AUTOMATIQUEMENT sur chaque page. Un seul
//  endroit à modifier = zéro risque d'incohérence.
//
//  C'est un Server Component (pas de "use client") : le menu mobile s'ouvre
//  grâce à la balise <details>, donc sans JavaScript.
// ============================================================================

// Les liens du menu, définis une seule fois. Chaque href pointe vers l'id
// d'une section de la page d'accueil (#accueil, #boutique…).
const liensNav = [
  { href: "/#accueil", label: "Accueil" },
  { href: "/#boutique", label: "Boutique" },
  { href: "/#creations", label: "Nos Créations" },
  { href: "/#contact", label: "Contact" },
];

export default function Header() {
  return (
    // sticky top-0 : la barre reste collée en haut pendant le défilement.
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-pink-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between h-20 md:h-24">

          {/* LOGO + NOM (cliquable : ramène à l'accueil) */}
          <a href="/" className="flex flex-col">
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-[#B03052]">
              Créations artisanales
            </span>
            <span className="text-2xl sm:text-4xl font-serif text-[#B03052]">
              L'Arbre à Bisous
            </span>
          </a>

          {/* MENU DESKTOP : caché sur mobile, visible à partir de "md". */}
          <nav className="hidden md:block">
            <ul className="flex items-center gap-8 text-lg font-medium">
              {liensNav.map((lien) => (
                <li key={lien.href}>
                  <a href={lien.href} className="hover:text-[#B03052] transition-colors">
                    {lien.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* MENU MOBILE : menu déroulant natif <details> (aucun JavaScript). */}
          <details className="md:hidden relative">
            <summary className="list-none cursor-pointer p-2 text-3xl text-[#B03052]">
              ☰
            </summary>
            <ul className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl p-4 space-y-1 text-lg font-medium">
              {liensNav.map((lien) => (
                <li key={lien.href}>
                  <a href={lien.href} className="block px-3 py-2 rounded-lg hover:bg-pink-50 hover:text-[#B03052]">
                    {lien.label}
                  </a>
                </li>
              ))}
            </ul>
          </details>

        </div>
      </div>
    </header>
  );
}
