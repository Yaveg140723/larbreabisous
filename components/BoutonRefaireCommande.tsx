// ============================================================================
//  BOUTON « Refaire cette commande »
//  EMPLACEMENT EXACT :  components/BoutonRefaireCommande.tsx
// ============================================================================

"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartProvider";

type Article = { id: string; quantite: number; personnalisation: string | null };

export default function BoutonRefaireCommande({ articles }: { articles: Article[] }) {
  const { addItem } = useCart();
  const router = useRouter();

  function refaire() {
    // On rajoute chaque article au panier autant de fois que sa quantité.
    articles.forEach((a) => {
      for (let i = 0; i < a.quantite; i++) {
        addItem({ id: a.id, personnalisation: a.personnalisation });
      }
    });
    router.push("/panier");
  }

  return (
    <button
      onClick={refaire}
      className="bg-[#B03052] hover:bg-[#8d2742] text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors"
    >
      🔁 Refaire cette commande
    </button>
  );
}