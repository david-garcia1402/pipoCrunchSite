import Image from "next/image";
import { MapPin } from "lucide-react";
import { Logo } from "@/components/logo";
import { site, whatsappLink } from "@/lib/site";

export function Hero() {
  return (
    <section
      id="inicio"
      className="grain relative min-h-screen overflow-hidden bg-burgundy text-cream"
    >
      <div
        className="absolute inset-0 opacity-35"
        style={{
          backgroundImage:
            "radial-gradient(circle at 18% 20%, rgba(217,131,36,0.28), transparent 32%), radial-gradient(circle at 82% 78%, rgba(217,131,36,0.18), transparent 36%)",
        }}
      />
      <Image
        src="/images/caramel-corn.jpg"
        alt="Pipoca gourmet caramelizada"
        fill
        priority
        className="object-cover opacity-[0.22]"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-burgundy via-burgundy/70 to-burgundy" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 pb-16 pt-28 text-center sm:px-8">
        <p className="reveal px-2 text-[10px] tracking-[0.3em] text-gold uppercase sm:text-[11px] sm:tracking-[0.42em]">
          Gourmet popcorn · {site.city}
        </p>
        <Logo
          className="reveal reveal-delay-1 float-y mt-8 h-auto w-32 drop-shadow-[0_18px_40px_rgba(0,0,0,0.45)] sm:w-44 md:w-64"
          priority
        />
        <h1 className="reveal reveal-delay-2 mt-8 max-w-full font-serif text-4xl tracking-[0.06em] text-gold drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)] sm:text-6xl sm:tracking-[0.12em] md:text-7xl md:tracking-[0.18em]">
          PIPOCRUNCH
        </h1>
        <p className="reveal reveal-delay-3 mt-4 max-w-xl font-serif text-xl tracking-[0.04em] text-cream sm:text-2xl sm:tracking-[0.08em] md:text-3xl">
          {site.tagline}
        </p>
        <p className="mt-6 max-w-lg text-sm leading-relaxed text-cream/75 md:text-base">
          Pipoca MUSH caramelizada, coberturas irresistíveis e potes recheados
          para aniversários, presentes e momentos que marcam.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href={whatsappLink("Olá! Quero fazer um pedido na PIPOCRUNCH.")}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-gold px-7 py-3 text-[12px] font-semibold tracking-[0.2em] text-burgundy-deep uppercase transition hover:bg-gold-light"
          >
            Fazer pedido
          </a>
          <a
            href="#cardapio"
            className="rounded-full border border-gold/40 px-7 py-3 text-[12px] tracking-[0.2em] text-gold uppercase transition hover:border-gold hover:bg-gold/10"
          >
            Ver cardápio
          </a>
        </div>

        <p className="mt-10 inline-flex items-center gap-2 text-xs tracking-[0.16em] text-cream/55 uppercase">
          <MapPin size={14} className="text-gold" />
          {site.city}
        </p>
      </div>
    </section>
  );
}
