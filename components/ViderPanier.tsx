// ============================================================================
//  COMPOSANT ViderPanier — vide le panier après un paiement réussi
//  ----------------------------------------------------------------------------
//  EMPLACEMENT EXACT :  components/ViderPanier.tsx
//
//  POURQUOI CE PETIT COMPOSANT ?
//   La page de confirmation (/commande-confirmee) est une page « serveur » : elle
//   ne peut pas toucher au panier, qui vit dans le NAVIGATEUR (localStorage).
//   Ce mini-composant « navigateur » ("use client") s'occupe juste de vider le
//   panier une fois qu'on arrive sur la page de confirmation. Il n'affiche RIEN.
// ============================================================================

"use client"; // ← indique que ce composant tourne dans le navigateur

// Vide le panier après un paiement réussi. N'affiche rien à l'écran.
// On récupère la fonction « clear » (vider le panier) depuis ton CartProvider.

import { useEffect } from "react";
import { useCart } from "@/components/CartProvider";

// Vide le panier après un paiement réussi. N'affiche rien à l'écran.
// Les crochets vides [] = "n'exécute ceci qu'au premier affichage".
export default function ViderPanier() {
  const { clear } = useCart();

  useEffect(() => {
    // 1) On efface tout de suite le panier mémorisé dans le navigateur…
    localStorage.removeItem("panier");
    // 2) …et on vide l'état juste après le rechargement du CartProvider.
    const t = setTimeout(() => clear(), 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

   // Ce composant n'affiche rien à l'écran → on renvoie « null ».
  return null;
}