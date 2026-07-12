// ============================================================================
//  PAGE INSCRIPTION (créer un compte)
//  EMPLACEMENT dans ton projet : app/inscription/page.tsx
//
//  ⚠️ "use client" (1ʳᵉ ligne) : cette page a besoin d'INTERACTIVITÉ dans le
//  navigateur (champs qui réagissent, message d'erreur, bouton qui charge).
//  → c'est un "Client Component". On en avait parlé : on ne met "use client"
//  QUE quand on a besoin de JavaScript côté navigateur, comme ici.
// ============================================================================

"use client";

import { useState } from "react"; // useState = pour "se souvenir" de valeurs qui changent
import { useRouter } from "next/navigation"; // pour rediriger après inscription
import { createSupabaseBrowser } from "@/lib/supabase-browser";

export default function Inscription() {
  const router = useRouter();
  const supabase = createSupabaseBrowser();

  // "state" = des variables que React surveille : quand elles changent,
  // l'affichage se met à jour tout seul.
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [chargement, setChargement] = useState(false);

  // Appelée quand on soumet le formulaire.
  async function creerCompte(e: React.FormEvent) {
    e.preventDefault(); // empêche le rechargement de page par défaut
    setErreur(null);
    setChargement(true);

    // On demande à Supabase de créer le compte.
    const { error } = await supabase.auth.signUp({
      email,
      password: motDePasse,
    });

    setChargement(false);

    if (error) {
      setErreur(error.message);
    } else {
      // "Confirm email" étant désactivé, le compte est actif immédiatement.
      router.push("/");   // retour à l'accueil
      router.refresh();   // met à jour l'affichage (l'utilisateur est connecté)
    }
  }

  return (
    <main className="max-w-md mx-auto px-4 sm:px-8 py-24">
      <h1 className="text-4xl font-serif text-[#B03052] text-center mb-8">
        Créer un compte
      </h1>

      <form onSubmit={creerCompte} className="bg-white rounded-3xl shadow-xl p-8 space-y-5">
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
            minLength={6}
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            placeholder="6 caractères minimum"
            className="w-full border border-gray-300 rounded-xl p-3 text-[#2C2C2C] placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#B03052]/40"
          />
        </div>

        {/* Le message d'erreur ne s'affiche que s'il y en a un. */}
        {erreur && <p className="text-red-600 text-sm">{erreur}</p>}

        <button
          type="submit"
          disabled={chargement}
          className="w-full bg-[#B03052] hover:bg-[#8d2742] text-white py-3 rounded-xl font-medium transition-colors disabled:opacity-60 focus:outline-none focus:ring-4 focus:ring-[#B03052]/30"
        >
          {chargement ? "Création…" : "Créer mon compte"}
        </button>
      </form>

      <p className="text-center mt-6 text-gray-600">
        Déjà un compte ?{" "}
        <a href="/connexion" className="text-[#B03052] font-semibold hover:underline">
          Se connecter
        </a>
      </p>
    </main>
  );
}