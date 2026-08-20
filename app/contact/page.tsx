import Link from "next/link";

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold mb-6">Contact</h1>

      <p className="mb-6">
        Une question sur une création, une commande personnalisée ou un service après-vente ?
        Contactez-nous via le formulaire.
      </p>

      <Link
        href="/#contact"
        className="inline-flex rounded-lg bg-pink-600 px-5 py-3 font-semibold text-white hover:bg-pink-700"
      >
        Accéder au formulaire de contact
      </Link>
    </main>
  );
}