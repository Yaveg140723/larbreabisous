// ============================================================================
//  PAGE CLIENTE — Mes commandes et suivi de livraison
//  ----------------------------------------------------------------------------
//  EMPLACEMENT EXACT : app/mes-commandes/page.tsx
//
//  À QUOI SERT CE FICHIER ?
//  Cette page permet à une cliente connectée de consulter ses commandes payées,
//  de voir leur statut de préparation/livraison, le numéro de suivi s’il existe,
//  et de refaire une commande en un clic.
//
//  IMPORTANT CONFIDENTIALITÉ :
//  La cliente ne voit que SES commandes.
//  Les notes internes admin ne sont jamais affichées ici.
// ============================================================================

import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase-server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import BoutonRefaireCommande from "@/components/BoutonRefaireCommande";

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
  if (statut === "preparee") return "En préparation";
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
  statut_traitement: string | null;
  prepared_at: string | null;
  shipped_at: string | null;
  tracking_number: string | null;
  articles: {
    id: string;
    nom: string;
    quantite: number;
    prix_unitaire: number;
    personnalisation: string | null;
  }[];
  frais_port: number;
  total: number;
};

export default async function MesCommandes() {
  const supabase = await createSupabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");

  const admin = createSupabaseAdmin();

  const { data } = await admin
    .from("orders")
    .select(
      "id, created_at, statut_traitement, prepared_at, shipped_at, tracking_number, articles, frais_port, total"
    )
    .eq("user_id", user.id)
    .eq("statut", "payee")
    .order("created_at", { ascending: false });

  const commandes = (data ?? []) as Order[];

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-8 py-16">
      <h1 className="text-4xl md:text-5xl font-serif text-[#B03052] mb-2">
        Mes commandes
      </h1>

      <p className="text-gray-600 mb-8">
        Retrouvez ici l'historique de vos commandes, leur suivi et la possibilité de recommander en un clic.
      </p>

      {commandes.length === 0 && (
        <p className="text-gray-500">
          Vous n'avez pas encore de commande.{" "}
          <a href="/boutique" className="text-[#B03052] underline">
            Découvrir la boutique
          </a>
        </p>
      )}

      <div className="space-y-4">
        {commandes.map((c) => (
          <div key={c.id} className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex flex-wrap justify-between items-start gap-3 mb-3">
              <div>
                <p className="font-semibold text-[#B03052]">
                  Commande #{c.id.slice(0, 8).toUpperCase()}
                </p>

                <p className="text-sm text-gray-500">{formatDate(c.created_at)}</p>
              </div>

              <div className="flex flex-wrap gap-2 items-center">
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${classeTraitement(
                    c.statut_traitement
                  )}`}
                >
                  {libelleTraitement(c.statut_traitement)}
                </span>

                <BoutonRefaireCommande
                  articles={c.articles.map((a) => ({
                    id: a.id,
                    quantite: a.quantite,
                    personnalisation: a.personnalisation,
                  }))}
                />
              </div>
            </div>

            {(c.tracking_number || c.prepared_at || c.shipped_at) && (
              <div className="rounded-xl bg-[#FFF8FA] border border-[#F3D9E1] p-3 text-sm text-gray-600 mb-3 space-y-1">
                {c.tracking_number && (
                  <p>
                    <span className="font-semibold text-[#B03052]">Numéro de suivi :</span>{" "}
                    {c.tracking_number}
                  </p>
                )}

                {c.prepared_at && <p>Préparée le {formatDate(c.prepared_at)}</p>}
                {c.shipped_at && <p>Expédiée le {formatDate(c.shipped_at)}</p>}
              </div>
            )}

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

            <div className="flex justify-end gap-6 text-sm border-t border-gray-100 pt-2">
              <span className="text-gray-500">
                Port : {c.frais_port === 0 ? "offert" : formatPrix(c.frais_port)}
              </span>
              <span className="font-bold text-[#B03052]">Total : {formatPrix(c.total)}</span>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
