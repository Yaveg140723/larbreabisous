// ============================================================================
//  ROBOTS.TXT — consignes pour les moteurs de recherche
//  ----------------------------------------------------------------------------
//  EMPLACEMENT EXACT : app/robots.ts
//
//  À QUOI SERT CE FICHIER ?
//  Next.js transforme ce fichier en /robots.txt.
//  Il indique aux moteurs de recherche quelles pages explorer ou éviter.
// ============================================================================

import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://preprod.larbreabisous.fr";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/panier", "/connexion", "/inscription", "/mes-commandes"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}