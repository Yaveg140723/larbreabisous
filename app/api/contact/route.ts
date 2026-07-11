// ============================================================================
//  Route API — Réception du formulaire de contact
//  EMPLACEMENT dans ton projet : app/api/contact/route.ts
//
//  RÔLE : reçoit les données du formulaire de contact, vérifie le CAPTCHA
//  Cloudflare Turnstile (anti-robots), puis enregistre le message dans une
//  table Supabase.
//
//  ⚠️ À FAIRE POUR QUE ÇA FONCTIONNE :
//   1) Installer la librairie :   npm install @supabase/supabase-js
//   2) Dans Supabase, créer une table "messages" avec les colonnes :
//        nom, prenom, email, telephone, sujet, message (texte)  +  created_at
//   3) Ajouter dans .env.local (TES clés, jamais commitées) :
//        NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
//        SUPABASE_SERVICE_ROLE_KEY=xxxxxxxx   (clé serveur → à garder secrète)
//        TURNSTILE_SECRET_KEY=xxxxxxxx        (clé secrète Cloudflare Turnstile)
//        NEXT_PUBLIC_SITE_URL=http://localhost:3000
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Client Supabase créé avec la clé "service role" : elle a le droit d'écrire
// dans la base et ne doit exister QUE côté serveur (jamais dans le navigateur).
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export async function POST(request: NextRequest) {
  const formData = await request.formData();

  // 1) Vérifier le CAPTCHA Turnstile pour bloquer les envois automatisés (spam).
  const token = formData.get("cf-turnstile-response") as string;
  const captchaOk = await verifierTurnstile(token);
  if (!captchaOk) {
    return NextResponse.json({ error: "CAPTCHA invalide" }, { status: 400 });
  }

  // 2) Enregistrer le message dans la table "messages" de Supabase.
  const { error } = await supabase.from("messages").insert({
    nom: formData.get("nom"),
    prenom: formData.get("prenom"),
    email: formData.get("email"),
    telephone: formData.get("telephone"),
    sujet: formData.get("sujet"),
    message: formData.get("message"),
  });

  if (error) {
    return NextResponse.json({ error: "Enregistrement impossible" }, { status: 500 });
  }

  // 3) Rediriger vers la page de remerciement (app/merci/page.tsx).
  //    On utilise une adresse RELATIVE ("/merci") : le navigateur la résout
  //    tout seul par rapport à la page courante. Résultat : ça marche partout
  //    (Codespaces, localhost, Vercel) SANS souci de domaine ni de port.
  return new NextResponse(null, {
    status: 303,
    headers: { Location: "/merci" },
  });
}

// Fonction utilitaire : demande à Cloudflare si le CAPTCHA est valide.
// Elle renvoie true (valide) ou false (invalide / robot).
async function verifierTurnstile(token: string): Promise<boolean> {
  if (!token) return false;

  const res = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET_KEY as string,
        response: token,
      }),
    }
  );

  const data = await res.json();
  return data.success === true;
}