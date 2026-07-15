// ============================================================================
//  PAGE CLIENTE — MES COMMANDES (historique + « refaire une commande »)
//  EMPLACEMENT EXACT :  app/mes-commandes/page.tsx
// ============================================================================

import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase-server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import BoutonRefaireCommande from "@/components/BoutonRefaireCommande";

export const dynamic = "force-dynamic";

function formatPrix(euros: number | string) {
  return Number(euros).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

type Order = {
  id: string;
  created_at: string;
  articles: { id: string; nom: string; quantite: number; prix_unitaire: number; personnalisation: string | null }[];
  frais_port: number;
  total: number;
};

export default async function MesCommandes() {
  // 1) Il faut être connecté (sinon → page de connexion).
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  // 2) On lit UNIQUEMENT les commandes PAYÉES de CETTE personne (récentes d'abord).
  const admin = createSupabaseAdmin();
  const { data } = await admin
    .from("orders")
    .select("id, created_at, articles, frais_port, total")
    .eq("user_id", user.id)
    .eq("statut", "payee")
    .order("created_at", { ascending: false });
  const commandes = (data ?? []) as Order[];

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-8 py-16">
      <h1 className="text-4xl md:text-5xl font-serif text-[#B03052] mb-2">Mes commandes</h1>
      <p className="text-gray-600 mb-8">Retrouvez ici l'historique de vos commandes, et recommandez en un clic.</p>

      {commandes.length === 0 && (
        <p className="text-gray-500">
          Vous n'avez pas encore de commande.{" "}
          <a href="/#boutique" className="text-[#B03052] underline">Découvrir la boutique</a>
        </p>
      )}

      <div className="space-y-4">
        {commandes.map((c) => (
          <div key={c.id} className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex flex-wrap justify-between items-start gap-3 mb-3">
              <div>
                <p className="font-semibold text-[#B03052]">Commande #{c.id.slice(0, 8).toUpperCase()}</p>
                <p className="text-sm text-gray-500">
                  {new Date(c.created_at).toLocaleString("fr-FR", {
                    day: "2-digit", month: "long", year: "numeric",
                    hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris",
                  })}
                </p>
              </div>
              <BoutonRefaireCommande
                articles={c.articles.map((a) => ({
                  id: a.id, quantite: a.quantite, personnalisation: a.personnalisation,
                }))}
              />
            </div>

            <ul className="text-sm text-[#2C2C2C] space-y-1 mb-3">
              {c.articles.map((a, i) => (
                <li key={i}>
                  • {a.nom} × {a.quantite}
                  {a.personnalisation && <span className="text-[#B03052]"> — ✨ « {a.personnalisation} »</span>}
                </li>
              ))}
            </ul>

            <div className="flex justify-end gap-6 text-sm border-t border-gray-100 pt-2">
              <span className="text-gray-500">Port : {c.frais_port === 0 ? "offert" : formatPrix(c.frais_port)}</span>
              <span className="font-bold text-[#B03052]">Total : {formatPrix(c.total)}</span>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}