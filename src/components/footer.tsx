import { Instagram } from "lucide-react";
import { Logo } from "@/components/logo";
import { site, whatsappLink } from "@/lib/site";

export function Footer() {
  return (
    <footer className="bg-burgundy-deep px-5 py-16 text-cream md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 text-center">
        <Logo className="h-auto w-24" />
        <p className="font-serif text-2xl tracking-[0.22em] text-gold">PIPOCRUNCH</p>
        <p className="font-serif text-2xl tracking-[0.08em] text-cream/80">{site.tagline}</p>
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
          <a
            href={whatsappLink("Olá! Quero fazer um pedido na PIPOCRUNCH.")}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold hover:underline"
          >
            {site.whatsapp.display}
          </a>
          <span className="text-gold/30">·</span>
          <a
            href={site.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-gold hover:underline"
          >
            <Instagram size={16} />
            {site.instagramHandle}
          </a>
          <span className="text-gold/30">·</span>
          <span className="text-cream/55">{site.city}</span>
        </div>
        <p className="text-[11px] tracking-[0.16em] text-cream/35 uppercase">
          Pipocas gourmet · Jaraguá do Sul
        </p>
        <a
          href="https://www.instagram.com/cub4studio/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram de @cub4studio — desenvolvido por Cub4 Studio"
          className="group mt-2 inline-flex items-center gap-3 rounded-full border border-gold/20 bg-white/5 py-1.5 pr-1.5 pl-4 text-[11px] tracking-[0.16em] text-cream/55 uppercase transition duration-300 hover:border-gold/45 hover:bg-white/10 hover:text-cream"
        >
          <span>
            Desenvolvido por{" "}
            <span className="text-gold transition group-hover:text-gold-light">@cub4studio</span>
          </span>
          <span className="relative inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-full text-white shadow-[0_6px_16px_rgba(214,41,118,0.35)] transition duration-300 group-hover:scale-110 group-hover:shadow-[0_8px_22px_rgba(214,41,118,0.55)]">
            <span
              aria-hidden="true"
              className="absolute inset-0 bg-[linear-gradient(135deg,#feda75,#fa7e1e_35%,#d62976_65%,#962fbf)] transition duration-500 group-hover:scale-125"
            />
            <Instagram size={15} className="relative" />
          </span>
        </a>
      </div>
    </footer>
  );
}
