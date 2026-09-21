"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  FREIGHT_BRL_PER_KM,
  FreightError,
  deliveryOrigin,
  fetchFreightQuote,
  formatBrl,
  formatKm,
  freightMessageLines,
  isAbortError,
  isCompleteCep,
  maskCep,
  onlyDigits,
  orderTotal,
  type FreightQuote,
} from "@/lib/freight";
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
  const [cep, setCep] = useState("");
  const [quote, setQuote] = useState<FreightQuote | null>(null);
  const [freightError, setFreightError] = useState("");
  const [freightLoading, setFreightLoading] = useState(false);
  const freightRequest = useRef(0);
  const freightAbort = useRef<AbortController | null>(null);

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
  const total = orderTotal(selectedSize.price, quote?.price ?? 0);
  const lineLabel = lines.find((item) => item.id === line)?.label;

  const message = useMemo(() => {
    const parts = [
      "Olá! Quero pedir na PIPOCRUNCH:",
      `• Linha: ${lineLabel}`,
      `• Sabor: ${flavor}`,
      `• Tamanho: ${selectedSize.label}`,
      `• Valor: R$ ${selectedSize.price}`,
    ];

    if (quote) {
      parts.push(...freightMessageLines(quote), `• Total: R$ ${formatBrl(total)}`);
    }

    return parts.join("\n");
  }, [flavor, lineLabel, quote, selectedSize.label, selectedSize.price, total]);

  function updateCep(value: string) {
    const next = maskCep(value);
    setCep(next);
    setFreightError("");
    if (quote && onlyDigits(next) !== onlyDigits(quote.cep)) {
      setQuote(null);
    }
  }

  async function consultFreight(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isCompleteCep(cep)) {
      setFreightError("Informe o CEP com 8 números.");
      return;
    }

    const requestId = freightRequest.current + 1;
    freightRequest.current = requestId;
    freightAbort.current?.abort();
    const controller = new AbortController();
    freightAbort.current = controller;
    setFreightLoading(true);
    setFreightError("");

    try {
      const nextQuote = await fetchFreightQuote(cep, controller.signal);
      if (freightRequest.current !== requestId) return;
      setQuote(nextQuote);
    } catch (error) {
      if (freightRequest.current !== requestId || isAbortError(error)) return;
      setQuote(null);
      setFreightError(
        error instanceof FreightError
          ? error.message
          : "Não foi possível consultar o frete agora. Tente de novo.",
      );
    } finally {
      if (freightRequest.current === requestId) setFreightLoading(false);
    }
  }

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
      freightAbort.current?.abort();
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
            Escolha a linha, o sabor e o tamanho. Consulte o frete pelo CEP e
            envie o pedido no WhatsApp.
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
            </dl>

            <form className="mt-6" onSubmit={consultFreight}>
              <label
                htmlFor="frete-cep"
                className="text-[11px] tracking-[0.22em] text-gold/80 uppercase"
              >
                Consultar frete
              </label>
              <p id="frete-ajuda" className="mt-2 text-xs leading-relaxed text-cream/55">
                R$ {formatBrl(FREIGHT_BRL_PER_KM)} por km rodado, a partir do{" "}
                {deliveryOrigin.label}. O valor entra na mensagem do WhatsApp.
              </p>
              <div className="mt-3 flex gap-2">
                <input
                  id="frete-cep"
                  name="cep"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  autoCapitalize="off"
                  spellCheck={false}
                  enterKeyHint="search"
                  placeholder="00000-000"
                  aria-describedby="frete-ajuda"
                  aria-invalid={freightError ? true : undefined}
                  value={cep}
                  onChange={(event) => updateCep(event.target.value)}
                  className="min-w-0 flex-1 rounded-full border border-gold/30 bg-burgundy-deep/40 px-4 py-2 text-sm text-cream outline-none placeholder:text-cream/35 focus:border-gold"
                />
                <button
                  type="submit"
                  disabled={freightLoading}
                  className="shrink-0 rounded-full border border-gold px-4 py-2 text-[11px] font-semibold tracking-[0.16em] whitespace-nowrap text-gold uppercase transition hover:bg-gold hover:text-burgundy-deep disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {freightLoading ? "Consultando" : "Consultar"}
                </button>
              </div>
              <div aria-live="polite">
                {freightLoading ? (
                  <p className="mt-3 text-sm text-cream/70">Consultando frete…</p>
                ) : freightError ? (
                  <p role="alert" className="mt-3 text-sm text-gold-light">
                    {freightError}
                  </p>
                ) : null}
              </div>
            </form>

            <dl className="mt-6 space-y-4 text-sm">
              {quote ? (
                <>
                  <div className="flex justify-between gap-4 border-b border-gold/15 pb-3">
                    <dt className="text-cream/55">Produto</dt>
                    <dd>R$ {selectedSize.price}</dd>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-gold/15 pb-3">
                    <dt className="text-cream/55">Entrega</dt>
                    <dd className="max-w-[14rem] text-right">{quote.addressLabel}</dd>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-gold/15 pb-3">
                    <dt className="text-cream/55">Distância</dt>
                    <dd className="text-right">
                      {formatKm(quote.distanceKm)} km
                      {quote.distanceKind === "straight" ? " (linha reta)" : ""}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-gold/15 pb-3">
                    <dt className="text-cream/55">Frete</dt>
                    <dd className="text-right">
                      R$ {formatBrl(quote.price)}
                      <span className="mt-1 block text-xs text-cream/50">
                        {formatKm(quote.distanceKm)} km × R$ {formatBrl(FREIGHT_BRL_PER_KM)}
                      </span>
                    </dd>
                  </div>
                </>
              ) : null}
              <div className="flex justify-between gap-4">
                <dt className="text-cream/55">Total</dt>
                <dd className="font-serif text-2xl text-gold">R$ {formatBrl(total)}</dd>
              </div>
            </dl>
            {quote && quote.precision !== "street" ? (
              <p className="mt-3 text-xs leading-relaxed text-cream/50">
                Estimativa pelo {quote.precision === "neighborhood" ? "bairro" : "município"},
                porque o logradouro do CEP não apareceu no mapa.
              </p>
            ) : null}
            {quote ? null : (
              <p className="mt-3 text-xs leading-relaxed text-cream/45">
                Consulte o CEP para somar o frete ao total e incluir a entrega na mensagem.
              </p>
            )}
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
