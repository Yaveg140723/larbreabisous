// ============================================================================
//  CONFIGURATION NEXT.JS — options globales du site
//  ----------------------------------------------------------------------------
//  EMPLACEMENT EXACT : next.config.ts
//
//  À QUOI SERT CE FICHIER ?
//  Ce fichier configure Next.js pour tout le projet.
//  On y garde la configuration Codespaces/Server Actions et on autorise aussi
//  l’optimisation des images distantes stockées dans Supabase Storage.
//
//  PERFORMANCE :
//  La section images.remotePatterns permet d’utiliser le composant next/image
//  avec les photos produit hébergées sur Supabase.
// ============================================================================

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Autorise le domaine Codespaces à utiliser les Server Actions.
      allowedOrigins: ["*.app.github.dev"],

      // Autorise l'upload de photos plus lourdes.
      bodySizeLimit: "10mb",
    },
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;