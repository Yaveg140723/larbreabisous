export default function Merci() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-8 py-24 md:py-32 text-center">
      <div className="text-6xl mb-6">🌸</div>

      <h1 className="text-4xl md:text-6xl font-serif text-[#B03052] mb-6">
        Merci !
      </h1>

      <p className="text-lg md:text-2xl leading-relaxed mb-10">
        Votre message a bien été envoyé. Nous revenons vers vous très vite. 💕
      </p>

      <a
        href="/"
        className="inline-block bg-[#B03052] hover:bg-[#8d2742] text-white px-8 py-4 rounded-2xl text-lg shadow-lg transition-colors"
      >
        Retour à l'accueil
      </a>
    </main>
  );
}
