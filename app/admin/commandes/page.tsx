// ============================================================================
//  PAGE ADMIN — Commandes reçues, statut et suivi transport
//  ----------------------------------------------------------------------------
//  EMPLACEMENT EXACT : app/admin/commandes/page.tsx
//
//  À QUOI SERT CE FICHIER ?
//  Cette page permet à l’administratrice de voir toutes les commandes reçues,
//  leur statut de paiement, leur statut de traitement, les articles commandés,
//  l’adresse de livraison, le total, le numéro de suivi et une note interne.
//
//  Elle permet aussi de faire avancer une commande dans le traitement :
//  - à préparer
//  - préparée
//  - expédiée
// ============================================================================

import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase-server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

function formatPrix(euros: number | string) {
  return Number(euros).toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
  });
}

function formatDate(date: string | null) {
  if (!date) return null;

  return new Date(date).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Paris",
  });
}

function libelleTraitement(statut: string | null) {
  if (statut === "preparee") return "Préparée";
  if (statut === "expediee") return "Expédiée";
  return "À préparer";
}

function classeTraitement(statut: string | null) {
  if (statut === "preparee") return "bg-blue-100 text-blue-700";
  if (statut === "expediee") return "bg-purple-100 text-purple-700";
  return "bg-amber-100 text-amber-700";
}

type Order = {
  id: string;
  created_at: string;
  statut: string;
  statut_traitement: string | null;
  prepared_at: string | null;
  shipped_at: string | null;
  tracking_number: string | null;
  admin_note: string | null;
  email: string | null;
  nom_client: string | null;
  telephone: string | null;
  adresse_livraison: Record<string, string> | null;
  articles: { nom: string; quantite: number; personnalisation: string | null }[];
  frais_port: number;
  total: number;
};

export default async function Commandes() {
  const supabase = await createSupabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== process.env.ADMIN_EMAIL) redirect("/");

  const admin = createSupabaseAdmin();

  const { data } = await admin
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  const liste = (data ?? []) as Order[];

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-8 py-16">
      <a href="/admin" className="text-[#B03052] font-medium hover:underline">
        ← Retour à l'admin
      </a>

      <h1 className="text-4xl md:text-5xl font-serif text-[#B03052] mt-4 mb-8">
        Commandes reçues
      </h1>

      {liste.length === 0 && <p className="text-gray-500">Aucune commande pour l'instant.</p>}

      <div className="space-y-4">
        {liste.map((c) => (
          <div key={c.id} className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex flex-wrap justify-between gap-4 mb-3">
              <div>
                <p className="font-semibold text-[#B03052]">
                  Commande #{c.id.slice(0, 8).toUpperCase()}
                </p>

                <p className="text-sm text-gray-500">{formatDate(c.created_at)}</p>

                <p className="text-sm text-gray-500">
                  {c.nom_client || c.email || "—"}
                  {c.telephone ? ` • ${c.telephone}` : ""}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 items-start">
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    c.statut === "payee"
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {c.statut === "payee" ? "Payée" : "En attente paiement"}
                </span>

                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${classeTraitement(
                    c.statut_traitement
                  )}`}
                >
                  {libelleTraitement(c.statut_traitement)}
                </span>
              </div>
            </div>

            <ul className="text-sm text-[#2C2C2C] space-y-1 mb-3">
              {c.articles.map((a, i) => (
                <li key={i}>
                  • {a.nom} × {a.quantite}
                  {a.personnalisation && (
                    <span className="text-[#B03052]"> — ✨ « {a.personnalisation} »</span>
                  )}
                </li>
              ))}
            </ul>

            {c.adresse_livraison && (
              <p className="text-sm text-gray-500 mb-2">
                📦{" "}
                {[
                  c.adresse_livraison.line1,
                  c.adresse_livraison.postal_code,
                  c.adresse_livraison.city,
                  c.adresse_livraison.country,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            )}

            {(c.tracking_number || c.admin_note || c.prepared_at || c.shipped_at) && (
              <div className="rounded-xl bg-[#FFF8FA] border border-[#F3D9E1] p-3 text-sm text-gray-600 mb-3 space-y-1">
                {c.tracking_number && (
                  <p>
                    <span className="font-semibold text-[#B03052]">Suivi :</span>{" "}
                    {c.tracking_number}
                  </p>
                )}

                {c.admin_note && (
                  <p>
                    <span className="font-semibold text-[#B03052]">Note admin :</span>{" "}
                    {c.admin_note}
                  </p>
                )}

                {c.prepared_at && <p>Préparée le {formatDate(c.prepared_at)}</p>}
                {c.shipped_at && <p>Expédiée le {formatDate(c.shipped_at)}</p>}
              </div>
            )}

            <form
              action="/api/admin/update-order-status"
              method="POST"
              className="border-t border-gray-100 pt-4"
            >
              <input type="hidden" name="order_id" value={c.id} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <div>
                  <label htmlFor={`tracking-${c.id}`} className="block text-sm font-semibold text-[#2C2C2C] mb-1">
                    Numéro de suivi
                  </label>
                  <input
                    id={`tracking-${c.id}`}
                    name="tracking_number"
                    type="text"
                    defaultValue={c.tracking_number ?? ""}
                    placeholder="ex : Chronopost 123456789"
                    className="w-full border border-gray-300 rounded-xl p-3 text-sm text-[#2C2C2C] placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#B03052]/40"
                  />
                </div>

                <div>
                  <label htmlFor={`note-${c.id}`} className="block text-sm font-semibold text-[#2C2C2C] mb-1">
                    Note interne
                  </label>
                  <input
                    id={`note-${c.id}`}
                    name="admin_note"
                    type="text"
                    defaultValue={c.admin_note ?? ""}
                    placeholder="ex : emballage cadeau, point relais confirmé..."
                    className="w-full border border-gray-300 rounded-xl p-3 text-sm text-[#2C2C2C] placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#B03052]/40"
                  />
                </div>
              </div>

              <div className="flex flex-wrap justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                  <button
                    name="statut_traitement"
                    value="a_preparer"
                    className="rounded-lg border border-[#B03052] px-3 py-2 text-sm font-semibold text-[#B03052] hover:bg-[#F5E6E8]"
                  >
                    À préparer
                  </button>

                  <button
                    name="statut_traitement"
                    value="preparee"
                    className="rounded-lg bg-blue-100 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-200"
                  >
                    Marquer préparée
                  </button>

                  <button
                    name="statut_traitement"
                    value="expediee"
                    className="rounded-lg bg-[#B03052] px-3 py-2 text-sm font-semibold text-white hover:bg-[#8d2742]"
                  >
                    Marquer expédiée
                  </button>
                </div>

                <div className="flex justify-end gap-6 text-sm">
                  <span className="text-gray-500">
                    Port : {c.frais_port === 0 ? "offert" : formatPrix(c.frais_port)}
                  </span>
                  <span className="font-bold text-[#B03052]">
                    Total : {formatPrix(c.total)}
                  </span>
                </div>
              </div>
            </form>
          </div>
        ))}
      </div>
    </main>
  );
}