// ============================================================================
//  CartProvider — le "cerveau" du panier (état partagé sur tout le site)
//  EMPLACEMENT dans ton projet : components/CartProvider.tsx
//
//  "use client" : le panier vit dans le navigateur. On le mémorise dans le
//  "localStorage" (petit espace de stockage du navigateur) → il survit aux
//  changements de page et au rafraîchissement.
//
//  Le "Context" React permet à N'IMPORTE quel composant du site de lire/modifier
//  le panier via le hook useCart().
// ============================================================================

"use client";

import { createContext, useContext, useEffect, useState } from "react";

// Une ligne de panier : un produit, une quantité, et une personnalisation
// éventuelle (pour les articles personnalisables).
export type CartItem = {
  id: string;
  quantity: number;
  personnalisation: string | null;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: { id: string; personnalisation: string | null }) => void;
  updateQuantity: (index: number, quantity: number) => void;
  removeItem: (index: number) => void;
  clear: () => void;
  totalArticles: number;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [charge, setCharge] = useState(false);

  // 1) Au démarrage : on recharge le panier depuis le navigateur.
  useEffect(() => {
    const stored = localStorage.getItem("panier");
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch {
        /* panier illisible → on repart d'un panier vide */
      }
    }
    setCharge(true);
  }, []);

  // 2) À chaque changement : on sauvegarde (une fois le chargement initial fait).
  useEffect(() => {
    if (charge) localStorage.setItem("panier", JSON.stringify(items));
  }, [items, charge]);

  // Ajouter un article. Si une ligne IDENTIQUE existe déjà (même produit +
  // même personnalisation) → on incrémente sa quantité. Sinon → nouvelle ligne.
  function addItem(nouveau: { id: string; personnalisation: string | null }) {
    setItems((prev) => {
      const i = prev.findIndex(
        (it) => it.id === nouveau.id && it.personnalisation === nouveau.personnalisation
      );
      if (i >= 0) {
        const copie = [...prev];
        copie[i] = { ...copie[i], quantity: copie[i].quantity + 1 };
        return copie;
      }
      return [...prev, { id: nouveau.id, quantity: 1, personnalisation: nouveau.personnalisation }];
    });
  }

  // Changer la quantité d'une ligne (0 ou moins → on retire la ligne).
  function updateQuantity(index: number, quantity: number) {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((_, i) => i !== index)
        : prev.map((it, i) => (i === index ? { ...it, quantity } : it))
    );
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function clear() {
    setItems([]);
  }

  // Nombre total d'articles (somme des quantités) → pour le badge du panier.
  const totalArticles = items.reduce((s, it) => s + it.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, updateQuantity, removeItem, clear, totalArticles }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Le hook à utiliser dans les composants pour accéder au panier.
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart doit être utilisé à l'intérieur de <CartProvider>");
  return ctx;
}
