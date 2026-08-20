"use client";

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
      <img
        src={selected}
        alt={alt}
        className="w-full aspect-[4/3] object-cover rounded-3xl shadow-lg"
      />

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
            className={`rounded-xl overflow-hidden border-2 transition ${
              selected === photo ? "border-[#B03052]" : "border-transparent"
            }`}
            aria-label={`Voir la photo ${index + 1}`}
          >
            <img
              src={photo}
              alt={`${alt} - photo ${index + 1}`}
              className="aspect-square w-full object-cover"
            />
          </button>
        ))}
      </div>

      {zoomed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 pointer-events-none">
          <img
            src={zoomed}
            alt={alt}
            className="max-w-[80vw] max-h-[80vh] object-contain rounded-3xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}