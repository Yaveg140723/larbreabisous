// ============================================================================
//  PAGE DE CONFIRMATION — n° + date/heure + récap + vidage du panier
//  EMPLACEMENT EXACT :  app/commande-confirmee/page.tsx
// ============================================================================

import Stripe from "stripe";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import ViderPanier from "@/components/ViderPanier";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

function formatPrix(euros: number | string) {
  return Number(euros).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

type ArticleCommande = { nom: string; quantite: number; prix_unitaire: number; personnalisation: string | null };

type Commande = {
  id: string;
  created_at: string;
  articles: ArticleCommande[];
  sous_total: number;
  frais_port: number;
  total: number;
};

export default async function CommandeConfirmee({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  let commande: Commande | null = null;

  if (session_id) {
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id);
      const orderId = session.metadata?.order_id ?? session.client_reference_id;
      if (orderId) {
        const admin = createSupabaseAdmin();
        const { data } = await admin
          .from("orders")
          .select("id, created_at, articles, sous_total, frais_port, total")
          .eq("id", orderId)
          .single();
        commande = data as Commande | null;
      }
    } catch {
      // session_id absent/invalide → message générique.
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-8 py-24 md:py-28 text-center">
      <ViderPanier />

      <div className="text-6xl mb-6">🎁</div>
      <h1 className="text-4xl md:text-6xl font-serif text-[#B03052] mb-6">Commande confirmée !</h1>
      <p className="text-lg md:text-2xl leading-relaxed mb-8">
        Merci pour votre commande 💕 Votre paiement a bien été reçu. Nous préparons
        votre création avec le plus grand soin.
      </p>

      {commande && (
        <div className="bg-white rounded-2xl shadow-md p-6 text-left mb-10">
          <h2 className="font-serif text-2xl text-[#B03052] mb-1 text-center">Récapitulatif</h2>

          <p className="text-center text-sm text-gray-500 mb-4">
            Commande #{commande.id.slice(0, 8).toUpperCase()} •{" "}
            {new Date(commande.created_at).toLocaleString("fr-FR", {
              day: "2-digit", month: "long", year: "numeric",
              hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris",
            })}
          </p>

          <div className="space-y-3">
            {commande.articles.map((a, i) => (
              <div key={i} className="flex justify-between gap-4 border-b border-gray-100 pb-3">
                <div>
                  <p className="font-medium text-[#2C2C2C]">{a.nom} × {a.quantite}</p>
                  {a.personnalisation && (
                    <p className="text-sm text-[#B03052]">✨ « {a.personnalisation} »</p>
                  )}
                </div>
                <p className="font-semibold text-[#B03052] whitespace-nowrap">
                  {formatPrix(a.prix_unitaire * a.quantite)}
                </p>
              </div>
            ))}
          </div>

          <div className="flex justify-between mt-4 text-gray-600">
            <span>Sous-total</span><span>{formatPrix(commande.sous_total)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Frais de port</span>
            <span>{commande.frais_port === 0 ? "Offerts 🎁" : formatPrix(commande.frais_port)}</span>
          </div>
          <div className="flex justify-between text-xl font-bold text-[#B03052] mt-2 pt-2 border-t border-gray-200">
            <span>Total</span><span>{formatPrix(commande.total)}</span>
          </div>
        </div>
      )}

      <a
        href="/"
        className="inline-block bg-[#B03052] hover:bg-[#8d2742] text-white px-8 py-4 rounded-2xl text-lg shadow-lg transition-colors"
      >
        Retour à l'accueil
      </a>
    </main>
  );
}