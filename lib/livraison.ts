// ============================================================================
//  CALCUL DES FRAIS DE PORT — Chronopost Shop2Shop
//  EMPLACEMENT dans ton projet : lib/livraison.ts
//
//  Tarifs Shop2Shop 2026 (France métropolitaine & Corse), livraison relais → relais.
//  Source : grille officielle La Poste / Chronopost, en vigueur au 1er janvier 2026.
//
//  Règle "franco de port" : la livraison est OFFERTE dès que le sous-total
//  (montant des articles, hors frais) atteint le seuil ci-dessous.
// ============================================================================

// 👉 Seuil de livraison offerte, en euros. Change ce chiffre pour l'ajuster (ex: 100).
export const SEUIL_FRANCO = 80;

// Tarif Shop2Shop de base, selon le POIDS TOTAL du panier (en grammes).
export function tarifShop2Shop(poidsGrammes: number): number {
  if (poidsGrammes <= 0) return 0; // panier vide
  if (poidsGrammes <= 1000) return 4.5; // jusqu'à 1 kg
  if (poidsGrammes <= 3000) return 6.5; // 1 à 3 kg
  if (poidsGrammes <= 10000) return 10.5; // 3 à 10 kg
  return 17.5; // 10 à 20 kg (maximum Shop2Shop)
}

// Frais de port FINAUX facturés au client :
//   → 0 € (offerts) si le sous-total atteint le seuil "franco"
//   → sinon, le tarif Shop2Shop selon le poids.
export function calculerFraisDePort(poidsGrammes: number, sousTotal: number): number {
  if (sousTotal >= SEUIL_FRANCO) return 0;
  return tarifShop2Shop(poidsGrammes);
}
