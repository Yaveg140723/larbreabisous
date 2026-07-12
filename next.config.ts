import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Autorise le domaine Codespaces à utiliser les Server Actions.
      allowedOrigins: ["*.app.github.dev"],
      // Autorise l'upload de photos plus lourdes (défaut = 1 Mo, trop peu).
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;