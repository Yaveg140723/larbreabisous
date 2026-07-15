// ============================================================================
//  BoutonAjouterPanier — bouton "Ajouter au panier" (sur la fiche produit)
//  EMPLACEMENT dans ton projet : components/BoutonAjouterPanier.tsx
//
//  "use client" : au clic, on ajoute l'article au panier (via useCart), et on
//  affiche un petit message de confirmation. Pour un produit personnalisable,
//  on capture d'abord le texte de personnalisation.
// ============================================================================

"use client";

import { useState } from "react";
import { useCart } from "@/components/CartProvider";

export default function BoutonAjouterPanier({
  produit,
}: {
  produit: { id: string; customizable: boolean; customization_label: string | null };
}) {
  const { addItem } = useCart();
  const [personnalisation, setPersonnalisation] = useState("");
  const [ajoute, setAjoute] = useState(false);

  function ajouter() {
    // Si le produit est personnalisable, on exige un texte non vide.
    if (produit.customizable && personnalisation.trim() === "") return;

    addItem({
      id: produit.id,
      personnalisation: produit.customizable ? personnalisation.trim() : null,
    });

    setAjoute(true);
    setPersonnalisation("");
  }

  return (
    <div className="mt-auto">
      {produit.customizable && (
        <div className="mb-4 bg-[#F5E6E8] rounded-xl p-4">
          <label htmlFor="personnalisation" className="block text-sm font-semibold text-[#B03052] mb-1.5">
            ✨ {produit.customization_label || "Votre personnalisation"}
          </label>
          <input
            id="personnalisation"
            type="text"
            maxLength={30}
            value={personnalisation}
            onChange={(e) => {
              setPersonnalisation(e.target.value);
              setAjoute(false);
            }}
            placeholder="Prénom, message, surnom… (30 car. max)"
            className="w-full border border-[#B03052]/40 rounded-lg p-3 text-[#2C2C2C] placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#B03052]/40"
          />
        </div>
      )}

      <button
        onClick={ajouter}
        className="w-full bg-[#B03052] hover:bg-[#8d2742] text-white py-4 rounded-xl text-lg font-medium transition-colors focus:outline-none focus:ring-4 focus:ring-[#B03052]/30"
      >
        Ajouter au panier
      </button>

      {ajoute && (
        <p className="text-green-600 text-sm mt-2 text-center">
          Ajouté au panier ✓ —{" "}
          <a href="/panier" className="underline font-medium">
            voir le panier
          </a>
        </p>
      )}
    </div>
  );
}
