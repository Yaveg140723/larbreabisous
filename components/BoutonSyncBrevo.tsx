// ============================================================================
//  COMPOSANT BoutonSyncBrevo — bouton "Synchroniser vers Brevo"
//  EMPLACEMENT dans ton projet : components/BoutonSyncBrevo.tsx
//
//  "use client" : au clic, on appelle la route de synchro et on affiche un
//  message de résultat, sans recharger la page.
// ============================================================================

"use client";

import { useState } from "react";

export default function BoutonSyncBrevo() {
  const [message, setMessage] = useState<{ ok: boolean; texte: string } | null>(null);
  const [chargement, setChargement] = useState(false);

  async function synchroniser() {
    setMessage(null);
    setChargement(true);

    const res = await fetch("/api/newsletter/sync-brevo", { method: "POST" });
    const data = await res.json().catch(() => ({}));

    setChargement(false);

    if (res.ok) {
      setMessage({ ok: true, texte: `${data.count} contact(s) synchronisé(s) vers Brevo ! 🎉` });
    } else {
      setMessage({ ok: false, texte: data.error || "Erreur lors de la synchronisation." });
    }
  }

  return (
    <div className="mt-4">
      <button
        onClick={synchroniser}
        disabled={chargement}
        className="bg-[#B03052] hover:bg-[#8d2742] text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-60"
      >
        {chargement ? "Synchronisation…" : "Synchroniser vers Brevo"}
      </button>

      {message && (
        <p className={`text-sm mt-2 ${message.ok ? "text-green-600" : "text-red-600"}`}>
          {message.texte}
        </p>
      )}
    </div>
  );
}
