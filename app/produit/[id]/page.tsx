// ============================================================================
//  PAGE PRODUIT — fiche détaillée + SEO dynamique
//  ----------------------------------------------------------------------------
//  EMPLACEMENT EXACT : app/produit/[id]/page.tsx
//
//  À QUOI SERT CE FICHIER ?
//  Cette page affiche la fiche détaillée d’un produit.
//  Comme le dossier s’appelle [id], la même page sert pour tous les produits.
//
//  SEO :
//  La fonction generateMetadata lit le produit dans Supabase et crée un titre,
//  une description et une image de partage propres à chaque produit.
// ============================================================================

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase-server";
import ProductGallery from "@/components/ProductGallery";
import BoutonAjouterPanier from "@/components/BoutonAjouterPanier";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://preprod.larbreabisous.fr";

type PageProps = {
  params: Promise<{ id: string }>;
};

function formatPrix(euros: number | string) {
  return Number(euros).toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
  });
}

function descriptionCourte(description: string | null) {
  const texte = description?.trim();

  if (!texte) {
    return "Découvrez cette création artisanale personnalisée de L'Arbre à Bisous.";
  }

  return texte.length > 155 ? `${texte.slice(0, 152)}...` : texte;
}

async function lireProduit(id: string) {
  const supabase = await createSupabaseServer();

  const { data: produit } = await supabase
    .from("products")
    .select(
      "id, name, description, price, image_url, image_url_2, image_url_3, image_url_4, customizable, customization_label, weight, stock"
    )
    .eq("id", id)
    .single();

  return produit;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const produit = await lireProduit(id);

  if (!produit) {
    return {
      title: "Produit introuvable",
    };
  }

  const title = produit.name;
  const description = descriptionCourte(produit.description);
  const url = `/produit/${produit.id}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "website",
      url,
      title: `${title} — L'Arbre à Bisous`,
      description,
      images: produit.image_url
        ? [
            {
              url: produit.image_url,
              alt: produit.name,
            },
          ]
        : undefined,
    },
  };
}

export default async function ProduitDetail({ params }: PageProps) {
  const { id } = await params;

  const supabase = await createSupabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const produit = await lireProduit(id);

  if (!produit) {
    notFound();
  }

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-8 py-12 md:py-16">
      <a href="/boutique" className="text-[#B03052] font-medium hover:underline">
        ← Retour à la boutique
      </a>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mt-6">
        <div>
          <ProductGallery
            alt={produit.name}
            images={[
              produit.image_url,
              produit.image_url_2,
              produit.image_url_3,
              produit.image_url_4,
            ]}
          />
        </div>

        <div className="flex flex-col">
          <h1 className="text-4xl md:text-5xl font-serif text-[#B03052] mb-4">
            {produit.name}
          </h1>

          {user?.email === process.env.ADMIN_EMAIL && (
            <a
              href={`/admin/${produit.id}`}
              className="inline-flex items-center justify-center mb-6 rounded-xl bg-[#F5E6E8] px-4 py-2 text-sm font-semibold text-[#B03052] hover:bg-[#E8B7C8] transition-colors"
            >
              Modifier ce produit
            </a>
          )}

          <p className="text-lg text-gray-600 leading-relaxed mb-6">
            {produit.description}
          </p>

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

          <p className="text-3xl font-bold text-[#B03052] mb-8">
            {formatPrix(produit.price)}
          </p>

          <div className="grid gap-3 mb-8">
            <div className="rounded-2xl border border-[#F3D9E1] bg-white p-4">
              <p className="font-semibold text-[#B03052]">🧵 Fabrication artisanale</p>
              <p className="text-sm text-gray-600">Préparé sous 3 à 5 jours ouvrés.</p>
            </div>

            <div className="rounded-2xl border border-[#F3D9E1] bg-white p-4">
              <p className="font-semibold text-[#B03052]">🚚 Livraison</p>
              <p className="text-sm text-gray-600">
                Livraison en point relais sous 2 à 4 jours. Offerte dès 80 €.
              </p>
            </div>

            <div className="rounded-2xl border border-[#F3D9E1] bg-white p-4">
              <p className="font-semibold text-[#B03052]">✨ Personnalisation</p>
              <p className="text-sm text-gray-600">
                {produit.customizable
                  ? "Ajoutez vos souhaits avant l’ajout au panier."
                  : "Ce produit n’est pas personnalisable."}
              </p>
            </div>

            <div className="rounded-2xl border border-[#F3D9E1] bg-white p-4">
              <p className="font-semibold text-[#B03052]">↩️ Retours</p>
              <p className="text-sm text-gray-600">
                Retour possible pour les produits non personnalisés. Les créations
                personnalisées ne sont pas reprises sauf défaut ou non-conformité.
              </p>
            </div>
          </div>

          {produit.stock < 1 ? (
            <p className="text-center font-semibold text-[#B03052] bg-[#F5E6E8] py-4 rounded-xl">
              Victime de son succès 🥲
            </p>
          ) : (
            <BoutonAjouterPanier
              produit={{
                id: produit.id,
                customizable: produit.customizable,
                customization_label: produit.customization_label,
              }}
            />
          )}
        </div>
      </div>
    </main>
  );
}