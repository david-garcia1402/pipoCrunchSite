import { site, whatsappLink } from "@/lib/site";

export function Events() {
  return (
    <section id="eventos" className="bg-cream px-5 py-24 md:px-8">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-burgundy text-cream">
        <div className="grid md:grid-cols-2">
          <div className="p-8 md:p-14">
            <p className="text-[11px] tracking-[0.32em] text-gold uppercase">
              Ocasiões
            </p>
            <h2 className="mt-3 font-serif text-4xl text-gold md:text-5xl">
              Para eventos especiais
            </h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-cream/75 md:text-base">
              Aniversários, presentes e momentos inesquecíveis. Surpreenda quem
              você ama com pipoca gourmet feita com carinho em cada detalhe.
            </p>
            <a
              href={whatsappLink(
                "Olá! Quero um orçamento da PIPOCRUNCH para um evento especial.",
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex rounded-full bg-gold px-6 py-3 text-[12px] font-semibold tracking-[0.18em] text-burgundy-deep uppercase"
            >
              Pedir orçamento
            </a>
          </div>
          <div
            className="min-h-[280px] bg-cover bg-center"
            style={{
              backgroundImage: "url(/images/gift.jpg)",
            }}
          />
        </div>
      </div>
      <p className="mx-auto mt-8 max-w-6xl text-center text-xs tracking-[0.14em] text-burgundy/45 uppercase">
        Siga {site.instagramHandle} e veja os pedidos saindo da cozinha
      </p>
    </section>
  );
}
