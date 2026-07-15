// ============================================================================
//  ENVOI DES EMAILS DE CONFIRMATION — via Brevo (avec n° + date/heure)
//  EMPLACEMENT EXACT :  lib/email.ts
// ============================================================================

type ArticleCommande = {
  nom: string;
  quantite: number;
  prix_unitaire: number;
  personnalisation: string | null;
};

export type DonneesCommande = {
  id: string;
  createdAt: string;
  emailClient: string | null;
  nomClient: string | null;
  telephone: string | null;
  adresse: Record<string, string> | null;
  articles: ArticleCommande[];
  sousTotal: number;
  fraisPort: number;
  total: number;
};

function formatPrix(euros: number) {
  return Number(euros).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

function lignesArticlesHTML(articles: ArticleCommande[]): string {
  return articles
    .map(
      (a) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #eee;">
          ${a.nom} × ${a.quantite}
          ${a.personnalisation ? `<br><span style="color:#B03052;font-size:13px;">✨ « ${a.personnalisation} »</span>` : ""}
        </td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;white-space:nowrap;">
          ${formatPrix(a.prix_unitaire * a.quantite)}
        </td>
      </tr>`
    )
    .join("");
}

function corpsHTML(c: DonneesCommande, titre: string, message: string): string {
  const numero = c.id.slice(0, 8).toUpperCase();
  const date = new Date(c.createdAt).toLocaleString("fr-FR", {
    day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris",
  });

  const adresse = c.adresse
    ? [
        c.adresse.line1,
        c.adresse.line2,
        `${c.adresse.postal_code ?? ""} ${c.adresse.city ?? ""}`.trim(),
        c.adresse.country,
      ]
        .filter(Boolean)
        .join("<br>")
    : "—";

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#2C2C2C;">
    <h1 style="color:#B03052;font-size:24px;margin-bottom:4px;">${titre}</h1>
    <p style="font-size:13px;color:#888;margin:0 0 14px;">Commande #${numero} • ${date}</p>
    <p style="font-size:15px;line-height:1.5;">${message}</p>

    <table style="width:100%;border-collapse:collapse;margin:20px 0;">
      ${lignesArticlesHTML(c.articles)}
      <tr>
        <td style="padding-top:12px;">Sous-total</td>
        <td style="padding-top:12px;text-align:right;">${formatPrix(c.sousTotal)}</td>
      </tr>
      <tr>
        <td>Frais de port</td>
        <td style="text-align:right;">${c.fraisPort === 0 ? "Offerts 🎁" : formatPrix(c.fraisPort)}</td>
      </tr>
      <tr>
        <td style="font-weight:bold;font-size:18px;color:#B03052;padding-top:6px;">Total</td>
        <td style="font-weight:bold;font-size:18px;color:#B03052;text-align:right;padding-top:6px;">${formatPrix(c.total)}</td>
      </tr>
    </table>

    <h3 style="color:#B03052;font-size:16px;margin-bottom:4px;">Livraison</h3>
    <p style="font-size:14px;line-height:1.5;margin-top:0;">
      ${c.nomClient ?? ""}${c.telephone ? ` • ${c.telephone}` : ""}<br>${adresse}
    </p>

    <p style="font-size:13px;color:#888;margin-top:24px;">L'Arbre à Bisous — Créations artisanales personnalisées</p>
  </div>`;
}

async function envoyerUnEmail(destinataire: string, sujet: string, html: string) {
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY as string,
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: {
        name: process.env.BREVO_SENDER_NAME || "L'Arbre à Bisous",
        email: process.env.BREVO_SENDER_EMAIL,
      },
      to: [{ email: destinataire }],
      subject: sujet,
      htmlContent: html,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("Brevo email erreur:", res.status, detail);
  }
}

export async function envoyerEmailsConfirmation(c: DonneesCommande) {
  const numero = c.id.slice(0, 8).toUpperCase();

  if (c.emailClient) {
    await envoyerUnEmail(
      c.emailClient,
      `Confirmation de votre commande #${numero} — L'Arbre à Bisous`,
      corpsHTML(
        c,
        "Merci pour votre commande ! 🎁",
        "Votre paiement a bien été reçu. Nous préparons votre création avec le plus grand soin. Voici le récapitulatif :"
      )
    );
  }

  const emailBoutique = process.env.EMAIL_BOUTIQUE || process.env.BREVO_SENDER_EMAIL;
  if (emailBoutique) {
    await envoyerUnEmail(
      emailBoutique,
      `🎉 Nouvelle commande #${numero} — L'Arbre à Bisous`,
      corpsHTML(
        c,
        "Nouvelle commande reçue 🎉",
        `Une commande vient d'être payée par ${c.nomClient ?? c.emailClient ?? "un client"}. À préparer et expédier :`
      )
    );
  }
}