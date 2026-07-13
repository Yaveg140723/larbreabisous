// ============================================================================
//  COMPOSANT PhotoZoom — photo cliquable qui s'agrandit en plein écran (80%)
//  EMPLACEMENT dans ton projet : components/PhotoZoom.tsx
//
//  "use client" : on a besoin d'une interaction navigateur (ouvrir/fermer le
//  zoom au clic) → c'est un Client Component, avec useState pour mémoriser
//  si le zoom est ouvert ou non.
// ============================================================================

"use client";

import { useState } from "react";

export default function PhotoZoom({
  src,
  alt,
}: {
  src: string | null;
  alt: string;
}) {
  // zoom = true quand l'overlay agrandi est affiché.
  const [zoom, setZoom] = useState(false);

  // Pas de photo → on garde le carré rose (non cliquable).
  if (!src) {
    return <div className="w-full aspect-square bg-[#E8B7C8] rounded-3xl shadow-lg"></div>;
  }

  return (
    <>
      {/* La photo normale, cliquable (curseur "loupe +"). */}
      <img
        src={src}
        alt={alt}
        onClick={() => setZoom(true)}
        className="w-full aspect-square object-cover rounded-3xl shadow-lg cursor-zoom-in"
      />
      <p className="text-center text-sm text-gray-500 mt-2">
        🔍 Cliquez sur la photo pour l'agrandir
      </p>

      {/* L'OVERLAY DE ZOOM — affiché seulement quand zoom = true.            */}
      {/* fixed inset-0 = occupe tout l'écran. z-[100] = passe au-dessus de   */}
      {/* tout. bg-black/80 = fond noir semi-transparent. Un clic n'importe    */}
      {/* où ferme le zoom.                                                    */}
      {zoom && (
        <div
          onClick={() => setZoom(false)}
          className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 cursor-zoom-out"
        >
          {/* max-w-[80vw] / max-h-[80vh] = au plus 80% de la largeur/hauteur  */}
          {/* de l'écran. object-contain garde les proportions de la photo.    */}
          <img
            src={src}
            alt={alt}
            className="max-w-[80vw] max-h-[80vh] object-contain rounded-2xl shadow-2xl"
          />

          {/* Bouton de fermeture (la croix en haut à droite). */}
          <button
            onClick={() => setZoom(false)}
            aria-label="Fermer"
            className="absolute top-6 right-6 text-white text-4xl leading-none hover:opacity-80"
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}
