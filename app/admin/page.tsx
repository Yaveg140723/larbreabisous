// ============================================================================
//  PAGE ADMIN — Espace de gestion du catalogue (réservé à ton épouse)
//  EMPLACEMENT dans ton projet : app/admin/page.tsx
//
//  🔒 Protégée (connecté + email = ADMIN_EMAIL).
//  ⭐ 4b : on ajoute un FORMULAIRE pour créer un produit. Il appelle l'action
//  serveur "creerProduit" (dans actions.ts), qui écrit dans Supabase.
// ============================================================================

import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase-server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import BoutonSupprimer from "@/components/BoutonSupprimer";
import BoutonSyncBrevo from "@/components/BoutonSyncBrevo";

// Force la page à TOUJOURS afficher des données fraîches (jamais de cache).
// Indispensable pour un tableau de bord admin : produits + inscrits newsletter
// à jour à chaque visite.
export const dynamic = "force-dynamic";

function formatPrix(euros: number | string) {
  return Number(euros).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

// Classes réutilisées pour les champs (évite de tout répéter dans le formulaire).
const labelClass = "block text-sm font-semibold text-[#2C2C2C] mb-1.5";
const champClass =
  "w-full border border-gray-300 rounded-xl p-3 text-[#2C2C2C] placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#B03052]/40";

export default async function Admin() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 🔒 Réservé à l'admin.
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    redirect("/");
  }

  const { data: produits } = await supabase
    .from("products")
    .select("id, name, price, stock, weight, customizable")
    .order("created_at", { ascending: true });

  // Inscrits à la newsletter — lus via le client ADMIN (service_role), car
  // cette table n'est PAS en lecture publique (contrairement aux produits).
  const admin = createSupabaseAdmin();
  const { data: abonnes } = await admin
    .from("newsletter_subscribers")
    .select("email, created_at")
    .order("created_at", { ascending: false });

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-8 py-16">
      <h1 className="text-4xl md:text-5xl font-serif text-[#B03052] mb-2">
        Espace administratrice
      </h1>
      <p className="text-gray-600 mb-10">Gestion du catalogue de produits.</p>

      {/* ── FORMULAIRE : AJOUTER UN PRODUIT ──                                 */}
      {/* action={creerProduit} : à l'envoi, Next.js exécute l'action serveur.  */}
      <section className="bg-white rounded-3xl shadow-lg p-6 md:p-8 mb-12">
        <h2 className="text-2xl font-serif text-[#B03052] mb-6">Ajouter un produit</h2>

        {/* Le formulaire envoie vers une ROUTE (comme /api/checkout), pas une  */}
        {/* Server Action → fiable derrière Codespaces. encType="multipart..."  */}
        {/* est indispensable pour transmettre le FICHIER photo.                */}
        <form
          action="/api/admin/create-product"
          method="POST"
          encType="multipart/form-data"
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <div className="sm:col-span-2">
            <label htmlFor="name" className={labelClass}>Nom</label>
            <input id="name" name="name" type="text" required className={champClass} />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="description" className={labelClass}>Description</label>
            <textarea id="description" name="description" rows={3} className={champClass}></textarea>
          </div>

          <div>
            <label htmlFor="price" className={labelClass}>Prix (€)</label>
            <input id="price" name="price" type="number" step="0.01" min="0" required
              placeholder="ex : 25.00" className={champClass} />
          </div>

          <div>
            <label htmlFor="stock" className={labelClass}>Stock</label>
            <input id="stock" name="stock" type="number" min="0" required
              placeholder="ex : 10" className={champClass} />
          </div>

          <div>
            <label htmlFor="weight" className={labelClass}>Poids (grammes)</label>
            <input id="weight" name="weight" type="number" min="0" required
              placeholder="ex : 50" className={champClass} />
          </div>

          <div>
            <label htmlFor="image" className={labelClass}>Photo du produit</label>
            {/* type="file" = bouton de sélection de fichier. accept="image/*"  */}
            {/* limite aux images. Les classes "file:" stylent le bouton.        */}
            <input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              className="w-full text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-[#F5E6E8] file:text-[#B03052] file:font-medium file:px-4 file:py-2 file:cursor-pointer"
            />
          </div>

          <div className="sm:col-span-2 flex items-center gap-2">
            <input id="customizable" name="customizable" type="checkbox" className="w-4 h-4" />
            <label htmlFor="customizable" className="font-medium text-[#2C2C2C]">
              Produit personnalisable
            </label>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="customization_label" className={labelClass}>
              Libellé de personnalisation (optionnel)
            </label>
            <input id="customization_label" name="customization_label" type="text"
              placeholder="ex : Prénom à graver" className={champClass} />
          </div>

          <div className="sm:col-span-2">
            <button type="submit"
              className="bg-[#B03052] hover:bg-[#8d2742] text-white px-8 py-3 rounded-xl font-medium transition-colors focus:outline-none focus:ring-4 focus:ring-[#B03052]/30">
              Ajouter le produit
            </button>
          </div>
        </form>
      </section>

      {/* ── TABLEAU DES PRODUITS EXISTANTS ── */}
      <h2 className="text-2xl font-serif text-[#B03052] mb-4">Produits existants</h2>
      <div className="bg-white rounded-3xl shadow-lg overflow-x-auto">
        <table className="w-full text-left min-w-[560px]">
          <thead className="bg-[#F5E6E8] text-[#B03052] text-sm uppercase">
            <tr>
              <th className="p-4">Produit</th>
              <th className="p-4">Prix</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Poids</th>
              <th className="p-4">Perso.</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(produits ?? []).map((p) => (
              <tr key={p.id} className="border-t border-gray-100">
                <td className="p-4 font-medium text-[#2C2C2C]">{p.name}</td>
                <td className="p-4">{formatPrix(p.price)}</td>
                <td className="p-4">{p.stock}</td>
                <td className="p-4">{p.weight} g</td>
                <td className="p-4">{p.customizable ? "✅" : "—"}</td>
                <td className="p-4">
                  <div className="flex gap-3 items-center">
                    <a href={`/admin/${p.id}`} className="text-[#B03052] hover:underline">
                      Modifier
                    </a>
                    <BoutonSupprimer id={p.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-gray-500 text-sm mt-6">
        💡 Astuce : « Modifier » ouvre la fiche du produit ; « Supprimer » demande
        une confirmation avant d'effacer.
      </p>

      {/* ── SECTION NEWSLETTER ── */}
      <h2 className="text-2xl font-serif text-[#B03052] mt-16 mb-4">
        Newsletter — {abonnes?.length ?? 0} inscrit(e)s
      </h2>
      <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8">
        <p className="text-gray-600 mb-4">
          Adresses email des personnes inscrites. Sélectionne-les et copie-les
          pour les importer dans ton service d'emailing.
        </p>
        <textarea
          readOnly
          rows={6}
          value={(abonnes ?? []).map((a) => a.email).join("\n")}
          className="w-full border border-gray-300 rounded-xl p-3 text-sm text-[#2C2C2C] font-mono"
        />
        {/* Bouton de synchronisation vers Brevo (en un clic). */}
        <BoutonSyncBrevo />
        <p className="text-gray-500 text-sm mt-3">
          Ce bouton envoie tous les emails ci-dessus vers ta liste Brevo. Tu
          enverras ensuite tes campagnes directement depuis Brevo.
        </p>
      </div>
    </main>
  );
}
