// ============================================================================
//  PAGE ADMIN — Modifier un produit (formulaire pré-rempli)
//  EMPLACEMENT dans ton projet : app/admin/[id]/page.tsx
//  (dossier [id] avec crochets, comme la fiche produit — route dynamique)
//
//  🔒 Réservée à l'admin. Le formulaire est PRÉ-REMPLI avec les valeurs
//  actuelles (defaultValue) et envoie vers la route /api/admin/update-product.
// ============================================================================

import { redirect, notFound } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase-server";

const labelClass = "block text-sm font-semibold text-[#2C2C2C] mb-1.5";
const champClass =
  "w-full border border-gray-300 rounded-xl p-3 text-[#2C2C2C] placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#B03052]/40";

export default async function ModifierProduit({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    redirect("/");
  }

  const { data: produit } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (!produit) {
    notFound();
  }

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-8 py-16">
      <a href="/admin" className="text-[#B03052] font-medium hover:underline">
        ← Retour à l'admin
      </a>

      <h1 className="text-3xl md:text-4xl font-serif text-[#B03052] mt-4 mb-8">
        Modifier « {produit.name} »
      </h1>

      {/* Formulaire PRÉ-REMPLI (defaultValue) → envoie vers la route update. */}
      <form
        action="/api/admin/update-product"
        method="POST"
        encType="multipart/form-data"
        className="bg-white rounded-3xl shadow-lg p-6 md:p-8 grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        {/* id caché : indique QUEL produit modifier. */}
        <input type="hidden" name="id" value={produit.id} />

        <div className="sm:col-span-2">
          <label htmlFor="name" className={labelClass}>Nom</label>
          <input id="name" name="name" type="text" required defaultValue={produit.name} className={champClass} />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="description" className={labelClass}>Description</label>
          <textarea id="description" name="description" rows={3} defaultValue={produit.description ?? ""} className={champClass}></textarea>
        </div>

        <div>
          <label htmlFor="price" className={labelClass}>Prix (€)</label>
          <input id="price" name="price" type="number" step="0.01" min="0" required defaultValue={produit.price} className={champClass} />
        </div>

        <div>
          <label htmlFor="stock" className={labelClass}>Stock</label>
          <input id="stock" name="stock" type="number" min="0" required defaultValue={produit.stock} className={champClass} />
        </div>

        <div>
          <label htmlFor="weight" className={labelClass}>Poids (grammes)</label>
          <input id="weight" name="weight" type="number" min="0" required defaultValue={produit.weight} className={champClass} />
        </div>

        {/* Photo : on montre l'actuelle, et on propose d'en choisir une nouvelle. */}
        <div className="sm:col-span-2">
          <label className={labelClass}>Photo actuelle</label>
          {produit.image_url ? (
            <img src={produit.image_url} alt={produit.name} className="w-32 h-32 object-cover rounded-xl mb-3" />
          ) : (
            <p className="text-gray-500 text-sm mb-3">Aucune photo pour l'instant.</p>
          )}
          <label htmlFor="image" className="block text-sm font-semibold text-[#2C2C2C] mb-1.5">
            Changer la photo (optionnel)
          </label>
          <input
            id="image"
            name="image"
            type="file"
            accept="image/*"
            className="w-full text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-[#F5E6E8] file:text-[#B03052] file:font-medium file:px-4 file:py-2 file:cursor-pointer"
          />
        </div>

        <div className="sm:col-span-2 flex items-center gap-2">
          <input id="customizable" name="customizable" type="checkbox" defaultChecked={produit.customizable} className="w-4 h-4" />
          <label htmlFor="customizable" className="font-medium text-[#2C2C2C]">
            Produit personnalisable
          </label>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="customization_label" className={labelClass}>
            Libellé de personnalisation (optionnel)
          </label>
          <input id="customization_label" name="customization_label" type="text" defaultValue={produit.customization_label ?? ""} placeholder="ex : Prénom à graver" className={champClass} />
        </div>

        <div className="sm:col-span-2">
          <button type="submit" className="bg-[#B03052] hover:bg-[#8d2742] text-white px-8 py-3 rounded-xl font-medium transition-colors focus:outline-none focus:ring-4 focus:ring-[#B03052]/30">
            Enregistrer les modifications
          </button>
        </div>
      </form>
    </main>
  );
}