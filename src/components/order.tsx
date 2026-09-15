"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ORDER_LINE_EVENT,
  filledFlavors,
  gourmetCoatings,
  gourmetSizes,
  potSizes,
  snackSize,
  snacks,
  whatsappLink,
  type OrderLine,
} from "@/lib/site";

const lines: { id: OrderLine; label: string }[] = [
  { id: "gourmet", label: "Gourmet" },
  { id: "recheadas", label: "Recheadas" },
  { id: "petiscos", label: "Petiscos" },
];

function isOrderLine(value: string | null): value is OrderLine {
  return value === "gourmet" || value === "recheadas" || value === "petiscos";
}

function lineFromUrl(): OrderLine | null {
  if (typeof window === "undefined") return null;
  const value = new URLSearchParams(window.location.search).get("linha");
  return isOrderLine(value) ? value : null;
}

function defaultsFor(next: OrderLine) {
  if (next === "gourmet") {
    return { flavor: gourmetCoatings[0].name, size: gourmetSizes[0].id };
  }
  if (next === "recheadas") {
    return { flavor: filledFlavors[0].name, size: potSizes[0].id };
  }
  return { flavor: snacks[0].name, size: snackSize.id };
}

export function Order() {
  const [line, setLine] = useState<OrderLine>("gourmet");
  const [flavor, setFlavor] = useState<string>(gourmetCoatings[0].name);
  const [size, setSize] = useState<string>(gourmetSizes[0].id);

  const flavors = useMemo(() => {
    if (line === "gourmet") return gourmetCoatings;
    if (line === "recheadas") return filledFlavors;
    return snacks;
  }, [line]);

  const sizes = useMemo(() => {
    if (line === "gourmet") return gourmetSizes;
    if (line === "recheadas") return potSizes;
    return [snackSize];
  }, [line]);

  const selectedSize = sizes.find((item) => item.id === size) ?? sizes[0];

  const message = `Olá! Quero pedir na PIPOCRUNCH:\n• Linha: ${
    lines.find((item) => item.id === line)?.label
  }\n• Sabor: ${flavor}\n• Tamanho: ${selectedSize.label}\n• Valor: R$ ${selectedSize.price}`;

  function changeLine(next: OrderLine) {
    const defaults = defaultsFor(next);
    setLine(next);
    setFlavor(defaults.flavor);
    setSize(defaults.size);
  }

  useEffect(() => {
    function applyLine(next: OrderLine | null) {
      if (!next) return;
      changeLine(next);
    }

    applyLine(lineFromUrl());

    function onPreset(event: Event) {
      applyLine((event as CustomEvent<OrderLine>).detail);
    }

    function onPopState() {
      applyLine(lineFromUrl());
    }

    window.addEventListener(ORDER_LINE_EVENT, onPreset);
    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener(ORDER_LINE_EVENT, onPreset);
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  return (
    <section id="pedido" className="bg-cream-soft px-5 py-24 md:px-8">
      <div className="mx-auto grid max-w-6xl gap-10 rounded-[2.5rem] bg-burgundy p-6 text-cream md:grid-cols-[1.1fr_0.9fr] md:p-12">
        <div>
          <p className="text-[11px] tracking-[0.32em] text-gold uppercase">Pedido</p>
          <h2 className="mt-3 font-serif text-4xl text-gold md:text-5xl">
            Monte o seu
          </h2>
          <p className="mt-4 max-w-md text-sm text-cream/70">
            Escolha a linha, o sabor e o tamanho. A gente recebe tudo prontinho
            no WhatsApp.
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            {lines.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => changeLine(item.id)}
                className={`rounded-full px-4 py-2 text-[11px] tracking-[0.18em] uppercase transition ${
                  line === item.id
                    ? "bg-gold text-burgundy-deep"
                    : "border border-gold/30 text-gold hover:bg-gold/10"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <p className="mt-8 text-[11px] tracking-[0.22em] text-gold/80 uppercase">
            Sabor
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {flavors.map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={() => setFlavor(item.name)}
                className={`rounded-full border px-3 py-1.5 text-xs transition ${
                  flavor === item.name
                    ? "border-gold bg-gold text-burgundy-deep"
                    : "border-gold/20 text-cream/80 hover:border-gold/50"
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>

          <p className="mt-8 text-[11px] tracking-[0.22em] text-gold/80 uppercase">
            Tamanho
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {sizes.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSize(item.id)}
                className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                  selectedSize.id === item.id
                    ? "border-gold bg-gold/15"
                    : "border-gold/20 hover:border-gold/50"
                }`}
              >
                <span>{item.label}</span>
                <span className="font-serif text-gold">R$ {item.price}</span>
              </button>
            ))}
          </div>
        </div>

        <aside className="flex flex-col justify-between rounded-[1.75rem] border border-gold/20 bg-burgundy-deep/70 p-6">
          <div>
            <p className="font-script text-3xl text-gold">Seu pedido</p>
            <dl className="mt-6 space-y-4 text-sm">
              <div className="flex justify-between gap-4 border-b border-gold/15 pb-3">
                <dt className="text-cream/55">Linha</dt>
                <dd>{lines.find((item) => item.id === line)?.label}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-gold/15 pb-3">
                <dt className="text-cream/55">Sabor</dt>
                <dd className="text-right">{flavor}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-gold/15 pb-3">
                <dt className="text-cream/55">Tamanho</dt>
                <dd>{selectedSize.label}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-cream/55">Total</dt>
                <dd className="font-serif text-2xl text-gold">
                  R$ {selectedSize.price}
                </dd>
              </div>
            </dl>
          </div>
          <a
            href={whatsappLink(message)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 rounded-full bg-gold py-3 text-center text-[12px] font-semibold tracking-[0.18em] text-burgundy-deep uppercase transition hover:bg-gold-light"
          >
            Enviar no WhatsApp
          </a>
        </aside>
      </div>
    </section>
  );
}
