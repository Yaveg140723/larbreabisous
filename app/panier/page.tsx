// ============================================================================
//  PAGE PANIER — liste des articles, frais de port, et BOUTON DE PAIEMENT
//  ----------------------------------------------------------------------------
//  EMPLACEMENT EXACT :  app/panier/page.tsx
//
//  NOUVEAUTÉ vs ta version : le message « 🔜 Prochaine étape » est remplacé par
//  un vrai bouton « Payer ma commande » qui envoie le panier à /api/checkout
//  puis redirige vers la page de paiement Stripe.
// ============================================================================

"use client"; // ← page « navigateur » (elle réagit aux clics, gère un état…)

import { useEffect, useState } from "react";
import { useCart } from "@/components/CartProvider";
import { supabase } from "@/lib/supabase";
import { SEUIL_FRANCO, tarifShop2Shop, calculerFraisDePort } from "@/lib/livraison";

// Petit outil : transforme un nombre (ex. 25) en « 25,00 € » à la française.
function formatPrix(euros: number | string) {
  return Number(euros).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

export default function Panier() {
  // On récupère le panier + les fonctions pour modifier/retirer un article.
  const { items, updateQuantity, removeItem } = useCart();

  // « produits » = les infos (nom, prix, poids, photo) des produits du panier.
  const [produits, setProduits] = useState<
    Record<string, { name: string; price: number | string; weight: number; image_url: string | null }>
  >({});

  // ── NOUVEAU : deux « états » pour gérer le paiement ──
  const [paiementEnCours, setPaiementEnCours] = useState(false);
  const [erreurPaiement, setErreurPaiement] = useState<string | null>(null);

  // Une « clé » listant les id du panier (triés) : sert à recharger les infos
  // produits seulement quand le contenu du panier change vraiment.
  const idsKey = [...new Set(items.map((i) => i.id))].sort().join(",");

  // useEffect = « quand idsKey change, va (re)lire les produits dans Supabase ».
  useEffect(() => {
    async function charger() {
      const ids = idsKey ? idsKey.split(",") : [];
      if (ids.length === 0) {
        setProduits({});
        return;
      }
      const { data } = await supabase
        .from("products")
        .select("id, name, price, weight, image_url")
        .in("id", ids);

      const map: Record<string, { name: string; price: number | string; weight: number; image_url: string | null }> = {};
      (data ?? []).forEach((p) => {
        map[p.id] = { name: p.name, price: p.price, weight: p.weight, image_url: p.image_url };
      });
      setProduits(map);
    }
    charger();
  }, [idsKey]);

  // « lignes » = chaque article du panier enrichi de ses infos produit.
  const lignes = items
    .map((it, index) => ({ ...it, index, produit: produits[it.id] }))
    .filter((l) => l.produit);

  // Calculs du récapitulatif :
  const sousTotal = lignes.reduce((s, l) => s + Number(l.produit.price) * l.quantity, 0);
  const poidsTotal = lignes.reduce((s, l) => s + Number(l.produit.weight) * l.quantity, 0);

  const tarifBase = tarifShop2Shop(poidsTotal);
  const fraisPort = calculerFraisDePort(poidsTotal, sousTotal);
  const francoAtteint = sousTotal >= SEUIL_FRANCO;
  const total = sousTotal + fraisPort;

  const restant = Math.max(0, SEUIL_FRANCO - sousTotal);
  const progression = Math.min(100, Math.round((sousTotal / SEUIL_FRANCO) * 100));

  // ── NOUVEAU : fonction appelée au clic sur « Payer ma commande ». ──
  async function payer() {
    setErreurPaiement(null);
    setPaiementEnCours(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }), // on envoie { id, quantity, personnalisation }
      });

      // 401 = pas connectée → l'achat est réservé aux comptes → connexion.
      if (res.status === 401) {
        window.location.href = "/connexion";
        return;
      }

      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url; // → page de paiement Stripe
      } else {
        setErreurPaiement(data.error || "Le paiement n'a pas pu démarrer.");
        setPaiementEnCours(false);
      }
    } catch {
      setErreurPaiement("Le paiement n'a pas pu démarrer.");
      setPaiementEnCours(false);
    }
  }

  // ── Cas « panier vide ». ──
  if (items.length === 0) {
    return (
      <main className="max-w-3xl mx-auto px-4 sm:px-8 py-24 text-center">
        <h1 className="text-4xl font-serif text-[#B03052] mb-6">Votre panier est vide 🌸</h1>
        <a
          href="/#boutique"
          className="inline-block bg-[#B03052] hover:bg-[#8d2742] text-white px-8 py-4 rounded-2xl text-lg shadow-lg transition-colors"
        >
          Découvrir la boutique
        </a>
      </main>
    );
  }

  // ── Cas normal : au moins un article. ──
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-8 py-16">
      <h1 className="text-4xl md:text-5xl font-serif text-[#B03052] mb-8">Mon panier</h1>

      {/* Liste des articles */}
      <div className="space-y-4">
        {lignes.map((l) => (
          <div key={l.index} className="bg-white rounded-2xl shadow-md p-4 flex flex-wrap gap-4 items-center">
            {l.produit.image_url ? (
              <img src={l.produit.image_url} alt={l.produit.name} className="w-20 h-20 object-cover rounded-xl" />
            ) : (
              <div className="w-20 h-20 bg-[#E8B7C8] rounded-xl" />
            )}

            <div className="flex-1 min-w-[140px]">
              <h3 className="font-semibold text-[#B03052]">{l.produit.name}</h3>
              {l.personnalisation && (
                <p className="text-sm text-[#B03052]">✨ « {l.personnalisation} »</p>
              )}
              <p className="text-sm text-gray-500">
                {l.produit.weight} g • {formatPrix(l.produit.price)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(l.index, l.quantity - 1)}
                className="w-8 h-8 rounded-full border border-[#B03052] text-[#B03052] font-bold"
                aria-label="Diminuer"
              >
                −
              </button>
              <span className="w-6 text-center">{l.quantity}</span>
              <button
                onClick={() => updateQuantity(l.index, l.quantity + 1)}
                className="w-8 h-8 rounded-full border border-[#B03052] text-[#B03052] font-bold"
                aria-label="Augmenter"
              >
                +
              </button>
            </div>

            <p className="font-bold text-[#B03052] w-24 text-right">
              {formatPrix(Number(l.produit.price) * l.quantity)}
            </p>

            <button
              onClick={() => removeItem(l.index)}
              className="text-red-600 hover:text-red-800 text-xl"
              aria-label="Retirer du panier"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* ✨ Bandeau « livraison offerte » (franco de port) */}
      <div className="mt-8 rounded-2xl p-5 border border-[#E8CBA8] shadow-sm bg-gradient-to-r from-[#FBEEF2] via-[#FDF6EF] to-[#F7E9DE]">
        {francoAtteint ? (
          <div className="text-center">
            <p className="font-serif text-2xl text-[#B03052]">🎁 Livraison offerte&nbsp;!</p>
            <p className="text-sm text-[#8A6D2F] mt-1">
              Votre commande dépasse {SEUIL_FRANCO}&nbsp;€ — les frais de port sont pour nous&nbsp;✨
            </p>
          </div>
        ) : (
          <div>
            <p className="text-center font-serif text-lg md:text-xl text-[#B03052]">
              Plus que <span className="font-bold">{formatPrix(restant)}</span> et la livraison vous est offerte&nbsp;✨
            </p>
            <div className="mt-3 h-3 rounded-full bg-[#F3D9E1] overflow-hidden shadow-inner">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#B03052] to-[#D4A574] transition-all duration-700 ease-out"
                style={{ width: `${progression}%` }}
              />
            </div>
            <p className="text-center text-xs text-[#8A6D2F] mt-2">
              Livraison offerte dès {SEUIL_FRANCO}&nbsp;€ d'achat 🎁
            </p>
          </div>
        )}
      </div>

      {/* Récapitulatif + bouton de paiement */}
      <div className="bg-white rounded-2xl shadow-md p-6 mt-4">
        <div className="flex justify-between mb-2 text-gray-600">
          <span>Poids total</span>
          <span>{poidsTotal} g</span>
        </div>
        <div className="flex justify-between mb-2 text-gray-600">
          <span>Sous-total</span>
          <span>{formatPrix(sousTotal)}</span>
        </div>
        <div className="flex justify-between mb-2 text-gray-600">
          <span>Frais de port (Chronopost Shop2Shop)</span>
          {francoAtteint ? (
            <span className="flex items-center gap-2">
              <span className="line-through text-gray-400">{formatPrix(tarifBase)}</span>
              <span className="bg-[#F3E3C8] text-[#8A6D2F] text-xs font-semibold px-2 py-0.5 rounded-full">
                OFFERTE
              </span>
            </span>
          ) : (
            <span>{formatPrix(fraisPort)}</span>
          )}
        </div>

        <div className="border-t border-gray-200 my-3" />

        <div className="flex justify-between text-2xl font-bold text-[#B03052]">
          <span>Total</span>
          <span>{formatPrix(total)}</span>
        </div>

        <p className="text-gray-500 text-sm mt-4">
          📦 Livraison en point relais Pickup (Chronopost Shop2Shop), sous 2 à 4 jours.
        </p>

        {/* ── NOUVEAU : bouton de paiement ── */}
        <button
          onClick={payer}
          disabled={paiementEnCours}
          className="w-full mt-4 bg-[#B03052] hover:bg-[#8d2742] text-white py-4 rounded-xl text-lg font-medium transition-colors disabled:opacity-60 focus:outline-none focus:ring-4 focus:ring-[#B03052]/30"
        >
          {paiementEnCours ? "Redirection vers le paiement…" : "Payer ma commande"}
        </button>

        {erreurPaiement && (
          <p className="text-red-600 text-sm mt-3 text-center">{erreurPaiement}</p>
        )}

        <p className="text-gray-400 text-xs mt-3 text-center">
          🔒 Paiement sécurisé par Stripe • Achat réservé aux comptes connectés
        </p>
      </div>
    </main>
  );
}