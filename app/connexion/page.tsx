// ============================================================================
//  PAGE CONNEXION (se connecter)
//  EMPLACEMENT dans ton projet : app/connexion/page.tsx
//
//  Même principe que la page inscription : c'est un "Client Component"
//  ("use client") car il y a de l'interactivité (champs, erreur, chargement).
// ============================================================================

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

export default function Connexion() {
  const router = useRouter();
  const supabase = createSupabaseBrowser();

  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [chargement, setChargement] = useState(false);

  async function seConnecter(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    setChargement(true);

    // On demande à Supabase de vérifier l'email + le mot de passe.
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: motDePasse,
    });

    setChargement(false);

    if (error) {
      // On reste volontairement vague (sécurité) : on ne dit pas si c'est
      // l'email ou le mot de passe qui est faux.
      setErreur("Email ou mot de passe incorrect.");
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <main className="max-w-md mx-auto px-4 sm:px-8 py-24">
      <h1 className="text-4xl font-serif text-[#B03052] text-center mb-8">
        Connexion
      </h1>

      <form onSubmit={seConnecter} className="bg-white rounded-3xl shadow-xl p-8 space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-[#2C2C2C] mb-1.5">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="exemple@email.com"
            className="w-full border border-gray-300 rounded-xl p-3 text-[#2C2C2C] placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#B03052]/40"
          />
        </div>

        <div>
          <label htmlFor="mdp" className="block text-sm font-semibold text-[#2C2C2C] mb-1.5">
            Mot de passe
          </label>
          <input
            id="mdp"
            type="password"
            required
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            placeholder="Votre mot de passe"
            className="w-full border border-gray-300 rounded-xl p-3 text-[#2C2C2C] placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#B03052]/40"
          />
        </div>

        {erreur && <p className="text-red-600 text-sm">{erreur}</p>}

        <button
          type="submit"
          disabled={chargement}
          className="w-full bg-[#B03052] hover:bg-[#8d2742] text-white py-3 rounded-xl font-medium transition-colors disabled:opacity-60 focus:outline-none focus:ring-4 focus:ring-[#B03052]/30"
        >
          {chargement ? "Connexion…" : "Se connecter"}
        </button>
      </form>

      <p className="text-center mt-6 text-gray-600">
        Pas encore de compte ?{" "}
        <a href="/inscription" className="text-[#B03052] font-semibold hover:underline">
          Créer un compte
        </a>
      </p>
    </main>
  );
}