// ============================================================================
//  ROUTE API — Modifier un produit avec jusqu’à 4 photos
//  ----------------------------------------------------------------------------
//  EMPLACEMENT EXACT : app/api/admin/update-product/route.ts
//
//  À QUOI SERT CE FICHIER ?
//  Ce fichier reçoit le formulaire “Modifier un produit” depuis l’espace admin.
//  Il vérifie que la personne connectée est bien l’administratrice, met à jour
//  les informations du produit, et remplace uniquement les photos pour lesquelles
//  un nouveau fichier a été choisi.
//
//  Important :
//  - si une nouvelle photo est envoyée, elle remplace l’ancienne URL.
//  - si aucun fichier n’est choisi pour une photo, l’ancienne photo est conservée.
//
//  UTILISÉ PAR : app/admin/[id]/page.tsx
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

// Taille maximum autorisée pour chaque image : 5 Mo.
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

// Correspondance entre les champs du formulaire et les colonnes Supabase.
// image_1 → image_url
// image_2 → image_url_2
// image_3 → image_url_3
// image_4 → image_url_4
const IMAGE_FIELDS = [
  { inputName: "image_1", columnName: "image_url" },
  { inputName: "image_2", columnName: "image_url_2" },
  { inputName: "image_3", columnName: "image_url_3" },
  { inputName: "image_4", columnName: "image_url_4" },
] as const;

// Petite fonction réutilisable :
// elle reçoit une image, la vérifie, l’envoie dans Supabase Storage,
// puis renvoie son URL publique.
async function uploadImage(admin: ReturnType<typeof createSupabaseAdmin>, file: File | null) {
  // Aucun fichier choisi → on ne change rien.
  if (!file || file.size === 0) return null;

  // Sécurité : on accepte uniquement les fichiers image.
  if (!file.type.startsWith("image/")) {
    throw new Error("Format d’image invalide.");
  }

  // Performance : on évite les images trop lourdes.
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("Image trop lourde.");
  }

  // Nom unique pour éviter d’écraser une ancienne image.
  const extension = file.name.split(".").pop() || "jpg";
  const chemin = `${crypto.randomUUID()}.${extension}`;

  // Upload dans le bucket Supabase Storage "product-images".
  const { error } = await admin.storage
    .from("product-images")
    .upload(chemin, file, { contentType: file.type });

  if (error) throw error;

  // URL publique à enregistrer dans la table products.
  return admin.storage.from("product-images").getPublicUrl(chemin).data.publicUrl;
}

export async function POST(request: NextRequest) {
  // 1) Vérifier que la personne est connectée et qu’elle est bien admin.
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return new NextResponse(null, { status: 303, headers: { Location: "/" } });
  }

  // 2) Lire les données envoyées par le formulaire de modification.
  const formData = await request.formData();
  const id = formData.get("id") as string;

  // Client admin Supabase : nécessaire pour écrire en base et uploader les images.
  const admin = createSupabaseAdmin();

  // 3) Préparer les champs texte/nombre à mettre à jour.
  const updates: Record<string, unknown> = {
    name: formData.get("name"),
    description: formData.get("description"),
    price: Number(formData.get("price")),
    stock: Number(formData.get("stock")),
    weight: Number(formData.get("weight")),
    customizable: formData.get("customizable") === "on",
    customization_label: (formData.get("customization_label") as string) || null,
  };

  // 4) Pour chaque photo, on vérifie si un nouveau fichier a été choisi.
  // Si oui : on l’upload et on met à jour la colonne correspondante.
  // Si non : on ne touche pas à cette colonne, donc l’ancienne photo reste.
  for (const field of IMAGE_FIELDS) {
    const file = formData.get(field.inputName) as File | null;
    const publicUrl = await uploadImage(admin, file);

    if (publicUrl) {
      updates[field.columnName] = publicUrl;
    }
  }

  // 5) Appliquer les modifications au bon produit.
  await admin.from("products").update(updates).eq("id", id);

  // 6) Revenir à la page admin.
  return new NextResponse(null, { status: 303, headers: { Location: "/admin" } });
}