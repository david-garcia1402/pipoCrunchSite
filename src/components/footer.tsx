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
      </div>
    </footer>
  );
}
