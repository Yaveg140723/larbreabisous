// ============================================================================
//  Route API — Créer un produit (depuis l'admin)
//  EMPLACEMENT dans ton projet : app/api/admin/create-product/route.ts
//  (dossiers : app/api/admin/create-product/ , fichier route.ts)
//
//  On utilise une ROUTE (comme /api/checkout) au lieu d'une Server Action :
//  c'est la même méthode fiable que tes autres formulaires, et elle fonctionne
//  parfaitement derrière la passerelle Codespaces.
//
//  🔒 La route revérifie que c'est bien l'admin avant d'écrire.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  // 1) Vérifier que c'est bien l'admin (connecté + bon email).
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return new NextResponse(null, { status: 303, headers: { Location: "/" } });
  }

  const formData = await request.formData();
  const admin = createSupabaseAdmin();

  // 2) Envoyer la photo dans Supabase Storage (si une image a été choisie).
  let imageUrl: string | null = null;
  const fichier = formData.get("image") as File | null;
  if (fichier && fichier.size > 0) {
    const extension = fichier.name.split(".").pop() || "jpg";
    const chemin = `${crypto.randomUUID()}.${extension}`;
    const { error } = await admin.storage
      .from("product-images")
      .upload(chemin, fichier, { contentType: fichier.type });
    if (!error) {
      imageUrl = admin.storage.from("product-images").getPublicUrl(chemin).data.publicUrl;
    }
  }

  // 3) Enregistrer le produit.
  await admin.from("products").insert({
    name: formData.get("name"),
    description: formData.get("description"),
    price: Number(formData.get("price")),
    stock: Number(formData.get("stock")),
    weight: Number(formData.get("weight")),
    customizable: formData.get("customizable") === "on",
    customization_label: (formData.get("customization_label") as string) || null,
    image_url: imageUrl,
  });

  // 4) Revenir à la page admin (redirection relative → robuste en Codespaces).
  return new NextResponse(null, { status: 303, headers: { Location: "/admin" } });
}
