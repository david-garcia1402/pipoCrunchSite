"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { nav, whatsappLink } from "@/lib/site";

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled || open
          ? "bg-burgundy/95 shadow-[0_10px_40px_rgba(43,13,13,0.28)] backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 md:px-8">
        <a href="#inicio" className="flex items-center" aria-label="PIPOCRUNCH">
          <Logo className="h-11 w-11" priority />
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-[13px] tracking-[0.18em] text-cream/80 uppercase transition-colors hover:text-gold"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={whatsappLink("Olá! Quero fazer um pedido na PIPOCRUNCH.")}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-full bg-gold px-5 py-2 text-[12px] font-semibold tracking-[0.16em] text-burgundy-deep uppercase transition hover:bg-gold-light sm:inline-flex"
          >
            Pedir agora
          </a>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gold/30 text-gold md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Fechar menu" : "Abrir menu"}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-gold/15 bg-burgundy px-5 py-6 md:hidden">
          <nav className="flex flex-col gap-4">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="text-sm tracking-[0.2em] text-cream uppercase"
              >
                {item.label}
              </a>
            ))}
            <a
              href={whatsappLink("Olá! Quero fazer um pedido na PIPOCRUNCH.")}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 rounded-full bg-gold px-5 py-3 text-center text-[12px] font-semibold tracking-[0.16em] text-burgundy-deep uppercase"
            >
              Pedir no WhatsApp
            </a>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
