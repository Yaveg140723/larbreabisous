// ============================================================================
//  PAGE 404 PERSONNALISÉE — page introuvable
//  ----------------------------------------------------------------------------
//  EMPLACEMENT EXACT : app/not-found.tsx
//
//  À QUOI SERT CE FICHIER ?
//  Next.js affiche automatiquement cette page lorsqu’une URL n’existe pas.
//  Elle remplace l’erreur 404 générique par une page plus douce et utile.
//
//  OBJECTIF UX :
//  Aider la visiteuse à revenir vers la boutique ou le formulaire de contact.
// ============================================================================

export default function NotFound() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-8 py-24 text-center">
      <p className="text-sm uppercase tracking-[0.3em] text-[#B03052] mb-4">
        Page introuvable
      </p>

      <h1 className="text-4xl md:text-5xl font-serif text-[#B03052] mb-6">
        Oups, cette page n’existe pas 🌸
      </h1>

      <p className="text-lg text-gray-600 leading-relaxed mb-10">
        Le lien utilisé est peut-être incorrect ou la page a été déplacée.
        Vous pouvez revenir à l’accueil ou découvrir les créations disponibles.
      </p>

      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <a
          href="/"
          className="rounded-2xl bg-[#B03052] px-6 py-3 font-semibold text-white hover:bg-[#8d2742] transition-colors"
        >
          Retour à l’accueil
        </a>

        <a
          href="/boutique"
          className="rounded-2xl border border-[#B03052] px-6 py-3 font-semibold text-[#B03052] hover:bg-[#F5E6E8] transition-colors"
        >
          Voir la boutique
        </a>
      </div>
    </main>
  );
}