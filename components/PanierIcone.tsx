// ============================================================================
//  PanierIcone — l'icône 🛒 du menu, avec le nombre d'articles
//  EMPLACEMENT dans ton projet : components/PanierIcone.tsx
//
//  "use client" : lit le panier (useCart) pour afficher le badge du nombre
//  d'articles, et renvoie vers la page /panier.
// ============================================================================

"use client";

import { useCart } from "@/components/CartProvider";

export default function PanierIcone() {
  const { totalArticles } = useCart();

  return (
    <a
      href="/panier"
      aria-label="Voir le panier"
      className="relative inline-flex items-center text-[#B03052]"
    >
      <span className="text-5xl">🛒</span>
      {totalArticles > 0 && (
        <span className="absolute -top-2 -right-2 bg-[#B03052] text-white text-xs font-medium w-5 h-5 rounded-full flex items-center justify-center">
          {totalArticles}
        </span>
      )}
    </a>
  );
}
