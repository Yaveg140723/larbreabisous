// ============================================================================
//  ROUTE API — Créer un produit avec jusqu’à 4 photos
//  ----------------------------------------------------------------------------
//  EMPLACEMENT EXACT : app/api/admin/create-product/route.ts
//
//  À QUOI SERT CE FICHIER ?
//  Ce fichier reçoit le formulaire “Ajouter un produit” depuis l’espace admin.
//  Il vérifie que la personne connectée est bien l’administratrice, envoie les
//  photos dans Supabase Storage, puis enregistre le produit dans la table
//  products avec ses informations : nom, description, prix, stock, poids,
//  personnalisation et jusqu’à 4 URLs d’images.
//
//  UTILISÉ PAR : app/admin/page.tsx
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

// Taille maximum autorisée pour chaque image : 5 Mo.
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

// Petite fonction réutilisable :
// elle reçoit une image, la vérifie, l’envoie dans Supabase Storage,
// puis renvoie son URL publique.
async function uploadImage(admin: ReturnType<typeof createSupabaseAdmin>, file: File | null) {
  // Aucun fichier choisi → on ne bloque pas, on renvoie simplement null.
  if (!file || file.size === 0) return null;

  // Sécurité : on accepte uniquement les fichiers image.
  if (!file.type.startsWith("image/")) {
    throw new Error("Format d’image invalide.");
  }

  // Performance : on évite les images trop lourdes.
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("Image trop lourde.");
  }

  // On génère un nom unique pour éviter d’écraser une ancienne image.
  const extension = file.name.split(".").pop() || "jpg";
  const chemin = `${crypto.randomUUID()}.${extension}`;

  // Upload dans le bucket Supabase Storage "product-images".
  const { error } = await admin.storage
    .from("product-images")
    .upload(chemin, file, { contentType: file.type });

  if (error) throw error;

  // On récupère l’URL publique qui sera stockée dans la table products.
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

  // 2) Lire les données envoyées par le formulaire admin.
  const formData = await request.formData();

  // Client admin Supabase : nécessaire pour écrire en base et uploader les images.
  const admin = createSupabaseAdmin();

  // 3) Uploader jusqu’à 4 photos.
  // Les noms image_1, image_2, image_3, image_4 doivent correspondre
  // exactement aux champs <input name="..."> du formulaire admin.
  const imageUrl1 = await uploadImage(admin, formData.get("image_1") as File | null);
  const imageUrl2 = await uploadImage(admin, formData.get("image_2") as File | null);
  const imageUrl3 = await uploadImage(admin, formData.get("image_3") as File | null);
  const imageUrl4 = await uploadImage(admin, formData.get("image_4") as File | null);

  // 4) Enregistrer le produit dans la table products.
  // Les URLs des images sont stockées dans 4 colonnes :
  // image_url, image_url_2, image_url_3, image_url_4.
  await admin.from("products").insert({
    name: formData.get("name"),
    description: formData.get("description"),
    price: Number(formData.get("price")),
    stock: Number(formData.get("stock")),
    weight: Number(formData.get("weight")),
    customizable: formData.get("customizable") === "on",
    customization_label: (formData.get("customization_label") as string) || null,
    image_url: imageUrl1,
    image_url_2: imageUrl2,
    image_url_3: imageUrl3,
    image_url_4: imageUrl4,
  });

  // 5) Une fois le produit créé, on revient à la page admin.
  return new NextResponse(null, { status: 303, headers: { Location: "/admin" } });
}