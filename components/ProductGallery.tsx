// ============================================================================
//  COMPOSANT PRODUCT GALLERY — galerie optimisée des photos produit
//  ----------------------------------------------------------------------------
//  EMPLACEMENT EXACT : components/ProductGallery.tsx
//
//  À QUOI SERT CE FICHIER ?
//  Ce composant affiche la photo principale d’un produit, les miniatures, puis
//  un aperçu zoomé au survol/focus.
//
//  PERFORMANCE :
//  On utilise next/image pour optimiser les images distantes Supabase.
// ============================================================================

"use client";

import Image from "next/image";
import { useState } from "react";

type ProductGalleryProps = {
  images: string[];
  alt: string;
};

export default function ProductGallery({ images, alt }: ProductGalleryProps) {
  const photos = images.filter(Boolean);
  const [selected, setSelected] = useState(photos[0] ?? "");
  const [zoomed, setZoomed] = useState<string | null>(null);

  if (photos.length === 0) {
    return <div className="aspect-[4/3] bg-[#E8B7C8] rounded-3xl" />;
  }

  return (
    <div>
      <div className="relative w-full aspect-[4/3] overflow-hidden rounded-3xl shadow-lg">
        <Image
          src={selected}
          alt={alt}
          fill
          priority
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover"
        />
      </div>

      <div className="grid grid-cols-4 gap-3 mt-4">
        {photos.slice(0, 4).map((photo, index) => (
          <button
            key={photo}
            type="button"
            onClick={() => setSelected(photo)}
            onMouseEnter={() => setZoomed(photo)}
            onFocus={() => setZoomed(photo)}
            onMouseLeave={() => setZoomed(null)}
            onBlur={() => setZoomed(null)}
            className={`relative aspect-square rounded-xl overflow-hidden border-2 transition ${
              selected === photo ? "border-[#B03052]" : "border-transparent"
            }`}
            aria-label={`Voir la photo ${index + 1}`}
          >
            <Image
              src={photo}
              alt={`${alt} - photo ${index + 1}`}
              fill
              sizes="120px"
              className="object-cover"
            />
          </button>
        ))}
      </div>

      {zoomed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 pointer-events-none">
          <div className="relative w-[80vw] h-[80vh]">
            <Image
              src={zoomed}
              alt={alt}
              fill
              sizes="80vw"
              className="object-contain rounded-3xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}