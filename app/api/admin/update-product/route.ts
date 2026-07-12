// ============================================================================
//  Route API — Modifier un produit (depuis l'admin)
//  EMPLACEMENT dans ton projet : app/api/admin/update-product/route.ts
//
//  🔒 Revérifie l'admin. Si une NOUVELLE photo est fournie, on la remplace ;
//  sinon on garde la photo actuelle.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  // 1) Vérifier l'admin.
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return new NextResponse(null, { status: 303, headers: { Location: "/" } });
  }

  const formData = await request.formData();
  const id = formData.get("id") as string;
  const admin = createSupabaseAdmin();

  // 2) Préparer les champs à mettre à jour.
  const updates: Record<string, unknown> = {
    name: formData.get("name"),
    description: formData.get("description"),
    price: Number(formData.get("price")),
    stock: Number(formData.get("stock")),
    weight: Number(formData.get("weight")),
    customizable: formData.get("customizable") === "on",
    customization_label: (formData.get("customization_label") as string) || null,
  };

  // 3) Nouvelle photo ? On l'upload et on met à jour image_url.
  //    Sinon, on ne touche pas à la photo existante.
  const fichier = formData.get("image") as File | null;
  if (fichier && fichier.size > 0) {
    const extension = fichier.name.split(".").pop() || "jpg";
    const chemin = `${crypto.randomUUID()}.${extension}`;
    const { error } = await admin.storage
      .from("product-images")
      .upload(chemin, fichier, { contentType: fichier.type });
    if (!error) {
      updates.image_url = admin.storage.from("product-images").getPublicUrl(chemin).data.publicUrl;
    }
  }

  // 4) Appliquer la modification au bon produit.
  await admin.from("products").update(updates).eq("id", id);

  // 5) Retour à la page admin.
  return new NextResponse(null, { status: 303, headers: { Location: "/admin" } });
}
