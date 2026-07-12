// ============================================================================
//  BOUTON SUPPRIMER (avec confirmation)
//  EMPLACEMENT dans ton projet : components/BoutonSupprimer.tsx
//
//  "use client" : on a besoin d'une petite interaction navigateur → afficher
//  une fenêtre "Êtes-vous sûr ?" AVANT de supprimer. Ça évite les suppressions
//  accidentelles (important pour ton épouse !).
// ============================================================================

"use client";

export default function BoutonSupprimer({ id }: { id: string }) {
  return (
    <form
      action="/api/admin/delete-product"
      method="POST"
      onSubmit={(e) => {
        // Si l'admin clique "Annuler", on empêche l'envoi du formulaire.
        if (!confirm("Supprimer ce produit définitivement ?")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="text-red-600 hover:underline">
        Supprimer
      </button>
    </form>
  );
}