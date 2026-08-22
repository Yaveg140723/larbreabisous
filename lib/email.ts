// ============================================================================
//  ENVOI DES EMAILS — confirmation commande + expédition
//  ----------------------------------------------------------------------------
//  EMPLACEMENT EXACT : lib/email.ts
//
//  À QUOI SERT CE FICHIER ?
//  Ce fichier prépare et envoie les emails transactionnels du site.
//  Il est utilisé par :
//  - app/api/webhooks/stripe/route.ts pour confirmer une commande payée
//  - app/api/admin/update-order-status/route.ts pour prévenir d’une expédition
//
//  IMPORTANT SÉCURITÉ :
//  Les textes venant du client ou de l’admin sont échappés avant insertion HTML.
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

export type DonneesExpedition = {
  id: string;
  emailClient: string | null;
  nomClient: string | null;
  trackingNumber: string | null;
};

function escapeHTML(value: string | null | undefined) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatPrix(euros: number) {
  return Number(euros).toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
  });
}

function formatDate(date: string) {
  return new Date(date).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Paris",
  });
}

function numeroCommande(id: string) {
  return id.slice(0, 8).toUpperCase();
}

function formatAdresseHTML(adresse: Record<string, string> | null) {
  if (!adresse) return "—";

  return [
    adresse.line1,
    adresse.line2,
    `${adresse.postal_code ?? ""} ${adresse.city ?? ""}`.trim(),
    adresse.country,
  ]
    .filter(Boolean)
    .map(escapeHTML)
    .join("<br>");
}

function lignesArticlesHTML(articles: ArticleCommande[]): string {
  return articles
    .map((article) => {
      const totalLigne = article.prix_unitaire * article.quantite;

      return `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #eee;">
            <strong>${escapeHTML(article.nom)}</strong> × ${article.quantite}
            ${
              article.personnalisation
                ? `<br><span style="color:#B03052;font-size:13px;">✨ Personnalisation : ${escapeHTML(article.personnalisation)}</span>`
                : ""
            }
          </td>
          <td style="padding:10px 0;border-bottom:1px solid #eee;text-align:right;white-space:nowrap;">
            ${formatPrix(totalLigne)}
          </td>
        </tr>`;
    })
    .join("");
}

function blocTotauxHTML(c: DonneesCommande) {
  return `
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
        <td style="font-weight:bold;font-size:18px;color:#B03052;padding-top:8px;">Total</td>
        <td style="font-weight:bold;font-size:18px;color:#B03052;text-align:right;padding-top:8px;">${formatPrix(c.total)}</td>
      </tr>
    </table>`;
}

function corpsClientHTML(c: DonneesCommande): string {
  const numero = numeroCommande(c.id);
  const date = formatDate(c.createdAt);

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;color:#2C2C2C;">
    <h1 style="color:#B03052;font-size:26px;margin-bottom:4px;">Merci pour votre commande 🎁</h1>
    <p style="font-size:13px;color:#888;margin:0 0 18px;">Commande #${numero} • ${date}</p>

    <p style="font-size:15px;line-height:1.6;">
      Bonjour ${escapeHTML(c.nomClient) || "et merci"},<br>
      Votre paiement a bien été reçu. Nous allons préparer votre création avec soin.
    </p>

    <div style="background:#FFF8FA;border:1px solid #F3D9E1;border-radius:14px;padding:14px;margin:18px 0;">
      <strong style="color:#B03052;">Prochaine étape</strong><br>
      Votre commande va être préparée, puis expédiée en point relais selon les modalités indiquées lors du paiement.
    </div>

    ${blocTotauxHTML(c)}

    <h3 style="color:#B03052;font-size:16px;margin-bottom:4px;">Livraison</h3>
    <p style="font-size:14px;line-height:1.5;margin-top:0;">
      ${escapeHTML(c.nomClient)}${c.telephone ? ` • ${escapeHTML(c.telephone)}` : ""}<br>
      ${formatAdresseHTML(c.adresse)}
    </p>

    <p style="font-size:13px;color:#888;margin-top:24px;">
      Merci pour votre confiance 💕<br>
      L'Arbre à Bisous — Créations artisanales personnalisées
    </p>
  </div>`;
}

function corpsAdminHTML(c: DonneesCommande): string {
  const numero = numeroCommande(c.id);
  const date = formatDate(c.createdAt);

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;color:#2C2C2C;">
    <h1 style="color:#B03052;font-size:26px;margin-bottom:4px;">Nouvelle commande à préparer 🎉</h1>
    <p style="font-size:13px;color:#888;margin:0 0 18px;">Commande #${numero} • ${date}</p>

    <div style="background:#F5E6E8;border-radius:14px;padding:14px;margin:18px 0;">
      <strong style="color:#B03052;">Client</strong><br>
      ${escapeHTML(c.nomClient) || "Nom non renseigné"}<br>
      ${escapeHTML(c.emailClient)}${c.telephone ? ` • ${escapeHTML(c.telephone)}` : ""}
    </div>

    ${blocTotauxHTML(c)}

    <h3 style="color:#B03052;font-size:16px;margin-bottom:4px;">Adresse de livraison</h3>
    <p style="font-size:14px;line-height:1.5;margin-top:0;">
      ${formatAdresseHTML(c.adresse)}
    </p>

    <p style="font-size:13px;color:#888;margin-top:24px;">
      Pense à mettre à jour le statut dans Admin → Commandes reçues.
    </p>
  </div>`;
}

function corpsExpeditionHTML(c: DonneesExpedition): string {
  const numero = numeroCommande(c.id);

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;color:#2C2C2C;">
    <h1 style="color:#B03052;font-size:26px;margin-bottom:4px;">Votre commande est expédiée 📦</h1>
    <p style="font-size:13px;color:#888;margin:0 0 18px;">Commande #${numero}</p>

    <p style="font-size:15px;line-height:1.6;">
      Bonjour ${escapeHTML(c.nomClient) || "et merci"},<br>
      Votre commande a été marquée comme expédiée.
    </p>

    ${
      c.trackingNumber
        ? `<div style="background:#FFF8FA;border:1px solid #F3D9E1;border-radius:14px;padding:14px;margin:18px 0;">
            <strong style="color:#B03052;">Numéro de suivi</strong><br>
            ${escapeHTML(c.trackingNumber)}
          </div>`
        : `<div style="background:#FFF8FA;border:1px solid #F3D9E1;border-radius:14px;padding:14px;margin:18px 0;">
            Votre commande est en cours d’acheminement.
          </div>`
    }

    <p style="font-size:13px;color:#888;margin-top:24px;">
      Vous pouvez retrouver le suivi dans votre espace “Mes commandes”.<br>
      L'Arbre à Bisous — Créations artisanales personnalisées
    </p>
  </div>`;
}

async function envoyerUnEmail(destinataire: string, sujet: string, html: string) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;

  if (!apiKey || !senderEmail) {
    console.error("Configuration Brevo manquante.");
    return;
  }

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: {
        name: process.env.BREVO_SENDER_NAME || "L'Arbre à Bisous",
        email: senderEmail,
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
  const numero = numeroCommande(c.id);

  if (c.emailClient) {
    await envoyerUnEmail(
      c.emailClient,
      `Confirmation de votre commande #${numero} — L'Arbre à Bisous`,
      corpsClientHTML(c)
    );
  }

  const emailBoutique = process.env.EMAIL_BOUTIQUE || process.env.BREVO_SENDER_EMAIL;

  if (emailBoutique) {
    await envoyerUnEmail(
      emailBoutique,
      `Nouvelle commande à préparer #${numero} — L'Arbre à Bisous`,
      corpsAdminHTML(c)
    );
  }
}

export async function envoyerEmailExpedition(c: DonneesExpedition) {
  if (!c.emailClient) return;

  const numero = numeroCommande(c.id);

  await envoyerUnEmail(
    c.emailClient,
    `Votre commande #${numero} est expédiée — L'Arbre à Bisous`,
    corpsExpeditionHTML(c)
  );
}