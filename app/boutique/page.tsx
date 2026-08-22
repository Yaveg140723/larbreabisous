// ============================================================================
//  PAGE BOUTIQUE — Liste publique optimisée des produits
//  ----------------------------------------------------------------------------
//  EMPLACEMENT EXACT : app/boutique/page.tsx
//
//  À QUOI SERT CE FICHIER ?
//  Cette page affiche tous les produits enregistrés dans Supabase.
//  Elle montre la photo principale, le nom, la description, le prix et les liens.
//
//  PERFORMANCE :
//  Les images produit utilisent next/image pour réduire le poids et améliorer
//  le chargement sur mobile.
// ============================================================================

import type { Metadata } from "next";
import Image from "next/image";
import { createSupabaseServer } from "@/lib/supabase-server";

export const metadata: Metadata = {
  title: "Boutique",
  description:
    "Découvrez les créations artisanales personnalisées de L'Arbre à Bisous : couture, bijoux, carterie, créations Fimo, albums photos et cadeaux personnalisés.",
  alternates: {
    canonical: "/boutique",
  },
  openGraph: {
    title: "Boutique — L'Arbre à Bisous",
    description:
      "Créations artisanales personnalisées, cadeaux faits main et pièces uniques à offrir ou à s’offrir.",
    url: "/boutique",
  },
};

function formatPrix(euros: number | string) {
  return Number(euros).toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
  });
}

export default async function BoutiquePage() {
  const supabase = await createSupabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const estAdmin = user?.email === process.env.ADMIN_EMAIL;

  const { data: produits, error } = await supabase
    .from("products")
    .select("id, name, description, price, image_url, customizable, stock")
    .order("created_at", { ascending: true });

  if (error) {
    return (
      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-4">Erreur Supabase</h1>
        <p>{error.message}</p>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-8 py-16">
      <h1 className="text-4xl md:text-5xl text-center font-serif text-[#B03052] mb-10">
        Boutique
      </h1>

      {(!produits || produits.length === 0) && (
        <p className="text-center text-gray-500">
          Aucun produit pour le moment. Revenez bientôt ! 🌸
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {(produits ?? []).map((produit) => (
          <div
            key={produit.id}
            className="bg-white rounded-3xl p-6 md:p-8 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col"
          >
            {produit.image_url ? (
            <a
              href={`/produit/${produit.id}`}
              className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl mb-6 block"
              aria-label={`Voir le produit ${produit.name}`}
            >
              <Image
                src={produit.image_url}
                alt={produit.name}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                className="object-cover transition-transform duration-300 hover:scale-105"
              />
            </a>
            ) : (
            <a
              href={`/produit/${produit.id}`}
              className="aspect-[4/3] bg-[#E8B7C8] rounded-2xl mb-6 block"
              aria-label={`Voir le produit ${produit.name}`}
            />
            )}

            <h2 className="text-2xl font-semibold text-[#B03052] mb-2">
              {produit.name}
            </h2>

            <p className="text-gray-600 leading-relaxed mb-3 line-clamp-2">
              {produit.description}
            </p>

            <div className="mb-3 text-sm">
              {produit.customizable ? (
                <span className="inline-flex items-center gap-1 bg-[#F5E6E8] text-[#B03052] font-medium px-3 py-1 rounded-full">
                  ✨ Personnalisable
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-500 px-3 py-1 rounded-full">
                  Non personnalisable
                </span>
              )}
            </div>

            <p className="text-xl font-bold text-[#B03052] mb-4">
              {formatPrix(produit.price)}
            </p>

            <div className="mt-auto flex flex-wrap gap-3 items-center">
              {produit.stock >= 1 ? (
                <a
                  href={`/produit/${produit.id}`}
                  className="text-[#B03052] font-medium hover:underline"
                >
                  Voir le produit →
                </a>
              ) : (
                <span className="font-semibold text-[#B03052] bg-[#F5E6E8] px-3 py-2 rounded-lg">
                  Victime de son succès 🥲
                </span>
              )}

              {estAdmin && (
                <a
                  href={`/admin/${produit.id}`}
                  className="inline-flex rounded-lg bg-[#F5E6E8] px-3 py-2 text-sm font-semibold text-[#B03052] hover:bg-[#E8B7C8] transition-colors"
                >
                  Modifier
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}