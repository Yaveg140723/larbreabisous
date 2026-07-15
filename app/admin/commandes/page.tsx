// ============================================================================
//  PAGE ADMIN — COMMANDES REÇUES
//  EMPLACEMENT EXACT :  app/admin/commandes/page.tsx      ← (vérifie ce chemin !)
// ============================================================================

import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase-server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

function formatPrix(euros: number | string) {
  return Number(euros).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

type Order = {
  id: string;
  created_at: string;
  statut: string;
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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) redirect("/");

  const admin = createSupabaseAdmin();
  const { data } = await admin.from("orders").select("*").order("created_at", { ascending: false });
  const liste = (data ?? []) as Order[];

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-8 py-16">
      <a href="/admin" className="text-[#B03052] font-medium hover:underline">← Retour à l'admin</a>
      <h1 className="text-4xl md:text-5xl font-serif text-[#B03052] mt-4 mb-8">Commandes reçues</h1>

      {liste.length === 0 && <p className="text-gray-500">Aucune commande pour l'instant.</p>}

      <div className="space-y-4">
        {liste.map((c) => (
          <div key={c.id} className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex flex-wrap justify-between gap-2 mb-3">
              <div>
                <p className="font-semibold text-[#B03052]">Commande #{c.id.slice(0, 8).toUpperCase()}</p>
                <p className="text-sm text-gray-500">
                  {new Date(c.created_at).toLocaleString("fr-FR", {
                    day: "2-digit", month: "long", year: "numeric",
                    hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris",
                  })}
                </p>
                <p className="text-sm text-gray-500">
                  {c.nom_client || c.email || "—"}{c.telephone ? ` • ${c.telephone}` : ""}
                </p>
              </div>
              <span className={`self-start text-xs font-semibold px-3 py-1 rounded-full ${
                c.statut === "payee" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
              }`}>
                {c.statut === "payee" ? "Payée" : "En attente"}
              </span>
            </div>

            <ul className="text-sm text-[#2C2C2C] space-y-1 mb-3">
              {c.articles.map((a, i) => (
                <li key={i}>
                  • {a.nom} × {a.quantite}
                  {a.personnalisation && <span className="text-[#B03052]"> — ✨ « {a.personnalisation} »</span>}
                </li>
              ))}
            </ul>

            {c.adresse_livraison && (
              <p className="text-sm text-gray-500 mb-2">
                📦 {[c.adresse_livraison.line1, c.adresse_livraison.postal_code, c.adresse_livraison.city, c.adresse_livraison.country].filter(Boolean).join(", ")}
              </p>
            )}

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