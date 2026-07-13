// ============================================================================
//  COMPOSANT FOOTER (le pied de page) — partagé sur toutes les pages
//  EMPLACEMENT dans ton projet : components/Footer.tsx
//
//  Même logique que le Header : on le sort de page.tsx pour qu'il s'affiche
//  sur TOUTES les pages via le layout, et non uniquement sur l'accueil.
// ============================================================================

import NewsletterForm from "@/components/NewsletterForm";

export default function Footer() {
  return (
    <footer className="bg-[#B03052] text-white mt-16 md:mt-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-12 md:py-16">

        {/* ── NEWSLETTER (inscription) ── */}
        <div className="mb-12 pb-12 border-b border-pink-300 text-center max-w-xl mx-auto">
          <h3 className="text-2xl font-serif mb-2">Restez informée 🌸</h3>
          <p className="mb-4 text-sm text-pink-100">
            Inscrivez-vous pour recevoir les nouvelles créations et les actualités.
          </p>
          <NewsletterForm />
        </div>

        {/* Grille des 3 colonnes : 1 colonne sur mobile, 3 sur écran moyen. */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">

          {/* MARQUE */}
          <div>
            <h3 className="text-2xl md:text-3xl font-serif mb-4">L'Arbre à Bisous</h3>
            <p className="leading-relaxed">
              Créations artisanales personnalisées : couture, bijoux, carterie,
              créations Fimo, albums photos et cadeaux personnalisés.
            </p>
          </div>

          {/* LIENS */}
          <div>
            <h4 className="text-xl font-semibold mb-4">Informations</h4>
            <ul className="space-y-2">
              <li><a href="/#accueil" className="hover:underline">Accueil</a></li>
              <li><a href="/#boutique" className="hover:underline">Boutique</a></li>
              <li><a href="/#contact" className="hover:underline">Contact</a></li>
              <li><a href="/mentions-legales" className="hover:underline">Mentions légales</a></li>
              <li><a href="/cgv" className="hover:underline">CGV</a></li>
              <li><a href="/confidentialite" className="hover:underline">Politique de confidentialité</a></li>
            </ul>
          </div>

          {/* RÉSEAUX SOCIAUX */}
          <div>
            <h4 className="text-xl font-semibold mb-4">Suivez-nous</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:underline">Facebook</a></li>
              <li><a href="#" className="hover:underline">Instagram</a></li>
              <li><a href="#" className="hover:underline">Pinterest</a></li>
              <li><a href="#" className="hover:underline">TikTok</a></li>
            </ul>
          </div>
        </div>

        {/* COPYRIGHT : après la grille → occupe toute la largeur. */}
        <div className="border-t border-pink-300 mt-10 md:mt-12 pt-8 text-center text-sm">
          © {new Date().getFullYear()} L'Arbre à Bisous. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}