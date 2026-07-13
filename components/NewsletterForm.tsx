// ============================================================================
//  COMPOSANT NewsletterForm — champ d'inscription à la newsletter
//  EMPLACEMENT dans ton projet : components/NewsletterForm.tsx
//
//  "use client" : on gère la saisie + un message de confirmation SANS recharger
//  la page (envoi via fetch). La case de consentement est OBLIGATOIRE (RGPD).
// ============================================================================

"use client";

import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; texte: string } | null>(null);
  const [chargement, setChargement] = useState(false);

  async function inscrire(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setChargement(true);

    // On envoie l'email à notre route serveur.
    const res = await fetch("/api/newsletter/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setChargement(false);

    if (res.ok) {
      setMessage({ ok: true, texte: "Merci ! Vous êtes bien inscrit(e). 🌸" });
      setEmail("");
    } else {
      const data = await res.json().catch(() => ({}));
      setMessage({ ok: false, texte: data.error || "Une erreur est survenue." });
    }
  }

  return (
    <form onSubmit={inscrire} className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="votre@email.com"
          className="flex-1 rounded-xl px-4 py-3 text-[#2C2C2C] placeholder:text-gray-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={chargement}
          className="bg-white text-[#B03052] font-medium px-6 py-3 rounded-xl hover:bg-pink-50 transition-colors disabled:opacity-60"
        >
          {chargement ? "…" : "S'inscrire"}
        </button>
      </div>

      {/* Consentement RGPD : la case est "required" → impossible de s'inscrire */}
      {/* sans l'avoir cochée.                                                  */}
      <label className="flex gap-2 items-start text-xs text-pink-100">
        <input type="checkbox" required className="mt-0.5" />
        <span>
          J'accepte de recevoir la newsletter de L'Arbre à Bisous et que mon
          adresse email soit utilisée à cette fin.
        </span>
      </label>

      {/* Message de confirmation ou d'erreur (affiché après l'envoi). */}
      {message && (
        <p className={`text-sm ${message.ok ? "text-green-200" : "text-red-200"}`}>
          {message.texte}
        </p>
      )}
    </form>
  );
}