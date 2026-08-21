// ============================================================================
//  SITEMAP.XML — liste des pages publiques du site
//  ----------------------------------------------------------------------------
//  EMPLACEMENT EXACT : app/sitemap.ts
//
//  À QUOI SERT CE FICHIER ?
//  Next.js transforme ce fichier en /sitemap.xml.
//  Il aide les moteurs de recherche à découvrir les pages publiques importantes.
// ============================================================================

import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://preprod.larbreabisous.fr";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = [
    "",
    "/boutique",
    "/contact",
    "/mentions-legales",
    "/cgv",
    "/politique-confidentialite",
  ];

  const { data: produits } = await supabase
    .from("products")
    .select("id")
    .gt("stock", 0);

  const routesPages = pages.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const routesProduits =
    produits?.map((produit) => ({
      url: `${siteUrl}/produit/${produit.id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })) ?? [];

  return [...routesPages, ...routesProduits];
}