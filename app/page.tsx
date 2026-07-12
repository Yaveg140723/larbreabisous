// ============================================================================
//  L'Arbre à Bisous — Page d'accueil (Next.js — App Router)
//  Emplacement dans ton projet : app/page.tsx
//
//  ⭐ NOUVEAUTÉ vs la version précédente :
//  Le MENU (Header) et le PIED DE PAGE (Footer) ne sont PLUS ici : ils vivent
//  maintenant dans app/layout.tsx (via les composants Header et Footer) et
//  s'affichent automatiquement sur toutes les pages. Cette page ne contient
//  donc plus que SON contenu propre : les sections Hero, Créations, Boutique,
//  Contact. C'est la règle de l'App Router : UI partagée → layout, contenu de
//  la page → page.tsx.
//
//  ℹ️ Le fond crème et la couleur du texte sont désormais posés sur le <body>
//  (dans le layout), donc inutile de les répéter ici.
// ============================================================================

// On importe le composant <Script> de Next.js (pour le CAPTCHA Turnstile)…
import Script from "next/script";
// …et le client Supabase, pour lire les produits depuis ta base de données.
import { supabase } from "@/lib/supabase";

// --- DONNÉES STATIQUES ------------------------------------------------------
// Les "catégories" (section Nos Créations) sont de simples vignettes
// décoratives → on les garde en dur ici. En revanche, les PRODUITS de la
// boutique sont maintenant LUS DEPUIS SUPABASE (voir la requête dans Home).
const categories = [
  { icon: "🧵", titre: "Couture", texte: "Pièces cousues main, uniques." },
  { icon: "💎", titre: "Bijoux", texte: "Bijoux personnalisés sur mesure." },
  { icon: "✉️", titre: "Carterie", texte: "Cartes pour toutes les occasions." },
  { icon: "🎨", titre: "Créations Fimo", texte: "Petites créations en pâte Fimo." },
  { icon: "📸", titre: "Albums Personnalisés", texte: "Albums photos souvenirs." },
  { icon: "🎁", titre: "Cadeaux Personnalisés", texte: "Cadeaux qui font plaisir." },
];

// Petite fonction utilitaire : transforme un prix en euros (ex. 25) en un
// texte lisible "25,00 €" (avec le bon symbole et les décimales).
function formatPrix(euros: number | string) {
  return Number(euros).toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
  });
}

// La fonction est "async" : elle peut ATTENDRE (await) les données de Supabase
// avant de construire la page. C'est un super-pouvoir des Server Components.
export default async function Home() {
  // On lit les produits depuis la table "products" de Supabase.
  // (La politique RLS "lecture publique" autorise cette requête.)
  const { data: produits } = await supabase
    .from("products")
    .select("id, name, description, price, image_url, customizable, customization_label, weight, stock")
    .order("created_at", { ascending: true });

  return (
    // <main> = le contenu principal de la page (sans le menu ni le pied de page,
    // qui sont dans le layout). Le fond et la couleur viennent du <body>.
    <main>

      {/* ========================= HERO (accroche) ========================= */}
      {/* id="accueil" : cible du lien "Accueil" du menu.                     */}
      <section id="accueil" className="max-w-6xl mx-auto px-4 sm:px-8 py-16 md:py-24 text-center">
        {/* Titre "responsive" : petit sur mobile, très grand sur ordinateur. */}
        <h2 className="text-4xl sm:text-6xl md:text-7xl font-serif text-[#B03052] mb-6 md:mb-8">
          Créations artisanales personnalisées
        </h2>

        <p className="text-lg md:text-2xl leading-relaxed max-w-3xl mx-auto mb-10 md:mb-12">
          Couture, bijoux, carterie, créations Fimo, albums photos et cadeaux
          personnalisés. Chaque création est unique et réalisée avec soin pour
          vous offrir un produit de qualité.
        </p>

        {/* Bouton = lien vers la boutique. focus:ring = anneau visible au    */}
        {/* clavier → accessibilité pour qui n'utilise pas la souris.         */}
        <a
          href="#boutique"
          className="inline-block bg-[#B03052] hover:bg-[#8d2742] text-white px-8 sm:px-10 py-4 rounded-2xl text-lg shadow-lg transition-colors focus:outline-none focus:ring-4 focus:ring-[#B03052]/30"
        >
          Découvrir la Boutique
        </a>
      </section>

      {/* ========================= NOS CRÉATIONS ========================= */}
      <section id="creations" className="max-w-6xl mx-auto px-4 sm:px-8 py-16 md:py-20">
        <h2 className="text-3xl md:text-5xl text-center font-serif text-[#B03052] mb-10 md:mb-16">
          Nos Créations
        </h2>

        {/* Grille responsive : 1 colonne (mobile) → 2 (sm) → 3 (md). */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
          {categories.map((cat) => (
            <div
              key={cat.titre}
              className="bg-white rounded-3xl p-8 md:p-10 shadow-lg text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="text-5xl mb-4">{cat.icon}</div>
              <h3 className="text-2xl font-semibold text-[#B03052] mb-2">{cat.titre}</h3>
              <p className="text-gray-600">{cat.texte}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ========================= À PROPOS ========================= */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 py-16 md:py-24">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-lg">
          <h2 className="text-3xl md:text-5xl font-serif text-[#B03052] mb-6 md:mb-8">
            Une création unique à chaque histoire
          </h2>
          <p className="text-lg md:text-xl leading-relaxed">
            Chaque création est réalisée de façon artisanale avec une attention
            particulière portée aux détails, aux matériaux et à la
            personnalisation. L'objectif est de proposer des produits uniques qui
            apportent émotion, souvenirs et douceur à ceux qui les reçoivent.
          </p>
        </div>
      </section>

      {/* ==================== CRÉATIONS DU MOMENT (boutique) ==================== */}
      <section id="boutique" className="max-w-6xl mx-auto px-4 sm:px-8 py-16 md:py-20">
        <h2 className="text-3xl md:text-5xl text-center font-serif text-[#B03052] mb-10 md:mb-16">
          Les créations du moment
        </h2>

        {/* Si aucun produit (base vide ou souci de lecture), on prévient. */}
        {(!produits || produits.length === 0) && (
          <p className="text-center text-gray-500">
            Aucun produit pour le moment. Revenez bientôt ! 🌸
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {/* On boucle sur les produits LUS DEPUIS SUPABASE (variable "produits"). */}
          {(produits ?? []).map((produit) => (
            <div
              key={produit.id}
              className="bg-white rounded-3xl p-6 md:p-8 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col"
            >
              {/* Si le produit a une photo (image_url), on l'affiche ; sinon on */}
              {/* garde la vignette rose. (<img> simple ; on passera à next/image */}
              {/* plus tard, qui demande un réglage de domaines autorisés.)       */}
              {produit.image_url ? (
                <img
                  src={produit.image_url}
                  alt={produit.name}
                  className="aspect-[4/3] w-full object-cover rounded-2xl mb-6"
                />
              ) : (
                <div className="aspect-[4/3] bg-[#E8B7C8] rounded-2xl mb-6"></div>
              )}

              <h3 className="text-2xl font-semibold text-[#B03052] mb-2">{produit.name}</h3>
              <p className="text-gray-600 leading-relaxed mb-3">{produit.description}</p>

              {/* INFOS PRODUIT : badge "personnalisable" + poids.                */}
              {/* produit.customizable vaut vrai/faux → on affiche un badge OU    */}
              {/* l'autre grâce à l'opérateur ternaire (condition ? A : B).       */}
              <div className="flex flex-wrap items-center gap-2 mb-3 text-sm">
                {produit.customizable ? (
                  <span className="inline-flex items-center gap-1 bg-[#F5E6E8] text-[#B03052] font-medium px-3 py-1 rounded-full">
                    ✨ Personnalisable
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-500 px-3 py-1 rounded-full">
                    Non personnalisable
                  </span>
                )}
                <span className="text-gray-500">Poids&nbsp;: {produit.weight} g</span>
              </div>

              {/* Le prix, formaté joliment (ex. "25,00 €"). */}
              <p className="text-xl font-bold text-[#B03052] mb-6">{formatPrix(produit.price)}</p>

              {/* GESTION DU STOCK :                                              */}
              {/*  • s'il reste au moins 1 article (stock >= 1) → bouton Commander */}
              {/*  • sinon → message "Victime de son succès" (achat impossible)    */}
              {/* mt-auto pousse ce bloc tout en bas de la carte.                 */}
              {produit.stock >= 1 ? (
                // ── STRIPE : le formulaire n'envoie QUE l'id du produit ; le
                //    serveur relit le vrai prix ET revérifie le stock. 🔒
                <form action="/api/checkout" method="POST" className="mt-auto">
                  <input type="hidden" name="productId" value={produit.id} />

                  {/* CHAMP DE PERSONNALISATION — affiché SEULEMENT si le produit  */}
                  {/* est personnalisable. C'est ICI que le client saisit son      */}
                  {/* texte (bien visible, sur la fiche produit, avant de payer).  */}
                  {/* maxLength={30} bloque la saisie à 30 caractères.             */}
                  {produit.customizable && (
                    <div className="mb-4 bg-[#F5E6E8] rounded-xl p-3">
                      <label
                        htmlFor={`perso-${produit.id}`}
                        className="block text-sm font-semibold text-[#B03052] mb-1.5"
                      >
                        ✨ {produit.customization_label || "Votre personnalisation"}
                      </label>
                      <input
                        id={`perso-${produit.id}`}
                        name="personnalisation"
                        type="text"
                        maxLength={30}
                        required
                        placeholder="Prénom, message, surnom… (30 car. max)"
                        className="w-full border border-[#B03052]/40 rounded-lg p-2.5 text-[#2C2C2C] placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#B03052]/40"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-[#B03052] hover:bg-[#8d2742] text-white py-3 rounded-xl font-medium transition-colors focus:outline-none focus:ring-4 focus:ring-[#B03052]/30"
                  >
                    Commander
                  </button>
                </form>
              ) : (
                <p className="mt-auto text-center font-semibold text-[#B03052] bg-[#F5E6E8] py-3 rounded-xl">
                  Victime de son succès 🥲
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ========================= CONTACT ========================= */}
      <section id="contact" className="max-w-4xl mx-auto px-4 sm:px-8 py-16 md:py-24">
        <h2 className="text-3xl md:text-5xl text-center font-serif text-[#B03052] mb-10 md:mb-12">
          Contactez-nous
        </h2>

        {/* ── INTÉGRATION SUPABASE : à l'envoi, ce formulaire poste vers      */}
        {/*    app/api/contact/route.ts, qui vérifie le CAPTCHA puis enregistre */}
        {/*    le message dans Supabase.                                        */}
        <form action="/api/contact" method="POST" className="bg-white rounded-3xl shadow-xl p-6 sm:p-12 space-y-6">

          {/* CHANGEMENT LISIBILITÉ :                                          */}
          {/*  • Les labels sont désormais VISIBLES (avant : "sr-only" cachés). */}
          {/*    Classe des labels : texte foncé + gras léger → bien lisibles. */}
          {/*  • Placeholders assombris : "placeholder:text-gray-500" au lieu  */}
          {/*    du gris très clair par défaut.                                */}
          {/*  • Bordures un peu plus marquées : "border-gray-300".            */}
          {/* On crée une petite classe réutilisable (constante labelClass et  */}
          {/* inputClass) plus haut ? Ici on reste explicite pour l'apprentis- */}
          {/* sage : chaque champ montre ses classes en entier.                */}
          <div>
            <label htmlFor="nom" className="block text-sm font-semibold text-[#2C2C2C] mb-1.5">Nom</label>
            <input id="nom" name="nom" type="text" placeholder="Votre nom" required
              className="w-full border border-gray-300 rounded-xl p-4 text-[#2C2C2C] placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#B03052]/40" />
          </div>

          <div>
            <label htmlFor="prenom" className="block text-sm font-semibold text-[#2C2C2C] mb-1.5">Prénom</label>
            <input id="prenom" name="prenom" type="text" placeholder="Votre prénom" required
              className="w-full border border-gray-300 rounded-xl p-4 text-[#2C2C2C] placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#B03052]/40" />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-[#2C2C2C] mb-1.5">Email</label>
            <input id="email" name="email" type="email" placeholder="exemple@email.com" required
              className="w-full border border-gray-300 rounded-xl p-4 text-[#2C2C2C] placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#B03052]/40" />
          </div>

          <div>
            <label htmlFor="telephone" className="block text-sm font-semibold text-[#2C2C2C] mb-1.5">Téléphone</label>
            <input id="telephone" name="telephone" type="tel" placeholder="06 12 34 56 78"
              className="w-full border border-gray-300 rounded-xl p-4 text-[#2C2C2C] placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#B03052]/40" />
          </div>

          <div>
            <label htmlFor="sujet" className="block text-sm font-semibold text-[#2C2C2C] mb-1.5">Sujet</label>
            <select id="sujet" name="sujet"
              className="w-full border border-gray-300 rounded-xl p-4 text-[#2C2C2C] focus:outline-none focus:ring-2 focus:ring-[#B03052]/40">
              <option>Choisissez un sujet</option>
              <option>Information Produit</option>
              <option>Commande Personnalisée</option>
              <option>SAV</option>
              <option>Autre demande</option>
            </select>
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-semibold text-[#2C2C2C] mb-1.5">Votre message</label>
            <textarea id="message" name="message" rows={6} placeholder="Écrivez votre message ici…" required
              className="w-full border border-gray-300 rounded-xl p-4 text-[#2C2C2C] placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#B03052]/40"></textarea>
          </div>

          <label className="flex gap-3 items-start">
            <input type="checkbox" name="consentement" required className="mt-1" />
            <span>
              J'accepte que mes données soient utilisées pour traiter ma demande
              conformément à la politique de confidentialité.
            </span>
          </label>

          {/* WIDGET CAPTCHA TURNSTILE (le vrai, plus le carré en pointillés).   */}
          {/* La classe "cf-turnstile" est repérée automatiquement par le script */}
          {/* chargé plus bas. data-sitekey = ta clé PUBLIQUE (site key).        */}
          {/* Une fois résolu, le widget ajoute tout seul un champ caché         */}
          {/* "cf-turnstile-response" dans le formulaire → c'est LUI que la      */}
          {/* route serveur vérifie avant d'enregistrer le message.             */}
          <div
            className="cf-turnstile"
            data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
          ></div>

          <button type="submit"
            className="w-full bg-[#B03052] hover:bg-[#8d2742] text-white py-4 rounded-xl text-lg transition-colors focus:outline-none focus:ring-4 focus:ring-[#B03052]/30">
            Envoyer ma demande
          </button>
        </form>

        {/* Charge le script Turnstile (une seule fois). C'est lui qui           */}
        {/* transforme la <div className="cf-turnstile"> ci-dessus en widget.    */}
        <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
      </section>

    </main>
  );
}

// ============================================================================
//  POUR ALLER PLUS LOIN (quand tu seras à l'aise)
//  • Centraliser les couleurs dans tailwind.config.ts (ex: "bg-brand").
//  • Remplacer les vignettes roses par de vraies photos (composant next/image).
//  • Créer une page /boutique dédiée listant tous les produits depuis Supabase.
// ============================================================================
