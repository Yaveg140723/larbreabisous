// ============================================================================
//  PAGE PRODUIT — fiche détaillée avec GRANDE photo
//  EMPLACEMENT dans ton projet : app/produit/[id]/page.tsx
//
//  ⭐ ROUTE DYNAMIQUE : le dossier s'appelle [id] (avec crochets). La même page
//  sert pour TOUS les produits. Next.js met l'id présent dans l'URL à ta
//  disposition via "params".  Ex : /produit/abc-123  →  params.id = "abc-123".
//
//  C'est ici que l'acheteur voit la photo en grand et peut commander.
// ============================================================================

import { notFound } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase-server";
import PhotoZoom from "@/components/PhotoZoom";

function formatPrix(euros: number | string) {
  return Number(euros).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

export default async function ProduitDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // En Next.js 16, params est une "promesse" → on l'attend avec await.
  const { id } = await params;

  const supabase = await createSupabaseServer();
  const { data: produit } = await supabase
    .from("products")
    .select("id, name, description, price, image_url, customizable, customization_label, weight, stock")
    .eq("id", id)
    .single();

  // Produit introuvable (id inexistant) → page "404 introuvable".
  if (!produit) {
    notFound();
  }

  // On regarde AUSSI qui est connecté : l'achat est réservé aux comptes.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-8 py-12 md:py-16">
      <a href="/#boutique" className="text-[#B03052] font-medium hover:underline">
        ← Retour à la boutique
      </a>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mt-6">
        {/* ── GRANDE PHOTO (cliquable → zoom à 80% de l'écran) ── */}
        <div>
          <PhotoZoom src={produit.image_url} alt={produit.name} />
        </div>

        {/* ── INFOS + ACHAT ── */}
        <div className="flex flex-col">
          <h1 className="text-4xl md:text-5xl font-serif text-[#B03052] mb-4">{produit.name}</h1>

          <p className="text-lg text-gray-600 leading-relaxed mb-6">{produit.description}</p>

          <div className="flex flex-wrap items-center gap-2 mb-4 text-sm">
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

          <p className="text-3xl font-bold text-[#B03052] mb-8">{formatPrix(produit.price)}</p>

          {/* Achat : même logique qu'avant, mais sur la fiche détaillée.        */}
          {/* En stock → formulaire (avec personnalisation si besoin) ; sinon →  */}
          {/* message "Victime de son succès".                                   */}
          {/* ACHAT — 3 cas :                                                  */}
          {/*  1) plus de stock → "Victime de son succès"                      */}
          {/*  2) en stock MAIS pas connecté → invitation à se connecter        */}
          {/*  3) en stock ET connecté → formulaire de commande                */}
          {produit.stock < 1 ? (
            <p className="text-center font-semibold text-[#B03052] bg-[#F5E6E8] py-4 rounded-xl">
              Victime de son succès 🥲
            </p>
          ) : !user ? (
            <div className="bg-[#F5E6E8] rounded-xl p-5 text-center">
              <p className="text-[#2C2C2C] mb-3">
                Vous devez avoir un compte pour commander.
              </p>
              <a
                href="/connexion"
                className="inline-block bg-[#B03052] hover:bg-[#8d2742] text-white px-6 py-3 rounded-xl font-medium transition-colors"
              >
                Se connecter pour commander
              </a>
            </div>
          ) : (
            <form action="/api/checkout" method="POST" className="mt-auto">
              <input type="hidden" name="productId" value={produit.id} />

              {produit.customizable && (
                <div className="mb-4 bg-[#F5E6E8] rounded-xl p-4">
                  <label
                    htmlFor="personnalisation"
                    className="block text-sm font-semibold text-[#B03052] mb-1.5"
                  >
                    ✨ {produit.customization_label || "Votre personnalisation"}
                  </label>
                  <input
                    id="personnalisation"
                    name="personnalisation"
                    type="text"
                    maxLength={30}
                    required
                    placeholder="Prénom, message, surnom… (30 car. max)"
                    className="w-full border border-[#B03052]/40 rounded-lg p-3 text-[#2C2C2C] placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#B03052]/40"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-[#B03052] hover:bg-[#8d2742] text-white py-4 rounded-xl text-lg font-medium transition-colors focus:outline-none focus:ring-4 focus:ring-[#B03052]/30"
              >
                Commander
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
