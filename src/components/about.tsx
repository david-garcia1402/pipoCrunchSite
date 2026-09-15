export function About() {
  return (
    <section className="bg-cream px-5 py-24 md:px-8">
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2 md:items-center">
        <div>
          <p className="text-[11px] tracking-[0.32em] text-gold uppercase">A marca</p>
          <h2 className="mt-3 font-serif text-4xl text-burgundy md:text-5xl">
            Petiscos que <span className="font-script text-5xl text-gold md:text-6xl">viciam</span>
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-burgundy/75">
            Na PIPOCRUNCH, cada pipoca começa caramelizada no ponto certo e ganha
            camadas de sabor. É o crunch gourmet de Jaraguá do Sul — perfeito para
            presentear, celebrar e surpreender quem você ama.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4 border-t border-burgundy/10 pt-8">
            {[
              ["MUSH", "Caramelizada"],
              ["+16", "Sabores"],
              ["JGS", "Santa Catarina"],
            ].map(([value, label]) => (
              <div key={label}>
                <p className="font-serif text-2xl text-gold">{value}</p>
                <p className="mt-1 text-[11px] tracking-[0.16em] text-burgundy/55 uppercase">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative min-h-[360px] overflow-hidden rounded-[2rem] bg-burgundy shadow-[0_30px_80px_rgba(74,24,24,0.18)]">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-70"
            style={{
              backgroundImage: "url(/images/caramel-bowl.jpg)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-burgundy via-burgundy/20 to-transparent" />
          <p className="absolute bottom-8 left-8 right-8 font-script text-3xl text-gold">
            Feito com carinho em cada detalhe.
          </p>
        </div>
      </div>
    </section>
  );
}
